const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const { webcrypto } = require('node:crypto');

function loadTs(path, names, imports = {}, globals = {}) {
  const source = stripTypeScriptTypes(fs.readFileSync(path, 'utf8'))
    .replace(/import[\s\S]*?from ['"]([^'"]+)['"];?/g, (_match, id) => imports[id] || '')
    .replace(/export /g, '');
  return vm.runInNewContext(source + '\n({' + names.join(',') + '})', {
    console, Error, TextEncoder, crypto: webcrypto, ...globals,
  });
}
const policy = loadTs('src/utils/applicationSubmission.ts', [
  'prepareSubmission', 'validateSubmissionSize', 'validateAttachments', 'attachmentBytes', 'submissionErrorMessage',
]);
const base = () => policy.prepareSubmission({ studentId: '12345678', fullName: 'Test', agreedToTerms: true }, '2569');
const file = size => ({ fileName: 'test.pdf', fileSize: size, fileType: 'application/pdf', dataUrl: 'data:application/pdf;base64,' + Buffer.alloc(size).toString('base64'), uploadedAt: '2026-10-07T00:00:00Z' });

function server({ deny = false, offline = false, readFail = false, existing, differentConfirmation = false } = {}) {
  let saved = existing;
  let writes = 0, cacheWrites = 0, transactions = 0;
  const snapshot = data => ({ exists: () => !!data, data: () => data });
  const api = loadTs('src/services/firebaseService.ts', ['submitApplicationOnline'], {}, {
    ...policy,
    db: {}, navigator: { onLine: !offline },
    doc: (_db, _collection, id) => ({ id }),
    runTransaction: async (_db, callback) => {
      transactions++;
      if (deny) throw Object.assign(new Error('denied'), { code: 'permission-denied' });
      await callback({
        get: async () => snapshot(saved),
        set: (_ref, data) => { writes++; saved = data; },
      });
    },
    getDocFromServer: async () => {
      if (readFail) throw Object.assign(new Error('offline after commit'), { code: 'unavailable' });
      return snapshot(differentConfirmation ? undefined : saved);
    },
    saveLocalApplication: () => { cacheWrites++; },
  });
  return { submit: api.submitApplicationOnline, saved: () => saved, writes: () => writes, cacheWrites: () => cacheWrites, transactions: () => transactions };
}

test('new submissions have UUID IDs and persist the retry ID', () => {
  const first = base(), second = base();
  assert.notEqual(first.id, second.id);
  assert.match(first.id, /^FSS-2569-[0-9a-f-]{36}$/);
  assert.equal(policy.prepareSubmission(first, '2569').id, first.id);
  assert.notEqual(policy.prepareSubmission(first, '2570').id, first.id);
});
test('successful submission is cached only after server verification', async () => {
  const x = server(), app = base();
  assert.equal((await x.submit(app)).id, app.id);
  assert.equal(x.writes(), 1);
  assert.equal(x.cacheWrites(), 1);
});
test('same ID retry is idempotent and cannot overwrite original data', async () => {
  const x = server(), app = base();
  await x.submit(app);
  const confirmed = await x.submit({ ...app, fullName: 'Changed after timeout' });
  assert.equal(x.writes(), 1);
  assert.equal(confirmed.fullName, 'Test');
});
test('a document belonging to another submission is never overwritten', async () => {
  const app = base();
  const x = server({ existing: { ...app, studentId: 'other' } });
  await assert.rejects(x.submit(app));
  assert.equal(x.writes(), 0);
  assert.equal(x.cacheWrites(), 0);
});
for (const mode of ['deny', 'offline', 'readFail', 'differentConfirmation']) {
  test(mode + ' does not report verified success or write the cache', async () => {
    const x = server({ [mode]: true });
    await assert.rejects(x.submit(base()));
    assert.equal(x.cacheWrites(), 0);
    if (mode === 'offline') assert.equal(x.transactions(), 0);
  });
}
test('oversized file is rejected before any database access', async () => {
  const x = server();
  await assert.rejects(x.submit({ ...base(), incomeCertificateDoc: file(800 * 1024) }), /450 KB/);
  assert.equal(x.transactions(), 0);
});
test('combined attachment limit counts actual base64 bytes, not claimed file size', () => {
  const a = { ...file(350 * 1024), fileSize: 1 };
  assert.throws(() => policy.validateAttachments({ incomeCertificateDoc: a, academicTranscriptDoc: a }), /650 KB/);
});
test('document byte limit includes Thai text and all metadata', () => {
  assert.throws(() => policy.validateSubmissionSize({ ...base(), reasonForApplying: 'ก'.repeat(320000) }), /ขนาดรวม/);
});
test('reasonable PDF and photograph payloads pass the combined budget', () => {
  policy.validateSubmissionSize({ ...base(), incomeCertificateDoc: file(300 * 1024), academicTranscriptDoc: file(100 * 1024), studentPhotoDoc: { ...file(100 * 1024), fileType: 'image/jpeg', dataUrl: file(100 * 1024).dataUrl.replace('application/pdf', 'image/jpeg') } });
});
test('missing or invalid attachment content is rejected', () => {
  assert.throws(() => policy.validateAttachments({ incomeCertificateDoc: { ...file(1), dataUrl: undefined } }));
});

function formFlow({ reject = false, oversized = false } = {}) {
  let resolveWrite, rejectWrite;
  const pending = new Promise((resolve, reject) => { resolveWrite = resolve; rejectWrite = reject; });
  const events = [];
  let draft, error = '';
  const initial = { studentId: '12345678', fullName: 'Test', ...(oversized ? { incomeCertificateDoc: file(800 * 1024) } : {}) };
  const source = fs.readFileSync('src/components/ScholarshipForm.tsx', 'utf8').match(/  const handleSubmit = async [\s\S]*?\n  };\n/)[0];
  const handle = vm.runInNewContext(stripTypeScriptTypes(source) + '\nhandleSubmit', {
    ...policy,
    Error,
    submittingRef: { current: false }, processingFilesRef: { current: 0 }, formDataRef: { current: initial },
    timelineConfig: { academicYear: '2569' }, totalModules: 1, validateModule: () => true,
    setSubmissionError: value => { error = value; }, setIsSubmitting: () => {}, setIsSlowSubmission: () => {},
    setFormData: () => {}, setDraftWarning: () => {},
    window: { setTimeout: () => 0, clearTimeout: () => {} },
    rememberDraft: app => { draft = app; events.push('draft'); },
    clearDraft: () => { draft = undefined; events.push('clear'); },
    submitApplicationOnline: app => { events.push('send'); return pending.then(() => app); },
    onSubmitSuccess: () => events.push('success'),
  });
  return { handle, events, draft: () => draft, error: () => error, finish: () => reject ? rejectWrite(new Error('simulated failure')) : resolveWrite() };
}
test('form waits for acknowledgement, prevents double-click, then clears draft', async () => {
  const x = formFlow();
  const first = x.handle();
  await x.handle();
  assert.deepEqual(x.events, ['draft', 'send']);
  assert.ok(x.draft().submissionToken);
  x.finish(); await first;
  assert.deepEqual(x.events, ['draft', 'send', 'clear', 'success']);
});
test('failed form submission keeps draft, reports an error, and never shows success', async () => {
  const x = formFlow({ reject: true });
  const call = x.handle(); x.finish(); await call;
  assert.ok(x.draft());
  assert.equal(x.error(), 'simulated failure');
  assert.deepEqual(x.events, ['draft', 'send']);
});
test('oversized form payload never starts a network request or clears a draft', async () => {
  const x = formFlow({ oversized: true });
  await x.handle();
  assert.deepEqual(x.events, []);
  assert.match(x.error(), /450 KB/);
});

test('PDF preprocessing rejects oversize files before reading them', async () => {
  const processor = loadTs('src/utils/attachmentProcessing.ts', ['prepareAttachment'], {}, {
    attachmentBytes: policy.attachmentBytes, MAX_FILE_BYTES: 450 * 1024,
    FileReader: class { constructor() { throw Error('must not read an oversize file'); } },
  });
  await assert.rejects(processor.prepareAttachment({ type: 'application/pdf', size: 451 * 1024 }), /450 KB/);
});
