import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

import NavigationBar from './components/NavigationBar.jsx';
import Hero          from './components/Hero.jsx';
import HomePage      from './components/Homepage.jsx';
import PortfolioPage from './components/Portfoliopage.jsx';
import ContactPage   from './components/Contactpage.jsx';
import Footer        from './components/Footer.jsx';

import { PAGE_TITLES } from './utils/Constants.js';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });

  const [page, setPage] = useState(1);

  const toggleDarkMode = useCallback((value) => {
    setDarkMode(value);
    try { localStorage.setItem('theme', value ? 'dark' : 'light'); } catch { /* ignore */ }
  }, []);

  const scrollToAbout = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Scroll to top and update tab title on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = PAGE_TITLES[page] ?? 'Kenneth · Portfolio';
  }, [page]);

  // Drive the design tokens off <html data-pt="dark|light">
  useEffect(() => {
    document.documentElement.setAttribute('data-pt', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Developer Easter egg
  useEffect(() => {
    const b = 'font-family:monospace;font-weight:bold;font-size:14px;color:#d4a54a;';
    const s = 'font-family:monospace;font-size:11px;color:#64748b;';
    const l = 'font-family:monospace;font-size:11px;color:#6366f1;';
    console.log('%cKenneth Jehezkiel M.W.', b);
    console.log('%cCompetitive Programmer · Surakarta, Indonesia', s);
    console.log('%chttps://github.com/elitcx', l);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--fg)',
        fontFamily: 'Barlow, system-ui, sans-serif',
        overflowX: 'hidden',
        transition: 'background .4s ease, color .4s ease',
      }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg"
      >
        Skip to content
      </a>

      <NavigationBar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        page={page}
        changePage={setPage}
      />

      <main id="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
        {page === 1 && (
          <>
            <Hero onScroll={scrollToAbout} theme={darkMode ? 'dark' : 'light'} />
            <HomePage />
          </>
        )}
        {page === 2 && <PortfolioPage />}
        {page === 3 && <ContactPage />}
      </main>

      <Footer />
    </div>
  );
}
