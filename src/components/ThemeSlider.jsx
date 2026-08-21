import React from 'react';

const MOON =
  'M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z';

const SUN =
  'M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z';

export default function ThemeSlider({ darkMode, toggleDarkMode }) {
  function handleClick() {
    if (typeof toggleDarkMode === 'function') toggleDarkMode(!darkMode);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle colour theme"
      aria-pressed={!!darkMode}
      style={{
        position: 'relative',
        width: 46,
        height: 24,
        flexShrink: 0,
        border: 0,
        borderRadius: 999,
        cursor: 'pointer',
        background: 'var(--track)',
        padding: 0,
        marginRight: 6,
        transition: 'background .3s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: -3,
          left: darkMode ? 16 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 999,
          background: 'var(--red)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          transition: 'left .25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <svg viewBox="0 0 20 20" fill="#fff" style={{ width: 13, height: 13 }} aria-hidden="true">
          <path d={darkMode ? MOON : SUN} />
        </svg>
      </span>
    </button>
  );
}
