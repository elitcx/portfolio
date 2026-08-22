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

// ─── Static Data ──────────────────────────────────────────────────────────────

// ─── Dates ────────────────────────────────────────────────────────────────────
// Anything that means "up to now" is derived, so the site never quietly goes
// stale on 1 January. Years that record a past event (an award, a photo, a
// timeline entry) stay hard-coded on purpose.

export const CODING_SINCE = 2017;
export const TIMELINE_START = 2014;

export const currentYear = () => new Date().getFullYear();
export const yearsCoding = () => currentYear() - CODING_SINCE;

export const stats = [
  // A specific beats an aggregate: this is the strongest verifiable result on the
  // page, so it leads rather than being averaged into the placement count.
  { value: '1st', label: 'OSN-K Informatika 2026' },
  { value: '10+', label: 'National competition placements' },
  // Kept in step with the projects page, which counts projects.json directly.
  { value: '10+', label: 'Projects shipped' },
  { value: `${yearsCoding()}+`, label: 'Years coding' },
];

export const facts = [
  { label: 'Looking for',   value: 'University scholarships' },
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
  { year: '2025', color: 'var(--mut)',   text: 'HTML/CSS/JS → accidentally joined a React course → never looked back.' },
  { year: '2026', color: 'var(--red-l)', text: '1st at OSNK Informatika. Samsung Solve for Tomorrow semifinals. More projects, more volunteering.' },
];

// Grouped because a language and a library are not the same kind of thing; a flat
// list mixing JavaScript with React invites the reader to compare them directly.
// `pct` drives the bar width only, it is no longer printed beside the row.
export const skillGroups = [
  {
    group: 'Languages',
    meta: '5 languages',
    items: [
      { lang: 'C++',        icon: '/images/c.webp',          pct: 82, level: 'Competition Level', detail: 'Algorithms / CP',      color: 'var(--red)' },
      { lang: 'Python',     icon: '/images/python.webp',     pct: 72, level: 'Competition Level', detail: 'Automation / Scripts', color: 'var(--red)' },
      { lang: 'JavaScript', icon: '/images/javascript.webp', pct: 52, level: 'Intermediate',      detail: 'Frontend / Web',       color: '#FCD34D' },
      { lang: 'TypeScript', icon: '/images/typescript.svg',  pct: 35, level: 'Learning',          detail: 'Typed React',          color: '#6EE7B7' },
      { lang: 'SQL',        icon: '/images/sql.webp',        pct: 22, level: 'Beginner',          detail: 'CRUD Queries',         color: '#6EE7B7' },
    ],
  },
  {
    group: 'Frameworks & tools',
    meta: '3 tools',
    items: [
      { lang: 'React',        icon: '/images/ReactJS.webp',  pct: 52, level: 'Intermediate', detail: 'Components / SPA',     color: '#FCD34D' },
      { lang: 'React Native', icon: '/images/ReactJS.webp',  pct: 42, level: 'Intermediate', detail: 'Expo / Mobile apps',   color: '#FCD34D' },
      { lang: 'Tailwind CSS', icon: '/images/tailwind.svg',  pct: 58, level: 'Intermediate', detail: 'Utility-first styling', color: '#FCD34D' },
    ],
  },
];

// Ordered by prestige x result x recency, best first: podium finishes, then
// finalist/semifinalist runs, then participation, then non-competition credentials.
// Every title and result below was read off the certificate itself.
export const certificates = [
  { image: '/images/certificates/osnk.png',       title: 'OSN Informatika (OSN-K) Kota Surakarta 2026',                            description: '1st Place' },
  { image: '/images/certificates/logicodix.webp', title: 'Programming & Logic Competition - LOGICODIX UNESA 2025',                 description: '2nd Place' },
  { image: '/images/certificates/image2.webp',    title: 'Competitive Programming - IAA UKDW Yogyakarta 2025',                     description: '2nd Place' },
  { image: '/images/certificates/image0.webp',    title: 'Battle of Technology IT-Venture - PINGFEST UNS 2025',                    description: '2nd Place' },
  { image: '/images/certificates/image3.webp',    title: 'Informatics Rally Games and Logic (IRGL) - UK Petra 2025',               description: '3rd Place' },
  { image: '/images/certificates/image1.webp',    title: 'OSN Informatika (OSN-K) Kota Surakarta 2025',                            description: 'Finalist' },
  { image: '/images/certificates/npc.webp',       title: 'Schematics National Programming Contest Junior - ITS 2025',              description: 'Finalist' },
  { image: '/images/certificates/ilpc.jpeg',      title: 'Informatics Logical and Programming Competition (ILPC) - Ubaya 2026',    description: 'Semifinalist' },
  { image: '/images/certificates/findit.webp',    title: 'Informatics Competition - FIND IT! UGM 2026',                            description: 'Participant' },
  { image: '/images/certificates/webdesign.jpg',  title: 'Web Design Competition - TechSoft, Politeknik Negeri Indramayu 2026',    description: 'Participant' },
  { image: '/images/certificates/image4.webp',    title: 'Final Nasional OMNAS 13 - Matematika 2024',                              description: 'Silver Medalist' },
  { image: '/images/certificates/image5.webp',    title: 'Final Nasional OMNAS 13 - Bahasa Inggris 2024',                          description: 'Silver Medalist' },
  { image: '/images/certificates/image6.webp',    title: 'National Junior High School Math Competition - Practo Math Academy 2023', description: 'Silver Medalist' },
  { image: '/images/certificates/image7.webp',    title: 'Entrepreneurship Business Challenge & Competition 6.0 - UKWMS 2024',     description: 'Top 10' },
  { image: '/images/certificates/nbpc.jpg',       title: 'National Business Plan Competition - Universitas Widyagama Malang 2025',  description: 'Participant' },
  { image: '/images/certificates/image8.webp',    title: 'Intro to Software Engineering - RevoU Coding Camp 2025',                 description: 'Attended' },
  { image: '/images/certificates/image9.webp',    title: 'Cybersecurity Workshop "Breaking the Code" - PSB Academy Singapore 2025', description: 'Attended' },
  { image: '/images/certificates/osis.jpeg',      title: 'Tutor Sebaya - SMA Regina Pacis Surakarta 2024/2025',                    description: 'Mentor' },
  { image: '/images/certificates/volunteer.png',  title: 'Volunteer - Panti Asuhan Beth Shan, Relawan Bersamaa.Baktikuu 2026',     description: 'Volunteer' },
  { image: '/images/certificates/uic.jpeg',       title: 'Ursulin Investment Club - SMA Regina Pacis Surakarta 2025',              description: 'Member' },
];

// How many cards show before the visitor asks for the rest.
export const CERT_PREVIEW_COUNT = 6;

// Award tier decides the badge colour shown under each certificate title.
export function getBadgeColor(description) {
  if (/1st|gold/i.test(description)) return 'var(--red-l)';
  if (/2nd|silver/i.test(description)) return 'var(--fg)';
  if (/3rd/i.test(description)) return '#FCD34D';
  if (/finalist/i.test(description)) return 'var(--dim)';
  return 'var(--dim)';
}

// Ordered by how a recruiter or admissions officer would actually reach out:
// the professional channels first, social last.
export const contactLinks = [
  { icon: '/images/email.svg',      label: 'Email',     handle: 'kjmw2211@gmail.com',   href: 'mailto:kjmw2211@gmail.com', flip: 'none' },
  { icon: '/images/linkedin.svg',   label: 'LinkedIn',  handle: 'Kenneth Jehezkiel M.W.', href: 'https://www.linkedin.com/in/kenneth-jehezkiel-marvel-wijaya-4a3664248/', flip: 'none' },
  { icon: '/images/github.svg',     label: 'GitHub',    handle: 'github.com/elitcx',    href: 'https://github.com/elitcx',               flip: 'var(--iconflip)' },
  { icon: '/images/whatsapp.webp',  label: 'WhatsApp',  handle: '+62 822-6159-2211',    href: 'https://wa.me/6282261592211',             flip: 'none' },
  { icon: '/images/instagram.webp', label: 'Instagram', handle: '@kenneth_kiel',        href: 'https://www.instagram.com/kenneth_kiel/', flip: 'none' },
];

// Served straight out of /public so the link works in dev and in the build.
export const CV = {
  href: '/Kenneth-Jehezkiel-MW-CV.pdf',
  filename: 'Kenneth-Jehezkiel-MW-CV.pdf',
  label: 'Download CV',
  meta: 'PDF · 2 pages',
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
