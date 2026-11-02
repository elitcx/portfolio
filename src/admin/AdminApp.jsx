import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { validateFile } from '../lib/contentSchema.js';
import { ApiError, AuthExpired, Conflict, ValidationFailed, apiRequest } from './api.js';
import { changedFiles, usedUploads, withIds, withoutIds } from './editing.js';
import { MAX_UPLOAD_BYTES, blobToBase64, shrinkPicture } from './image.js';
import Login from './Login.jsx';
import Shell from './Shell.jsx';

const FILES = ['projects', 'certificates', 'site'];

const POLL_MS = 10_000;
const POLL_LIMIT_MS = 180_000;

const pick = (content) => Object.fromEntries(FILES.map((name) => [name, content[name]]));

function applyStoredTheme() {
  let theme = null;
  try { theme = localStorage.getItem('theme'); } catch { /* ignore */ }
  const dark = theme ? theme === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-pt', dark ? 'dark' : 'light');
}

const DEPLOY_TEXT = {
  pending: 'Published. Building…',
  success: 'Published and live',
  failure: 'Build failed. The previous version is still live',
  unknown: 'Published, live in about a minute',
};

function Editor({ initial, onLoggedOut, onReload, setExpired, expired }) {
  const [base, setBase] = useState(initial);
  const [edited, setEdited] = useState(() => withIds(pick(initial)));
  const [uploads, setUploads] = useState([]);
  const [previews, setPreviews] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [conflict, setConflict] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);
  const [deploy, setDeploy] = useState(null);

  const clean = useMemo(() => withoutIds(edited), [edited]);
  const changed = useMemo(() => changedFiles(base, clean), [base, clean]);
  const toUpload = useMemo(() => usedUploads(uploads, clean), [uploads, clean]);
  const dirty = changed.length > 0 || toUpload.length > 0;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const call = useCallback(async (path, options) => {
    try {
      return await apiRequest(path, options);
    } catch (failure) {
      if (failure instanceof AuthExpired) setExpired(true);
      throw failure;
    }
  }, [setExpired]);

  const upload = useCallback(async (kind, name, blob) => {
    const dataBase64 = await blobToBase64(blob);
    const result = await call('/api/upload', { method: 'POST', body: { kind, name, dataBase64 } });
    setUploads((list) => [
      ...list.filter((u) => u.path !== result.path),
      { path: result.path, blobSha: result.blobSha },
    ]);
    return result;
  }, [call]);

  const uploadPicture = useCallback(async (kind, name, file) => {
    const blob = await shrinkPicture(file);
    const { publicPath } = await upload(kind, name, blob);
    setPreviews((current) => ({ ...current, [publicPath]: URL.createObjectURL(blob) }));
    return publicPath;
  }, [upload]);

  const uploadCv = useCallback(async (file) => {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('That file is larger than 3 MB');
    await upload('cv', 'cv', file);
  }, [upload]);

  const previewOf = useCallback((path) => previews[path] ?? path, [previews]);

  // Follows the deploy of the last save, then gives up quietly: the save itself
  // already succeeded, so a slow or silent build is not an error.
  const deploySha = deploy?.sha;
  useEffect(() => {
    if (!deploySha) return undefined;
    const started = Date.now();
    const timer = setInterval(async () => {
      let state = 'unknown';
      try {
        ({ state } = await apiRequest(`/api/status?sha=${deploySha}`));
      } catch { /* the message below still holds */ }
      const finished = state === 'success' || state === 'failure';
      const timedOut = Date.now() - started > POLL_LIMIT_MS;
      if (finished || timedOut) clearInterval(timer);
      setDeploy((current) => (
        current?.sha === deploySha ? { sha: deploySha, state: timedOut && !finished ? 'unknown' : state } : current
      ));
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [deploySha]);

  const save = async () => {
    const local = changed.flatMap((name) => validateFile(name, clean[name]));
    if (local.length) {
      setErrors(local);
      return;
    }

    setSaving(true);
    setErrors([]);
    setConflict(false);
    try {
      const files = Object.fromEntries(changed.map((name) => [name, clean[name]]));
      const { sha } = await call('/api/save', {
        method: 'POST',
        body: { baseSha: base.sha, files, uploads: toUpload },
      });
      setBase({ ...clean, sha });
      setUploads([]);
      setDeploy({ sha, state: 'pending' });
    } catch (failure) {
      if (failure instanceof Conflict) setConflict(true);
      else if (failure instanceof ValidationFailed) setErrors(failure.errors);
      else if (failure instanceof AuthExpired) setErrors(['Log in again, then save once more.']);
      else setErrors([failure.message]);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    if (dirty && !window.confirm('You have unsaved changes. Log out and lose them?')) return;
    try {
      await apiRequest('/api/logout', { method: 'POST' });
    } finally {
      onLoggedOut();
    }
  };

  const status = saving
    ? 'Saving…'
    : dirty
      ? 'Unsaved changes'
      : deploy
        ? DEPLOY_TEXT[deploy.state] ?? DEPLOY_TEXT.unknown
        : 'Everything is saved';

  const footer = (
    <footer className="cp-footer">
      <div className="cp-messages">
        {conflict && (
          <div className="cp-error" role="alert">
            The site changed somewhere else since you opened this page. Your edits are still here.{' '}
            {confirmReload ? (
              <>
                <button type="button" className="cp-link" onClick={onReload}>Yes, discard my edits and reload</button>{' '}
                <button type="button" className="cp-link" onClick={() => setConfirmReload(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="cp-link" onClick={() => setConfirmReload(true)}>Reload latest</button>
            )}
          </div>
        )}
        {errors.length > 0 && (
          <ul className="cp-errors" role="alert">
            {errors.slice(0, 6).map((error) => <li key={error}>{error}</li>)}
            {errors.length > 6 && <li>and {errors.length - 6} more</li>}
          </ul>
        )}
      </div>
      <button type="button" className="cp-primary" disabled={!dirty || saving} onClick={save}>
        {saving ? 'Saving…' : 'Save & publish'}
      </button>
    </footer>
  );

  return (
    <>
      <Shell
        edited={edited}
        setEdited={setEdited}
        status={status}
        onLogout={logout}
        call={call}
        previewOf={previewOf}
        uploadPicture={uploadPicture}
        uploadCv={uploadCv}
        footer={footer}
      />
      {expired && <Login expired onLoggedIn={() => setExpired(false)} />}
    </>
  );
}

export default function AdminApp() {
  const [loaded, setLoaded] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState(null);
  const loadCount = useRef(0);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(applyStoredTheme, []);

  const load = useCallback(() => {
    const attempt = ++loadCount.current;
    return apiRequest('/api/content').then(
      (content) => {
        if (attempt !== loadCount.current) return;
        setError(null);
        setNeedsLogin(false);
        setLoaded(content);
        setEditorKey((key) => key + 1);
      },
      (failure) => {
        if (attempt !== loadCount.current) return;
        if (failure instanceof AuthExpired) setNeedsLogin(true);
        else if (failure instanceof ApiError) setError(failure.message);
        else throw failure;
      },
    );
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loaded) {
    return (
      <Editor
        key={editorKey}
        initial={loaded}
        expired={expired}
        setExpired={setExpired}
        onReload={load}
        onLoggedOut={() => {
          setLoaded(null);
          setNeedsLogin(true);
        }}
      />
    );
  }

  // Clearing this first means a load that fails after a good password shows its
  // reason, rather than the login form again as if the password were wrong.
  if (needsLogin) {
    return (
      <Login
        onLoggedIn={() => {
          setNeedsLogin(false);
          load();
        }}
      />
    );
  }

  return (
    <div className="cp-login">
      {error
        ? <p className="cp-error" role="alert">{error} <button type="button" className="cp-link" onClick={load}>Try again</button></p>
        : <p className="cp-note">Loading…</p>}
    </div>
  );
}
