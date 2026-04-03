import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 dark:border-white/5 bg-white dark:bg-slate-950 px-6 py-8 text-center">
      <p className="text-xs text-slate-400 dark:text-slate-600">
        Kenneth Jehezkiel Marvel Wijaya · Personal Portfolio · © {new Date().getFullYear()}
      </p>
    </footer>
  );
}