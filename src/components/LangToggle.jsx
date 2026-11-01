import React from 'react';

import { useLang } from '../i18n/lang.js';

const OPTIONS = [
  { value: 'id', label: 'ID', name: 'Bahasa Indonesia' },
  { value: 'en', label: 'EN', name: 'English' },
];

export default function LangToggle() {
  const { lang, setLang, s } = useLang();

  return (
    <div role="group" aria-label={s('nav.language')} style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 10 }}>
      {OPTIONS.map((option, i) => (
        <React.Fragment key={option.value}>
          {i > 0 && <span aria-hidden="true" style={{ color: 'var(--faint)', fontSize: 12 }}>/</span>}
          <button
            type="button"
            onClick={() => setLang(option.value)}
            aria-pressed={lang === option.value}
            aria-label={option.name}
            lang={option.value}
            style={{
              padding: '6px 5px',
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--label)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: lang === option.value ? 'var(--fg)' : 'var(--dim)',
            }}
          >
            {option.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
