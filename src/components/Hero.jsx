import React, { useRef, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const GRID = 28;
const INFLUENCE = 200;
const PULL = 12;

function HeroCanvas({ mouseRef, dotColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const { x: mx, y: my } = mouseRef.current;
      const hasMouse = mx > -100;
      const t = performance.now() / 1000;

      ctx.fillStyle = dotColor;
      ctx.beginPath();

      for (let gy = 0; gy <= h + GRID; gy += GRID) {
        for (let gx = 0; gx <= w + GRID; gx += GRID) {
          let px = gx, py = gy;

          if (hasMouse) {
            const dx = mx - gx;
            const dy = my - gy;
            const d = Math.hypot(dx, dy);
            if (d > 0 && d < INFLUENCE) {
              const f = (1 - d / INFLUENCE) ** 2 * PULL;
              px += (dx / d) * f;
              py += (dy / d) * f;
            }
          } else {
            const wave = Math.sin(gx / 80 + t * 0.6) * Math.cos(gy / 100 + t * 0.45) * 10;
            px += wave;
            py += wave * 0.55;
          }

          ctx.moveTo(px + 1, py);
          ctx.arc(px, py, 1, 0, 6.2832);
        }
      }

      ctx.fill();
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [mouseRef, dotColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default function Hero({ onScroll, theme = 'dark' }) {
  const prefersReduced = useReducedMotion();
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const isDark = theme === 'dark';

  const tokens = {
    bg:         isDark ? 'oklch(0.09 0.012 58)'    : 'oklch(0.97 0.008 58)',
    dotColor:   isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(15, 10, 5, 0.12)',
    staticDot:  isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(15,10,5,0.05)',
    name:       isDark ? 'oklch(0.985 0.004 240)'  : 'oklch(0.10 0.015 58)',
    label:      isDark ? 'oklch(0.62 0.008 240)'   : 'oklch(0.42 0.010 58)',
    discipline: isDark ? 'oklch(0.50 0.01 240)'    : 'oklch(0.48 0.012 240)',
    scroll:     isDark ? 'oklch(0.38 0.008 240)'   : 'oklch(0.52 0.008 240)',
  };

  const onMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  return (
    <div
      className="relative flex flex-col w-full h-screen overflow-hidden"
      style={{ background: tokens.bg }}
      onMouseMove={prefersReduced ? undefined : onMouseMove}
      onMouseLeave={prefersReduced ? undefined : onMouseLeave}
    >
      {prefersReduced ? (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle, ${tokens.staticDot} 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
      ) : (
        <HeroCanvas mouseRef={mouseRef} dotColor={tokens.dotColor} />
      )}

      {/* Top metadata bar */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 md:px-14 pt-8">
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[10px] tracking-[0.3em] uppercase"
          style={{ color: tokens.label }}
          aria-hidden="true"
        >
          Portfolio · 2025
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[10px] tracking-[0.25em] uppercase"
          style={{ color: tokens.label }}
          aria-hidden="true"
        >
          Surakarta, ID
        </motion.span>
      </div>

      {/* Main name block */}
      <div className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-10 md:px-14 pb-16">
        <h1 className="sr-only">Kenneth Jehezkiel M.W. — Competitive Programmer from Surakarta</h1>

        <div style={{ overflow: 'hidden' }} aria-hidden="true">
          <motion.span
            initial={{ y: '115%', scaleX: 0.97 }}
            animate={{ y: '0%', scaleX: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="block font-display font-black leading-none"
            style={{
              fontSize: 'clamp(5rem, 18vw, 15rem)',
              letterSpacing: '-0.04em',
              marginLeft: '-0.02em',
              transformOrigin: 'left bottom',
              color: tokens.name,
            }}
            aria-hidden="true"
          >
            KENNETH
          </motion.span>
        </div>

        <div className="flex items-center gap-5 mt-4 sm:mt-5">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
            style={{
              height: '2px',
              width: 'clamp(2.5rem, 5vw, 5rem)',
              transformOrigin: 'left',
              flexShrink: 0,
            }}
            className="bg-indigo-600"
          />
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[11px] sm:text-xs tracking-[0.22em] uppercase"
            style={{ color: tokens.discipline }}
          >
            Competitive Programmer · Surakarta
          </motion.p>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        onClick={onScroll}
        aria-label="Scroll to About section"
        className="absolute bottom-8 right-6 sm:right-10 md:right-14 z-10 flex flex-col items-center gap-2"
      >
        <span
          className="font-mono text-[9px] tracking-[0.35em] uppercase"
          style={{ writingMode: 'vertical-rl', color: tokens.scroll }}
        >
          Scroll
        </span>
        <div
          aria-hidden="true"
          style={{
            width: '1px',
            height: '2.5rem',
            background: `linear-gradient(to bottom, ${tokens.scroll}, transparent)`,
          }}
        />
      </motion.button>
    </div>
  );
}
