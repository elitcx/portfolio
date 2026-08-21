import React, { useEffect, useRef, useState } from 'react';

import ImageZoom from './Imagezoom.jsx';
import { useReveal, usePrefersReducedMotion } from '../hooks/UseReveal.js';
import {
  facts,
  timeline,
  skills,
  stats,
  certificates,
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 440, width: '100%', justifySelf: 'end' }}>
      <div data-reveal ref={reveal}>
        <div
          ref={tiltRef}
          style={{
            position: 'relative',
            aspectRatio: '1 / 1',
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

  return (
    <>
      {/* 01 · About ------------------------------------------------------- */}
      <section id="about" data-screen-label="About" style={{ ...SECTION, background: 'var(--panel)' }}>
        <div style={SHELL}>
          <SectionHeader num="01" label="About Me" />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 72,
              alignItems: 'start',
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
                I'm a <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>17-year-old student at SMA Regina Pacis Surakarta</strong>,
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
                  I build things people feel grateful exist — starting with problems I hit every day.
                </span>
              </div>
            </div>

            <ProfilePhoto reduced={reduced} />
          </div>

          {/* Fast facts */}
          <GroupLabel title="Fast facts" meta="Off the clock" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
          <GroupLabel title="By the numbers" meta="2021 — 2025" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
          <GroupLabel title="How it started" meta="2014 — 2025" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
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
          <SectionHeader num="02" label="Technical skills" meta={`${skills.length} languages`} />
          <h2 style={HEADING}>What I Work With</h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {skills.map((s) => (
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
                  <span style={{ flex: 1, minWidth: 20 }} />
                  <span
                    style={{
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
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 800,
                      fontSize: 18,
                      color: 'var(--mut)',
                      fontVariantNumeric: 'tabular-nums',
                      width: 34,
                      textAlign: 'right',
                    }}
                  >
                    {s.pct}
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
      </section>

      {/* 03 · Certifications ---------------------------------------------- */}
      <section data-screen-label="Certifications" style={{ ...SECTION, background: 'var(--panel)' }}>
        <div style={SHELL}>
          <SectionHeader num="03" label="Achievements" meta={`${certificates.length} credentials`} />
          <h2 style={HEADING}>Certifications &amp; Awards</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {certificates.map((c, i) => (
              <button
                key={c.title}
                data-reveal
                ref={reveal}
                onClick={() => setZoom({ src: fullSrc(c.image), alt: c.title })}
                className="kj-card"
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
        </div>
      </section>

      {zoom && <ImageZoom src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </>
  );
}
