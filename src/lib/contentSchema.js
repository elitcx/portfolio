// One description of every editable field. The server validates saves against
// it and the dashboard builds its forms from it, so the two cannot disagree.

import { TEXT_KEYS } from '../content/textKeys.js';
import { ALLOWED_TOKENS, findTokens } from './richText.js';

// The image build reads project and banner pictures from the root of
// public/images and certificates from their own folder, so each must be there.
const ROOT_IMAGE = /^\/images\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/;
const CERT_IMAGE = /^\/images\/certificates\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/;

const MAX_TEXT = 5000;

const whileBuilding = (item) => item.current !== true;

const TIER_OPTIONS = [
  { value: 'gold', label: 'Gold (1st place)' },
  { value: 'silver', label: 'Silver (2nd place)' },
  { value: 'bronze', label: 'Bronze (3rd place)' },
  { value: 'other', label: 'Plain' },
];

const TIMELINE_COLORS = [
  { value: 'var(--faint)', label: 'Faintest' },
  { value: 'var(--dim)', label: 'Faint' },
  { value: 'var(--mut)', label: 'Normal' },
  { value: 'var(--red-l)', label: 'Accent' },
];

const SKILL_COLORS = [
  { value: 'var(--red)', label: 'Red (advanced)' },
  { value: '#FCD34D', label: 'Yellow (intermediate)' },
  { value: '#6EE7B7', label: 'Green (beginner)' },
];

const SKILL_ICONS = [
  { value: '', label: 'No icon' },
  { value: '/images/c.webp', label: 'C++' },
  { value: '/images/python.webp', label: 'Python' },
  { value: '/images/javascript.webp', label: 'JavaScript' },
  { value: '/images/typescript.svg', label: 'TypeScript' },
  { value: '/images/sql.webp', label: 'SQL' },
  { value: '/images/ReactJS.webp', label: 'React' },
  { value: '/images/tailwind.svg', label: 'Tailwind' },
  { value: '/images/kotlin.svg', label: 'Kotlin' },
  { value: '/images/nextjs.svg', label: 'Next.js' },
  { value: '/images/fastapi.svg', label: 'FastAPI' },
  { value: '/images/threejs.svg', label: 'Three.js' },
  { value: '/images/pytorch.svg', label: 'PyTorch' },
  { value: '/images/onnx.svg', label: 'ONNX' },
  { value: '/images/pytest.svg', label: 'pytest' },
  { value: '/images/ocr.svg', label: 'OCR' },
];

// Order here is the order the Experience section shows the groups in.
export const RESUME_GROUPS = [
  { value: 'education', label: 'Education & test scores' },
  { value: 'experience', label: 'Work' },
  { value: 'leadership', label: 'Leadership & volunteering' },
];

const ICON_FLIP = [
  { value: 'none', label: 'Keep colours' },
  { value: 'var(--iconflip)', label: 'Invert in dark mode' },
];

export const SCHEMAS = {
  project: {
    current: { type: 'bool', label: 'Currently building' },
    title: { type: 'text', label: 'Title', required: true },
    description: { type: 'locLong', label: 'Description', required: true },
    period: { type: 'loc', label: 'Period', required: true },
    team: { type: 'loc', label: 'Team (leave empty if solo)' },
    categories: { type: 'tags', label: 'Categories', required: true },
    link: { type: 'link', label: 'Repo link', required: whileBuilding },
    deployed: { type: 'link', label: 'Live link' },
    image: { type: 'image', label: 'Picture', required: whileBuilding, upload: 'project', pattern: ROOT_IMAGE },
  },
  certificate: {
    title: { type: 'text', label: 'Title', required: true },
    result: { type: 'loc', label: 'Result', required: true },
    tier: { type: 'select', label: 'Badge colour', required: true, options: TIER_OPTIONS },
    image: { type: 'image', label: 'Picture (leave empty if there is no certificate)', upload: 'certificate', pattern: CERT_IMAGE },
  },
  stat: {
    value: { type: 'loc', label: 'Value', required: true },
    label: { type: 'loc', label: 'Label', required: true },
  },
  fact: {
    label: { type: 'loc', label: 'Label', required: true },
    value: { type: 'loc', label: 'Value', required: true },
  },
  timeline: {
    year: { type: 'text', label: 'Year', required: true },
    text: { type: 'locLong', label: 'Text', required: true },
    color: { type: 'select', label: 'Year colour', required: true, options: TIMELINE_COLORS },
  },
  skillGroup: {
    group: { type: 'loc', label: 'Group name', required: true },
    meta: { type: 'loc', label: 'Count label', required: true },
    items: { type: 'list', label: 'Skills', of: 'skill', required: true },
  },
  skill: {
    lang: { type: 'text', label: 'Name', required: true },
    detail: { type: 'loc', label: 'Detail', required: true },
    level: { type: 'loc', label: 'Level', required: true },
    pct: { type: 'number', label: 'Bar length (0 to 100)', required: true, min: 0, max: 100 },
    color: { type: 'select', label: 'Colour', required: true, options: SKILL_COLORS },
    icon: { type: 'select', label: 'Icon', options: SKILL_ICONS },
  },
  resume: {
    group: { type: 'select', label: 'Group', required: true, options: RESUME_GROUPS },
    title: { type: 'loc', label: 'Title', required: true },
    period: { type: 'loc', label: 'Period', required: true },
    highlight: { type: 'loc', label: 'Highlight (a short number, e.g. 8.5)' },
    text: { type: 'locLong', label: 'Details' },
  },
  contact: {
    label: { type: 'text', label: 'Name', required: true },
    handle: { type: 'text', label: 'Shown as', required: true },
    href: { type: 'link', label: 'Link', required: true, mailto: true },
    flip: { type: 'select', label: 'Icon colour', required: true, options: ICON_FLIP },
    icon: { type: 'fixed', label: 'Icon', pattern: /^\/images\/[a-zA-Z0-9_-]+\.(svg|webp|png)$/ },
  },
};

const NAMES = { project: 'Project', certificate: 'Certificate', stat: 'Stat', fact: 'Fact', timeline: 'Timeline entry', skillGroup: 'Skill group', skill: 'Skill', resume: 'Experience entry', contact: 'Contact' };

export function isSafeLink(url, { mailto = false } = {}) {
  if (typeof url !== 'string') return false;
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:' || (mailto && protocol === 'mailto:');
  } catch {
    return false;
  }
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isFilled = (value) => value !== undefined && value !== null && value !== '';

function checkLocalized(value, required, name) {
  if (!isPlainObject(value)) return [`${name} must have English or Indonesian text`];
  const unknown = Object.keys(value).filter((key) => key !== 'en' && key !== 'id');
  if (unknown.length) return [`${name} has an unknown language: ${unknown[0]}`];

  const parts = [value.en ?? '', value.id ?? ''];
  if (parts.some((part) => typeof part !== 'string' || part.length > MAX_TEXT)) {
    return [`${name} must be text under ${MAX_TEXT} characters`];
  }
  if (required && !parts.some((part) => part.trim())) return [`${name} needs English or Indonesian text`];

  const bad = parts.flatMap(findTokens).filter((token) => !ALLOWED_TOKENS.includes(token));
  return bad.length ? [`${name} uses an unknown value {${bad[0]}}. Use {age}, {years} or {count}`] : [];
}

function checkField(field, value, item, name) {
  const required = typeof field.required === 'function' ? field.required(item) : field.required;
  const localized = field.type === 'loc' || field.type === 'locLong';

  if (!localized && !isFilled(value)) {
    return required ? [`${name} is required`] : [];
  }

  switch (field.type) {
    case 'loc':
    case 'locLong':
      if (value === undefined && !required) return [];
      return checkLocalized(value, required, name);
    case 'text':
      return typeof value === 'string' && value.trim() && value.length <= MAX_TEXT
        ? []
        : [`${name} must be text under ${MAX_TEXT} characters`];
    case 'bool':
      return typeof value === 'boolean' ? [] : [`${name} must be on or off`];
    case 'number':
      return Number.isFinite(value) && value >= field.min && value <= field.max
        ? []
        : [`${name} must be a number from ${field.min} to ${field.max}`];
    case 'tags':
      return Array.isArray(value) && value.every((tag) => typeof tag === 'string' && tag.trim())
        ? []
        : [`${name} must be a list of words`];
    case 'link':
      return isSafeLink(value, { mailto: field.mailto })
        ? []
        : [`${name} must start with https://${field.mailto ? ' or mailto:' : ''}`];
    case 'image':
      return typeof value === 'string' && field.pattern.test(value) ? [] : [`${name} is not a valid picture path`];
    case 'select':
      return field.options.some((option) => option.value === value) ? [] : [`${name} has an unknown choice`];
    case 'fixed':
      return typeof value === 'string' && field.pattern.test(value) ? [] : [`${name} is not valid`];
    case 'list':
      return Array.isArray(value)
        ? value.flatMap((entry, i) => checkItem(field.of, entry, `${name} ${i + 1}`))
        : [`${name} must be a list`];
    default:
      return [`${name} has an unknown type`];
  }
}

function checkItem(kind, item, name) {
  if (!isPlainObject(item)) return [`${name} is not valid`];
  const schema = SCHEMAS[kind];
  const unknown = Object.keys(item).filter((key) => !Object.hasOwn(schema, key));
  if (unknown.length) return [`${name} has an unknown field: ${unknown[0]}`];
  return Object.entries(schema).flatMap(([key, field]) =>
    checkField(field, item[key], item, `${name}: ${field.label}`),
  );
}

function itemName(kind, item, index) {
  const title = isPlainObject(item) && typeof item.title === 'string' && item.title;
  return `${NAMES[kind]} ${title ? `"${title}"` : index + 1}`;
}

function checkList(kind, list, { uniqueTitles = false } = {}) {
  if (!Array.isArray(list)) return [`${NAMES[kind]} list is not valid`];
  const errors = list.flatMap((item, i) => checkItem(kind, item, itemName(kind, item, i)));
  if (uniqueTitles) {
    const seen = new Set();
    for (const item of list) {
      if (!isPlainObject(item)) continue;
      if (seen.has(item.title)) errors.push(`Two items are both titled "${item.title}". Titles must differ`);
      seen.add(item.title);
    }
  }
  return errors;
}

function checkSite(site) {
  if (!isPlainObject(site)) return ['Site content is not valid'];
  const allowed = ['banner', 'text', 'stats', 'facts', 'timeline', 'skillGroups', 'resume', 'contact'];
  const unknown = Object.keys(site).filter((key) => !allowed.includes(key));
  if (unknown.length) return [`Site content has an unknown section: ${unknown[0]}`];

  const errors = [];
  if (typeof site.banner !== 'string' || !ROOT_IMAGE.test(site.banner)) errors.push('Banner is not a valid picture path');

  if (!isPlainObject(site.text)) {
    errors.push('Page text is not valid');
  } else {
    for (const key of Object.keys(site.text)) {
      if (!TEXT_KEYS.includes(key)) errors.push(`Page text has an unknown key: ${key}`);
    }
    for (const key of TEXT_KEYS) {
      errors.push(...checkLocalized(site.text[key], true, `Page text ${key}`));
    }
  }

  errors.push(...checkList('stat', site.stats));
  errors.push(...checkList('fact', site.facts));
  errors.push(...checkList('timeline', site.timeline));
  errors.push(...checkList('skillGroup', site.skillGroups));
  errors.push(...checkList('resume', site.resume));
  errors.push(...checkList('contact', site.contact));
  return errors;
}

export function validateFile(name, data) {
  if (name === 'projects') return checkList('project', data, { uniqueTitles: true });
  if (name === 'certificates') return checkList('certificate', data, { uniqueTitles: true });
  if (name === 'site') return checkSite(data);
  return [`Unknown content file: ${name}`];
}
