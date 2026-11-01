import { gitHubFromEnv } from './_lib/github.js';
import { guard, sendFailure } from './_lib/guard.js';

export default async function handler(req, res) {
  if (!guard(req, res, { method: 'GET' })) return;

  const { sha } = req.query ?? {};
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) {
    res.status(400).json({ error: 'Unknown commit' });
    return;
  }

  try {
    res.status(200).json({ state: await gitHubFromEnv().status(sha) });
  } catch (error) {
    sendFailure(res, error);
  }
}
