import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';

import status from '../api/status.js';
import translate from '../api/translate.js';
import { signSession } from '../api/_lib/session.js';
import { buildTranslateRequest, requestDraft, tokensPreserved } from '../api/_lib/translate.js';

const SITE = 'https://kennethjmw.vercel.app';
const realFetch = globalThis.fetch;

function fakeRes() {
  return {
    code: null,
    body: undefined,
    setHeader() { return this; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const headers = () => ({ origin: SITE, cookie: `admin_session=${signSession('secret')}` });

async function post(body) {
  const res = fakeRes();
  await translate({ method: 'POST', headers: headers(), body }, res);
  return res;
}

function stubGemini(reply, ok = true) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok,
      status: ok ? 200 : 500,
      json: async () => ({ candidates: [{ content: { parts: [{ text: reply }] } }] }),
    };
  };
  return calls;
}

beforeEach(() => {
  process.env.SESSION_SECRET = 'secret';
  process.env.GEMINI_API_KEY = 'gem-key';
  process.env.GITHUB_TOKEN = 'tok';
  process.env.VERCEL_ENV = 'production';
});
after(() => { globalThis.fetch = realFetch; });

test('tokensPreserved notices dropped tokens and bold markers', () => {
  assert.equal(tokensPreserved('{age} **a**', '{age} **b**'), true);
  assert.equal(tokensPreserved('{age} a', 'a'), false);
  assert.equal(tokensPreserved('**a** b', 'a b'), false);
  assert.equal(tokensPreserved('x', 'y'), true);
});

test('the request carries the text, the language and the rules', () => {
  const body = JSON.stringify(buildTranslateRequest('Halo {age}', 'en'));
  assert.ok(body.includes('Halo {age}'));
  assert.ok(body.includes('English'));
  assert.ok(JSON.stringify(buildTranslateRequest('x', 'id')).includes('Indonesian'));
  for (const rule of ['{', '**', 'line breaks', 'proper nouns', 'only the translation']) {
    assert.ok(body.includes(rule), rule);
  }
});

test('translate returns the draft and keeps the key in a header', async () => {
  const calls = stubGemini('Hello\n');
  const res = await post({ text: 'Halo', to: 'en' });
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { text: 'Hello' });
  assert.equal(calls[0].url.includes('gem-key'), false);
  assert.equal(calls[0].init.headers['x-goog-api-key'], 'gem-key');
});

test('translate warns when the draft lost a token', async () => {
  stubGemini('Berusia tahun');
  const res = await post({ text: '{age} years old', to: 'id' });
  assert.equal(res.body.text, 'Berusia tahun');
  assert.ok(res.body.warning);
});

test('translate rejects bad input without calling the service', async () => {
  const calls = stubGemini('x');
  assert.equal((await post({ text: '', to: 'id' })).code, 400);
  assert.equal((await post({ text: 'x', to: 'fr' })).code, 400);
  assert.equal((await post({ text: 'x'.repeat(4001), to: 'id' })).code, 400);
  assert.equal((await post(undefined)).code, 400);
  assert.equal(calls.length, 0);
});

test('a service failure is a readable 502, not a crash', async () => {
  stubGemini('x', false);
  const original = console.error;
  console.error = () => {};
  const res = await post({ text: 'x', to: 'id' });
  console.error = original;
  assert.equal(res.code, 502);
  assert.equal(JSON.stringify(res.body).includes('gem-key'), false);
});

test('translate needs a session, so nobody can spend the key', async () => {
  const calls = stubGemini('x');
  const res = fakeRes();
  await translate({ method: 'POST', headers: { origin: SITE }, body: { text: 'x', to: 'id' } }, res);
  assert.equal(res.code, 401);
  assert.equal(calls.length, 0);
});

test('status rejects a malformed sha and reports the state', async () => {
  const get = async (sha) => {
    const res = fakeRes();
    await status({ method: 'GET', headers: headers(), query: { sha } }, res);
    return res;
  };
  assert.equal((await get('../../evil')).code, 400);
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ state: 'success', total_count: 1 }) });
  assert.deepEqual((await get('a'.repeat(40))).body, { state: 'success' });
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ state: 'pending', total_count: 0 }) });
  assert.deepEqual((await get('a'.repeat(40))).body, { state: 'unknown' });
});

test('a Gemini call that hangs gives up instead of leaving the button stuck', async () => {
  globalThis.fetch = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason));
  });
  await assert.rejects(requestDraft('x', 'id', 'key', { timeoutMs: 20 }), /timeout|aborted/i);
});
