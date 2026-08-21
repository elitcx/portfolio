import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/UseReveal.js';

const GRID = 28;
const INFLUENCE = 210;
const PULL = 13;
const TAU = 6.2832;

// Ring dots are bucketed by intensity so each frame issues ~13 fill() calls
// instead of one per dot. At 1080p the naive version was ~2,800 per frame.
const BUCKETS = 12;

/**
 * Dot grid that ripples outward from a wandering source, bends away from the
 * cursor, and drifts on a slow sine wave when the pointer is elsewhere.
 *
 * The loop is suspended whenever the hero is scrolled out of view or the tab
 * is hidden — otherwise it keeps burning main-thread time while the reader is
 * down in the certificate grid, which is exactly when frames matter most.
 */
function HeroCanvas({ isDark, reduced }) {
  const canvasRef = useRef(null);
  const isDarkRef = useRef(isDark);
  const drawRef = useRef(null);

  // Repaint on theme change without tearing down the loop. Under reduced
  // motion nothing is scheduled, so the repaint has to be requested here or
  // the dots keep the previous theme's colour.
  useEffect(() => {
    isDarkRef.current = isDark;
    drawRef.current?.();
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    const parent = canvas.parentElement;

    let raf = 0;
    let visible = true;
    let src = { x: 0, y: 0 };
    let radius = 0;
    let maxR = 1200;
    const mouse = { x: -9999, y: -9999 };

    // Reused per-frame scratch buffers — no allocation in the draw loop.
    const buckets = Array.from({ length: BUCKETS }, () => []);

    const newSource = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      src = { x: (0.12 + Math.random() * 0.76) * w, y: (0.18 + Math.random() * 0.64) * h };
      radius = 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxR = Math.hypot(canvas.offsetWidth, canvas.offsetHeight);
      newSource();
      if (reduced) draw();
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const t = performance.now() / 1000;
      const dark = isDarkRef.current;
      const baseA = dark ? 0.17 : 0.3;
      const baseRGB = dark ? '255,255,255' : '15,23,42';
      const ringBoost = dark ? 0.85 : 0.6;
      const hasMouse = mouse.x > -100;

      if (!reduced) {
        radius += 3.4;
        if (radius > maxR + 140) newSource();
      }

      for (let i = 0; i < BUCKETS; i++) buckets[i].length = 0;

      // Pass 1 — every base-intensity dot goes into a single path.
      ctx.fillStyle = `rgba(${baseRGB},${baseA})`;
      ctx.beginPath();

      for (let gy = 0; gy <= h + GRID; gy += GRID) {
        for (let gx = 0; gx <= w + GRID; gx += GRID) {
          let px = gx;
          let py = gy;

          const mdx = mouse.x - gx;
          const mdy = mouse.y - gy;
          const md = hasMouse ? Math.hypot(mdx, mdy) : Infinity;

          if (md > 0 && md < INFLUENCE) {
            const f = (1 - md / INFLUENCE) ** 2 * PULL;
            px += (mdx / md) * f;
            py += (mdy / md) * f;
          } else if (!reduced) {
            const wave = Math.sin(gx / 90 + t * 0.5) * Math.cos(gy / 110 + t * 0.4) * 5;
            px += wave;
            py += wave * 0.5;
          }

          let bucket = -1;
          if (!reduced) {
            const dx = gx - src.x;
            const dy = gy - src.y;
            const d = Math.hypot(dx, dy);
            const ring = Math.exp(-((d - radius) ** 2) / 3200);
            if (ring > 0.02) bucket = Math.min(BUCKETS - 1, (ring * BUCKETS) | 0);
          }

          if (bucket < 0) {
            ctx.moveTo(px + 1, py);
            ctx.arc(px, py, 1, 0, TAU);
          } else {
            const b = buckets[bucket];
            b.push(px, py);
          }
        }
      }

      ctx.fill();

      // Pass 2 — one path per intensity bucket for the expanding ring.
      for (let i = 0; i < BUCKETS; i++) {
        const pts = buckets[i];
        if (pts.length === 0) continue;

        const ring = (i + 0.5) / BUCKETS;
        const alpha = baseA + ring * ringBoost;
        const size = 1 + ring * 1.7;
        const rgb = ring > 0.22 ? '34,211,238' : baseRGB;

        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        for (let j = 0; j < pts.length; j += 2) {
          ctx.moveTo(pts[j] + size, pts[j + 1]);
          ctx.arc(pts[j], pts[j + 1], size, 0, TAU);
        }
        ctx.fill();
      }
    }

    drawRef.current = draw;

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf || reduced || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Suspend while the hero is off screen or the tab is backgrounded.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    if (!reduced) {
      parent?.addEventListener('mousemove', onMove, { passive: true });
      parent?.addEventListener('mouseleave', onLeave, { passive: true });
    }
    start();

    return () => {
      stop();
      drawRef.current = null;
      io.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      parent?.removeEventListener('mousemove', onMove);
      parent?.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

const META = {
  fontFamily: 'var(--label)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'var(--dim)',
};

export default function Hero({ onScroll, theme = 'dark' }) {
  const reduced = usePrefersReducedMotion();
  const isDark = theme === 'dark';

  return (
    <section
      className="kj-hero"
      data-screen-label="Hero"
      style={{
        position: 'relative',
        minHeight: 640,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--herobg)',
      }}
    >
      <HeroCanvas isDark={isDark} reduced={reduced} />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(115% 75% at 50% 42%, transparent 32%, var(--herobg) 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 20,
          padding: '88px 24px 0',
          ...META,
        }}
      >
        <span>Portfolio · 2025</span>
        <span>Surakarta, ID</span>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 24px 64px',
        }}
      >
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Kenneth Jehezkiel M.W. — Competitive Programmer from Surakarta
        </h1>

        <div style={{ overflow: 'hidden', paddingBottom: '0.04em' }} aria-hidden="true">
          <div
            className="kj-rise"
            style={{
              display: 'block',
              fontFamily: 'var(--display)',
              fontWeight: 900,
              lineHeight: 0.84,
              letterSpacing: 0,
              fontKerning: 'normal',
              fontFeatureSettings: "'kern' 1",
              fontSize: 'clamp(3.2rem, 20.2vw, 21rem)',
              color: 'var(--fg)',
              marginLeft: '-0.018em',
              whiteSpace: 'nowrap',
            }}
          >
            KENNETH
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 22 }}>
          <span
            className="kj-wipe"
            aria-hidden="true"
            style={{
              display: 'block',
              width: 'clamp(2.5rem, 5vw, 5rem)',
              height: 2,
              background: 'var(--red)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--label)',
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              fontWeight: 600,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: 'var(--mut)',
            }}
          >
            Competitive Programmer · Surakarta
          </span>
        </div>
      </div>

      <button
        onClick={onScroll}
        aria-label="Scroll to about"
        style={{
          position: 'absolute',
          zIndex: 2,
          bottom: 34,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          fontFamily: 'var(--label)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          padding: 0,
        }}
      >
        Scroll
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, var(--dim), transparent)',
          }}
        />
      </button>
    </section>
  );
}
