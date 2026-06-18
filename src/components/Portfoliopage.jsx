import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageZoom from './Imagezoom.jsx';
import { fadeUp, stagger } from '../utils/Animations.js';
import { getCategoryColor, CATEGORIES } from '../utils/Constants.js';
import projects from '../assets/projects.json';

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ image, title, description, link, categories, onZoom, deployed }) {
  return (
    <motion.div
      {...stagger(0)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800/60 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-2xl transition-shadow duration-500"
    >
      <div className="relative overflow-hidden aspect-video bg-slate-100 dark:bg-slate-900">
        <button
          type="button"
          className="block w-full h-full"
          onClick={() => onZoom({ src: image, alt: title })}
          aria-label={`View screenshot of ${title}`}
        >
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat, i) => (
            <span
              key={i}
              className="text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ backgroundColor: getCategoryColor(cat) }}
            >
              {cat}
            </span>
          ))}
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{title}</h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        <div className="flex flex-row items-center gap-3 w-full">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#24292e] hover:bg-[#1b1f23] dark:bg-[#30363d] dark:hover:bg-[#3d444d] text-white text-xs font-bold tracking-wide transition-colors duration-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              View GitHub Repo →
            </a>
          )}
          {deployed && (
            <a
              href={deployed}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 self-start px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-colors duration-200"
            >
              View Website →
            </a>
          )}
        </div>
        </div>
    </motion.div>
  );
}

// ─── PortfolioPage ────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [zoomImage, setZoomImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const displayedProjects = useMemo(() => {
    let filtered = projects;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) =>
        p.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <div className="w-full min-h-screen flex flex-col dark:bg-slate-950 bg-slate-50 pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">

          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 mb-3">
              My Work
            </p>
            <h1 className="font-display font-black text-slate-900 dark:text-white leading-none" style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', letterSpacing: '-0.03em' }}>
              Projects
            </h1>
          </motion.div>

          {/* Filters */}
          <motion.div
            {...stagger(1)}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search projects"
              className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />

            <div className="flex gap-2 flex-wrap justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-indigo-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {displayedProjects.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedProjects.map((project, i) => (
                  <ProjectCard key={i} {...project} onZoom={setZoomImage} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-slate-400 dark:text-slate-600"
              >
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">No projects match your search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {zoomImage && (
        <ImageZoom src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />
      )}
    </>
  );
}