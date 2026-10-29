const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');

const raw = stripTypeScriptTypes(fs.readFileSync('src/services/firebaseService.ts', 'utf8'));
const source = raw.replace(/import[\s\S]*?from ['"]([^'"]+)['"];?/g, (_match, id) => {
  if (id === 'firebase/firestore') return `const {collection,doc,deleteDoc,getDocFromServer,getDocsFromServer,writeBatch,onSnapshot,setDoc}=require('${id}');`;
  if (id === 'firebase/functions') return `const {getFunctions,httpsCallable}=require('${id}');`;
  if (id === '../firebase') return `const {db,handleFirestoreError,OperationType}=require('${id}');`;
  if (id === '../data/scholarshipData') return `const {loadApplications:loadLocalApplications,saveApplication:saveLocalApplication,loadTimelineConfig:loadLocalTimelineConfig,saveTimelineConfig:saveLocalTimelineConfig,normalizeTimelineConfig}=require('${id}');`;
  if (id === '../utils/applicationSubmission') return `const {validateSubmissionSize}=require('${id}');`;
  if (id === '../utils/offlineStorage') return `const {safeSetApplicationsLocalStorage,saveAppsIndexedDB,deleteAppIndexedDB,clearAppsIndexedDB}=require('${id}');`;
  return '';
}).replace(/export /g, '') + '\nmodule.exports={deleteApplicationOnline,clearAllApplicationsOnline};';

function setup({ rejectDelete = false, rejectClear = false } = {}) {
  const documents = new Map([
    ['APP-2569-010', { id: 'APP-2569-010', studentId: 's1' }],
    ['FSS-2569-011', { id: 'FSS-2569-011', studentId: 's2' }],
  ]);
  let cache = Array.from(documents.values());
  const ref = id => ({ id });
  const snapshot = id => {
    const data = documents.get(id);
    return { id, ref: ref(id), exists: () => Boolean(data), data: () => data };
  };
  const firestore = {
    collection: () => ({}),
    doc: (_db, _collection, id) => ref(id),
    getDocFromServer: async docRef => snapshot(docRef.id),
    getDocsFromServer: async () => ({ docs: Array.from(documents.keys(), snapshot) }),
    deleteDoc: async docRef => {
      if (rejectDelete) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
      documents.delete(docRef.id);
    },
    writeBatch: () => {
      const pending = [];
      return {
        delete: docRef => pending.push(docRef.id),
        commit: async () => {
          if (rejectClear) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
          pending.forEach(id => documents.delete(id));
        },
      };
    },
    onSnapshot: () => () => {}, setDoc: async () => {},
  };
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module, exports: module.exports, console,
    localStorage: { setItem: (_key, value) => { cache = JSON.parse(value); }, removeItem: () => {} },
    require: id => id === 'firebase/firestore' ? firestore
      : id === 'firebase/functions' ? { getFunctions: () => ({}), httpsCallable: () => async () => ({ data: {} }) }
        : id === '../firebase' ? { db: {}, handleFirestoreError: () => {}, OperationType: { GET: 'get', WRITE: 'write' } }
          : id === '../data/scholarshipData' ? { loadApplications: () => cache, saveApplication: () => {}, loadTimelineConfig: () => ({}), saveTimelineConfig: () => {}, normalizeTimelineConfig: x => x }
            : id === '../utils/offlineStorage' ? { safeSetApplicationsLocalStorage: apps => { cache = apps; }, saveAppsIndexedDB: async () => {}, deleteAppIndexedDB: async () => {}, clearAppsIndexedDB: async () => {} }
              : id === '../utils/applicationSubmission' ? { validateSubmissionSize: () => {} }
                : {},
  });
  return { api: module.exports, cache: () => cache, documents };
}

test('admin delete uses a direct document read and preserves unrelated applications', async () => {
  const x = setup();
  await x.api.deleteApplicationOnline('FSS-2569-010', 's1');
  assert.equal(x.documents.has('APP-2569-010'), false);
  assert.deepEqual(x.cache().map(app => app.id), ['FSS-2569-011']);
});

test('denied deletion leaves local records intact', async () => {
  const x = setup({ rejectDelete: true });
  await assert.rejects(x.api.deleteApplicationOnline('FSS-2569-010', 's1'), /permission-denied/);
  assert.equal(x.cache().length, 2);
});

test('admin bulk delete batches records and clears local cache after success', async () => {
  const x = setup();
  await x.api.clearAllApplicationsOnline();
  assert.equal(x.documents.size, 0);
  assert.equal(x.cache().length, 0);
});

test('denied bulk delete preserves local records', async () => {
  const x = setup({ rejectClear: true });
  await assert.rejects(x.api.clearAllApplicationsOnline(), /permission-denied/);
  assert.equal(x.cache().length, 2);
});
