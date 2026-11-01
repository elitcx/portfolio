import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const mac = (expiry, secret) => createHmac('sha256', secret).update(expiry).digest('base64url');

// Stateless on purpose: rotating SESSION_SECRET logs out every device.
export function signSession(secret, now = Date.now()) {
  const expiry = String(now + SESSION_TTL_MS);
  return `${expiry}.${mac(expiry, secret)}`;
}

export function verifySession(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || !secret) return false;
  const [expiry, given, extra] = token.split('.');
  if (!expiry || !given || extra !== undefined || !/^\d+$/.test(expiry)) return false;

  const a = Buffer.from(given);
  const b = Buffer.from(mac(expiry, secret));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return now < Number(expiry);
}
