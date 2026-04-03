import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button.jsx';
import { useTypewriter } from '../hooks/Usetypewriter.js';
import { TYPEWRITER_WORDS } from '../utils/Constants.js';

export default function Hero({ onScroll }) {
  const typed = useTypewriter(TYPEWRITER_WORDS);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen text-center px-6 relative overflow-hidden">

      {/* Soft background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center gap-6"
      >
        <span className="text-xs font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10">
          Student · Developer · Problem Solver
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight">
          Hello, I'm{' '}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 inline-flex items-center"
            aria-label={typed}
          >
            {typed}
            <span
              className="ml-1 inline-block w-[3px] h-[0.85em] bg-indigo-500 rounded-sm align-middle"
              style={{ animation: 'cursorBlink 1s step-end infinite' }}
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-md">
          Building software that matters — one line of code at a time.
        </p>

        <button
          onClick={onScroll}
          aria-label="Scroll to About section"
          className="mt-4 flex flex-col items-center gap-2 text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors group"
        >
          <span>Scroll to explore</span>
          <div className="animate-bounce mt-4">
            <Button />
          </div>
        </button>
      </motion.div>
    </div>
  );
}