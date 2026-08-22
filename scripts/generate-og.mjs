// Builds the 1200x630 social share card from the square portrait.
//
// Every platform that unfurls a link (LinkedIn, WhatsApp, X, Discord, Slack)
// wants 1.91:1. Feeding them the 1:1 portrait meant each one center-cropped it
// differently and several cut the head off, so the card is composed once here
// and committed as a static asset: portrait bled off the right edge, name and
// credentials set on the site's own dark background at the left.
//
// Run with `npm run og`. Sources stay untouched so it can always be redone.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'public/images/banner.webp');
const OUT = path.join(root, 'public/images/og-card.jpg');

const W = 1200;
const H = 630;
const PHOTO_W = 470;

const BG = '#0C0B0B';
const FG = '#F5F4F2';
const RED = '#E0413A';
const DIM = '#8A8580';

// Escapes text for XML — an unescaped & in a label would break the whole overlay.
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos' }[c]};`);

const DISPLAY = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const lines = [
  { text: 'KENNETH JEHEZKIEL', y: 250, size: 62, weight: 800, fill: FG, spacing: '-0.5' },
  { text: 'MARVEL WIJAYA',     y: 322, size: 62, weight: 800, fill: FG, spacing: '-0.5' },
];

const credits = [
  '1st Place  ·  OSN-K Informatika 2026',
  '10+ national placements  ·  10+ shipped projects',
];

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="72" y="150" width="52" height="5" fill="${RED}"/>
  <text x="72" y="196" font-family="${DISPLAY}" font-size="19" font-weight="700"
        letter-spacing="4.5" fill="${RED}">COMPETITIVE PROGRAMMER</text>
  ${lines
    .map(
      (l) =>
        `<text x="72" y="${l.y}" font-family="${DISPLAY}" font-size="${l.size}" font-weight="${l.weight}" letter-spacing="${l.spacing}" fill="${l.fill}">${esc(l.text)}</text>`,
    )
    .join('\n  ')}
  ${credits
    .map(
      (c, i) =>
        `<text x="72" y="${400 + i * 38}" font-family="${DISPLAY}" font-size="25" font-weight="500" fill="${DIM}">${esc(c)}</text>`,
    )
    .join('\n  ')}
  <text x="72" y="540" font-family="${DISPLAY}" font-size="22" font-weight="600"
        letter-spacing="1.5" fill="${FG}">kennethjmw.vercel.app</text>
</svg>`);

// A hard edge between photo and background reads as a paste-up, so the portrait
// fades into the panel across ~110px of its left edge.
const fadeMask = Buffer.from(`
<svg width="${PHOTO_W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#000"/>
      <stop offset="0.24" stop-color="#fff"/>
    </linearGradient>
  </defs>
  <rect width="${PHOTO_W}" height="${H}" fill="url(#f)"/>
</svg>`);

const photo = await sharp(SRC)
  .resize(PHOTO_W, H, { fit: 'cover', position: 'top' })
  .composite([{ input: fadeMask, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(overlay)
  .composite([{ input: photo, left: W - PHOTO_W, top: 0 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

const { width, height, size } = await sharp(OUT).metadata();
console.log(`og-card.jpg  ${width}x${height}  ${(size / 1024).toFixed(0)} KB`);
