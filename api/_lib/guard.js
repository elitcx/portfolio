import { SITE_URL } from '../../src/utils/Constants.js';
import { SESSION_TTL_MS, verifySession } from './session.js';

export const COOKIE_NAME = 'admin_session';

const COOKIE_FLAGS = 'HttpOnly; Secure; SameSite=Strict; Path=/';

export const sessionCookie = (token) =>
  `${COOKIE_NAME}=${token}; ${COOKIE_FLAGS}; Max-Age=${SESSION_TTL_MS / 1000}`;

export const clearedCookie = () => `${COOKIE_NAME}=; ${COOKIE_FLAGS}; Max-Age=0`;

// Localhost is trusted only outside production, for `vercel dev`. Preview
// deployments hold no secrets, so they cannot log in at all.
export function originAllowed(origin, vercelEnv) {
  if (origin === SITE_URL) return true;
  return vercelEnv === 'development'
    && /^http:\/\/localhost:\d+$/.test(origin ?? '');
}

export function readCookie(header, name) {
  for (const part of (header ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

export const failureDelay = (count) => Math.min(500 * 2 ** count, 5000);

// The cause goes to the Vercel logs. The browser only ever gets a generic line.
export function sendFailure(res, error) {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong on the server. Your edits are still here' });
}

// Shared by the endpoints that have no session to check: login and logout.
export function guardPublic(req, res, { method }) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== method) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  if (method !== 'GET' && !originAllowed(req.headers.origin, process.env.VERCEL_ENV)) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

export function guard(req, res, { method }) {
  if (!guardPublic(req, res, { method })) return false;
  const token = readCookie(req.headers.cookie, COOKIE_NAME);
  if (!verifySession(token, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'Please log in again' });
    return false;
  }
  return true;
}
