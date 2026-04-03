import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageZoom from './Imagezoom.jsx';
import { fadeUp, stagger } from '../utils/Animations.js';
import { getCategoryColor, CATEGORIES } from '../utils/Constants.js';
import projects from '../assets/projects.json';

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ image, title, description, link, categories, onZoom }) {
  return (
    <motion.div
      {...stagger(0)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800/60 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-2xl transition-shadow duration-500"
    >
      <div className="relative overflow-hidden aspect-video bg-slate-100 dark:bg-slate-900">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
          onClick={() => onZoom({ src: image, alt: title })}
        />
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

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 self-start px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide transition-colors duration-200"
          >
            View Project →
          </a>
        )}
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

          <motion.div {...fadeUp} className="text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mb-2">
              My Work
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white">Projects</h1>
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