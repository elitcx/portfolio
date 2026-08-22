// Post-build step: turn the single-page bundle into one real HTML document per
// route, and emit the sitemap.
//
// The app is a client-rendered SPA, so without this every URL would ship the
// same <title> and description and only "/" would exist as a file at all.
// Crawlers and link unfurlers read the served HTML before any script runs, so
// each route gets its own shell here: same JS bundle, different head. Route
// text comes from src/utils/Constants.js, which the app itself reads, so the
// two can't drift.
//
// Runs automatically after `npm run build`.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

// pathToFileURL, not a bare path: node's ESM loader rejects Windows drive
// letters given as plain paths.
const { PAGES, SITE_URL } = await import(
  pathToFileURL(path.join(root, 'src/utils/Constants.js')).href
);

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Rewrites one tag in place, matched on its identifying attribute rather than
// on surrounding text, since Vite reformats the head during the build.
function setTag(html, matcher, attr, value) {
  const re = new RegExp(`(<[^>]*${matcher}[^>]*\\b${attr}=")[^"]*(")`, 'i');
  if (!re.test(html)) throw new Error(`SEO build: no tag matching ${matcher} with ${attr}`);
  return html.replace(re, `$1${esc(value)}$2`);
}

function shellFor(html, page) {
  const url = SITE_URL + page.path;

  // SITE_URL is the single source of truth for the origin. index.html carries
  // absolute URLs in places no per-route rewrite touches — og:image,
  // twitter:image, and every @id in the JSON-LD graph — and those went stale
  // the moment the deployment moved from one vercel.app subdomain to another.
  // Normalising here means a domain change is one edit in Constants.js.
  // Only this project's own origin is rewritten; an external link to somebody
  // else's vercel.app site in the head would need excluding by hand.
  let out = html.replace(/https:\/\/[a-z0-9-]+\.vercel\.app/gi, SITE_URL);

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);
  out = setTag(out, 'name="description"', 'content', page.description);
  out = setTag(out, 'rel="canonical"', 'href', url);
  out = setTag(out, 'property="og:url"', 'content', url);
  out = setTag(out, 'property="og:title"', 'content', page.title);
  out = setTag(out, 'property="og:description"', 'content', page.description);
  out = setTag(out, 'name="twitter:title"', 'content', page.title);
  out = setTag(out, 'name="twitter:description"', 'content', page.description);
  return out;
}

const source = await fs.readFile(path.join(dist, 'index.html'), 'utf8');

for (const page of PAGES) {
  // "/" is the file the bundler already produced; the rest become directories
  // so Vercel can serve /projects with no rewrite rule and no 404 on refresh.
  const dir = page.path === '/' ? dist : path.join(dist, page.path.slice(1));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), shellFor(source, page), 'utf8');
  console.log(`  ${page.path.padEnd(10)} -> ${path.relative(dist, path.join(dir, 'index.html'))}`);
}

const today = new Date().toISOString().slice(0, 10);
const urls = PAGES.map(
  (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p.path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
).join('\n');

await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  'utf8',
);
console.log(`  sitemap.xml (${PAGES.length} urls)`);
