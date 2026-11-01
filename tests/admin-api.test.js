import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError, AuthExpired, Conflict, ValidationFailed, apiRequest } from '../src/admin/api.js';

const respond = (status, body) => async () => ({
  ok: status < 400,
  status,
  json: async () => {
    if (body === undefined) throw new SyntaxError('no json');
    return body;
  },
});

test('a good response returns its JSON', async () => {
  assert.deepEqual(await apiRequest('/api/x', { fetch: respond(200, { a: 1 }) }), { a: 1 });
});

test('a 204 returns null', async () => {
  assert.equal(await apiRequest('/api/x', { fetch: respond(204) }), null);
});

test('a 401 raises AuthExpired, so the editor can ask for login and keep its state', async () => {
  await assert.rejects(apiRequest('/api/x', { fetch: respond(401, { error: 'Please log in again' }) }), AuthExpired);
});

test('a 409 raises Conflict', async () => {
  await assert.rejects(apiRequest('/api/x', { fetch: respond(409, { error: 'Moved' }) }), Conflict);
});

test('a 400 raises ValidationFailed with every error', async () => {
  await assert.rejects(apiRequest('/api/x', { fetch: respond(400, { errors: ['a', 'b'] }) }), (error) => {
    assert.ok(error instanceof ValidationFailed);
    assert.deepEqual(error.errors, ['a', 'b']);
    return true;
  });
  await assert.rejects(apiRequest('/api/x', { fetch: respond(400, { error: 'one' }) }), (error) => {
    assert.deepEqual(error.errors, ['one']);
    return true;
  });
});

test('being offline raises ApiError', async () => {
  const offline = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(apiRequest('/api/x', { fetch: offline }), (error) => {
    assert.ok(error instanceof ApiError);
    assert.match(error.message, /connection/);
    return true;
  });
});

test('a non-JSON 500 raises ApiError instead of a parse crash', async () => {
  await assert.rejects(apiRequest('/api/x', { fetch: respond(500) }), ApiError);
});

test('the body is sent as JSON with the session cookie', async () => {
  let seen;
  await apiRequest('/api/x', {
    method: 'POST',
    body: { a: 1 },
    fetch: async (url, init) => {
      seen = { url, init };
      return { ok: true, status: 204, json: async () => null };
    },
  });
  assert.equal(seen.url, '/api/x');
  assert.equal(seen.init.method, 'POST');
  assert.equal(seen.init.body, '{"a":1}');
  assert.equal(seen.init.headers['Content-Type'], 'application/json');
  assert.equal(seen.init.credentials, 'same-origin');
});
