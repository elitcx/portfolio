import React from 'react';

import { useLang } from '../i18n/lang.js';
import { currentYear } from '../utils/Constants.js';

const LINE = {
  margin: 0,
  fontFamily: 'var(--label)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
};

export default function Footer() {
  const { s } = useLang();

  return (
    <footer
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '34px 24px',
        borderTop: '1px solid var(--line)',
        background: 'var(--bg)',
      }}
    >
      <p style={{ ...LINE, color: 'var(--dim)' }}>{s('footer.name')}</p>
      <p style={{ ...LINE, color: 'var(--faint)' }}>
        {s('footer.tagline')} · © {currentYear()}
      </p>
    </footer>
  );
}
