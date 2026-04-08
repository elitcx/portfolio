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
};

export function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? '#64748b';
}

// ─── Skill Levels ─────────────────────────────────────────────────────────────

export const SKILL_LEVELS = {
  'Competition Level': {
    bg: 'bg-red-500/20 dark:bg-red-400/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-400/40',
  },
  Intermediate: {
    bg: 'bg-amber-500/20 dark:bg-amber-400/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-400/40',
  },
  Beginner: {
    bg: 'bg-emerald-500/20 dark:bg-emerald-400/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-400/40',
  },
};

export function getSkillLevel(label) {
  if (label.includes('Competition Level') || label.includes('Comp. Level'))
    return SKILL_LEVELS['Competition Level'];
  if (label.includes('Intermediate')) return SKILL_LEVELS['Intermediate'];
  return SKILL_LEVELS['Beginner'];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

export const stats = [
  { value: '10+', label: 'National Competitions Won' },
  { value: '15+', label: 'Projects Completed' },
  { value: '5+', label: 'Years of Programming' },
];

export const skills = [
  { lang: 'C++',        icon: '/images/c.webp',        pct: 82, label: 'Competition Level · Algorithms / CP' },
  { lang: 'Python',     icon: '/images/python.webp',    pct: 72, label: 'Competition Level · Automation / Scripts' },
  { lang: 'JavaScript', icon: '/images/javascript.webp', pct: 52, label: 'Intermediate · Frontend / Web' },
  { lang: 'ReactJS',    icon: '/images/ReactJS.webp',   pct: 52, label: 'Intermediate · Components / SPA' },
  { lang: 'SQL',        icon: '/images/sql.webp',        pct: 22, label: 'Beginner · CRUD Queries' },
];

export const certificates = [
  { image: '/images/certificates/image0.webp',    title: 'Battle of Technology PingFEST UNS 2025',                                    description: '2nd Place' },
  { image: '/images/certificates/image2.webp',    title: 'Competitive Programming IAA UKDW Yogyakarta 2025',                          description: '2nd Place' },
  { image: '/images/certificates/image1.webp',    title: 'OSN Informatika Surakarta 2025',                                            description: 'Finalist' },
  { image: '/images/certificates/logicodix.webp', title: 'Logicodix Programming & Coding Competition UNESA 2025',                     description: '2nd Place' },
  { image: '/images/certificates/image3.webp',    title: 'Informatics Rally Games and Logic (IRGL) PCU 2025',                         description: '3rd Place' },
  { image: '/images/certificates/image4.webp',    title: 'Final OMNAS 13 Matematika 2024',                                           description: 'Silver Medalist' },
  { image: '/images/certificates/image5.webp',    title: 'Final OMNAS 13 English 2024',                                              description: 'Silver Medalist' },
  { image: '/images/certificates/ilpc.jpeg', title: 'Semifinal ILPC Ubaya 2026', description: 'Semifinalist'},
  { image: '/images/certificates/image6.webp',    title: 'National Junior Highschool Math Competition - Practo Math Academy 2024',    description: '2nd Place' },
  { image: '/images/certificates/image7.webp',    title: 'Entrepreneurship Business Challenge & Competition 6.0 UKWMS 2024',          description: 'Top 10' },
  { image: '/images/certificates/image8.webp',    title: 'Intro to Software Engineering Course - RevoU 2025',                        description: 'Completed' },
  { image: '/images/certificates/image9.webp',    title: 'Cybersecurity Workshop: "Breaking the Code" - PSB Academy 2025',           description: 'Completed' },
  { image: '/images/certificates/osis.jpeg',    title: 'Tutor Sebaya 2024-2025',           description: 'Mentor' },
  { image: '/images/certificates/uic.jpeg',    title: 'Ursulin Investment Club 2024-2025',           description: 'Member' },
];

export const contactLinks = [
  { icon: '/images/instagram.webp', label: 'Instagram', href: 'https://www.instagram.com/kenneth_kiel/#' },
  { icon: '/images/whatsapp.webp',   label: 'WhatsApp',  href: 'https://wa.me/6282261592211' },
  { icon: '/images/github.svg',     label: 'GitHub',    href: 'https://github.com/elitcx' },
];

export const CATEGORIES = ['All', 'C++', 'Python', 'Website', 'React'];

export const PAGE_TITLES = {
  1: 'Kenneth · Portfolio',
  2: 'Kenneth · Projects',
  3: 'Kenneth · Contact',
};

export const TYPEWRITER_WORDS = [
  'Kenneth.',
];