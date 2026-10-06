const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');

const raw = stripTypeScriptTypes(fs.readFileSync('src/services/firebaseService.ts', 'utf8'));
const source = raw.replace(/import[\s\S]*?from ['"]([^'"]+)['"];?/g, (_, id) => {
  if (id === 'firebase/firestore') return `const {collection,getDocsFromServer,writeBatch,onSnapshot}=require('${id}');`;
  if (id === '../firebase') return `const {db,handleFirestoreError,OperationType}=require('${id}');`;
  if (id === '../data/scholarshipData') return `const {loadApplications:loadLocalApplications}=require('${id}');`;
  return '';
}).replace(/export /g, '') + '\nmodule.exports={deleteApplicationOnline,clearAllApplicationsOnline,subscribeApplications};';

function setup({ denied = false, retained = false } = {}) {
  const record = (id, applicationId, studentId) => ({ id, ref: id, data: () => ({ id: applicationId, studentId }) });
  const target = record('legacy-document', 'APP-2569-010', 's1');
  const other = record('other-document', 'FSS-2569-011', 's2');
  let docs = [target, other];
  let cache = docs.map(doc => doc.data());
  let listener;
  let updates = [];
  const firebase = {
    collection: () => ({}),
    getDocsFromServer: async () => ({ docs, size: docs.length, empty: !docs.length }),
    onSnapshot: (_ref, _options, callback) => { listener = callback; return () => {}; },
    writeBatch: () => {
      const removed = new Set();
      return {
        delete: ref => removed.add(ref),
        commit: async () => {
          if (denied) throw Error('permission-denied');
          if (!retained) docs = docs.filter(doc => !removed.has(doc.ref));
        },
      };
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module, exports: module.exports, console,
    localStorage: { setItem: (_key, value) => { cache = JSON.parse(value); }, removeItem: () => {} },
    require: id => id === 'firebase/firestore' ? firebase : id === '../firebase'
      ? { db: {}, handleFirestoreError: () => {}, OperationType: { GET: 'get' } }
      : { loadApplications: () => cache },
  });
  module.exports.subscribeApplications(apps => { updates.push(Array.from(apps, app => app.id)); });
  return {
    api: module.exports, target, other, record,
    emit: (records, metadata = {}) => listener({
      metadata: { hasPendingWrites: false, fromCache: false, ...metadata },
      forEach: callback => records.forEach(callback),
    }),
    latest: () => updates.at(-1),
    count: () => updates.length,
    cachedIds: () => cache.map(app => app.id),
  };
}

test('stale realtime data after successful delete cannot restore UI or cache', async () => {
  const x = setup();
  await x.api.deleteApplicationOnline('FSS-2569-010', 's1');
  x.emit([x.target, x.other]);
  assert.deepEqual(x.latest(), ['FSS-2569-011']);
  assert.deepEqual(x.cachedIds(), ['FSS-2569-011']);
});

test('cached absence does not release deletion suppression', async () => {
  const x = setup();
  await x.api.deleteApplicationOnline('FSS-2569-010', 's1');
  x.emit([x.other], { fromCache: true });
  x.emit([x.target, x.other]);
  assert.deepEqual(x.latest(), ['FSS-2569-011']);
});

test('raw document ID still suppresses a stale record with a changed data ID', async () => {
  const x = setup();
  await x.api.deleteApplicationOnline('FSS-2569-010', 's1');
  x.emit([x.record(x.target.id, 'FSS-2569-099', 's1'), x.other]);
  assert.deepEqual(x.latest(), ['FSS-2569-011']);
});

test('confirmed server absence allows a later new record using the same ID', async () => {
  const x = setup();
  await x.api.deleteApplicationOnline('FSS-2569-010', 's1');
  x.emit([x.other]);
  x.emit([x.target, x.other]);
  assert.deepEqual(x.latest(), ['FSS-2569-010', 'FSS-2569-011']);
});

test('unconfirmed local writes are not treated as deletion confirmation', async () => {
  const x = setup();
  await x.api.deleteApplicationOnline('FSS-2569-010', 's1');
  x.emit([], { hasPendingWrites: true });
  assert.equal(x.count(), 0);
  x.emit([x.target, x.other]);
  assert.deepEqual(x.latest(), ['FSS-2569-011']);
});

test('denied deletion releases suppression and shows the existing record', async () => {
  const x = setup({ denied: true });
  await assert.rejects(x.api.deleteApplicationOnline('FSS-2569-010', 's1'), /permission-denied/);
  x.emit([x.target, x.other]);
  assert.deepEqual(x.latest(), ['FSS-2569-010', 'FSS-2569-011']);
});

test('server verification rejects success if a deleted record remains', async () => {
  const x = setup({ retained: true });
  await assert.rejects(x.api.deleteApplicationOnline('FSS-2569-010', 's1'), /เซิร์ฟเวอร์ยังพบข้อมูลเดิม/);
  x.emit([x.target, x.other]);
  assert.equal(x.latest().length, 2);
});

test('clear all suppresses stale records but preserves new applicants', async () => {
  const x = setup();
  await x.api.clearAllApplicationsOnline();
  x.emit([x.target, x.other, x.record('new-document', 'FSS-2569-012', 's3')]);
  assert.deepEqual(x.latest(), ['FSS-2569-012']);
});
