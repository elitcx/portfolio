import React, { useEffect } from 'react';

export default function ImageZoom({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Freeze the page behind the overlay and hand focus back to whatever opened
  // it, so a keyboard reader does not land at the top of the document.
  useEffect(() => {
    const opener = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  return (
    <div
      className="kj-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Zoomed view of ${alt}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        cursor: 'zoom-out',
      }}
    >
      <div
        role="img"
        aria-label={alt}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${src})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'drop-shadow(0 40px 90px rgba(0,0,0,0.6))',
        }}
      />
      <button
        autoFocus
        onClick={onClose}
        aria-label="Close"
        className="kj-close"
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.28)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {/* Drawn rather than typed: the × glyph sits on a baseline, so it is not
            centred in the button and any transform pivots around the wrong point. */}
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none"
             stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M6 6 L18 18 M18 6 L6 18" />
        </svg>
      </button>
    </div>
  );
}
