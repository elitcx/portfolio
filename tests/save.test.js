import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, beforeEach, test } from 'node:test';

import save from '../api/save.js';
import upload from '../api/upload.js';
import { signSession } from '../api/_lib/session.js';

const SHA = (c) => c.repeat(40);
const SITE = 'https://kennethjmw.vercel.app';
const realFetch = globalThis.fetch;

const projects = JSON.parse(readFileSync(new URL('../src/content/projects.json', import.meta.url), 'utf8'));

let calls;

function stubGitHub({ head = SHA('a'), compareFiles = [], existing = [] } = {}) {
  calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const path = url.replace('https://api.github.com/repos/elitcx/portfolio', '');
    calls.push({ method: init.method ?? 'GET', path, body: init.body && JSON.parse(init.body) });
    const json = (data, status = 200) => ({ ok: status < 400, status, json: async () => data, text: async () => '' });
    if (path === '/git/ref/heads/main') return json({ object: { sha: head } });
    if (path.startsWith('/git/trees/')) return json({ tree: existing.map((p) => ({ path: p })) });
    if (path.startsWith('/compare/')) return json({ files: compareFiles.map((filename) => ({ filename })) });
    if (path.startsWith('/git/commits/')) return json({ tree: { sha: SHA('t') } });
    if (path === '/git/blobs') return json({ sha: SHA('b') }, 201);
    if (path === '/git/trees') return json({ sha: SHA('n') }, 201);
    if (path === '/git/commits') return json({ sha: SHA('c') }, 201);
    if (path === '/git/refs/heads/main') return json({});
    return json({ message: 'unexpected' }, 500);
  };
}

function fakeRes() {
  return {
    code: null,
    body: undefined,
    setHeader() { return this; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

async function call(handler, body) {
  const res = fakeRes();
  const cookie = `admin_session=${signSession('secret')}`;
  await handler({ method: 'POST', headers: { origin: SITE, cookie }, body }, res);
  return res;
}

const allImages = projects.map((p) => `public${p.image}`);
const wrote = () => calls.some((c) => c.method !== 'GET');

beforeEach(() => {
  process.env.SESSION_SECRET = 'secret';
  process.env.GITHUB_TOKEN = 'tok';
  process.env.VERCEL_ENV = 'production';
  delete process.env.GITHUB_BRANCH;
  stubGitHub({ existing: allImages });
});
after(() => { globalThis.fetch = realFetch; });

test('save commits valid content and names it in the message', async () => {
  const res = await call(save, { baseSha: SHA('a'), files: { projects } });
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { sha: SHA('c') });
  assert.equal(calls.find((c) => c.path === '/git/commits').body.message, 'content: update projects via admin');
});

test('save rejects invalid content with readable errors, writing nothing', async () => {
  const bad = [{ ...projects[0], link: 'javascript:alert(1)' }];
  const res = await call(save, { baseSha: SHA('a'), files: { projects: bad } });
  assert.equal(res.code, 400);
  assert.match(res.body.errors[0], /Repo link/);
  assert.equal(wrote(), false);
});

test('save rejects a picture that exists nowhere, writing nothing', async () => {
  const bad = [{ ...projects[0], image: '/images/missing-1a2b3c4d.jpg' }];
  const res = await call(save, { baseSha: SHA('a'), files: { projects: bad } });
  assert.equal(res.code, 400);
  assert.match(res.body.errors[0], /missing-1a2b3c4d/);
  assert.equal(wrote(), false);
});

test('save accepts a new picture that was just uploaded', async () => {
  const path = 'public/images/new-1a2b3c4d.jpg';
  const res = await call(save, {
    baseSha: SHA('a'),
    files: { projects: [{ ...projects[0], image: '/images/new-1a2b3c4d.jpg' }] },
    uploads: [{ path, blobSha: SHA('b') }],
  });
  assert.equal(res.code, 200);
  const entry = calls.find((c) => c.path === '/git/trees').body.tree.find((e) => e.path === path);
  assert.equal(entry.sha, SHA('b'));
});

test('save refuses paths outside the allowlist and malformed input', async () => {
  const cases = [
    { baseSha: SHA('a'), uploads: [{ path: 'api/save.js', blobSha: SHA('b') }] },
    { baseSha: SHA('a'), uploads: [{ path: 'public/images/a-1a2b3c4d.jpg', blobSha: 'nope' }] },
    { baseSha: SHA('a'), files: { evil: {} } },
    { baseSha: SHA('a'), files: {} },
    { baseSha: 'nope', files: { projects } },
    { baseSha: SHA('a'), files: { projects }, uploads: 'x' },
    undefined,
  ];
  for (const body of cases) {
    const res = await call(save, body);
    assert.equal(res.code, 400, JSON.stringify(body)?.slice(0, 80));
  }
  assert.equal(wrote(), false);
});

test('save reports a conflict when content moved on', async () => {
  stubGitHub({ head: SHA('d'), compareFiles: ['src/content/projects.json'], existing: allImages });
  const res = await call(save, { baseSha: SHA('a'), files: { projects } });
  assert.equal(res.code, 409);
});

test('save hides internal failures behind a generic message', async () => {
  globalThis.fetch = async () => { throw new Error('secret detail tok'); };
  const original = console.error;
  console.error = () => {};
  const res = await call(save, { baseSha: SHA('a'), files: { projects } });
  console.error = original;
  assert.equal(res.code, 500);
  assert.equal(JSON.stringify(res.body).includes('secret'), false);
});

test('upload stores a real picture and rejects anything else', async () => {
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2]).toString('base64');
  const ok = await call(upload, { kind: 'project', name: 'My App', dataBase64: jpg });
  assert.equal(ok.code, 200);
  assert.match(ok.body.path, /^public\/images\/my-app-[0-9a-f]{8}\.jpg$/);
  assert.equal(ok.body.publicPath, ok.body.path.replace('public', ''));
  assert.equal(ok.body.blobSha, SHA('b'));

  calls.length = 0;
  const svg = Buffer.from('<svg onload="alert(1)"/>').toString('base64');
  assert.equal((await call(upload, { kind: 'project', name: 'x', dataBase64: svg })).code, 400);
  assert.equal((await call(upload, { kind: 'project', name: 'x' })).code, 400);
  assert.equal((await call(upload, { kind: 'cv', name: 'x', dataBase64: jpg })).code, 400);
  assert.equal(calls.length, 0);
});

test('endpoints reject a request with no session', async () => {
  const res = fakeRes();
  await save({ method: 'POST', headers: { origin: SITE }, body: { baseSha: SHA('a'), files: { projects } } }, res);
  assert.equal(res.code, 401);
});

test('a rejected GitHub token says so, without being mistaken for a login problem', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}), text: async () => '' });
  const original = console.error;
  console.error = () => {};
  const res = await call(save, { baseSha: SHA('a'), files: { projects } });
  console.error = original;
  assert.equal(res.code, 502);
  assert.match(res.body.error, /GitHub token/);
  assert.equal(JSON.stringify(res.body).includes('tok"'), false);
});
