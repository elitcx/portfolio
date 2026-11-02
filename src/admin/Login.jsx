import React, { useState } from 'react';

import { apiRequest } from './api.js';

// Also shown as an overlay when a session runs out mid-edit: the editor stays
// mounted underneath, so nothing typed is lost.
export default function Login({ expired = false, onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiRequest('/api/login', { method: 'POST', body: { password } });
      setPassword('');
      onLoggedIn();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cp-login">
      <form className="cp-login-box" onSubmit={submit}>
        <h1 className="cp-brand">Site admin</h1>
        {expired && <p className="cp-note">Your session ended. Log in again. Your edits are still here.</p>}
        <label className="cp-field">
          <span className="cp-label">Password</span>
          <input
            className="cp-input"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="cp-error" role="alert">{error}</p>}
        <button className="cp-primary" type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
