import React, { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import ImageZoom from './Imagezoom.jsx';
import { fadeUp, stagger } from '../utils/Animations.js';
import {
  computeAge,
  getSkillLevel,
  SKILL_LEVELS,
  stats,
  skills,
  certificates,
} from '../utils/Constants.js';

// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  const age = computeAge('2008-11-22');

  return (
    <section className="w-full dark:bg-slate-900 bg-slate-50 px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">

        <motion.div {...stagger(0)} className="w-full md:w-auto shrink-0">
          <div
            className="w-full aspect-square md:w-72 md:h-72 rounded-3xl shadow-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden ring-4 ring-indigo-500/20"
            style={{
              backgroundImage: "url('/images/banner.webp')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
            role="img"
            aria-label="Kenneth's profile photo"
          />
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div {...stagger(1)}>
            <p className="text-xs font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mb-2">
              About Me
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Hi, I'm Kenneth Jehezkiel M.W.
            </h2>
          </motion.div>

          <motion.p
            {...stagger(2)}
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

          <motion.div {...stagger(3)} className="flex flex-wrap gap-3 text-sm font-medium">
            <span className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
              🚀 Aspiring Developer
            </span>
            <span className="px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
              💡 Problem Solver
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
              🏆 Competitive Programmer
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  return (
    <section className="w-full bg-indigo-600 dark:bg-indigo-700 px-6 py-14">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-white text-center">
        {stats.map((s, i) => (
          <motion.div key={i} {...stagger(i)} className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-black">{s.value}</span>
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider opacity-80">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Skill Row ────────────────────────────────────────────────────────────────

const LEVEL_DOT_COLOR = {
  'Competition Level': 'bg-red-400 dark:bg-red-400',
  'Intermediate':      'bg-amber-400 dark:bg-amber-400',
  'Beginner':          'bg-emerald-400 dark:bg-emerald-400',
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

  return (
    <motion.div {...stagger(index)} className="flex flex-col gap-1.5">

      {/* Row: icon + name · bar · badge/dot */}
      <div className="flex items-center gap-3">

        {/* Language */}
        <div className="flex items-center gap-2 w-28 shrink-0">
          <img src={icon} alt={lang} className="w-5 h-5 object-contain" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{lang}</span>
        </div>

        {/* Bar */}
        <div className="flex-1 bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.1 }}
            viewport={{ once: true }}
          />
        </div>

        {/* Full pill — md and up */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${level.bg} ${level.text} ${level.border} shrink-0 hidden md:block`}
        >
          {shortLabel}
        </span>

        {/* Coloured dot — mobile only, tap to reveal popover */}
        <button
          className="relative md:hidden shrink-0 flex items-center justify-center w-6 h-6 focus:outline-none"
          onClick={() => setShowTip((v) => !v)}
          aria-label={`Show skill level: ${shortLabel}`}
        >
          <span className={`w-3 h-3 rounded-full ${dotColor} shadow-sm`} />

          {showTip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-8 z-20 min-w-max px-3 py-2 rounded-xl border shadow-lg text-left ${level.bg} ${level.border}`}
            >
              <p className={`text-xs font-bold ${level.text}`}>{shortLabel}</p>
              {detailLabel && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{detailLabel}</p>
              )}
            </motion.div>
          )}
        </button>
      </div>

      {/* Detail sub-label — desktop only */}
      {detailLabel && (
        <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 pl-7">{detailLabel}</p>
      )}
    </motion.div>
  );
}

function Skills() {
  return (
    <section className="w-full dark:bg-slate-900 bg-slate-50 px-6 py-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mb-2">
            Technical Skills
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            What I Work With
          </h2>
        </motion.div>

        <div className="flex flex-col gap-5">
          {skills.map((skill, i) => (
            <SkillRow key={skill.lang} index={i} {...skill} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {Object.entries(SKILL_LEVELS).map(([label, cls]) => (
            <span
              key={label}
              className={`text-xs px-3 py-1 rounded-full border font-semibold ${cls.bg} ${cls.text} ${cls.border}`}
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

const CertificateCard = memo(function CertificateCard({ image, title, description }) {
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
      <div
        ref={cardRef}
        className="group flex flex-col gap-3 rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm transform transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[4/3]">
          <img
            src={actualSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            width="640"
            height="480"
            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 ease-out group-hover:scale-105"
            onClick={() => setZoomOpen(true)}
          />
          <div
            className="absolute inset-0 cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
            aria-hidden="true"
          />
        </div>
        <div className="px-5 pb-5 flex flex-col gap-1">
          <h3 className="font-bold text-sm md:text-base leading-snug text-slate-900 dark:text-white">
            {title}
          </h3>
          <span className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">
            {description}
          </span>
        </div>
      </div>

      {zoomOpen && (
        <ImageZoom src={image} alt={title} onClose={() => setZoomOpen(false)} />
      )}
    </>
  );
});

function Certifications() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? certificates : certificates.slice(0, 6);

  return (
    <section className="w-full bg-white dark:bg-slate-950 px-6 py-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mb-2">
            Achievements
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Certifications & Awards
          </h2>
        </motion.div>

        <div className="flex flex-col items-center gap-8 w-full">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.1 }}
          >
            {visible.map((item, i) => (
              <CertificateCard key={item.title} {...item} />
            ))}
          </motion.div>

          {certificates.length > 6 && (
            <button
              onClick={() => setShowAll((p) => !p)}
              className="px-6 py-2.5 rounded-full border-2 border-slate-300 dark:border-white/20 text-sm font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-200"
            >
              {showAll ? 'Show Less' : `Show All (${certificates.length - 6} more)`}
            </button>
          )}
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
      <Stats />
      <Skills />
      <Certifications />
    </div>
  );
}