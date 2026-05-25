import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import ImageZoom from './Imagezoom.jsx';
import { fadeUp, stagger, revealUp, slideInLeft } from '../utils/Animations.js';
import {
  computeAge,
  getSkillLevel,
  SKILL_LEVELS,
  skills,
  certificates,
} from '../utils/Constants.js';

function awardBadgeClass(description) {
  const d = description.toLowerCase();
  if (d.includes('silver') || d.includes('2nd'))
    return 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-white/20';
  if (d.includes('3rd'))
    return 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/50 dark:border-amber-500/20';
  if (d.includes('finalist') || d.includes('semifinalist'))
    return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20';
  return 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10';
}

// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  const age = computeAge('2008-11-22');
  const photoRef = useRef(null);
  const wrapperRef = useRef(null);

  const handlePhotoMove = useCallback((e) => {
    if (!photoRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 7;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -7;
    photoRef.current.style.willChange = 'transform';
    photoRef.current.style.transition = '';
    photoRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  }, []);

  const handlePhotoLeave = useCallback(() => {
    if (!photoRef.current) return;
    photoRef.current.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    photoRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    photoRef.current.style.willChange = 'auto';
  }, []);

  const TIMELINE = [
    { year: '2014', text: 'Cousin showed me Minecraft. Computers became home.' },
    { year: '2017', text: 'Discovered Roblox Studio. Built games in Lua — one reached ~1,000 players.' },
    { year: '2021', text: 'Junior high: Python, SQL, HTML. YouTube tutorials. The foundation.' },
    { year: '2023', text: 'School C++ class → self-studied docs → selected for OSN Informatika.' },
    { year: '2024', text: 'Algorithms, data structures, competitive programming. Went deep.' },
    { year: '2025', text: 'HTML/CSS/JS → accidentally joined a React course → never looked back.' },
  ];

  return (
    <section className="w-full dark:bg-slate-900 bg-slate-50 px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">

        {/* Profile photo — scale + lift entrance, then cursor tilt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.1 }}
          className="w-full md:w-auto shrink-0"
        >
          <div
            ref={wrapperRef}
            onMouseMove={handlePhotoMove}
            onMouseLeave={handlePhotoLeave}
            className="w-full aspect-square md:w-[22rem] md:h-[22rem]"
            style={{ perspective: '700px' }}
          >
            <div
              ref={photoRef}
              className="w-full h-full rounded-3xl shadow-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden ring-[3px] ring-indigo-500/15 dark:ring-indigo-400/20"
              style={{
                backgroundImage: "url('/images/banner.webp')",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
              role="img"
              aria-label="Kenneth's profile photo"
            />
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Section heading with clip-path reveal */}
          <div className="relative overflow-visible">
            <span
              className="absolute -top-6 -right-2 font-display font-black leading-none select-none pointer-events-none text-slate-900/[0.04] dark:text-white/[0.04]"
              style={{ fontSize: 'clamp(5rem, 10vw, 8rem)' }}
              aria-hidden="true"
            >01</span>
            <motion.p {...fadeUp} className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-3">
              About Me
            </motion.p>
            <motion.h2
              {...revealUp}
              className="font-display font-black text-slate-900 dark:text-white leading-none"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', letterSpacing: '-0.025em' }}
            >
              Hi, I'm Kenneth<br className="hidden md:block" /> Jehezkiel M.W.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            viewport={{ once: true, amount: 0.1 }}
            className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl text-justify"
          >
            I'm a{' '}
            <strong className="text-slate-900 dark:text-white">
              {age}-year-old student at SMA Regina Pacis Surakarta
            </strong>
            , passionate about{' '}
            <strong className="text-slate-900 dark:text-white">
              Software Engineering and Development
            </strong>
            . I love turning ideas into real, working applications and exploring how code can solve
            everyday problems. Whether crafting clean frontends or tackling competitive programming,{' '}
            <strong className="text-slate-900 dark:text-white">
              I'm always eager to learn, build, and grow.
            </strong>
          </motion.p>
        </div>
      </div>

      {/* Row 2: Timeline left, facts + goal right */}
      <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">

        {/* Left — timeline: hollow past dots, filled current, visible rail */}
        <div className="flex flex-col gap-4">
          <motion.p {...fadeUp} className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">
            How it started
          </motion.p>
          <div className="relative flex flex-col gap-4">
            <span className="absolute left-[5px] top-3 bottom-3 w-px bg-slate-300 dark:bg-white/20" />
            {TIMELINE.map((entry, i) => (
              <motion.div key={entry.year} {...slideInLeft(i)} className="flex gap-4 items-start">
                <span className={`mt-[3px] shrink-0 w-3 h-3 rounded-full border-2 z-10 ${
                  i === TIMELINE.length - 1
                    ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_0_3px_oklch(0.6_0.25_270/0.12)]'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-white/30'
                }`} />
                <span className="font-mono text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase shrink-0 w-10 tabular-nums">{entry.year}</span>
                <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{entry.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — fact cards + goal card */}
        <div className="flex flex-col gap-4">
          <motion.div {...fadeUp} className="grid grid-cols-2 gap-3">
            {[
              { label: 'Based in',      value: 'Solo, Indonesia' },
              { label: 'Speaks',        value: 'Indonesian · English · Chinese' },
              { label: 'Outside code',  value: 'Rock climbing · Gaming · Photography' },
              { label: 'Why I started', value: 'Colorful code looked cool. Then it got serious.' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 flex flex-col gap-1.5">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500">{label}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            {...fadeUp}
            className="rounded-xl border border-indigo-200 dark:border-indigo-400/30 bg-indigo-50/60 dark:bg-indigo-500/10 p-5 flex flex-col gap-1.5"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-indigo-500 dark:text-indigo-400">What drives me</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              I build things people feel grateful exist — starting with problems I hit every day.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// ─── Skill Row ────────────────────────────────────────────────────────────────

const LEVEL_DOT_COLOR = {
  'Competition Level': 'bg-red-400',
  'Intermediate':      'bg-amber-400',
  'Beginner':          'bg-emerald-400',
};

function getLevelKey(label) {
  if (label.includes('Competition Level') || label.includes('Comp. Level')) return 'Competition Level';
  if (label.includes('Intermediate')) return 'Intermediate';
  return 'Beginner';
}

function SkillRow({ lang, icon, pct, label, index }) {
  const level      = getSkillLevel(label);
  const levelKey   = getLevelKey(label);
  const dotColor   = LEVEL_DOT_COLOR[levelKey];
  const shortLabel = label.split('·')[0].trim();
  const detailLabel = label.split('·')[1]?.trim();
  const [showTip, setShowTip] = useState(false);
  const rowRef = useRef(null);
  const isInView = useInView(rowRef, { once: true });

  return (
    <motion.div ref={rowRef} {...slideInLeft(index)} className="flex flex-col gap-1.5">

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2 w-28 shrink-0">
          <img src={icon} alt={lang} className="w-5 h-5 object-contain" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{lang}</span>
        </div>

        <div className="flex-1 bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-indigo-500 origin-left will-change-transform"
            style={{ width: `${pct}%` }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
          />
        </div>

        {/* Full pill — md and up */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${level.bg} ${level.text} ${level.border} shrink-0 hidden md:block transition-all duration-200 hover:brightness-110`}
        >
          {shortLabel}
        </span>

        {/* Coloured dot — mobile only */}
        <button
          className="relative md:hidden shrink-0 flex items-center justify-center w-11 h-11 focus:outline-none"
          onClick={() => setShowTip((v) => !v)}
          aria-label={`Show skill level: ${shortLabel}`}
        >
          <span className={`w-3 h-3 rounded-full ${dotColor} shadow-sm`} />

          {showTip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-12 z-20 min-w-max px-3 py-2 rounded-xl border shadow-lg text-left ${level.bg} ${level.border}`}
            >
              <p className={`text-xs font-bold ${level.text}`}>{shortLabel}</p>
              {detailLabel && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{detailLabel}</p>
              )}
            </motion.div>
          )}
        </button>
      </div>

      {detailLabel && (
        <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 pl-7">{detailLabel}</p>
      )}
    </motion.div>
  );
}

function Skills() {
  return (
    <section className="w-full dark:bg-slate-950 bg-white px-6 py-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        <div className="relative overflow-visible">
          <span
            className="absolute -top-5 -right-2 font-display font-black leading-none select-none pointer-events-none text-slate-900/[0.04] dark:text-white/[0.04]"
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)' }}
            aria-hidden="true"
          >02</span>
          <motion.p {...fadeUp} className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-3">
            Technical Skills
          </motion.p>
          <motion.h2
            {...revealUp}
            className="font-display font-black text-slate-900 dark:text-white leading-none"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            What I Work With
          </motion.h2>
        </div>

        <div className="flex flex-col gap-5">
          {skills.map((skill, i) => (
            <SkillRow key={skill.lang} index={i} {...skill} />
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {Object.entries(SKILL_LEVELS).map(([label, cls]) => (
            <span
              key={label}
              className={`text-xs px-3 py-1 rounded-full border font-semibold transition-all duration-200 hover:brightness-110 ${cls.bg} ${cls.text} ${cls.border}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

const CertificateCard = memo(function CertificateCard({ image, title, description, index }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px', threshold: 0.1 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const actualSrc = inView ? image : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.12 }}
        viewport={{ once: true, amount: 0.1 }}
      >
        <div
          ref={cardRef}
          className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
        >
          <button
            type="button"
            className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[4/3] w-full"
            onClick={() => setZoomOpen(true)}
            aria-label={`View certificate: ${title}`}
          >
            <img
              src={actualSrc}
              alt={title}
              decoding="async"
              width="640"
              height="480"
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </button>
          <div className="px-5 py-4 flex flex-col gap-2">
            <h3 className="font-bold text-sm md:text-base leading-snug text-slate-900 dark:text-white">
              {title}
            </h3>
            <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full border ${awardBadgeClass(description)}`}>
              {description}
            </span>
          </div>
        </div>
      </motion.div>

      {zoomOpen && (
        <ImageZoom src={image} alt={title} onClose={() => setZoomOpen(false)} />
      )}
    </>
  );
});


function Certifications() {
  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900 px-6 py-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="relative overflow-visible">
          <span
            className="absolute -top-5 -right-2 font-display font-black leading-none select-none pointer-events-none text-slate-900/[0.04] dark:text-white/[0.04]"
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)' }}
            aria-hidden="true"
          >03</span>
          <motion.p {...fadeUp} className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-3">
            Achievements
          </motion.p>
          <motion.h2
            {...revealUp}
            className="font-display font-black text-slate-900 dark:text-white leading-none"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            Certifications & Awards
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((item, i) => (
            <CertificateCard key={item.title} index={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div id="home" className="w-full flex flex-col">
      <About />
      <Skills />
      <Certifications />
    </div>
  );
}
