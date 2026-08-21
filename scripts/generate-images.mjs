/**
 * Generates display-sized derivatives of everything in public/images.
 *
 * The source files are camera/screenshot originals — several certificates are
 * 3500x2480 and one is 6250x4419. Handing those to a 280px card means the
 * browser decodes ~35-110 MB of bitmap per image and rescales it on every
 * paint, which is what makes the image-heavy sections stutter.
 *
 * Card variants are pre-cropped to the exact aspect ratio the CSS uses, so the
 * browser does no scaling work at all. Zoom variants stay uncropped.
 *
 * Run with: npm run images
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public', 'images');

// Derivative kinds, keyed by the output directory under public/images/.
const CARD_QUALITY = 76;
const FULL_QUALITY = 80;

// Certificate cards render 4:3 at up to ~380px wide; 760px covers 2x DPR.
const CERT_CARD = { width: 760, height: 570, fit: 'cover', position: 'centre' };
// Project cards render 16:10 with object-position:top at up to ~400px wide.
const PROJECT_CARD = { width: 800, height: 500, fit: 'cover', position: 'top' };
// The About photo renders 1:1 in a 440px box.
const BANNER = { width: 900, height: 900, fit: 'cover', position: 'centre' };
// Skill (22px) and contact (26px) icons — 64px covers 2x DPR.
const ICON = { width: 64, height: 64, fit: 'inside', withoutEnlargement: true };
// Zoom overlay is contain-fit against the viewport; 1800px is plenty at 2x.
const FULL = { width: 1800, withoutEnlargement: true };

// Read from the same source the app renders, so adding a project can never
// silently skip its derivatives (which would 404 in production).
const projects = JSON.parse(
  await fs.readFile(path.join(ROOT, 'src', 'assets', 'projects.json'), 'utf8')
);
const PROJECT_IMAGES = projects.map((p) => path.basename(p.image));

const ICON_IMAGES = [
  'c.webp', 'python.webp', 'javascript.webp', 'ReactJS.webp', 'sql.webp',
  'instagram.webp', 'whatsapp.webp',
];

/** Every derivative is webp and mirrors the source path minus its extension. */
function outPath(kind, relative) {
  const parsed = path.parse(relative);
  return path.join(SRC, kind, parsed.dir, `${parsed.name}.webp`);
}

async function emit(kind, relative, resize, quality) {
  const from = path.join(SRC, relative);
  const to = outPath(kind, relative);
  await fs.mkdir(path.dirname(to), { recursive: true });

  const info = await sharp(from)
    .rotate()
    .resize(resize)
    .webp({ quality, effort: 5 })
    .toFile(to);

  const before = (await fs.stat(from)).size;
  return { to: path.relative(SRC, to), before, after: info.size, w: info.width, h: info.height };
}

async function main() {
  const jobs = [];

  const certs = await fs.readdir(path.join(SRC, 'certificates'));
  for (const name of certs) {
    if (!/\.(webp|png|jpe?g)$/i.test(name)) continue;
    const rel = path.join('certificates', name);
    jobs.push(['thumb', rel, CERT_CARD, CARD_QUALITY]);
    jobs.push(['full', rel, FULL, FULL_QUALITY]);
  }

  for (const name of PROJECT_IMAGES) {
    jobs.push(['thumb', name, PROJECT_CARD, CARD_QUALITY]);
    jobs.push(['full', name, FULL, FULL_QUALITY]);
  }

  jobs.push(['thumb', 'banner.webp', BANNER, 82]);

  for (const name of ICON_IMAGES) {
    jobs.push(['icon', name, ICON, 88]);
  }

  let before = 0;
  let after = 0;
  for (const [kind, rel, resize, quality] of jobs) {
    const r = await emit(kind, rel, resize, quality);
    if (kind !== 'full') { before += r.before; after += r.after; }
    console.log(
      `${r.to.padEnd(42)} ${String(r.w).padStart(5)}x${String(r.h).padEnd(5)} ` +
      `${String(Math.round(r.before / 1024)).padStart(5)}K -> ${String(Math.round(r.after / 1024)).padStart(5)}K`
    );
  }

  console.log(
    `\nDisplayed variants: ${Math.round(before / 1024)}K -> ${Math.round(after / 1024)}K ` +
    `(${Math.round((1 - after / before) * 100)}% smaller)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
