import { CONTENT_PATHS, pathAllowed } from './files.js';

const API = 'https://api.github.com';
const FILE_MODE = '100644';

export class ConflictError extends Error {}

export function createGitHub({
  token,
  repo = 'elitcx/portfolio',
  branch,
  fetch = (...args) => globalThis.fetch(...args),
}) {
  async function request(method, path, body) {
    const response = await fetch(`${API}/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (response.ok) return response.json();

    const error = new Error(`GitHub ${method} ${path} failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const headSha = async () => (await request('GET', `/git/ref/heads/${branch}`)).object.sha;

  return {
    async readContent() {
      const sha = await headSha();
      const entries = await Promise.all(
        Object.entries(CONTENT_PATHS).map(async ([name, path]) => {
          const file = await request('GET', `/contents/${path}?ref=${sha}`);
          return [name, JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'))];
        }),
      );
      return { sha, ...Object.fromEntries(entries) };
    },

    async createBlob(buffer) {
      const blob = await request('POST', '/git/blobs', {
        content: buffer.toString('base64'),
        encoding: 'base64',
      });
      return blob.sha;
    },

    async paths(sha) {
      const { tree } = await request('GET', `/git/trees/${sha}?recursive=1`);
      return new Set(tree.map((entry) => entry.path));
    },

    async status(sha) {
      const { state, total_count: total } = await request('GET', `/commits/${sha}/status`);
      if (!total) return 'unknown';
      return state === 'error' ? 'failure' : state;
    },

    // `json` maps content names to data, `blobs` are pictures already uploaded.
    // The ref update is never forced, so a concurrent push cannot be overwritten.
    async commit({ baseSha, message, json = {}, blobs = [] }) {
      const jsonPaths = Object.keys(json).map((name) => CONTENT_PATHS[name]);
      const blobPaths = blobs.map((blob) => blob.path);
      for (const path of [...jsonPaths, ...blobPaths]) {
        if (!pathAllowed(path)) throw new Error(`Path not allowed: ${path}`);
      }

      const head = await headSha();
      if (head !== baseSha) {
        const { files } = await request('GET', `/compare/${baseSha}...${head}`);
        const guarded = new Set([...Object.values(CONTENT_PATHS), ...blobPaths]);
        if (files.some((file) => guarded.has(file.filename))) {
          throw new ConflictError('Content changed since this page was loaded');
        }
      }

      const { tree: baseTree } = await request('GET', `/git/commits/${head}`);
      const tree = await request('POST', '/git/trees', {
        base_tree: baseTree.sha,
        tree: [
          ...Object.entries(json).map(([name, data]) => ({
            path: CONTENT_PATHS[name],
            mode: FILE_MODE,
            type: 'blob',
            content: `${JSON.stringify(data, null, 2)}\n`,
          })),
          ...blobs.map(({ path, blobSha }) => ({ path, mode: FILE_MODE, type: 'blob', sha: blobSha })),
        ],
      });
      const commit = await request('POST', '/git/commits', {
        message,
        tree: tree.sha,
        parents: [head],
      });

      try {
        await request('PATCH', `/git/refs/heads/${branch}`, { sha: commit.sha, force: false });
      } catch (error) {
        if (error.status === 422) throw new ConflictError('Content changed while saving');
        throw error;
      }
      return { sha: commit.sha };
    },
  };
}

export function gitHubFromEnv() {
  const { GITHUB_TOKEN, GITHUB_BRANCH } = process.env;
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set');
  return createGitHub({ token: GITHUB_TOKEN, branch: GITHUB_BRANCH || 'main' });
}
