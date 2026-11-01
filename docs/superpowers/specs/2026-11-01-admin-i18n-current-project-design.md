# Admin dashboard, ID/EN translation, current-project highlight

Date: 2026-11-01
Status: approved by the owner on 2026-11-01

## Why

Adding a project or certificate today takes four manual steps: edit
`src/assets/projects.json` (or `src/utils/Constants.js` for certificates), copy
the picture in, run `npm run images`, then `git push`. A missed `npm run images`
gives a 404 in production. The owner wants to update the site from any device
without touching files or git.

Visitors include Indonesian and international readers, so the site should read
in both languages. Visitors should also see what the owner is working on now,
not only finished work.

## Goals

1. A password-protected `/admin` page, usable on phone and computer, that edits
   everything visible on the site and publishes it with one click.
2. A "Currently building" highlight at the top of the Projects page, controlled
   by a switch per project.
3. An `ID / EN` language switch for visitors, with AI-drafted translations in
   the dashboard that the owner reviews before saving.

## Non-goals

- Multiple users or roles. There is one editor.
- A database or external CMS. The git repo stays the source of truth.
- Separate `/id` URLs. Indonesian will not be indexed as its own pages.
- A translated CV. The PDF stays English.
- A draft or preview environment. Saving publishes.
- Undo inside the dashboard. Every save is a commit, so GitHub revert is the undo.

## Anti-goals

This is a failure even if it technically works:

- Any secret reaches the browser, a `VITE_` variable or the repo.
- The dashboard can change code, or anything outside the allowed content paths.
- Public visitors download admin code or get a slower site.
- The highlight turns into visual noise. `PRODUCT.md` requires the accent colour
  to stay rare and the design to stay restrained.
- A failed save loses what the owner typed.

## Decided by the owner

- The dashboard pushes to GitHub with a token, and the site deploys from that.
- `/admin` has a real password and proper security.
- It works on any device.
- Translation: type one language, get an AI draft of the other, review, save.
- Highlight placement: large card at the top of the Projects page, above the
  filters (option A). No strip on the home page.
- Dashboard layout as mocked up: section list, item list, edit form on a
  computer; tabs, then list, then form, with a sticky save button on a phone.

## Calls made by the designer

The owner has not specifically agreed to these. They are listed again at handover.

- Password is checked on a server, and the token lives in Vercel environment
  variables. This replaces the earlier idea of pasting a token into the browser.
- Translation uses Gemini, because the owner's Personal Dashboard already does.
- More than one project can be "currently building". Each gets a stacked card.
- The highlight stays visible during search and filtering.
- Everything visible is editable except the exclusions below.
- CV and banner picture are replaceable from the dashboard, because the git
  history shows both change.
- No shared rate limiting or two-factor login in this version.
- Not editable from the dashboard: SEO titles and descriptions (`PAGES`), JSON-LD
  in `index.html`, the `CATEGORIES` filter list, category colours, birth date,
  and contact icons. They stay in code and stay English. Their claims, such as
  "10+ shipped projects", do not follow edits to the stats.
- Contact links: existing rows can be edited and reordered. No adding new rows,
  because each needs an icon.
- Skills can be added, edited, reordered and removed. Icons are chosen from the
  existing set or left empty. No icon upload: SVG is banned, and the JPEG picture
  flow removes the transparency logos need.
- Computed values stay computed, and emphasis stays editable, using the text
  format below.
- The social share card stays manual. See "Things the owner will notice".
- Project titles, competition names and tech categories are not translated.

## Content model

Move all content out of `Constants.js`, `projects.json` and hard-coded component
text into JSON files under `src/content/`. Suggested split: `projects.json`,
`certificates.json`, `site.json` (stats, facts, timeline, skills, contact, CV,
banner, page text). Exact split is left to the builder.

A translatable field is `{ "en": "...", "id": "..." }`. Lookup falls back in both
directions: `field[lang] || field.en || field.id`. Saving requires at least one
language filled per field.

```json
{
  "title": "Personal Dashboard",
  "current": true,
  "period": { "en": "May – Jun 2026", "id": "Mei – Jun 2026" },
  "description": { "en": "...", "id": "..." },
  "link": "https://github.com/elitcx/dashboard",
  "deployed": "https://elitcx123.vercel.app",
  "categories": ["NextJS", "React"],
  "image": "/images/dashboard.webp"
}
```

Array order is display order, set with up and down buttons. `image` and `link`
are optional while `current` is true, and required otherwise.

### Editable text format

Some text today is JSX, not plain strings: the bio has `<strong>` runs and
`computeAge(BIRTH_DATE)` mid-sentence, the name heading has a `<br />`, and labels
such as `Show all N` contain counts. Step 1 must keep the page looking the same,
so editable text supports exactly three things:

- `**bold**`, rendered as the existing `<strong>` style.
- A line break in the text box, rendered as `<br />`.
- Tokens for computed values: `{age}` and `{years}`, plus `{count}` in labels that
  show a count.

Render these to React elements. Never use `dangerouslySetInnerHTML`. The server
rejects unknown tokens. The translate prompt must keep tokens and `**` unchanged,
and the form warns if a token is missing from either language. A short hint under
the text box explains the format, so it is usable on a phone.

`stats` keeps `{years}+`, so the "up to now" values rule in `Constants.js` still holds.

### Traps in the existing code

- `scripts/seo-build.mjs` imports `Constants.js` directly in Node. Keep `PAGES`
  and `SITE_URL` importable there. A plain JSON import inside `Constants.js`
  would break this script unless it uses import attributes.
- `getBadgeColor` runs regexes on the English result text (`1st`, `silver`). Run
  it on the English value, or store an explicit tier, or `Juara 1` loses its colour.
- `Portfoliopage.jsx` builds `INDEXED`, including the search text, once at module
  load. It must rebuild per language.
- The `CATEGORIES` filter compares by value. Translate the `All` label only.
- `scripts/generate-images.mjs` calls `path.basename(p.image)` for every project,
  which throws when `image` is missing. It also hard-codes `banner.webp`, and
  `Homepage.jsx` hard-codes `/images/banner.webp`.
- `skillGroups[].meta` ("5 languages") and the `shipped` label should be derived.
- `timeline[].color`, `skill.color` and contact `flip` are styling. Preserve them
  without showing them as raw CSS fields.

### Existing mismatch

`Hero.jsx` and `stats` say "10+ projects shipped". `projects.json` holds 9. This
is not fixed here. The owner can edit the numbers once they are in content.

## Current-project highlight

As in option A of `2026-11-01-mockups/highlight-placement.html`, on `/projects`,
between the `Projects` heading and the filter bar:

- One wide card per project with `current: true`, picture on the left and text on
  the right, stacked on phones. Without a picture, the text takes full width.
- A pulsing red dot with the label `Currently building` (`Sedang dikerjakan`). The
  pulse stops under `prefers-reduced-motion`.
- A thin red outline, using `--red`. No other new accent.
- These projects do not appear in the grid and do not count toward `N shipped`.
- Turning the switch off returns the project to the grid in its list position.

## Translation on the public site

- A small React context with `useLang()`. No i18n library.
- Toggle in `NavigationBar.jsx` next to `ThemeSlider`, with correct `aria` labels.
- First visit: `navigator.language` starting with `id` gives Indonesian, anything
  else English. The choice persists in `localStorage`, wrapped in try/catch like
  the existing `theme` key.
- Set `document.documentElement.lang` on change.
- Translate `aria-label`, `alt` and placeholders as well as visible text.
- Static HTML shells and `<title>` stay English.

The first Indonesian version of all existing content is written during the build,
for the owner to check. Certificate titles stay as read off the certificates.

## Backend

Vercel functions in `api/`, Node with no new dependencies where the stdlib covers
it (`node:crypto`, `fetch`).

Environment variables, Production scope only, so preview deployments hold no secrets:

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | Fine-grained token: `elitcx/portfolio` only, Contents read/write, Commit statuses read, with an expiry date |
| `ADMIN_PASSWORD_HASH` | scrypt salt and hash, produced by a local script such as `npm run admin:hash` |
| `SESSION_SECRET` | Long random value |
| `GEMINI_API_KEY` | Key for draft translation |

The owner creates and enters these. They never go in chat or the repo.

### Endpoints

Exact shape is left to the builder. Required behaviour:

- **Login:** verify with scrypt and `timingSafeEqual`, return one generic error,
  delay failed attempts. Set a signed cookie with an expiry 12 hours out:
  `HttpOnly; Secure; SameSite=Strict; Path=/`. Rotating `SESSION_SECRET` logs out
  everywhere.
- **Logout:** clear the cookie.
- **Read content:** load the current files from GitHub, not the bundle, so the
  form never starts from a stale deploy. Return the commit SHA.
- **Save:** take changed content and pictures plus the base SHA, and write one
  commit through the Git Data API (blobs, tree, commit, non-forced ref update).
  If the content changed since the base SHA, return a conflict and let the owner
  reload, keeping their typed text on screen.
- **Translate:** text plus target language in, draft out. Keep proper nouns and
  tech terms. Failure is non-fatal, and the owner can type instead.
- **Status (optional):** poll the commit status so the header can say building or
  live. At minimum show "Published, live in about a minute".

### Security rules, enforced on the server

- Every endpoint except login needs a valid session.
- Every state-changing request checks `Origin` against `SITE_URL`.
- Path allowlist, fixed in server code and never taken from the client: files in
  `src/content/`, pictures under `public/images/`, and the CV PDF path.
- Validate content against the expected shape before committing, so a save cannot
  break the build. Unknown fields are rejected.
- Links must be `http:` or `https:`. Contact links may also use `mailto:`.
- Pictures: JPEG, PNG or WebP only, checked by magic bytes. No SVG. CV: PDF only,
  checked by magic bytes.
- Size limits below Vercel's 4.5 MB request cap, accounting for base64 growth.
- `Cache-Control: no-store` on all `api/` responses.
- `/admin` gets `X-Frame-Options: DENY` and a strict `Content-Security-Policy` in
  `vercel.json`.

Known ceiling: failed-login delay is per function instance, so it does not stop a
distributed attack. The defence is a long random password. Mark this with a
`ponytail:` comment, and add shared rate limiting if logs show attacks.

## Dashboard

- Layout as in `2026-11-01-mockups/admin-layout.html`.
- Separate Vite entry at `admin/index.html`, so the code is a separate bundle and
  public pages never load it. Add it to `rollupOptions.input`.
- `<meta name="robots" content="noindex,nofollow">`. Not in `PAGES` or the sitemap.
  No analytics on it. Not listed in `robots.txt`, which is public and would
  advertise the path, and which would stop crawlers reading the `noindex`.
- Sections: Projects, Certificates, About & stats, Timeline, Skills, Contact, Page
  text, CV & banner.
- Inputs use native form elements. Every translatable field shows EN and ID boxes,
  with a draft button on whichever is empty.
- Pictures are shrunk and converted to JPEG in the browser with `<canvas>`, to a
  long edge of about 2400 px. JPEG because Safari cannot encode WebP from canvas.
- Unsaved changes trigger a `beforeunload` warning. A failed save keeps the form
  contents and shows the error.
- Delete asks for confirmation.
- Works at phone width, follows the existing design tokens, respects light and dark.

## Pictures and deployment

- `npm run build` runs image generation first, so the manual step disappears.
- Uploaded pictures get a new filename each time (slug plus short hash). `vercel.json`
  caches `/images/*` for 30 days, so reusing a filename would show the old picture.
- Regeneration may skip a derivative that already exists, which unique filenames
  make safe. Existing committed derivatives stay.
- A failed Vercel build leaves the previous deployment live.

Verify on the first real deploy: `sharp` installs on Vercel's Linux builders from
the lockfile generated on Windows, and build time stays reasonable.

## Order of work

Each step leaves the site working.

1. Move content to `src/content/`. No visible change.
2. Language switch and Indonesian text.
3. Current-project highlight.
4. Backend with security rules.
5. Dashboard UI.
6. Build-time images and upload flow.

## Checking

- One small script of assertions for the risky logic: session sign and verify, path
  allowlist, content validation, link validation, magic-byte checks, language fallback.
- Run `npm run lint` and `npm run build`, then click through both languages and themes.
- End to end with `vercel dev` and a throwaway branch or test repo before touching
  `main`, because the Vite dev server does not serve `api/`.
- Security review of `api/` before the first production login.

## Left to the builder

File layout and API shape, form component structure, commit message wording, card
styling within the rules above, Gemini model choice, and how status polling works.

## Things the owner will notice

- After a dashboard save, the local clone is behind GitHub. Run `git pull` before
  editing locally.
- Each save makes one commit and one deployment.
- The token expires. When it does, saves fail until a new one is set in Vercel.
- Replacing the banner does not update `public/images/og-card.jpg`, the preview
  shown when the site is shared on LinkedIn or WhatsApp. Run `npm run og` on a
  computer and push to update it. Automating this is not worth it yet:
  `scripts/generate-og.mjs` uses a Windows font, a fixed filename under the 30-day
  image cache, and baked-in "10+" text.
