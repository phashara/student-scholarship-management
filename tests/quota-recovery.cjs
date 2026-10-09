const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

function setup(initial = [{ id: 'FSS-2569-existing', studentId: '12345678' }]) {
  let cache = structuredClone(initial), writes = 0, update, fail;
  const states = [], updates = [];
  const raw = stripTypeScriptTypes(fs.readFileSync('src/services/firebaseService.ts', 'utf8'));
  const source = raw.replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '').replace(/export /g, '');
  const api = vm.runInNewContext(source + '\n({subscribeApplications,firestoreReadErrorStatus})', {
    db: {}, collection: () => ({}),
    onSnapshot: (_ref, _opts, onUpdate, onError) => { update = onUpdate; fail = onError; return () => {}; },
    loadLocalApplications: () => structuredClone(cache),
    handleFirestoreError: () => {}, OperationType: { GET: 'get' },
    localStorage: { setItem: (_key, value) => { writes++; cache = JSON.parse(value); } },
  });
  api.subscribeApplications(apps => updates.push(Array.from(apps)), undefined, status => states.push(status));
  return {
    api, states, updates, cache: () => cache, writes: () => writes,
    fail: error => fail(error),
    emit: (apps, metadata = {}) => update({
      metadata: { fromCache: false, hasPendingWrites: false, ...metadata },
      forEach: fn => apps.forEach(app => fn({ id: app.id, data: () => ({ ...app }) })),
    }),
  };
}

test('empty in-memory snapshot then quota failure preserves the previous register', () => {
  const x = setup();
  x.emit([], { fromCache: true });
  x.fail({ code: 'resource-exhausted', message: 'Quota exceeded' });
  assert.equal(x.cache().length, 1);
  assert.equal(x.writes(), 0);
  assert.equal(x.updates.at(-1)[0].id, 'FSS-2569-existing');
  assert.equal(x.states.at(-1), 'quota-exceeded');
  assert.ok(!x.states.includes('server'));
});

test('partial Firestore cache cannot replace the complete saved register', () => {
  const x = setup([{ id: 'FSS-a' }, { id: 'FSS-b' }]);
  x.emit([{ id: 'FSS-a' }], { fromCache: true });
  assert.equal(x.cache().length, 2);
  assert.equal(x.writes(), 0);
  assert.equal(x.updates.length, 0);
});

test('a fresh device with quota failure remains unavailable, never server-confirmed empty', () => {
  const x = setup([]);
  x.emit([], { fromCache: true });
  x.fail(new Error('Quota exceeded for free daily read units'));
  assert.equal(x.updates.at(-1).length, 0);
  assert.equal(x.states.at(-1), 'quota-exceeded');
  assert.equal(x.writes(), 0);
});

test('only a confirmed server snapshot may clear the register after real deletions', () => {
  const x = setup();
  x.emit([]);
  assert.equal(x.cache().length, 0);
  assert.equal(x.writes(), 1);
  assert.equal(x.states.at(-1), 'server');
});

test('successful reconnection replaces old cache with confirmed applicants', () => {
  const x = setup();
  x.emit([{ id: 'FSS-new', studentId: '22222222' }]);
  assert.equal(x.cache()[0].id, 'FSS-new');
  assert.equal(x.updates.at(-1)[0].id, 'FSS-new');
  assert.equal(x.states.at(-1), 'server');
});

test('permission errors retain cached records and are not reported as quota errors', () => {
  const x = setup();
  x.fail({ code: 'permission-denied', message: 'Insufficient permissions' });
  assert.equal(x.states.at(-1), 'error');
  assert.equal(x.cache().length, 1);
  assert.equal(x.writes(), 0);
});
