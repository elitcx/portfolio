import { validateFile } from '../src/lib/contentSchema.js';
import { CONTENT_PATHS, pathAllowed } from './_lib/files.js';
import { ConflictError, gitHubFromEnv } from './_lib/github.js';
import { guard, sendFailure } from './_lib/guard.js';

const SHA = /^[0-9a-f]{40}$/;
const MAX_UPLOADS = 20;

function imagesIn(name, data) {
  if (name === 'site') return [data.banner];
  return data.map((item) => item.image).filter(Boolean);
}

function checkRequest({ baseSha, files, uploads }) {
  if (typeof baseSha !== 'string' || !SHA.test(baseSha)) return ['The page is out of date. Reload and try again'];
  if (files !== null && typeof files !== 'object') return ['Nothing to save'];
  if (!Array.isArray(uploads) || uploads.length > MAX_UPLOADS) return ['Too many pictures in one save'];

  const names = Object.keys(files ?? {});
  if (!names.length && !uploads.length) return ['Nothing to save'];

  const unknown = names.find((name) => !Object.hasOwn(CONTENT_PATHS, name));
  if (unknown) return [`Unknown content file: ${unknown}`];

  const badUpload = uploads.find((u) => !pathAllowed(u?.path) || !SHA.test(u?.blobSha ?? ''));
  if (badUpload) return ['A picture could not be saved. Choose it again'];

  return names.flatMap((name) => validateFile(name, files[name]));
}

export default async function handler(req, res) {
  if (!guard(req, res, { method: 'POST' })) return;

  const { baseSha, files, uploads = [] } = req.body ?? {};
  const errors = checkRequest({ baseSha, files, uploads });
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  const json = files ?? {};
  const names = Object.keys(json);

  try {
    const github = gitHubFromEnv();

    // A reference to a picture that does not exist would fail the image step of
    // the build, so catch it here where the owner can still fix it.
    const uploaded = new Set(uploads.map((u) => u.path));
    const existing = await github.paths(baseSha);
    const missing = names
      .flatMap((name) => imagesIn(name, json[name]))
      .filter((image) => !uploaded.has(`public${image}`) && !existing.has(`public${image}`));
    if (missing.length) {
      res.status(400).json({ errors: missing.map((image) => `Picture not found: ${image}`) });
      return;
    }

    const message = `content: update ${names.join(', ') || 'files'} via admin`;
    const { sha } = await github.commit({ baseSha, message, json, blobs: uploads });
    res.status(200).json({ sha });
  } catch (error) {
    if (error instanceof ConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }
    sendFailure(res, error);
  }
}
