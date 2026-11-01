import { clearedCookie, guardPublic } from './_lib/guard.js';

export default function handler(req, res) {
  if (!guardPublic(req, res, { method: 'POST' })) return;
  res.setHeader('Set-Cookie', clearedCookie());
  res.status(204).end();
}
