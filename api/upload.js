import { MAX_UPLOAD_BYTES, uploadPath } from './_lib/files.js';
import { gitHubFromEnv } from './_lib/github.js';
import { guard, sendFailure } from './_lib/guard.js';

// Each picture is its own request, so several fit under Vercel's request cap.
// This stores the file in git but publishes nothing until save references it.
export default async function handler(req, res) {
  if (!guard(req, res, { method: 'POST' })) return;

  const { kind, name, dataBase64 } = req.body ?? {};
  if (typeof dataBase64 !== 'string' || dataBase64.length > (MAX_UPLOAD_BYTES * 4) / 3 + 4) {
    res.status(400).json({ error: 'That file is larger than 3 MB' });
    return;
  }

  const buffer = Buffer.from(dataBase64, 'base64');
  const { path, error } = uploadPath(kind, name, buffer);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  try {
    const blobSha = await gitHubFromEnv().createBlob(buffer);
    res.status(200).json({ path, blobSha, publicPath: path.replace(/^public/, '') });
  } catch (failure) {
    sendFailure(res, failure);
  }
}
