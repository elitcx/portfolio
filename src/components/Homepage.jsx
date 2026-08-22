import React, { useEffect, useRef, useState } from 'react';

import ImageZoom from './Imagezoom.jsx';
import { useReveal, usePrefersReducedMotion } from '../hooks/UseReveal.js';
import {
  facts,
  timeline,
  skillGroups,
  stats,
  certificates,
  CERT_PREVIEW_COUNT,
  CV,
  CODING_SINCE,
  TIMELINE_START,
  currentYear,
  computeAge,
  BIRTH_DATE,
  getBadgeColor,
  thumbSrc,
  fullSrc,
  iconSrc,
} from '../utils/Constants.js';

// ─── Shared bits ──────────────────────────────────────────────────────────────

const SECTION = { padding: '104px 24px' };
const SHELL = { maxWidth: 1180, margin: '0 auto' };

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

const HEADING = {
  margin: '0 0 56px',
  fontFamily: 'var(--display)',
  fontWeight: 900,
  fontSize: 'clamp(2.6rem, 5.6vw, 4.8rem)',
  lineHeight: 0.9,
  letterSpacing: '-0.02em',
};

const ROW = {
  padding: '26px 16px 30px',
  marginLeft: -16,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

function SectionHeader({ num, label, meta }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid var(--line)',
          fontFamily: 'var(--label)',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--red-l)',
          flexShrink: 0,
        }}
      >
        {num}
      </span>
      <span style={EYEBROW}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      {meta && <span style={META}>{meta}</span>}
    </div>
  );
}

function GroupLabel({ title, meta }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, marginTop: 72 }}>
      <div style={EYEBROW}>{title}</div>
      <div style={META}>{meta}</div>
    </div>
  );
}

// ─── Profile photo: cursor tilt + colour reveal spotlight ─────────────────────

const REST_MASK = 'radial-gradient(circle 0px at 50% 50%,#000 42%,rgba(0,0,0,0.35) 72%,transparent 100%)';

function ProfilePhoto({ reduced }) {
  const reveal = useReveal();
  const tiltRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    if (reduced) return undefined;
    const tilt = tiltRef.current;
    if (!tilt) return undefined;

    // The loop only runs while the pointer is over the photo, or while the
    // spotlight is easing back to rest. A permanently-running rAF that calls
    // getBoundingClientRect() forces a synchronous layout on every frame,
    // which shows up as scroll jank across the whole page.
    let raf = 0;
    let rect = null;
    let inside = false;
    let restored = true;
    let revealR = 0;
    const pointer = { x: 0, y: 0 };
    const revealPt = { x: 50, y: 50 };

    const readRect = () => { rect = tilt.getBoundingClientRect(); };

    const tick = () => {
      raf = 0;
      if (!rect) readRect();

      if (inside) {
        const ry = ((pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2)) * 7;
        const rx = ((pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2)) * -7;
        tilt.style.transition = '';
        tilt.style.transform =
          `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
        revealPt.x = pointer.x - rect.left;
        revealPt.y = pointer.y - rect.top;
        restored = false;
      } else if (!restored) {
        tilt.style.transition = 'transform .6s cubic-bezier(0.16,1,0.3,1)';
        tilt.style.transform = 'none';
        restored = true;
      }

      const target = inside ? Math.min(rect.width, rect.height) * 0.42 : 0;
      revealR += (target - revealR) * 0.12;
      if (Math.abs(target - revealR) < 0.4) revealR = target;

      const rev = revealRef.current;
      if (rev) {
        const mask =
          `radial-gradient(circle ${revealR.toFixed(1)}px at ` +
          `${revealPt.x.toFixed(1)}px ${revealPt.y.toFixed(1)}px,` +
          '#000 42%,rgba(0,0,0,0.35) 72%,transparent 100%)';
        rev.style.webkitMaskImage = mask;
        rev.style.maskImage = mask;
      }

      if (inside || revealR !== 0) raf = requestAnimationFrame(tick);
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const onEnter = (e) => {
      inside = true;
      readRect();
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      window.addEventListener('scroll', readRect, { passive: true });
      schedule();
    };
    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      schedule();
    };
    const onLeave = () => {
      inside = false;
      window.removeEventListener('scroll', readRect);
      schedule();
    };

    tilt.addEventListener('pointerenter', onEnter);
    tilt.addEventListener('pointermove', onMove, { passive: true });
    tilt.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', readRect);
      tilt.removeEventListener('pointerenter', onEnter);
      tilt.removeEventListener('pointermove', onMove);
      tilt.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  const noiseUrl =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

  const photo = thumbSrc('/images/banner.webp');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 512, width: '100%', justifySelf: 'end', height: '100%' }}>
      <div data-reveal ref={reveal} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          ref={tiltRef}
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 320,
            overflow: 'hidden',
            borderRadius: 20,
            background: '#121111',
            boxShadow: '0 30px 60px var(--sh)',
            transition: 'transform .6s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <img
            src={photo}
            alt="Kenneth's profile photo"
            width="900"
            height="900"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(1) contrast(1.18) brightness(0.92)',
            }}
          />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'var(--red)', mixBlendMode: 'color', opacity: 0.28 }} />
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, opacity: 0.26, mixBlendMode: 'overlay', backgroundImage: noiseUrl }}
          />
          <img
            ref={revealRef}
            src={photo}
            alt=""
            aria-hidden="true"
            width="900"
            height="900"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'contrast(1.05) saturate(1.06)',
              pointerEvents: 'none',
              WebkitMaskImage: REST_MASK,
              maskImage: REST_MASK,
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 14,
            fontFamily: 'var(--label)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--dim)',
          }}
        >
          <span>Solo, Indonesia</span>
          <span style={{ color: 'var(--red-l)' }}>2025</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const reduced = usePrefersReducedMotion();
  const reveal = useReveal();
  const [zoom, setZoom] = useState(null);
  const [showAllCerts, setShowAllCerts] = useState(false);

  return (
    <>
      {/* 01 · About ------------------------------------------------------- */}
      <section id="about" data-screen-label="About" style={{ ...SECTION, background: 'var(--panel)' }}>
        <div style={SHELL}>
          <SectionHeader num="01" label="About Me" />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
              gap: 72,
              // Stretch, not start: the bio is the taller column and its height
              // moves with the viewport (the heading is a vw clamp), so no fixed
              // portrait size can track it. The photo fills whatever the bio sets.
              alignItems: 'stretch',
            }}
          >
            <div>
              <h2
                data-reveal
                ref={reveal}
                style={{
                  margin: 0,
                  fontFamily: 'var(--display)',
                  fontWeight: 900,
                  fontSize: 'clamp(2.9rem, 6.4vw, 5.6rem)',
                  lineHeight: 0.88,
                  letterSpacing: '-0.02em',
                }}
              >
                Hi, I'm Kenneth<br />Jehezkiel M.W.
              </h2>

              <p
                data-reveal
                ref={reveal}
                style={{
                  margin: '28px 0 0',
                  fontSize: 'clamp(1.02rem, 1.35vw, 1.2rem)',
                  lineHeight: 1.7,
                  color: 'var(--mut)',
                  maxWidth: '54ch',
                  textWrap: 'pretty',
                }}
              >
                I'm a <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>{computeAge(BIRTH_DATE)}-year-old student at SMA Regina Pacis Surakarta</strong>,
                passionate about <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Software Engineering and Development</strong>.
                I love turning ideas into real, working applications and exploring how code can solve everyday problems.
              </p>

              <p
                data-reveal
                ref={reveal}
                style={{
                  margin: '20px 0 0',
                  fontSize: 'clamp(1.02rem, 1.35vw, 1.2rem)',
                  lineHeight: 1.7,
                  color: 'var(--mut)',
                  maxWidth: '54ch',
                  textWrap: 'pretty',
                }}
              >
                Whether crafting clean frontends or tackling competitive programming,{' '}
                <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>I'm always eager to learn, build, and grow.</strong>
              </p>

              <div
                data-reveal
                ref={reveal}
                style={{
                  marginTop: 40,
                  paddingLeft: 20,
                  borderLeft: '2px solid var(--red)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxWidth: '48ch',
                }}
              >
                <span style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.2em' }}>What drives me</span>
                <span
                  style={{
                    fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
                    lineHeight: 1.6,
                    color: 'var(--red-l)',
                    textWrap: 'pretty',
                  }}
                >
                  I build for the people around me — my school, my community, and the problems I hit every day.
                </span>
              </div>

              {/* Placed at the end of the bio: a reader who has just finished the
                  introduction is the one most likely to want to take it away. */}
              <a
                data-reveal
                ref={reveal}
                href={CV.href}
                download={CV.filename}
                className="kj-cv"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 36,
                  padding: '15px 28px',
                  borderRadius: 999,
                  border: '1px solid var(--fg)',
                  background: 'transparent',
                  color: 'var(--fg)',
                  textDecoration: 'none',
                  fontFamily: 'var(--label)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start',
                  width: 'fit-content',
                  transition: 'background .25s ease, color .25s ease',
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }} aria-hidden="true">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v11.19l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Z" />
                  <path d="M3.75 15a.75.75 0 0 1 .75.75v3a.75.75 0 0 0 .75.75h13.5a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 1 1.5 0v3a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18.75v-3a.75.75 0 0 1 .75-.75Z" />
                </svg>
                {CV.label}
                <span style={{ color: 'var(--dim)', fontWeight: 600, letterSpacing: '0.12em' }}>{CV.meta}</span>
              </a>
            </div>

            <ProfilePhoto reduced={reduced} />
          </div>

          {/* Fast facts */}
          <GroupLabel title="Fast facts" meta="Off the clock" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))',
              columnGap: 28,
              rowGap: 8,
              marginTop: 24,
              borderTop: '1px solid var(--line)',
            }}
          >
            {facts.map((f) => (
              <div key={f.label} data-reveal ref={reveal} className="kj-row" style={ROW}>
                <span style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.2em' }}>{f.label}</span>
                <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--mut)', textWrap: 'pretty' }}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* By the numbers */}
          <GroupLabel title="By the numbers" meta={`${CODING_SINCE} — ${currentYear()}`} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
              columnGap: 28,
              rowGap: 8,
              marginTop: 24,
              borderTop: '1px solid var(--line)',
            }}
          >
            {stats.map((s) => (
              <div key={s.label} data-reveal ref={reveal} className="kj-row" style={{ padding: '26px 16px 30px', marginLeft: -16 }}>
                <div
                  style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 900,
                    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.value}
                </div>
                <div style={{ ...EYEBROW, fontSize: 12, letterSpacing: '0.2em', marginTop: 10 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* How it started */}
          <GroupLabel title="How it started" meta={`${TIMELINE_START} — ${currentYear()}`} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(112px, 100%), 1fr))',
              columnGap: 28,
              rowGap: 8,
              marginTop: 24,
              borderTop: '1px solid var(--line)',
            }}
          >
            {timeline.map((t) => (
              <div key={t.year} data-reveal ref={reveal} className="kj-row" style={{ ...ROW, gap: 12, minHeight: 160 }}>
                <span
                  style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 900,
                    fontSize: '2.1rem',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: t.color,
                  }}
                >
                  {t.year}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--mut)', textWrap: 'pretty' }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 · Skills ------------------------------------------------------ */}
      <section data-screen-label="Skills" style={{ ...SECTION, background: 'var(--bg)' }}>
        <div style={SHELL}>
          <SectionHeader num="02" label="Technical skills" />
          <h2 style={HEADING}>What I Work With</h2>

          {skillGroups.map((g) => (
          <div key={g.group}>
          <GroupLabel title={g.group} meta={g.meta} />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24 }}>
            {g.items.map((s) => (
              <div
                key={s.lang}
                data-reveal
                ref={reveal}
                className="kj-row"
                style={{ padding: '26px 16px 24px', marginLeft: -16, borderTop: '1px solid var(--line)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <img
                    src={iconSrc(s.icon)}
                    alt=""
                    aria-hidden="true"
                    width="22"
                    height="22"
                    decoding="async"
                    style={{ width: 22, height: 22, flexShrink: 0, objectFit: 'contain' }}
                  />
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.01em', minWidth: 130 }}>
                    {s.lang}
                  </span>
                  <span style={{ ...EYEBROW, fontSize: 11, letterSpacing: '0.2em' }}>{s.detail}</span>
                  {/* Level and score travel together so a narrow row wraps them
                      as one unit instead of splitting them across two lines. */}
                  {/* The bar carries the proportion; printing the same number beside
                      it just invites the reader to argue with a self-rated score. */}
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: 'var(--label)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: s.color,
                    }}
                  >
                    {s.level}
                  </span>
                </div>
                <div style={{ height: 3, width: '100%', background: 'var(--line2)', marginTop: 18, overflow: 'hidden' }}>
                  <div className="kj-bar" style={{ height: '100%', width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line)' }} />
          </div>
          </div>
          ))}
        </div>
      </section>

      {/* 03 · Certifications ---------------------------------------------- */}
      <section data-screen-label="Certifications" style={{ ...SECTION, background: 'var(--panel)' }}>
        <div style={SHELL}>
          <SectionHeader num="03" label="Achievements" meta={`${certificates.length} credentials`} />
          <h2 style={HEADING}>Certifications &amp; Awards</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 24 }}>
            {(showAllCerts ? certificates : certificates.slice(0, CERT_PREVIEW_COUNT)).map((c, i) => (
              // The expanded batch mounts on an explicit click, often already past the
              // scroll position that would trigger the observer — so those cards are
              // revealed outright instead of waiting for a further scroll.
              <button
                key={c.title}
                data-reveal
                ref={i < CERT_PREVIEW_COUNT ? reveal : undefined}
                onClick={() => setZoom({ src: fullSrc(c.image), alt: c.title })}
                className={i < CERT_PREVIEW_COUNT ? 'kj-card' : 'kj-card is-revealed'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  padding: 0,
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'var(--card)',
                  cursor: 'zoom-in',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: 'var(--bg)' }}>
                  <img
                    className="kj-card-img"
                    src={thumbSrc(c.image)}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    width="760"
                    height="570"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'grayscale(0.55) contrast(1.05)',
                      transition: 'filter .4s ease, transform .6s cubic-bezier(0.16,1,0.3,1)',
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
                </span>

                <span style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 18px 20px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 700,
                      fontSize: 17,
                      lineHeight: 1.25,
                      color: 'var(--fg)',
                      textWrap: 'pretty',
                    }}
                  >
                    {c.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--label)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: getBadgeColor(c.description),
                    }}
                  >
                    {c.description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {certificates.length > CERT_PREVIEW_COUNT && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <button
                type="button"
                onClick={() => setShowAllCerts((v) => !v)}
                aria-expanded={showAllCerts}
                className="kj-more"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 32px',
                  border: '1px solid var(--fg)',
                  borderRadius: 999,
                  // Solid inverted fill: --fg/--bg swap between themes, so this reads as
                  // the loudest element in the section without spending the accent colour.
                  background: 'var(--fg)',
                  cursor: 'pointer',
                  fontFamily: 'var(--label)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--bg)',
                }}
              >
                {showAllCerts
                  ? 'Show fewer'
                  : `Show all ${certificates.length}`}
                <span
                  aria-hidden="true"
                  style={{
                    display: 'block',
                    transition: 'transform .3s ease',
                    transform: showAllCerts ? 'rotate(180deg)' : 'none',
                    lineHeight: 1,
                  }}
                >
                  ↓
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {zoom && <ImageZoom src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </>
  );
}
