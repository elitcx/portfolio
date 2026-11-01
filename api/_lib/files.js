import { createHash } from 'node:crypto';

// Decoded size. Base64 grows it by a third, which stays under Vercel's 4.5 MB
// request cap.
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

export const CONTENT_PATHS = {
  projects: 'src/content/projects.json',
  certificates: 'src/content/certificates.json',
  site: 'src/content/site.json',
};

const CV_PATH = 'public/Kenneth-Jehezkiel-MW-CV.pdf';

const PICTURE_TYPES = ['jpeg', 'png', 'webp'];
const EXTENSIONS = { jpeg: 'jpg', png: 'png', webp: 'webp' };

// The derivative folders (thumb, full, icon) are deliberately not listed:
// only the build writes those.
const PICTURE_PATH = /^public\/images\/(certificates\/)?[a-z0-9-]+\.(jpg|png|webp)$/;

const startsWith = (buffer, bytes, at = 0) =>
  buffer.length >= at + bytes.length && bytes.every((byte, i) => buffer[at + i] === byte);

const ascii = (text) => [...Buffer.from(text, 'latin1')];

export function sniffType(buffer) {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(buffer, ascii('RIFF')) && startsWith(buffer, ascii('WEBP'), 8)) return 'webp';
  if (startsWith(buffer, ascii('%PDF-'))) return 'pdf';
  return null;
}

export function slugify(name) {
  const slug = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return slug || 'image';
}

// A new picture always gets a new filename: /images/* is cached for 30 days, so
// reusing a name would keep serving the old picture.
function picturePath(folder, name, buffer, type) {
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 8);
  return `public/images/${folder}${slugify(name)}-${hash}.${EXTENSIONS[type]}`;
}

export function uploadPath(kind, name, buffer) {
  if (buffer.length > MAX_UPLOAD_BYTES) return { error: 'That file is larger than 3 MB' };
  const type = sniffType(buffer);

  if (kind === 'cv') {
    return type === 'pdf' ? { path: CV_PATH } : { error: 'The CV must be a PDF' };
  }
  if (kind !== 'project' && kind !== 'certificate' && kind !== 'banner') {
    return { error: 'Unknown upload type' };
  }
  if (!PICTURE_TYPES.includes(type)) return { error: 'Pictures must be JPEG, PNG or WebP' };

  if (kind === 'certificate') return { path: picturePath('certificates/', name, buffer, type) };
  if (kind === 'banner') return { path: picturePath('', 'banner', buffer, type) };
  return { path: picturePath('', name, buffer, type) };
}

export function pathAllowed(path) {
  if (typeof path !== 'string') return false;
  return Object.values(CONTENT_PATHS).includes(path) || path === CV_PATH || PICTURE_PATH.test(path);
}
