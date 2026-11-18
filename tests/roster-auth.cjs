const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const source = fs.readFileSync('src/App.tsx', 'utf8');

function authHarness() {
  const start = source.lastIndexOf('useEffect(() => {', source.indexOf('const unsubscribeAuth'));
  const end = source.indexOf('\n  }, []);', start);
  let listener, admin = false, apps = [];
  const cleanup = vm.runInNewContext(stripTypeScriptTypes('(() => {' + source.slice(start + 'useEffect(() => {'.length, end) + '})()', {
    mode: 'transform',
  }), {
    auth: {}, onAuthStateChanged: (_auth, callback) => { listener = callback; return () => {}; },
    setIsAdminLoggedIn: value => { admin = value; }, setApplications: value => { apps = value; },
    safeSetApplicationsLocalStorage: () => {}, clearAppsIndexedDB: async () => {},
    loadApplications: () => [{ id: 'synthetic-private' }], backfillPublicApplicationsOnce: async () => {},
    loadTimelineConfig: () => ({}), setTimelineConfig: () => {}, console,
  });
  return { fire: user => listener(user), admin: () => admin, apps: () => apps, cleanup };
}

function delayedUser() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { user: { emailVerified: true, getIdTokenResult: () => promise }, resolve, reject };
}

test('late admin claims cannot reauthorize a logged out session', async () => {
  const x = authHarness(), pending = delayedUser();
  const first = x.fire(pending.user);
  await x.fire(null);
  pending.resolve({ claims: { admin: true } }); await first;
  assert.equal(x.admin(), false);
  assert.equal(x.apps().length, 0);
});

test('late claims from a previous account cannot replace the current account', async () => {
  const x = authHarness(), pending = delayedUser();
  const first = x.fire(pending.user);
  await x.fire({ emailVerified: true, getIdTokenResult: async () => ({ claims: {} }) });
  pending.resolve({ claims: { admin: true } }); await first;
  assert.equal(x.admin(), false);
  assert.equal(x.apps().length, 0);
});

test('verified admin claims load the admin cache', async () => {
  const x = authHarness();
  await x.fire({ emailVerified: true, getIdTokenResult: async () => ({ claims: { admin: true } }) });
  assert.equal(x.admin(), true);
  assert.equal(x.apps()[0].id, 'synthetic-private');
});

test('switching accounts clears private state before claims resolve', async () => {
  const x = authHarness();
  await x.fire({ emailVerified: true, getIdTokenResult: async () => ({ claims: { admin: true } }) });
  const pending = delayedUser(), next = x.fire(pending.user);
  assert.equal(x.admin(), false);
  assert.equal(x.apps().length, 0);
  pending.resolve({ claims: {} }); await next;
});

test('public refresh never loads legacy private cache and preserves cooldown', () => {
  const body = source.match(/const refreshApplications = \(\) => \{([\s\S]*?)\n  };/)[1];
  let cacheReads = 0, updates = 0, reconnects = 0;
  const run = vm.runInNewContext('(()=>{' + body + '})', {
    Date, lastRefresh: { current: 0 }, isAdminLoggedIn: false,
    setApplications: () => { updates++; }, loadApplications: () => { cacheReads++; return [{ id: 'private' }]; },
    setTimelineError: () => {}, setRefreshVersion: () => { reconnects++; },
  });
  run(); run();
  assert.equal(cacheReads, 0);
  assert.equal(updates, 0);
  assert.equal(reconnects, 1);
});
