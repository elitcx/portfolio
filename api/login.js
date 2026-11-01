import { setTimeout as sleep } from 'node:timers/promises';

import { failureDelay, guardPublic, sessionCookie } from './_lib/guard.js';
import { verifyPassword } from './_lib/password.js';
import { signSession } from './_lib/session.js';

// Longer than any real password, and short enough that scrypt stays cheap.
const MAX_PASSWORD_LENGTH = 1024;

// ponytail: per-instance only, add shared rate limiting if logs show attacks.
// The real defence against guessing is the long random password.
let failures = 0;

export default async function handler(req, res) {
  if (!guardPublic(req, res, { method: 'POST' })) return;

  const { ADMIN_PASSWORD_HASH, SESSION_SECRET } = process.env;
  if (!ADMIN_PASSWORD_HASH || !SESSION_SECRET) {
    console.error('Login is missing ADMIN_PASSWORD_HASH or SESSION_SECRET');
    res.status(500).json({ error: 'Login is not available' });
    return;
  }

  const password = req.body?.password;
  const usable = typeof password === 'string' && password.length <= MAX_PASSWORD_LENGTH;

  if (!usable || !(await verifyPassword(password, ADMIN_PASSWORD_HASH))) {
    await sleep(failureDelay(failures));
    failures += 1;
    res.status(401).json({ error: 'Wrong password' });
    return;
  }

  failures = 0;
  res.setHeader('Set-Cookie', sessionCookie(signSession(SESSION_SECRET)));
  res.status(204).end();
}
