const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');

const raw = stripTypeScriptTypes(fs.readFileSync('src/services/firebaseService.ts', 'utf8'));
const source = raw.replace(/import[\s\S]*?from ['"]([^'"]+)['"];?/g, (_match, id) => {
  if (id === 'firebase/firestore') return `const {collection,doc,onSnapshot,setDoc}=require('${id}');`;
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
  const firestore = {
    collection: () => ({}),
    doc: () => ({}),
    onSnapshot: () => () => {}, setDoc: async () => {},
  };
  const functionsModule = {
    getFunctions: () => ({}),
    httpsCallable: (_fns, name) => async (data) => {
      if (name === 'deleteApplication') {
        if (rejectDelete) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
        const id = data.applicationId;
        const candidates = [id, id.replace(/^FSS-/, 'APP-')];
        for (const c of candidates) { if (documents.has(c)) { documents.delete(c); return { data: { deleted: true } }; } }
        throw new Error('not-found');
      }
      if (name === 'clearApplications') {
        if (rejectClear) throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' });
        documents.clear();
        return { data: { deleted: documents.size } };
      }
      return { data: {} };
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module, exports: module.exports, console,
    localStorage: { setItem: (_key, value) => { cache = JSON.parse(value); }, removeItem: () => {} },
    require: id => id === 'firebase/firestore' ? firestore
      : id === 'firebase/functions' ? functionsModule
        : id === '../firebase' ? { db: {}, handleFirestoreError: () => {}, OperationType: { GET: 'get', WRITE: 'write' } }
          : id === '../data/scholarshipData' ? { loadApplications: () => cache, saveApplication: () => {}, loadTimelineConfig: () => ({}), saveTimelineConfig: () => {}, normalizeTimelineConfig: x => x }
            : id === '../utils/offlineStorage' ? { safeSetApplicationsLocalStorage: apps => { cache = apps; }, saveAppsIndexedDB: async () => {}, deleteAppIndexedDB: async () => {}, clearAppsIndexedDB: async () => {} }
              : id === '../utils/applicationSubmission' ? { validateSubmissionSize: () => {} }
                : {},
  });
  return { api: module.exports, cache: () => cache, documents };
}

test('admin delete via callable removes the target and preserves unrelated applications', async () => {
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

test('admin bulk delete via callable clears local cache after success', async () => {
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
