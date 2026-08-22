import React from 'react';
import ThemeSlider from './ThemeSlider.jsx';

import { pageById } from '../utils/Constants.js';

const NAV_ITEMS = [
  {
    page: 1,
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }} aria-hidden="true">
        <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
      </svg>
    ),
  },
  {
    page: 2,
    label: 'Projects',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }} aria-hidden="true">
        <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    page: 3,
    label: 'Contact',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }} aria-hidden="true">
        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function NavigationBar({ darkMode, toggleDarkMode, page, changePage }) {
  return (
    <nav
      className="kj-nav"
      style={{
        position: 'fixed',
        top: 18,
        left: '50%',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 6,
        borderRadius: 999,
        background: 'color-mix(in oklab, var(--panel) 88%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--line)',
        boxShadow: '0 12px 34px var(--sh-nav)',
        maxWidth: 'calc(100vw - 24px)',
        transform: 'translateX(-50%)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ page: p, label, icon }) => {
        const active = page === p;
        return (
          <a
            key={p}
            href={pageById(p).path}
            onClick={(e) => {
              // Plain left-click navigates in place; modifier-clicks and middle
              // clicks fall through to the browser so "open in new tab" still
              // works, and the bare href stays crawlable either way.
              if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              changePage(p);
            }}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              textDecoration: 'none',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 999,
              border: 0,
              cursor: 'pointer',
              fontFamily: 'var(--label)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: active ? 'var(--red)' : 'transparent',
              color: active ? '#ffffff' : 'var(--mut)',
              transition: 'all .25s ease',
            }}
          >
            {icon}
            <span className="hidden sm:block">{label}</span>
          </a>
        );
      })}

      <span
        aria-hidden="true"
        style={{ display: 'block', width: 1, height: 22, background: 'var(--line)', margin: '0 8px' }}
      />

      <span
        aria-hidden="true"
        style={{ display: 'block', width: 1, height: 22, background: 'var(--line)', margin: '0 8px' }}
      />

      <ThemeSlider darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </nav>
  );
}
