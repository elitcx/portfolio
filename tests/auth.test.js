import assert from 'node:assert/strict';
import { test } from 'node:test';

import login from '../api/login.js';
import logout from '../api/logout.js';
import { failureDelay, guard, originAllowed, readCookie } from '../api/_lib/guard.js';
import { hashPassword, verifyPassword } from '../api/_lib/password.js';
import { SESSION_TTL_MS, signSession, verifySession } from '../api/_lib/session.js';

test('a session verifies until it expires', () => {
  const token = signSession('s', 1000);
  assert.equal(verifySession(token, 's', 2000), true);
  assert.equal(verifySession(token, 's', 1000 + SESSION_TTL_MS + 1), false);
  assert.equal(SESSION_TTL_MS, 43200000);
});

test('a session is rejected when forged or malformed', () => {
  const token = signSession('s', 1000);
  assert.equal(verifySession(token, 'other', 2000), false);
  const last = token.at(-1) === 'x' ? 'y' : 'x';
  assert.equal(verifySession(token.slice(0, -1) + last, 's', 2000), false);
  assert.equal(verifySession('garbage', 's', 2000), false);
  assert.equal(verifySession(undefined, 's', 2000), false);
  assert.equal(verifySession(token, undefined, 2000), false);
});

test('changing the expiry invalidates the signature', () => {
  const [, mac] = signSession('s', 1000).split('.');
  assert.equal(verifySession(`${Date.now() + 1e12}.${mac}`, 's', 2000), false);
});

test('password hash verifies only the right password', async () => {
  const hash = await hashPassword('correct horse');
  assert.equal(await verifyPassword('correct horse', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
  assert.equal(await verifyPassword('x', 'malformed'), false);
  assert.equal(await verifyPassword('x', undefined), false);
  assert.equal(await verifyPassword(undefined, hash), false);
  assert.notEqual(await hashPassword('correct horse'), hash);
});

test('origin check only trusts the site, and localhost outside production', () => {
  assert.equal(originAllowed('https://kennethjmw.vercel.app', 'production'), true);
  assert.equal(originAllowed('http://localhost:3000', 'production'), false);
  assert.equal(originAllowed('http://localhost:3000', 'development'), true);
  assert.equal(originAllowed('https://evil.example', 'preview'), false);
  assert.equal(originAllowed('http://localhost.evil.example', 'development'), false);
  assert.equal(originAllowed(undefined, 'production'), false);
});

test('readCookie finds the named cookie', () => {
  assert.equal(readCookie('a=1; admin_session=abc', 'admin_session'), 'abc');
  assert.equal(readCookie('a=1', 'admin_session'), null);
  assert.equal(readCookie(undefined, 'admin_session'), null);
});

test('failed logins slow down up to a cap', () => {
  assert.equal(failureDelay(0), 500);
  assert.equal(failureDelay(1), 1000);
  assert.equal(failureDelay(20), 5000);
});

function fakeRes() {
  return {
    code: null,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

const SITE = 'https://kennethjmw.vercel.app';
const cookieFor = (token) => `admin_session=${token}`;

test('guard rejects wrong method, bad origin and missing session', () => {
  process.env.SESSION_SECRET = 'secret';
  process.env.VERCEL_ENV = 'production';
  const good = signSession('secret');
  const run = (req) => {
    const res = fakeRes();
    const ok = guard({ headers: {}, ...req }, res, { method: 'POST' });
    return { ok, code: res.code, cache: res.headers['cache-control'] };
  };
  const valid = { origin: SITE, cookie: cookieFor(good) };
  assert.equal(run({ method: 'GET', headers: valid }).code, 405);
  assert.equal(run({ method: 'POST', headers: { ...valid, origin: 'https://evil.example' } }).code, 403);
  assert.equal(run({ method: 'POST', headers: { cookie: valid.cookie } }).code, 403);
  assert.equal(run({ method: 'POST', headers: { origin: SITE } }).code, 401);
  assert.equal(run({ method: 'POST', headers: { origin: SITE, cookie: cookieFor('forged.x') } }).code, 401);
  const pass = run({ method: 'POST', headers: valid });
  assert.deepEqual([pass.ok, pass.code, pass.cache], [true, null, 'no-store']);
});

test('guard needs no origin on a read, but still needs a session', () => {
  process.env.SESSION_SECRET = 'secret';
  const res = fakeRes();
  assert.equal(guard({ method: 'GET', headers: {} }, res, { method: 'GET' }), false);
  assert.equal(res.code, 401);
  const ok = fakeRes();
  const cookie = cookieFor(signSession('secret'));
  assert.equal(guard({ method: 'GET', headers: { cookie } }, ok, { method: 'GET' }), true);
});

test('login sets a locked-down cookie only for the right password', async () => {
  process.env.VERCEL_ENV = 'production';
  process.env.SESSION_SECRET = 'secret';
  process.env.ADMIN_PASSWORD_HASH = await hashPassword('correct horse battery');
  const post = async (body, origin = SITE) => {
    const res = fakeRes();
    await login({ method: 'POST', headers: { origin }, body }, res);
    return res;
  };

  const ok = await post({ password: 'correct horse battery' });
  assert.equal(ok.code, 204);
  const cookie = ok.headers['set-cookie'];
  for (const part of ['admin_session=', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=43200']) {
    assert.ok(cookie.includes(part), part);
  }
  assert.equal(verifySession(cookie.split(';')[0].split('=')[1], 'secret'), true);

  const wrong = await post({ password: 'nope' });
  assert.equal(wrong.code, 401);
  assert.deepEqual(wrong.body, { error: 'Wrong password' });
  assert.equal(wrong.headers['set-cookie'], undefined);

  assert.equal((await post({ password: 'correct horse battery' }, 'https://evil.example')).code, 403);
  assert.equal((await post({})).code, 401);
  assert.equal((await post({ password: 'x'.repeat(5000) })).code, 401);
});

test('login fails closed when secrets are missing', async () => {
  const { ADMIN_PASSWORD_HASH } = process.env;
  delete process.env.ADMIN_PASSWORD_HASH;
  const res = fakeRes();
  await login({ method: 'POST', headers: { origin: SITE }, body: { password: 'x' } }, res);
  process.env.ADMIN_PASSWORD_HASH = ADMIN_PASSWORD_HASH;
  assert.equal(res.code, 500);
  assert.equal(res.headers['set-cookie'], undefined);
});

test('logout clears the cookie', () => {
  process.env.VERCEL_ENV = 'production';
  const res = fakeRes();
  logout({ method: 'POST', headers: { origin: SITE } }, res);
  assert.equal(res.code, 204);
  assert.ok(res.headers['set-cookie'].includes('Max-Age=0'));
});
