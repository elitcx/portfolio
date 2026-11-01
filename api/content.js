import { gitHubFromEnv } from './_lib/github.js';
import { guard, sendFailure } from './_lib/guard.js';

// Reads from GitHub rather than the bundle, so the form never starts from a
// deploy that is still catching up with the last save.
export default async function handler(req, res) {
  if (!guard(req, res, { method: 'GET' })) return;

  try {
    res.status(200).json(await gitHubFromEnv().readContent());
  } catch (error) {
    sendFailure(res, error);
  }
}
