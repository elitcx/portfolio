import React, { useMemo } from 'react';

import { site } from '../content/index.js';
import { localize } from '../lib/localize.js';
import { LangContext } from './lang.js';

export default function LangProvider({ children }) {
  const lang = 'en';

  const value = useMemo(
    () => ({
      lang,
      l: (field) => localize(field, lang),
      s: (key) => localize(site.text[key], lang),
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
