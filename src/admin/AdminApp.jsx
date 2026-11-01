import React, { useCallback, useEffect, useState } from 'react';

import { ApiError, AuthExpired, apiRequest } from './api.js';
import Login from './Login.jsx';

function applyStoredTheme() {
  let theme = null;
  try { theme = localStorage.getItem('theme'); } catch { /* ignore */ }
  const dark = theme ? theme === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-pt', dark ? 'dark' : 'light');
}

export default function AdminApp() {
  const [loaded, setLoaded] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(applyStoredTheme, []);

  const load = useCallback(async () => {
    try {
      const content = await apiRequest('/api/content');
      setError(null);
      setLoaded(content);
      setNeedsLogin(false);
    } catch (failure) {
      if (failure instanceof AuthExpired) setNeedsLogin(true);
      else if (failure instanceof ApiError) setError(failure.message);
      else throw failure;
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!loaded) {
    if (needsLogin) return <Login onLoggedIn={load} />;
    return (
      <div className="ad-login">
        {error
          ? <p className="ad-error" role="alert">{error} <button className="ad-link" onClick={load}>Try again</button></p>
          : <p className="ad-note">Loading…</p>}
      </div>
    );
  }

  return <p className="ad-note">Loaded {loaded.projects.length} projects.</p>;
}
