import { localize } from './localize.js';
import { fullSrc, getCategoryColor, thumbSrc } from '../utils/Constants.js';

export function splitProjects(indexed) {
  return {
    current: indexed.filter((p) => p.current === true),
    shipped: indexed.filter((p) => p.current !== true),
  };
}

// Search text and resolved image variants per project. Rebuilt per language,
// because the search has to match the text the visitor is actually reading.
export function indexProjects(projects, lang) {
  return projects.map((p) => {
    const description = localize(p.description, lang);
    return {
      ...p,
      description,
      period: localize(p.period, lang),
      thumb: p.image ? thumbSrc(p.image) : null,
      full: p.image ? fullSrc(p.image) : null,
      haystack: `${p.title} ${description} ${p.categories.join(' ')}`.toLowerCase(),
      tags: p.categories.map((c) => ({ name: c, color: getCategoryColor(c) })),
    };
  });
}
