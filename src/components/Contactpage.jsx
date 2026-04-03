import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../utils/Animations.js';
import { contactLinks } from '../utils/Constants.js';

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center dark:bg-slate-950 bg-slate-50 px-6 pt-28 pb-24">
      <div className="max-w-xl w-full flex flex-col gap-10 text-center">

        <motion.div {...fadeUp}>
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mb-2">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Let's Connect
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
            Have a project in mind or just want to say hello? I'm always open to new opportunities
            and conversations.
          </p>
        </motion.div>

        <motion.div {...stagger(1)} className="flex flex-col gap-4">
          {contactLinks.map((c, i) => (
            <motion.a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <img src={c.icon} alt={c.label} className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{c.label}</span>
              <span className="ml-auto text-slate-400 group-hover:text-indigo-500 transition-colors text-lg">
                →
              </span>
            </motion.a>
          ))}
        </motion.div>

      </div>
    </div>
  );
}