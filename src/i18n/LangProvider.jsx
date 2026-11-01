import React, { useEffect, useMemo, useState } from 'react';

import { site } from '../content/index.js';
import { localize } from '../lib/localize.js';
import { detectLang, readStoredLang } from './detect.js';
import { LangContext } from './lang.js';

export default function LangProvider({ children }) {
  const [lang, setLangState] = useState(() =>
    detectLang({ stored: readStoredLang(), navigatorLanguage: navigator.language }),
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        try { localStorage.setItem('lang', next); } catch { /* ignore */ }
      },
      l: (field) => localize(field, lang),
      s: (key) => localize(site.text[key], lang),
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
