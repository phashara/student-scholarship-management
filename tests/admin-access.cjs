const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');

function setup() {
  let accesses = 0;
  const db = { collection: name => ({
    doc: () => ({ get: async () => { accesses++; return { get: field => field === 'complete' }; } }),
    limit: () => ({ get: async () => { accesses++; return { empty: true }; } }),
    add: async () => {},
  }) };
  const source = stripTypeScriptTypes(fs.readFileSync('functions/src/index.ts', 'utf8'))
    .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '').replace(/export /g, '');
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const api = vm.runInNewContext(source + '\n({deleteApplication,clearApplications,updateApplication,backfillPublicApplications})', {
    initializeApp: () => {}, getFirestore: () => db, getAuth: () => ({}), HttpsError,
    onCall: (options, run) => ({ options, run }), onDocumentWritten: () => ({}),
    validateApplication: () => {}, console,
  });
  return { api, accesses: () => accesses };
}
const adminAuth = { uid: 'synthetic-admin', token: { admin: true, email_verified: true } };

for (const name of ['deleteApplication', 'clearApplications', 'updateApplication', 'backfillPublicApplications']) {
  test(name + ' uses App Check on the Firebase callable transport', () => {
    const { api } = setup();
    assert.equal(api[name].options.enforceAppCheck, true);
    assert.equal(api[name].options.invoker, 'public');
  });
  for (const auth of [undefined, { token: { email_verified: true } }, { token: { admin: true, email_verified: false } }]) {
    test(name + ' rejects ' + JSON.stringify(auth) + ' before database access', async () => {
      const x = setup();
      await assert.rejects(x.api[name].run({ auth, data: {} }), { code: 'permission-denied' });
      assert.equal(x.accesses(), 0);
    });
  }
}
test('admin backfill checks the completed marker without scanning or writing applicants', async () => {
  const x = setup();
  const result = await x.api.backfillPublicApplications.run({ auth: adminAuth });
  assert.equal(result.migrated, 0);
  assert.equal(x.accesses(), 1);
});
test('admin delete rejects malformed IDs before accessing a document', async () => {
  const x = setup();
  await assert.rejects(x.api.deleteApplication.run({ auth: adminAuth, data: { applicationId: '!' } }), { code: 'invalid-argument' });
  assert.equal(x.accesses(), 0);
});
