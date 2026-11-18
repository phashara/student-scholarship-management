const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const raw = fs.readFileSync('src/services/firebaseService.ts', 'utf8');
const service = stripTypeScriptTypes(raw).replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '').replace(/export /g, '');
function setup() {
  let emit, fail, writes = 0;
  const states = [];
  const api = vm.runInNewContext(service + '\n({subscribeTimelineConfig,firestoreReadErrorStatus})', {
    db: {}, doc: () => ({}), getFunctions: () => ({}),
    onSnapshot: (_ref, next, error) => { emit = next; fail = error; return () => {}; },
    normalizeTimelineConfig: x => x, saveLocalTimelineConfig: () => {}, loadLocalTimelineConfig: () => ({}),
    setDoc: async () => { writes++; }, handleFirestoreError: () => {}, OperationType: { GET: 'get' },
  });
  api.subscribeTimelineConfig(() => {}, () => states.push('error'), state => states.push(state));
  return { api, states, writes: () => writes, fail: () => fail({ code: 'unavailable' }),
    emit: () => emit({ metadata: { fromCache: false, hasPendingWrites: false }, exists: () => true,
      data: () => ({ version: 'old', heroTitle: '28 กันยายน' }) }) };
}
test('read failures distinguish permissions, quota, offline, and unknown errors', () => {
  const { api } = setup();
  for (const [code, expected] of [['permission-denied', 'permission-denied'], ['resource-exhausted', 'quota-exceeded'], ['unavailable', 'unavailable'], ['unknown', 'error']]) {
    assert.equal(api.firestoreReadErrorStatus({ code }), expected);
  }
});
test('timeline server recovery clears a previous error through the status callback', () => {
  const x = setup(); x.fail(); x.emit();
  assert.deepEqual(x.states, ['error', 'server']);
});
test('reading an old public timeline never writes to Firestore', () => {
  const x = setup(); x.emit(); assert.equal(x.writes(), 0);
});
test('timeline errors do not mark server-confirmed roster as failed', () => {
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  const expression = app.match(/const hasReadError = (.*);/)[1];
  assert.equal(vm.runInNewContext(expression, { applicationReadStatus: 'server', timelineError: 'error' }), false);
});
test('status lookup errors are distinguished from a successful no-match response', async () => {
  const component = fs.readFileSync('src/components/StatusTracker.tsx', 'utf8');
  const handler = component.match(/  const handleSearch = async [\s\S]*?\n  };/)[0];
  let matched = 'old', error = '';
  const run = vm.runInNewContext(stripTypeScriptTypes(handler) + '\nhandleSearch', {
    query: 'SYNTHETIC', setHasSearched: () => {}, setIsSearching: () => {},
    setMatchedApp: x => { matched = x; }, setSearchError: x => { error = x; },
    onLookup: async () => { throw Error('service unavailable'); },
  });
  await run({ preventDefault() {} });
  assert.equal(matched, null); assert.ok(error.length > 0);
  assert.match(component, /searchError\s*\?/);
});
