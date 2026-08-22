import React, { useMemo, useState } from 'react';

import ImageZoom from './Imagezoom.jsx';
import projects from '../assets/projects.json';
import { useReveal } from '../hooks/UseReveal.js';
import { CATEGORIES, getCategoryColor, thumbSrc, fullSrc } from '../utils/Constants.js';

const EYEBROW = {
  fontFamily: 'var(--label)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--dim)',
};

const META = {
  fontFamily: 'var(--label)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--faint)',
};

const GITHUB_PATH =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.91-.88-2.91-2.84 0-.63.22-1.15.59-1.55-.06-.15-.26-.75.06-1.56 0 0 .6-.19 1.97.74a5.5 5.5 0 0 1 1.5-.2c.51 0 1.02.07 1.5.2 1.37-.93 1.97-.74 1.97-.74.32.81.12 1.41.06 1.56.37.4.59.92.59 1.55 0 1.97-1.14 2.64-2.92 2.84.3.26.56.76.56 1.54 0 1.11-.01 2.02-.01 2.3 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z';

// Precomputed once: search haystack and resolved image variants per project.
const INDEXED = projects.map((p) => ({
  ...p,
  thumb: thumbSrc(p.image),
  full: fullSrc(p.image),
  haystack: `${p.title} ${p.description} ${p.categories.join(' ')}`.toLowerCase(),
  tags: p.categories.map((c) => ({ name: c, color: getCategoryColor(c) })),
}));

export default function PortfolioPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [zoom, setZoom] = useState(null);
  const reveal = useReveal();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = category.toLowerCase();
    return INDEXED.filter(
      (p) =>
        (!q || p.haystack.includes(q)) &&
        (category === 'All' || p.categories.some((c) => c.toLowerCase() === cat))
    );
  }, [query, category]);

  return (
    <section
      data-screen-label="Projects"
      style={{ minHeight: '100vh', padding: '130px 24px 100px', background: 'var(--bg)' }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <span style={EYEBROW}>My work</span>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={META}>{projects.length} shipped</span>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: 'clamp(3.4rem, 11vw, 9rem)',
            lineHeight: 0.86,
            letterSpacing: '-0.02em',
          }}
        >
          Projects
        </h1>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'space-between',
            marginTop: 48,
            padding: '20px 0',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <input
            type="text"
            className="kj-search"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
            style={{
              width: 260,
              maxWidth: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid var(--line)',
              background: 'var(--card)',
              color: 'var(--fg)',
              fontSize: 14,
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((name) => {
              const on = category === name;
              return (
                <button
                  key={name}
                  onClick={() => setCategory(name)}
                  aria-pressed={on}
                  className="kj-chip"
                  style={{
                    padding: '9px 15px',
                    borderRadius: 999,
                    border: `1px solid ${on ? 'var(--red)' : 'var(--line)'}`,
                    background: on ? 'var(--red)' : 'transparent',
                    color: on ? '#ffffff' : 'var(--mut)',
                    fontFamily: 'var(--label)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {shown.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
              gap: 28,
              marginTop: 40,
            }}
          >
            {shown.map((p, i) => (
              <div
                key={p.title}
                data-reveal
                ref={reveal}
                className="kj-pcard"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--line)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: 'var(--card)',
                }}
              >
                <button
                  onClick={() => setZoom({ src: p.full, alt: p.title })}
                  aria-label={`View screenshot of ${p.title}`}
                  style={{
                    position: 'relative',
                    display: 'block',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    padding: 0,
                    border: 0,
                    overflow: 'hidden',
                    background: 'var(--bg)',
                    cursor: 'zoom-in',
                  }}
                >
                  <img
                    className="kj-pcard-img"
                    src={p.thumb}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="500"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                      // Filter and transition handled in App.css, see .kj-pcard-img.
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontFamily: 'var(--label)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      color: '#fff',
                      background: 'rgba(0,0,0,0.55)',
                      padding: '4px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '22px 22px 24px', flex: 1 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
                    {p.tags.map((t) => (
                      <span
                        key={t.name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: 'var(--label)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'var(--dim)',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'block',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: t.color,
                            flexShrink: 0,
                          }}
                        />
                        {t.name}
                      </span>
                    ))}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'var(--display)',
                      fontWeight: 800,
                      fontSize: 23,
                      lineHeight: 1.15,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {p.title}
                  </h3>

                  {/* Build period: without it every project reads as undated, and a
                      visitor cannot tell current work from something long parked. */}
                  {p.period && (
                    <span
                      style={{
                        fontFamily: 'var(--label)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--dim)',
                        marginTop: -4,
                      }}
                    >
                      {p.period} · Solo
                    </span>
                  )}

                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--mut)', textWrap: 'pretty', flex: 1 }}>
                    {p.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kj-ghost"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          borderRadius: 999,
                          border: '1px solid var(--line)',
                          fontFamily: 'var(--label)',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--fg)',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d={GITHUB_PATH} />
                        </svg>
                        Repo →
                      </a>
                    )}
                    {p.deployed && (
                      <a
                        href={p.deployed}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kj-live"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          borderRadius: 999,
                          background: 'var(--red)',
                          color: '#fff',
                          fontFamily: 'var(--label)',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Live site →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '120px 0', textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '-0.02em',
                color: 'var(--faint)',
              }}
            >
              Nothing here
            </div>
            <div style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.2em', marginTop: 14 }}>
              No projects match that filter
            </div>
          </div>
        )}
      </div>

      {zoom && <ImageZoom src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </section>
  );
}
