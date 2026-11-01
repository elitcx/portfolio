import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ConflictError, createGitHub } from '../api/_lib/github.js';

const SHA = (c) => c.repeat(40);

// Answers GitHub's routes from a table and records every call.
function fakeGitHub({ head = SHA('a'), compareFiles = [], refStatus = 200 } = {}) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    const path = url.replace('https://api.github.com/repos/elitcx/portfolio', '');
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ method: init.method ?? 'GET', path, body, headers: init.headers });
    const json = (data, status = 200) => ({ ok: status < 400, status, json: async () => data, text: async () => JSON.stringify(data) });

    if (path === '/git/ref/heads/main') return json({ object: { sha: head } });
    if (path.startsWith('/compare/')) return json({ files: compareFiles.map((filename) => ({ filename })) });
    if (path === `/git/commits/${head}`) return json({ tree: { sha: SHA('t') } });
    if (path === '/git/blobs') return json({ sha: SHA('b') }, 201);
    if (path === '/git/trees') return json({ sha: SHA('n') }, 201);
    if (path === '/git/commits') return json({ sha: SHA('c') }, 201);
    if (path === '/git/refs/heads/main') return json({ message: 'ref' }, refStatus);
    return json({ message: `unexpected ${path}` }, 500);
  };
  return { gh: createGitHub({ token: 'tok', branch: 'main', fetch }), calls };
}

const save = (gh, baseSha, extra = {}) =>
  gh.commit({
    baseSha,
    message: 'content: update projects via admin',
    json: { projects: [{ title: 'A' }] },
    blobs: [],
    ...extra,
  });

test('commit on an unmoved branch updates the ref without force', async () => {
  const { gh, calls } = fakeGitHub();
  const result = await save(gh, SHA('a'));
  assert.deepEqual(result, { sha: SHA('c') });

  const tree = calls.find((c) => c.path === '/git/trees').body;
  assert.equal(tree.base_tree, SHA('t'));
  assert.equal(tree.tree[0].path, 'src/content/projects.json');
  assert.equal(tree.tree[0].content, `${JSON.stringify([{ title: 'A' }], null, 2)}\n`);

  const commit = calls.find((c) => c.path === '/git/commits').body;
  assert.deepEqual(commit.parents, [SHA('a')]);

  const ref = calls.find((c) => c.path === '/git/refs/heads/main');
  assert.equal(ref.method, 'PATCH');
  assert.deepEqual(ref.body, { sha: SHA('c'), force: false });
  assert.equal(calls.some((c) => c.path.startsWith('/compare/')), false);
});

test('commit throws a conflict when content changed since the form loaded', async () => {
  const { gh, calls } = fakeGitHub({ head: SHA('d'), compareFiles: ['src/content/site.json'] });
  await assert.rejects(save(gh, SHA('a')), ConflictError);
  assert.equal(calls.some((c) => c.path === '/git/trees'), false);
});

test('commit carries on when only unrelated files changed, building on the new head', async () => {
  const { gh, calls } = fakeGitHub({ head: SHA('d'), compareFiles: ['src/App.jsx'] });
  await save(gh, SHA('a'));
  assert.deepEqual(calls.find((c) => c.path === '/git/commits').body.parents, [SHA('d')]);
});

test('commit treats a change to an uploaded path as a conflict', async () => {
  const path = 'public/Kenneth-Jehezkiel-MW-CV.pdf';
  const { gh } = fakeGitHub({ head: SHA('d'), compareFiles: [path] });
  await assert.rejects(save(gh, SHA('a'), { blobs: [{ path, blobSha: SHA('b') }] }), ConflictError);
});

test('a lost race on the ref update is a conflict', async () => {
  const { gh } = fakeGitHub({ refStatus: 422 });
  await assert.rejects(save(gh, SHA('a')), ConflictError);
});

test('commit refuses a disallowed path before any network call', async () => {
  const { gh, calls } = fakeGitHub();
  await assert.rejects(
    save(gh, SHA('a'), { blobs: [{ path: 'api/save.js', blobSha: SHA('b') }] }),
    /not allowed/,
  );
  assert.equal(calls.length, 0);
  await assert.rejects(save(gh, SHA('a'), { json: { evil: {} } }), /not allowed/);
  assert.equal(calls.length, 0);
});

test('GitHub errors never reveal the token', async () => {
  const fetch = async () => ({ ok: false, status: 500, json: async () => ({}), text: async () => 'boom' });
  const gh = createGitHub({ token: 'super-secret-token', branch: 'main', fetch });
  await assert.rejects(gh.readContent(), (error) => {
    assert.equal(String(error.message).includes('super-secret-token'), false);
    return true;
  });
});

test('the token is sent only as a header', async () => {
  const { gh, calls } = fakeGitHub();
  await save(gh, SHA('a'));
  assert.equal(calls[0].headers.Authorization, 'Bearer tok');
  assert.equal(calls[0].path.includes('tok'), false);
});
