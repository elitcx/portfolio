import React, { useId, useState } from 'react';

import { draftInto, normalizeLink, tokenMismatch } from './editing.js';

const FORMAT_HINT = '**bold**, new line for a break, {age} {years} {count} for live values.';

const NAMES = { en: 'EN', id: 'ID' };
const OTHER = { en: 'id', id: 'en' };

function LocalizedBox({ field, value, lang, long, hint, update, call }) {
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
      update((current) => draftInto(current, lang, result.text));
      if (result.warning) setMessage({ warning: result.warning });
    } catch (failure) {
      setMessage({ error: failure.message });
    } finally {
      setBusy(false);
    }
  };

  const Input = long ? 'textarea' : 'input';

  return (
    <div className="cp-field">
      <div className="cp-field-head">
        <label className="cp-label" htmlFor={id}>{field.label} · {NAMES[lang]}</label>
        {canDraft && (
          <button type="button" className="cp-draft" onClick={draft} disabled={busy}>
            {busy ? 'Drafting…' : `Draft from ${NAMES[OTHER[lang]]}`}
          </button>
        )}
      </div>
      <Input
        id={id}
        className={long ? 'cp-input cp-area' : 'cp-input'}
        lang={lang}
        value={text}
        onChange={(e) => {
          const { value: typed } = e.target;
          update((current) => ({ ...current, [lang]: typed }));
        }}
        placeholder={source ? `${NAMES[OTHER[lang]]} shows until this is filled` : undefined}
      />
      {hint && <span className="cp-hint">{FORMAT_HINT}</span>}
      {message?.warning && <span className="cp-warn" role="status">{message.warning}</span>}
      {message?.error && <span className="cp-error" role="alert">{message.error}</span>}
    </div>
  );
}

// `update` takes a function of the current value, so a draft that returns late
// cannot overwrite what was typed in the meantime.
export function LocalizedField({ field, value, update, call, long, rich }) {
  return (
    <div className="cp-field">
      <div className="cp-two">
        <LocalizedBox field={field} value={value} lang="en" long={long} hint={rich} update={update} call={call} />
        <LocalizedBox field={field} value={value} lang="id" long={long} update={update} call={call} />
      </div>
      {tokenMismatch(value) && (
        <span className="cp-warn" role="status">
          English and Indonesian use different live values such as {'{age}'}. Check both.
        </span>
      )}
    </div>
  );
}

export function TextField({ field, value, onChange }) {
  return (
    <label className="cp-field">
      <span className="cp-label">{field.label}</span>
      <input className="cp-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function LinkField({ field, value, onChange }) {
  return (
    <label className="cp-field">
      <span className="cp-label">{field.label}</span>
      <input
        className="cp-input"
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
    <label className="cp-field">
      <span className="cp-label">{field.label}</span>
      <input
        className="cp-input"
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
    <label className="cp-field">
      <span className="cp-label">{field.label}</span>
      <select className="cp-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
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
    <label className="cp-field">
      <span className="cp-label">{field.label} (separated by commas)</span>
      <input
        className="cp-input"
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
    <label className="cp-switch">
      <span>
        {field.label}
        <span className="cp-label cp-switch-note">Pins to the top of Projects</span>
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
    <div className="cp-field">
      <span className="cp-label">{label}</span>
      <div className="cp-picture">
        {value
          ? <img src={previewOf(value)} alt="" />
          : <span className="cp-picture-empty" aria-hidden="true" />}
        <label className="cp-secondary cp-file">
          {busy ? 'Uploading…' : value ? 'Change picture' : 'Add picture'}
          <input type="file" accept={accept} onChange={pick} disabled={busy} />
        </label>
        {value && onClear && !busy && (
          <button type="button" className="cp-link" onClick={onClear}>Remove</button>
        )}
      </div>
      {error && <span className="cp-error" role="alert">{error}</span>}
    </div>
  );
}
