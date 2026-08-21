// ─── Age ──────────────────────────────────────────────────────────────────────

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

// ─── Static Data ──────────────────────────────────────────────────────────────

export const stats = [
  { value: '10+', label: 'National wins' },
  { value: '15+', label: 'Projects shipped' },
  { value: '5+',  label: 'Years coding' },
];

export const facts = [
  { label: 'Based in',      value: 'Solo, Indonesia' },
  { label: 'Speaks',        value: 'Indonesian · English · Chinese' },
  { label: 'Outside code',  value: 'Rock climbing · Gaming · Photography' },
  { label: 'Why I started', value: 'Colorful code looked cool. Then it got serious.' },
];

export const timeline = [
  { year: '2014', color: 'var(--faint)', text: 'Cousin showed me Minecraft. Computers became home.' },
  { year: '2017', color: 'var(--faint)', text: 'Discovered Roblox Studio. Built games in Lua — one reached ~1,000 players.' },
  { year: '2021', color: 'var(--dim)',   text: 'Junior high: Python, SQL, HTML. YouTube tutorials. The foundation.' },
  { year: '2023', color: 'var(--dim)',   text: 'School C++ class → self-studied docs → selected for OSN Informatika.' },
  { year: '2024', color: 'var(--mut)',   text: 'Algorithms, data structures, competitive programming. Went deep.' },
  { year: '2025', color: 'var(--red-l)', text: 'HTML/CSS/JS → accidentally joined a React course → never looked back.' },
];

export const skills = [
  { lang: 'C++',        icon: '/images/c.webp',          pct: 82, level: 'Competition Level', detail: 'Algorithms / CP',      color: 'var(--red)' },
  { lang: 'Python',     icon: '/images/python.webp',     pct: 72, level: 'Competition Level', detail: 'Automation / Scripts', color: 'var(--red)' },
  { lang: 'JavaScript', icon: '/images/javascript.webp', pct: 52, level: 'Intermediate',      detail: 'Frontend / Web',       color: '#FCD34D' },
  { lang: 'ReactJS',    icon: '/images/ReactJS.webp',    pct: 52, level: 'Intermediate',      detail: 'Components / SPA',     color: '#FCD34D' },
  { lang: 'SQL',        icon: '/images/sql.webp',        pct: 22, level: 'Beginner',          detail: 'CRUD Queries',         color: '#6EE7B7' },
];

export const certificates = [
  { image: '/images/certificates/image0.webp',    title: 'Battle of Technology PingFEST UNS 2025',                                 description: '2nd Place' },
  { image: '/images/certificates/image2.webp',    title: 'Competitive Programming IAA UKDW Yogyakarta 2025',                       description: '2nd Place' },
  { image: '/images/certificates/image1.webp',    title: 'OSN Informatika Surakarta 2025',                                         description: 'Finalist' },
  { image: '/images/certificates/logicodix.webp', title: 'Logicodix Programming & Coding Competition UNESA 2025',                  description: '2nd Place' },
  { image: '/images/certificates/image3.webp',    title: 'Informatics Rally Games and Logic (IRGL) PCU 2025',                      description: '3rd Place' },
  { image: '/images/certificates/image4.webp',    title: 'Final OMNAS 13 Matematika 2024',                                         description: 'Silver Medalist' },
  { image: '/images/certificates/image5.webp',    title: 'Final OMNAS 13 English 2024',                                            description: 'Silver Medalist' },
  { image: '/images/certificates/ilpc.jpeg',      title: 'Semifinal ILPC Ubaya 2026',                                              description: 'Semifinalist' },
  { image: '/images/certificates/npc.webp',       title: 'Final Schematics National Programming Contest - Junior - ITS 2026',      description: 'Finalist' },
  { image: '/images/certificates/findit.webp',    title: 'Informatics Competition Find IT UGM 2026',                               description: 'Participant' },
  { image: '/images/certificates/image6.webp',    title: 'National Junior Highschool Math Competition - Practo Math Academy 2024', description: '2nd Place' },
  { image: '/images/certificates/image7.webp',    title: 'Entrepreneurship Business Challenge & Competition 6.0 UKWMS 2024',       description: 'Top 10' },
  { image: '/images/certificates/image8.webp',    title: 'Intro to Software Engineering Course - RevoU 2025',                      description: 'Completed' },
  { image: '/images/certificates/image9.webp',    title: 'Cybersecurity Workshop: "Breaking the Code" - PSB Academy 2025',         description: 'Completed' },
  { image: '/images/certificates/osis.jpeg',      title: 'Tutor Sebaya 2024-2025',                                                 description: 'Mentor' },
  { image: '/images/certificates/uic.jpeg',       title: 'Ursulin Investment Club 2024-2025',                                      description: 'Member' },
];

// Award tier decides the badge colour shown under each certificate title.
export function getBadgeColor(description) {
  if (/2nd|silver/i.test(description)) return 'var(--fg)';
  if (/3rd/i.test(description)) return '#FCD34D';
  if (/finalist/i.test(description)) return 'var(--red-l)';
  return 'var(--dim)';
}

export const contactLinks = [
  { icon: '/images/instagram.webp', label: 'Instagram', handle: '@kenneth_kiel',     href: 'https://www.instagram.com/kenneth_kiel/', flip: 'none' },
  { icon: '/images/whatsapp.webp',  label: 'WhatsApp',  handle: '+62 822-6159-2211', href: 'https://wa.me/6282261592211',             flip: 'none' },
  { icon: '/images/github.svg',     label: 'GitHub',    handle: 'github.com/elitcx', href: 'https://github.com/elitcx',               flip: 'var(--iconflip)' },
];

export const CATEGORIES = ['All', 'C++', 'Python', 'Website', 'React', 'Full-Stack', 'Mobile'];

export const PAGE_TITLES = {
  1: 'Kenneth · Portfolio',
  2: 'Kenneth · Projects',
  3: 'Kenneth · Contact',
};
