import React from 'react';

const LINE = {
  margin: 0,
  fontFamily: 'var(--label)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
};

export default function Footer() {
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
      <p style={{ ...LINE, color: 'var(--dim)' }}>Kenneth Jehezkiel Marvel Wijaya</p>
      <p style={{ ...LINE, color: 'var(--faint)' }}>
        Personal Portfolio · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
