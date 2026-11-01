// ─── Age ──────────────────────────────────────────────────────────────────────

// Months are zero-based: 10 = November. Built in local time on purpose —
// new Date('2008-11-22') is UTC midnight, which is still the 21st for
// visitors west of UTC and would advance the age a day early.
export const BIRTH_DATE = new Date(2008, 10, 22);

export function computeAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasBirthdayPassed) age--;
  return age;
}

// ─── Category Colors ──────────────────────────────────────────────────────────

export const CATEGORY_COLORS = {
  python: '#f59e0b',
  'c++': '#3b82f6',
  html: '#ef4444',
  css: '#6366f1',
  javascript: '#eab308',
  react: '#10b981',
  website: '#8b5cf6',
  'react native': '#06b6d4',
  'full stack': '#f97316',
  'full-stack': '#f97316',
  firebase: '#fbbf24',
  ios: '#a855f7',
  android: '#22c55e',
  mobile: '#ec4899',
  nextjs: '#94a3b8',
  'api integration': '#14b8a6',
  ai: '#d946ef',
  beautifulsoup: '#4ade80',
  pandas: '#60a5fa',
  selenium: '#facc15',
  dsa: '#fb923c',
  typescript: '#3178c6',
  tailwind: '#38bdf8',
  expo: '#a1a1aa',
  webgl: '#990000',
  '3d': '#f472b6',
  'web apis': '#2dd4bf',
};

export function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? 'var(--dim)';
}

// ─── Image variants ───────────────────────────────────────────────────────────
// `npm run images` writes display-sized derivatives beside the originals:
//   /images/thumb/… card-sized, pre-cropped to the CSS aspect ratio
//   /images/full/…  zoom-overlay sized (max 1800px wide)
//   /images/icon/…  64px square
// Sources stay untouched so the derivatives can always be regenerated.

const RASTER = /\.(webp|png|jpe?g)$/i;

export function imageVariant(src, kind) {
  if (!RASTER.test(src)) return src; // SVGs have no derivative
  return src.replace('/images/', `/images/${kind}/`).replace(RASTER, '.webp');
}

export const thumbSrc = (src) => imageVariant(src, 'thumb');
export const fullSrc  = (src) => imageVariant(src, 'full');
export const iconSrc  = (src) => imageVariant(src, 'icon');

// ─── Dates ────────────────────────────────────────────────────────────────────
// Anything that means "up to now" is derived, so the site never quietly goes
// stale on 1 January. Years that record a past event (an award, a photo, a
// timeline entry) stay hard-coded on purpose.

export const CODING_SINCE = 2017;
export const TIMELINE_START = 2014;

export const currentYear = () => new Date().getFullYear();
export const yearsCoding = () => currentYear() - CODING_SINCE;

// How many cards show before the visitor asks for the rest.
export const CERT_PREVIEW_COUNT = 6;

// Award tier decides the badge colour shown under each certificate title.
export function getBadgeColor(tier) {
  if (tier === 'gold') return 'var(--red-l)';
  if (tier === 'silver') return 'var(--fg)';
  if (tier === 'bronze') return '#FCD34D';
  return 'var(--dim)';
}

// Served straight out of /public so the link works in dev and in the build.
export const CV = {
  href: '/Kenneth-Jehezkiel-MW-CV.pdf',
  filename: 'Kenneth-Jehezkiel-MW-CV.pdf',
};

export const CATEGORIES = ['All', 'C++', 'Python', 'Website', 'React', 'Full-Stack', 'Mobile'];

// ─── Routes ────────────────────────────────────────────────────────────

export const SITE_URL = 'https://kennethjmw.vercel.app';

// One entry per crawlable URL. The build script reads this same table to stamp
// a static HTML shell per route, so the title and description a crawler is
// served before any JavaScript runs are the ones defined here — there is no
// second copy in index.html to drift out of sync.
export const PAGES = [
  {
    id: 1,
    path: '/',
    title: 'Kenneth Jehezkiel Marvel Wijaya · Competitive Programmer & Student Developer',
    description:
      'Portfolio of Kenneth Jehezkiel Marvel Wijaya — 1st place OSN-K Informatika 2026, 10+ national competition placements, 10+ shipped projects. Competitive programmer and student developer from Surakarta, Indonesia, seeking university scholarships.',
  },
  {
    id: 2,
    path: '/projects',
    title: 'Projects · Kenneth Jehezkiel Marvel Wijaya',
    description:
      'Selected projects by Kenneth Jehezkiel Marvel Wijaya: full-stack Next.js and React web apps, React Native mobile apps, Python automation, and C++ algorithm work. Source and live demos for each.',
  },
  {
    id: 3,
    path: '/contact',
    title: 'Contact · Kenneth Jehezkiel Marvel Wijaya',
    description:
      'Get in touch with Kenneth Jehezkiel Marvel Wijaya — email, LinkedIn, GitHub, and WhatsApp. Open to university scholarship opportunities, internships, and collaboration.',
  },
];

export const HOME = PAGES[0];

// Trailing slashes are normalised because Vercel serves /contact and /contact/
// as the same document, and a miss here would silently fall back to the home
// page after a deep link.
export function pageFromPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return PAGES.find((p) => p.path === clean) ?? HOME;
}

export const pageById = (id) => PAGES.find((p) => p.id === id) ?? HOME;
