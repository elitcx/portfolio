import React, { useId, useState } from 'react';

import { normalizeLink } from './editing.js';

const FORMAT_HINT = '**bold**, new line for a break, {age} {years} {count} for live values.';

const NAMES = { en: 'EN', id: 'ID' };
const OTHER = { en: 'id', id: 'en' };

function LocalizedBox({ field, value, lang, long, hint, onChange, call }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const text = value?.[lang] ?? '';
  const source = value?.[OTHER[lang]] ?? '';
  const canDraft = !text.trim() && source.trim();

  const draft = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await call('/api/translate', { method: 'POST', body: { text: source, to: lang } });
      onChange({ ...value, [lang]: result.text });
      if (result.warning) setMessage({ warning: result.warning });
    } catch (failure) {
      setMessage({ error: failure.message });
    } finally {
      setBusy(false);
    }
  };

  const Input = long ? 'textarea' : 'input';

  return (
    <div className="ad-field">
      <div className="ad-field-head">
        <label className="ad-label" htmlFor={id}>{field.label} · {NAMES[lang]}</label>
        {canDraft && (
          <button type="button" className="ad-draft" onClick={draft} disabled={busy}>
            {busy ? 'Drafting…' : `Draft from ${NAMES[OTHER[lang]]}`}
          </button>
        )}
      </div>
      <Input
        id={id}
        className={long ? 'ad-input ad-area' : 'ad-input'}
        lang={lang}
        value={text}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        placeholder={source ? `${NAMES[OTHER[lang]]} shows until this is filled` : undefined}
      />
      {hint && <span className="ad-hint">{FORMAT_HINT}</span>}
      {message?.warning && <span className="ad-warn" role="status">{message.warning}</span>}
      {message?.error && <span className="ad-error" role="alert">{message.error}</span>}
    </div>
  );
}

export function LocalizedField({ field, value, onChange, call, long }) {
  return (
    <div className="ad-two">
      <LocalizedBox field={field} value={value} lang="en" long={long} hint={long} onChange={onChange} call={call} />
      <LocalizedBox field={field} value={value} lang="id" long={long} onChange={onChange} call={call} />
    </div>
  );
}

export function TextField({ field, value, onChange }) {
  return (
    <label className="ad-field">
      <span className="ad-label">{field.label}</span>
      <input className="ad-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function LinkField({ field, value, onChange }) {
  return (
    <label className="ad-field">
      <span className="ad-label">{field.label}</span>
      <input
        className="ad-input"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onChange(normalizeLink(e.target.value))}
      />
    </label>
  );
}

export function NumberField({ field, value, onChange }) {
  return (
    <label className="ad-field">
      <span className="ad-label">{field.label}</span>
      <input
        className="ad-input"
        type="number"
        min={field.min}
        max={field.max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    </label>
  );
}

export function SelectField({ field, value, onChange }) {
  return (
    <label className="ad-field">
      <span className="ad-label">{field.label}</span>
      <select className="ad-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

// Holds the raw text so a comma can be typed before the next word exists.
export function TagsField({ field, value, onChange }) {
  const [raw, setRaw] = useState((value ?? []).join(', '));
  return (
    <label className="ad-field">
      <span className="ad-label">{field.label} (separated by commas)</span>
      <input
        className="ad-input"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean));
        }}
      />
    </label>
  );
}

export function SwitchField({ field, value, onChange }) {
  return (
    <label className="ad-switch">
      <span>
        {field.label}
        <span className="ad-label ad-switch-note">Pins to the top of Projects</span>
      </span>
      <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function PictureField({ label, value, previewOf, onPick, onClear, accept = 'image/*' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onPick(file);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ad-field">
      <span className="ad-label">{label}</span>
      <div className="ad-picture">
        {value
          ? <img src={previewOf(value)} alt="" />
          : <span className="ad-picture-empty" aria-hidden="true" />}
        <label className="ad-secondary ad-file">
          {busy ? 'Uploading…' : value ? 'Change picture' : 'Add picture'}
          <input type="file" accept={accept} onChange={pick} disabled={busy} />
        </label>
        {value && onClear && !busy && (
          <button type="button" className="ad-link" onClick={onClear}>Remove</button>
        )}
      </div>
      {error && <span className="ad-error" role="alert">{error}</span>}
    </div>
  );
}
