# Admin Dashboard, ID/EN Translation and Current-Project Highlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the owner edit and publish all site content from a password-protected `/admin` page on any device, show projects in progress at the top of Projects, and serve the site in Indonesian and English.

**Architecture:** Content moves to JSON in `src/content/`, and `{ en, id }` fields are resolved through a small language context. Vercel functions in `api/` check the password, hold the secrets, validate content against one shared schema, and commit to GitHub through the Git Data API. `/admin` is a separate Vite entry, so public pages never load its code.

**Tech Stack:** React 19, Vite (rolldown), Vercel functions (Node, `node:crypto`, `fetch`), `node:test`, `sharp`, Gemini REST API. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-01-admin-i18n-current-project-design.md`. Read it first. Mockups: `docs/superpowers/specs/2026-11-01-mockups/`.

## Global Constraints

- All work on branch `feat/admin-i18n`. Never push or merge without the owner's confirmation: pushing `main` deploys production.
- Stage files by explicit path. `brag-output/` and `brag-trailer/` are untracked and stay out of commits.
- End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- No secret in the browser, a `VITE_` variable, the repo, or chat.
- Public pages must not import anything from `src/admin/`.
- Match the code style: inline style objects, CSS variables from `src/index.css`, `kj-` classes in `src/App.css`, single quotes, 2 spaces.
- Accent colour stays rare (`PRODUCT.md`). Only the highlight card and primary admin actions gain `--red`.
- Tests run with `npm test` (`node --test tests/`). Test pure logic only, with no framework.

## Review Focus

1. **Phone photo:** a rotated, HEIC or huge picture must end up upright and under the limit, or show a clear error with the form intact. Pinned in Task 10 (`fitSize`, `encodeUnderLimit`).
2. **Session expires mid-edit:** a phone left open for 12 hours gets a 401 on save, must log in again, and keeps everything typed. Pinned in Task 9 (`apiRequest` raises `AuthExpired`).
3. **Malformed text:** `**` without a closing pair or a stray `{` in content must render literally, never crash the public page. Pinned in Task 1.
4. **Duplicates and awkward names:** duplicate titles break React keys, and a title with no Latin letters gives an empty filename. Pinned in Task 6 and Task 7 (`slugify`).
5. **Empty states:** every project ongoing leaves an empty grid, which must not say "No projects match". Blocked `localStorage` must not break language detection. Pinned in Task 3 and Task 4.

---

### Task 1: Text helpers

**Files:**
- Create: `src/lib/localize.js`, `src/lib/richText.js`, `tests/text.test.js`
- Modify: `package.json` (add `"test": "node --test tests/"`)

**Interfaces:**
- Produces: `localize(field, lang) -> string`; `parseRichText(str, vars = {}) -> Array<{ type: 'text' | 'bold', value: string } | { type: 'br' }>`; `plainText(str, vars = {}) -> string`; `findTokens(str) -> string[]`; `ALLOWED_TOKENS = ['age', 'years', 'count']`.

- [ ] **Step 1: Write the failing tests in `tests/text.test.js`**

```js
assert.equal(localize({ en: 'A', id: 'B' }, 'id'), 'B');
assert.equal(localize({ en: 'A', id: '' }, 'id'), 'A');
assert.equal(localize({ en: '', id: 'B' }, 'en'), 'B');
assert.equal(localize('plain', 'id'), 'plain');
assert.equal(localize(undefined, 'id'), '');

assert.deepEqual(parseRichText('a **b** c'), [
  { type: 'text', value: 'a ' }, { type: 'bold', value: 'b' }, { type: 'text', value: ' c' },
]);
assert.deepEqual(parseRichText('x\ny'), [
  { type: 'text', value: 'x' }, { type: 'br' }, { type: 'text', value: 'y' },
]);
assert.deepEqual(parseRichText('{age} old', { age: 17 }), [{ type: 'text', value: '17 old' }]);
// Malformed input renders literally
assert.deepEqual(parseRichText('a ** b'), [{ type: 'text', value: 'a ** b' }]);
assert.deepEqual(parseRichText('{nope} {'), [{ type: 'text', value: '{nope} {' }]);
assert.deepEqual(parseRichText(''), []);

assert.equal(plainText('Show **all** {count}', { count: 3 }), 'Show all 3');
assert.deepEqual(findTokens('{age} and {years} {'), ['age', 'years']);
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL, modules not found.
- [ ] **Step 3: Implement both modules.** Substitute vars first, then split on line breaks, then pair `**` within each line. An unpaired `**` stays literal.
- [ ] **Step 4: Run `npm test`.** Expected: PASS.
- [ ] **Step 5: Commit** the spec, mockups, plan and these files: `feat: add localize and rich text helpers`.

### Task 2: Move content to JSON, no visible change

**Files:**
- Create: `src/content/certificates.json`, `src/content/site.json`, `src/content/index.js`, `src/content/textKeys.js`, `src/i18n/lang.js`, `src/i18n/LangProvider.jsx`, `src/components/RichText.jsx`, `tests/content.test.js`
- Move: `src/assets/projects.json` to `src/content/projects.json`
- Modify: `src/utils/Constants.js`, `src/main.jsx`, `src/App.jsx`, `src/components/{Hero,Homepage,Portfoliopage,Contactpage,Footer,NavigationBar,ThemeSlider,Imagezoom}.jsx`, `scripts/generate-images.mjs:40`

**Interfaces:**
- Consumes: Task 1 helpers.
- Produces:
  - `useLang() -> { lang, setLang, l(field) -> string, s(key) -> string }` from `src/i18n/lang.js`. `s` returns the raw string with tokens; callers pass it through `plainText` or `<RichText>`. In this task `lang` is always `'en'`.
  - `<RichText value={string} vars={object} />` renders `parseRichText` to elements. `bold` uses the existing `<strong style={{ color: 'var(--fg)', fontWeight: 600 }}>`. It merges `age: computeAge(BIRTH_DATE)` and `years: yearsCoding()` into `vars`.
  - `export { projects, certificates, site }` from `src/content/index.js`.
  - `TEXT_KEYS: string[]` from `src/content/textKeys.js`.

Content shapes, where `L` is `{ en, id }`:

```
projects[]:     title, current?: bool, period: L, description: L, link?, deployed?, categories: string[], image?
certificates[]: image, title, result: L, tier: 'gold' | 'silver' | 'bronze' | 'other'
site.banner:    '/images/banner.webp'
site.text:      { [TEXT_KEY]: L }
site.stats[]:   value: L, label: L
site.facts[]:   label: L, value: L
site.timeline[]: year, color, text: L
site.skillGroups[]: group: L, meta: L, items[]: lang, icon?, pct, level: L, detail: L, color
site.contact[]: icon, label, handle, href, flip
```

`TEXT_KEYS`, with the current English copied exactly from the components:

```
app.skip
nav.home nav.projects nav.contact nav.label nav.theme nav.language
hero.name hero.portfolio hero.location hero.role hero.srHeading hero.cred1Value hero.cred1Label
hero.cred2Value hero.cred2Label hero.scroll hero.scrollAria
about.label about.heading about.bio1 about.bio2 about.drivesLabel about.drives about.photoAlt
about.photoPlace about.photoYear about.factsTitle about.factsMeta about.numbersTitle about.timelineTitle
skills.label skills.heading
certs.label certs.meta certs.heading certs.showAll certs.showFewer
cv.label cv.meta
projects.eyebrow projects.heading projects.shipped projects.current projects.search projects.searchAria
projects.filterAll projects.solo projects.repo projects.live projects.viewShot projects.emptyTitle projects.emptyBody
contact.eyebrow contact.location contact.heading contact.body
footer.name footer.tagline
zoom.label zoom.close
```

Exact conversions:
- `about.heading`: `Hi, I'm Kenneth\nJehezkiel M.W.`
- `about.bio1`: `I'm a **{age}-year-old student at SMA Regina Pacis Surakarta**, passionate about **Software Engineering and Development**. I love turning ideas into real, working applications and exploring how code can solve everyday problems.`
- `about.bio2`: `Whether crafting clean frontends or tackling competitive programming, **I'm always eager to learn, build, and grow.**`
- `certs.meta`: `{count} credentials`. `certs.showAll`: `Show all {count}`. `projects.shipped`: `{count} shipped`. `zoom.label`: `Zoomed view`, with `: ${alt}` appended in JSX. `projects.viewShot`: `View screenshot`, with `: ${title}` appended in JSX.
- `site.stats` years row: value `{years}+`. `skillGroups[0].meta`: `{count} languages`. `skillGroups[1].meta`: `{count} tools`.
- Tier mapping: `1st` or `gold` to `gold`; `2nd` or `silver` to `silver`; `3rd` to `bronze`; everything else to `other`.
- The year stays in JSX, not in text: `{s('hero.portfolio')} · {currentYear()}`, `{s('footer.tagline')} · © {currentYear()}`, and the `CODING_SINCE — currentYear()` metas.

`Constants.js` keeps `computeAge`, `BIRTH_DATE`, `CATEGORY_COLORS`, `getCategoryColor`, image variants, `CODING_SINCE`, `TIMELINE_START`, `currentYear`, `yearsCoding`, `CERT_PREVIEW_COUNT`, `CATEGORIES`, `SITE_URL`, `PAGES`, `HOME`, `pageFromPath`, `pageById`, and `CV` reduced to `{ href, filename }`. It must import no JSON, because `scripts/seo-build.mjs` imports it in plain Node. `getBadgeColor(description)` becomes `getBadgeColor(tier)`, returning the same colours.

Use array index as the React `key` for facts, stats, timeline, skill groups, skills and contact. Project and certificate titles remain keys, since Task 6 enforces uniqueness.

- [ ] **Step 1: Write failing tests in `tests/content.test.js`.** Read the JSON with `fs`. Assert `Object.keys(site.text).sort()` deep-equals `[...TEXT_KEYS].sort()`, every `site.text` entry has non-empty `en`, `projects.length === 9`, `certificates.length === 20`, and certificates[0] has `tier: 'gold'`.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Before changing components, save a baseline.** Run `npm run build`, then `npx vite preview`, and take full-page screenshots of `/`, `/projects` and `/contact` in dark mode at 1280 px wide.
- [ ] **Step 4: Create the content files and `LangProvider`** (fixed to `'en'`, wrapped around `<App />` in `src/main.jsx`). Update the path in `generate-images.mjs`.
- [ ] **Step 5: Rewire all components** to read content and `s()`. Pass `meta`, labels and `aria-label`s through `plainText`.
- [ ] **Step 6: Verify.** `npm test` passes. `npm run lint` shows no new errors. `npm run build` succeeds. New screenshots of the 3 routes match the baseline, with the bio emphasis, the heading line break and `Show all 20` intact. `grep -c "Show all" dist/assets/*.js` finds the string in only the main bundle.
- [ ] **Step 7: Commit:** `refactor: move site content to src/content`.

### Task 3: Language switch and Indonesian text

**Files:**
- Modify: `src/i18n/lang.js`, `src/i18n/LangProvider.jsx`, `src/components/NavigationBar.jsx`, `src/components/Portfoliopage.jsx`, all `src/content/*.json`
- Create: `src/components/LangToggle.jsx`, `src/lib/projects.js`, `tests/lang.test.js`

**Interfaces:**
- Produces: `detectLang({ stored, navigatorLanguage }) -> 'en' | 'id'`, `readStoredLang() -> string | null` (never throws), `indexProjects(projects, lang) -> Array<project & { thumb, full, haystack, tags, resolved L fields as strings }>`.

- [ ] **Step 1: Write failing tests**

```js
assert.equal(detectLang({ stored: 'id', navigatorLanguage: 'en-US' }), 'id');
assert.equal(detectLang({ stored: 'en', navigatorLanguage: 'id-ID' }), 'en');
assert.equal(detectLang({ stored: null, navigatorLanguage: 'id-ID' }), 'id');
assert.equal(detectLang({ stored: null, navigatorLanguage: 'de' }), 'en');
assert.equal(detectLang({ stored: 'xx', navigatorLanguage: undefined }), 'en');

const [p] = indexProjects([{ title: 'T', period: { en: 'May', id: 'Mei' },
  description: { en: 'hello', id: 'halo' }, categories: ['React'], image: '/images/a.webp' }], 'id');
assert.equal(p.description, 'halo');
assert.ok(p.haystack.includes('halo') && p.haystack.includes('react'));
assert.equal(p.thumb, '/images/thumb/a.webp');
assert.equal(indexProjects([{ title: 'T', period: { en: 'x' }, description: { en: 'x' }, categories: [] }], 'en')[0].thumb, null);
```

Also test `readStoredLang` with a `globalThis.localStorage` whose `getItem` throws: it returns `null`.

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement detection and persistence.** Key is `lang`, with try/catch writes like `theme` in `App.jsx`. The provider sets `document.documentElement.lang` in an effect.
- [ ] **Step 4: Add `LangToggle`** beside `ThemeSlider`: an `ID / EN` text button pair, active in `--fg`, inactive in `--dim`, `aria-pressed` per button, group `aria-label` from `nav.language`.
- [ ] **Step 5: Replace `INDEXED` in `Portfoliopage.jsx`** with `useMemo(() => indexProjects(projects, lang), [lang])`, and include it in the `shown` dependencies.
- [ ] **Step 6: Write all `id` values.** Keep project titles, certificate titles, tech terms and `Solo` the city. Use natural, direct Indonesian, not literal translation. Certificate results:

| en | id |
|---|---|
| 1st Place | Juara 1 |
| 2nd Place | Juara 2 |
| 3rd Place | Juara 3 |
| Finalist | Finalis |
| Semifinalist | Semifinalis |
| Participant | Peserta |
| Silver Medalist | Peraih Medali Perak |
| Top 10 | 10 Besar |
| Attended | Mengikuti |
| Mentor | Mentor |
| Volunteer | Relawan |
| Member | Anggota |

Months use Indonesian forms: `Mei`, `Agu`, `Okt`, `Des`.

- [ ] **Step 7: Add a test** that every `site.text` entry, project description and certificate result has a non-empty `id`, and that `findTokens` matches between `en` and `id`.
- [ ] **Step 8: Verify.** `npm test`, lint and build pass. In the browser: toggling changes all visible text with no reload; search finds `halo`-style Indonesian words in `id` mode; the choice survives a reload; `document.documentElement.lang` changes; the nav fits at 360 px wide with no horizontal scroll; the bronze and gold badges keep their colours in `id`.
- [ ] **Step 9: Commit:** `feat: add ID/EN language switch and Indonesian text`.

### Task 4: Current-project highlight

**Files:**
- Modify: `src/lib/projects.js`, `src/components/Portfoliopage.jsx`, `src/App.css`, `scripts/generate-images.mjs:42`, `tests/lang.test.js`

**Interfaces:**
- Produces: `splitProjects(indexed) -> { current: [], shipped: [] }`, preserving order.

- [ ] **Step 1: Write failing tests:** `splitProjects` separates by `current === true` and preserves order; a missing `current` counts as shipped; an all-current list gives `shipped: []`.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement** `splitProjects`. In `generate-images.mjs`, use `projects.filter((p) => p.image)` so a project without a picture cannot throw.
- [ ] **Step 4: Add `CurrentProjectCard`** in `Portfoliopage.jsx`, per option A of the mockup and the spec's highlight section. Render it between the `h1` and the filter bar. It ignores search and filter. `projects.shipped` receives `{ count: shipped.length }`, and the grid numbers count only `shipped`. Without an image, the text takes full width. Without a link, the button is absent.
- [ ] **Step 5: Add `.kj-now-dot`** to `App.css`, with the pulse from the mockup, and stop it inside the existing reduced-motion block.
- [ ] **Step 6: Handle the empty grid.** Show the "Nothing here" block only when a search or filter is active. With no filter and `shipped` empty, show no grid and no message.
- [ ] **Step 7: Verify.** Temporarily set `current: true` on Personal Dashboard, then on all projects, and remove `image` from one. In both themes and at 360 px: the card appears, stays during filtering, leaves the grid, and the count is right. Run `npm run images`, which succeeds with the missing image. Revert the temporary edits.
- [ ] **Step 8: Commit:** `feat: highlight projects in progress on Projects page`.

### Task 5: Login, sessions and request guards

**Files:**
- Create: `api/_lib/session.js`, `api/_lib/password.js`, `api/_lib/guard.js`, `api/login.js`, `api/logout.js`, `scripts/hash-password.mjs`, `.env.example`, `tests/auth.test.js`
- Modify: `package.json` (add `"admin:hash": "node scripts/hash-password.mjs"`), `eslint.config.js` (a block with `globals.node` for `api/**`, `tests/**`)

Files under `api/_lib/` are not exposed as routes, because Vercel skips paths starting with `_`.

**Interfaces:**
- Produces:
  - `SESSION_TTL_MS = 43200000`; `signSession(secret, now = Date.now()) -> string`; `verifySession(token, secret, now = Date.now()) -> boolean`.
  - `hashPassword(password) -> Promise<'saltHex:hashHex'>`; `verifyPassword(password, stored) -> Promise<boolean>`.
  - `originAllowed(origin, vercelEnv) -> boolean`; `readCookie(header, name) -> string | null`; `failureDelay(count) -> ms`.
  - `guard(req, res, { method }) -> boolean`: sets `Cache-Control: no-store`, checks the method, checks `Origin` for non-GET requests, checks the session, writes the error response and returns `false` on failure.
  - Cookie `admin_session`: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`.
  - `POST /api/login { password } -> 204 | 401 { error: 'Wrong password' }`. `POST /api/logout -> 204`.

- [ ] **Step 1: Write failing tests**

```js
const t = signSession('s', 1000);
assert.equal(verifySession(t, 's', 2000), true);
assert.equal(verifySession(t, 'other', 2000), false);
assert.equal(verifySession(t, 's', 1000 + SESSION_TTL_MS + 1), false);
assert.equal(verifySession(t.slice(0, -1) + 'x', 's', 2000), false);
assert.equal(verifySession('garbage', 's', 2000), false);
assert.equal(verifySession(undefined, 's', 2000), false);

const h = await hashPassword('correct horse');
assert.equal(await verifyPassword('correct horse', h), true);
assert.equal(await verifyPassword('wrong', h), false);
assert.equal(await verifyPassword('x', 'malformed'), false);

assert.equal(originAllowed('https://kennethjmw.vercel.app', 'production'), true);
assert.equal(originAllowed('http://localhost:3000', 'production'), false);
assert.equal(originAllowed('http://localhost:3000', 'development'), true);
assert.equal(originAllowed('https://evil.example', 'preview'), false);
assert.equal(originAllowed(undefined, 'production'), false);

assert.equal(readCookie('a=1; admin_session=abc', 'admin_session'), 'abc');
assert.equal(failureDelay(0), 500);
assert.equal(failureDelay(20), 5000);
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement.** Token is `<expiryMs>.<base64url HMAC-SHA256>`, compared with `timingSafeEqual` after a length check. scrypt uses a 16-byte salt and 64-byte key. `failureDelay` is `min(500 * 2 ** count, 5000)`. Login keeps a failure count in module scope, marked: `// ponytail: per-instance only, add shared rate limiting if logs show attacks`. If an env var is missing, login returns 500 with a generic error and never treats the check as passed. `login` and `logout` also set `Cache-Control: no-store` and check `Origin`, since they cannot use the session part of `guard`.
- [ ] **Step 4: Write `scripts/hash-password.mjs`.** It reads the password from stdin, not argv, so it stays out of shell history. It refuses fewer than 16 characters and prints the hash.
- [ ] **Step 5: Write `.env.example`** with empty `GITHUB_TOKEN`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `GEMINI_API_KEY`, `GITHUB_BRANCH`. Confirm `git check-ignore .env.local` matches.
- [ ] **Step 6: Run `npm test` and `npm run lint`.** Expected: PASS.
- [ ] **Step 7: Commit:** `feat: add admin login and session guards`.

### Task 6: Content schema and validation

**Files:**
- Create: `src/lib/contentSchema.js`, `tests/schema.test.js`

The admin form renders from this same schema (Task 10), so the form and server cannot disagree.

**Interfaces:**
- Consumes: `TEXT_KEYS`, `ALLOWED_TOKENS`, `findTokens`.
- Produces: `SCHEMAS` (field definitions per content type); `validateFile(name: 'projects' | 'certificates' | 'site', data) -> string[]` (empty means valid); `isSafeLink(url, { mailto = false } = {}) -> boolean`; `IMAGE_PATH`.

Field types: `text`, `loc`, `locLong`, `bool`, `number`, `tags`, `link`, `image`, `select`. Each field has `label`, optional `required`, and optional `options: [{ value, label }]`. Items reject unknown fields.

Select options, shown with friendly labels so no raw CSS appears:
- Certificate `tier`: `gold`, `silver`, `bronze`, `other`.
- Timeline `color`: `var(--faint)`, `var(--dim)`, `var(--mut)`, `var(--red-l)`.
- Skill `color`: `var(--red)`, `#FCD34D`, `#6EE7B7`.
- Skill `icon`: the existing icon paths, plus empty.
- Contact `flip`: `none`, `var(--iconflip)`. Contact `icon` is not editable and is preserved.

- [ ] **Step 1: Write failing tests**

```js
const ok = { title: 'A', period: { en: 'x' }, description: { en: 'x' }, categories: ['React'],
  link: 'https://github.com/a', image: '/images/a.webp' };
assert.deepEqual(validateFile('projects', [ok]), []);
const bad = (patch) => validateFile('projects', [{ ...ok, ...patch }]).length > 0;
assert.ok(bad({ extra: 1 }));
assert.ok(bad({ title: '' }));
assert.ok(bad({ description: { en: '', id: '' } }));
assert.ok(bad({ link: 'javascript:alert(1)' }));
assert.ok(bad({ deployed: 'data:text/html,x' }));
assert.ok(bad({ image: '/images/../../secret.webp' }));
assert.ok(bad({ image: '/images/a.svg' }));
assert.ok(bad({ description: { en: '{evil}' } }));
assert.ok(bad({ image: undefined }));          // required unless current
assert.ok(bad({ link: undefined }));
assert.deepEqual(validateFile('projects', [{ ...ok, current: true, image: undefined, link: undefined }]), []);
assert.ok(validateFile('projects', [ok, ok]).length > 0);   // duplicate title
assert.ok(validateFile('projects', {}).length > 0);         // not an array
assert.ok(validateFile('nope', []).length > 0);

assert.equal(isSafeLink('mailto:a@b.c', { mailto: true }), true);
assert.equal(isSafeLink('mailto:a@b.c'), false);
assert.equal(isSafeLink('https://x.y'), true);
assert.equal(isSafeLink('not a url'), false);
```

Add: certificates reject a bad `tier` and duplicate titles; `site` rejects missing or extra `text` keys, an out-of-range `pct` (0 to 100), a contact `href` of `javascript:...`, and an empty `skillGroups[].items` is allowed. Validate the real files: `validateFile` returns `[]` for all three in `src/content/`.

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement.** `IMAGE_PATH = /^\/images\/(certificates\/)?[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/`. Error strings name the item and field in plain words, such as `Project "A": link must start with https://`, because the dashboard shows them.
- [ ] **Step 4: Run `npm test`.** Expected: PASS.
- [ ] **Step 5: Commit:** `feat: add shared content schema and validation`.

### Task 7: GitHub writes, content and upload endpoints

**Files:**
- Create: `api/_lib/github.js`, `api/_lib/files.js`, `api/content.js`, `api/upload.js`, `api/save.js`, `tests/github.test.js`, `tests/files.test.js`

**Interfaces:**
- Consumes: `guard`, `validateFile`.
- Produces:
  - `sniffType(buffer) -> 'jpeg' | 'png' | 'webp' | 'pdf' | null`; `MAX_UPLOAD_BYTES = 3145728`; `slugify(name) -> string`; `uploadPath(kind: 'project' | 'certificate' | 'banner' | 'cv', name, buffer) -> { path } | { error }`; `pathAllowed(path) -> boolean`; `CONTENT_PATHS`.
  - `createGitHub({ token, repo = 'elitcx/portfolio', branch, fetch }) -> { readContent(), createBlob(buffer), commit({ baseSha, message, json, blobs }), paths(sha), status(sha) }`. `ConflictError` class.
  - `GET /api/content -> { sha, projects, certificates, site }`.
  - `POST /api/upload { kind, name, dataBase64 } -> { path, blobSha, publicPath }`.
  - `POST /api/save { baseSha, files: { projects?, certificates?, site? }, uploads: [{ path, blobSha }] } -> { sha } | 400 { errors: string[] } | 409 { error }`.

The upload is a separate request, so several pictures fit under Vercel's 4.5 MB cap.

- [ ] **Step 1: Write failing tests**

```js
assert.equal(sniffType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpeg');
assert.equal(sniffType(Buffer.from('%PDF-1.7')), 'pdf');
assert.equal(sniffType(Buffer.from('<svg></svg>')), null);
assert.equal(slugify('My Cool Project!'), 'my-cool-project');
assert.equal(slugify('程序'), 'image');
assert.equal(slugify('../../etc/passwd'), 'etc-passwd');

const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2]);
assert.match(uploadPath('certificate', 'OSN', jpg).path, /^public\/images\/certificates\/osn-[0-9a-f]{8}\.jpg$/);
assert.match(uploadPath('project', 'A', jpg).path, /^public\/images\/a-[0-9a-f]{8}\.jpg$/);
assert.match(uploadPath('banner', 'x', jpg).path, /^public\/images\/banner-[0-9a-f]{8}\.jpg$/);
assert.equal(uploadPath('cv', 'x', Buffer.from('%PDF-1.7')).path, 'public/Kenneth-Jehezkiel-MW-CV.pdf');
assert.ok(uploadPath('cv', 'x', jpg).error);
assert.ok(uploadPath('project', 'x', Buffer.from('%PDF-1.7')).error);
assert.ok(uploadPath('project', 'x', Buffer.alloc(MAX_UPLOAD_BYTES + 1, jpg)).error);
assert.ok(uploadPath('nope', 'x', jpg).error);

assert.equal(pathAllowed('src/content/projects.json'), true);
assert.equal(pathAllowed('public/images/a-1a2b3c4d.jpg'), true);
for (const p of ['api/save.js', 'package.json', 'vercel.json', 'public/index.html',
  'src/content/../App.jsx', 'public/images/thumb/a.webp', 'public/images/a.svg', '.env'])
  assert.equal(pathAllowed(p), false);
```

GitHub tests use a fake `fetch` recording calls:
- `commit` with head equal to base creates tree, commit, then `PATCH` ref with `force: false`.
- `commit` with a moved head and a changed `src/content/` file in the compare response throws `ConflictError`.
- `commit` with a moved head and only unrelated files changed succeeds, building on the new head.
- A `422` on the ref update throws `ConflictError`.
- `commit` with a disallowed path throws before any network call.

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement `files.js` and `github.js`.** Use `https://api.github.com`, the `X-GitHub-Api-Version: 2022-11-28` header, and `process.env.GITHUB_BRANCH || 'main'` in the endpoint wiring. Write JSON with `JSON.stringify(data, null, 2) + '\n'`. Never put the token in an error message.
- [ ] **Step 4: Implement the endpoints** with `guard`. `save` runs `validateFile` on every sent file, checks `pathAllowed` and that `blobSha` is 40 hex for every upload, then checks every `image` in sent content exists in `paths(head)` or in `uploads`. Commit message: `content: update <names> via admin`. Map `ConflictError` to 409, and anything else to a generic 500 with the real cause in `console.error`.
- [ ] **Step 5: Run `npm test` and `npm run lint`.** Expected: PASS.
- [ ] **Step 6: Commit:** `feat: add content, upload and save endpoints`.

### Task 8: Draft translation and deploy status

**Files:**
- Create: `api/_lib/translate.js`, `api/translate.js`, `api/status.js`, `tests/translate.test.js`

**Interfaces:**
- Consumes: `guard`, `findTokens`, `github.status`.
- Produces:
  - `buildTranslateRequest(text, to) -> Gemini generateContent body`; `tokensPreserved(source, output) -> boolean`.
  - `POST /api/translate { text, to: 'en' | 'id' } -> { text, warning?: string } | 502 { error }`. Text is capped at 4000 characters.
  - `GET /api/status?sha=<40 hex> -> { state: 'pending' | 'success' | 'failure' | 'unknown' }`.

- [ ] **Step 1: Write failing tests:** `tokensPreserved('{age} **a**', '{age} **b**')` is true; a dropped token or a dropped `**` pair returns false; the request body from `buildTranslateRequest` contains the text, the target language name, and instructions to keep `{tokens}`, `**`, line breaks, proper nouns and tech terms unchanged and return only the translation.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement.** Call `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` with the `x-goog-api-key` header. Choose `<model>` from the current list at `GET /v1beta/models`, using a current Flash-tier model, and keep it as one constant. On a preserved-token failure return the draft plus a `warning`. Reject `sha` that is not 40 hex.
- [ ] **Step 4: Run `npm test`.** Expected: PASS.
- [ ] **Step 5: Commit:** `feat: add draft translation and deploy status endpoints`.

### Task 9: Admin entry, login screen and API client

**Files:**
- Create: `admin/index.html`, `src/admin/main.jsx`, `src/admin/AdminApp.jsx`, `src/admin/Login.jsx`, `src/admin/api.js`, `src/admin/admin.css`, `tests/admin-api.test.js`
- Modify: `vite.config.js`, `vercel.json`

**Interfaces:**
- Consumes: the endpoints from Tasks 5, 7 and 8.
- Produces: `apiRequest(path, { method, body, fetch } = {}) -> parsed JSON`, throwing `AuthExpired` on 401, `Conflict` on 409, `ValidationFailed` with `.errors` on 400, and `ApiError` otherwise, including when offline.

- [ ] **Step 1: Write failing tests** with a fake `fetch`: 200 returns JSON; 204 returns `null`; 401 throws `AuthExpired`; 409 throws `Conflict`; 400 throws `ValidationFailed` with `errors`; a rejected `fetch` throws `ApiError`; a non-JSON 500 throws `ApiError` without a parse crash.
- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement `api.js`**, then `admin/index.html` with `<meta name="robots" content="noindex,nofollow">`, no analytics and no inline script.
- [ ] **Step 4: Update `vite.config.js`:** `rollupOptions.input: { main: 'index.html', admin: 'admin/index.html' }`.
- [ ] **Step 5: Add to `vercel.json`, after the catch-all headers rule so it wins:** source `/admin(.*)` with `X-Frame-Options: DENY` and:

```
default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' blob: data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

- [ ] **Step 6: Build `AdminApp` and `Login`.** On load, `GET /api/content`: a 401 shows login, success shows the shell. `AuthExpired` at any time shows login as an overlay, while editor state stays mounted. Theme follows `localStorage.theme` and sets `data-pt`. `admin.css` imports `../index.css` tokens.
- [ ] **Step 7: Verify.** `npm test` and `npm run build` pass. `dist/admin/index.html` exists. `dist/index.html`, `dist/projects/index.html` and `dist/contact/index.html` reference no admin chunk. `dist/sitemap.xml` has no `admin` entry. A wrong password shows the generic error.
- [ ] **Step 8: Commit:** `feat: add admin entry and login`.

### Task 10: Dashboard editor

**Files:**
- Create: `src/admin/sections.js`, `src/admin/Shell.jsx`, `src/admin/ListEditor.jsx`, `src/admin/ItemForm.jsx`, `src/admin/fields.jsx`, `src/admin/image.js`, `src/admin/editing.js`, `tests/editing.test.js`
- Modify: `src/admin/AdminApp.jsx`, `src/admin/admin.css`

**Interfaces:**
- Consumes: `SCHEMAS`, `validateFile`, `apiRequest`, `TEXT_KEYS`.
- Produces:
  - `SECTIONS`: `Projects`, `Certificates`, `About & stats` (facts, stats), `Timeline`, `Skills`, `Contact`, `Page text`, `CV & banner`.
  - `move(list, index, delta) -> list`; `blankItem(schema) -> object`; `normalizeLink(value) -> string`; `changedFiles(saved, edited) -> names[]`.
  - `fitSize(width, height, maxEdge = 2400) -> { width, height }`.
  - `encodeUnderLimit(encode: (quality) => Promise<Blob>, maxBytes) -> Promise<Blob>`, stepping quality through 0.85, 0.75, 0.65, 0.5, and throwing `Picture is too large` if the last is still over.
  - `shrinkPicture(file) -> Promise<Blob>` (browser only, not unit tested).

- [ ] **Step 1: Write failing tests**

```js
assert.deepEqual(move(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c']);
assert.deepEqual(move(['a', 'b'], 0, -1), ['a', 'b']);
assert.deepEqual(move(['a', 'b'], 1, 1), ['a', 'b']);
assert.equal(normalizeLink('github.com/x'), 'https://github.com/x');
assert.equal(normalizeLink('https://x.y'), 'https://x.y');
assert.equal(normalizeLink('mailto:a@b.c'), 'mailto:a@b.c');
assert.equal(normalizeLink(''), '');
assert.deepEqual(fitSize(6000, 3000), { width: 2400, height: 1200 });
assert.deepEqual(fitSize(800, 600), { width: 800, height: 600 });
assert.deepEqual(changedFiles({ projects: [1], site: {} }, { projects: [2], site: {} }), ['projects']);
```

`encodeUnderLimit` tests: a fake encoder returning decreasing sizes stops at the first under the limit; one that never fits rejects with `Picture is too large`.

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement the helpers.** `shrinkPicture` uses `createImageBitmap(file, { imageOrientation: 'from-image' })`, a canvas and `canvas.toBlob(cb, 'image/jpeg', q)`. A decode failure throws `This picture format can't be read. Try a JPEG or PNG.`
- [ ] **Step 4: Build `Shell`** per `admin-layout.html`: section list, item list, form on a computer; tabs, then list, then form on a phone, with a sticky Save button. Header shows publish state and Log out.
- [ ] **Step 5: Build fields from the schema.** `loc` and `locLong` show EN and ID boxes. On each one that is empty while the other is filled, show `Draft from EN` or `Draft from ID`, calling `/api/translate`. Show `warning` under the box. Text fields with tokens show this hint: `**bold**, new line for a break, {age} {years} {count} for live values.` Links run `normalizeLink` on blur. Inputs are at least 16 px on phones, so iOS does not zoom.
- [ ] **Step 6: Build list editing:** add, up and down, delete with an inline confirm, and the `Currently building` switch at the top of the project form. Contact has no add or delete. Skills are added, reordered and deleted within each group, and group names can be edited. `Page text` is one form of all `TEXT_KEYS`, grouped by prefix.
- [ ] **Step 7: Build the save flow.** Run `validateFile` locally and show errors by field. Upload each pending picture, swap `publicPath` into content, then call `/api/save` with only `changedFiles`. On success set new base content and SHA, and poll `/api/status` every 10 s for 3 min, falling back to `Published, live in about a minute`. On `AuthExpired`, `Conflict` or `ApiError`, keep all edits and pending pictures on screen. `Conflict` offers `Reload latest`, which confirms first because it discards edits. Add a `beforeunload` warning while `changedFiles` is non-empty. Picture previews use object URLs, because a new file is not deployed yet.
- [ ] **Step 8: Add `CV & banner`:** banner through `shrinkPicture` then kind `banner`, setting `site.banner`. CV as a PDF under `MAX_UPLOAD_BYTES`, kind `cv`, read directly without shrinking. Accept `image/*` on picture inputs so phones offer the camera.
- [ ] **Step 9: Verify.** `npm test`, lint and build pass. With `/api` mocked or through `vercel dev` once Task 12 setup exists: at 1280 px and 360 px, every section opens and edits, keyboard works, both themes read correctly, and the browser console shows no CSP violations.
- [ ] **Step 10: Commit:** `feat: add dashboard editor`.

### Task 11: Build-time pictures

**Files:**
- Modify: `package.json`, `scripts/generate-images.mjs`, `scripts/generate-og.mjs:16`, `src/components/Homepage.jsx`, `tests/content.test.js`

**Interfaces:**
- Consumes: `site.banner`, `projects[].image`.
- Produces: `npm run build` runs `node scripts/generate-images.mjs && vite build && node scripts/seo-build.mjs`. `generate-images.mjs --force` regenerates everything.

- [ ] **Step 1: Write a failing test:** every project `image` and certificate `image` in content has a matching file under `public/`.
- [ ] **Step 2: Fix any mismatch it reveals, or report it** if a real file is missing.
- [ ] **Step 3: Update `generate-images.mjs`.** Read project images from `src/content/projects.json` and the banner from `site.banner`. Project pictures may live only at the root of `public/images/`. Skip a job when its output exists, unless `--force` is passed: uploaded filenames contain a content hash, so existing outputs are never stale. `npm run images` keeps its current meaning by passing `--force`.
- [ ] **Step 4: Point `generate-og.mjs` at `site.banner`,** so `npm run og` uses the current banner. `ProfilePhoto` uses `thumbSrc(site.banner)`.
- [ ] **Step 5: Verify.** `npm test` passes. A clean build with existing outputs takes under 10 s for the image step and prints no regeneration. Add a test image under a new name and reference it temporarily: only its derivatives are created. Revert. `git status` shows no changes to committed derivatives after `npm run build`.
- [ ] **Step 6: Commit:** `feat: generate picture variants during build`.

### Task 12: End-to-end check and security review

**Owner action required.** These steps need secrets only the owner can create. Ask, and wait. Never ask for the values to be pasted into chat.

1. Create the fine-grained token per the spec, and a Gemini API key.
2. Run `npm run admin:hash` with a long random password from a password manager.
3. Put all values in a local `.env.local`, with `GITHUB_BRANCH=admin-test`, and create that branch on GitHub.
4. Run `npx vercel login` and `npx vercel link`.

**Files:** none expected, apart from fixes.

- [ ] **Step 1: Run `npx vercel dev`.** Log in at `/admin`. Expected: the content loads.
- [ ] **Step 2: Edit a project and add a certificate with a phone photo.** Expected: one commit on `admin-test` with the JSON and one picture, no other paths. Use `git show --stat`.
- [ ] **Step 3: Exercise failures.** Delete the cookie mid-edit and save: login appears, edits survive. Commit a content change to `admin-test` from another tab and save: a conflict appears, edits survive. Invalid `javascript:` link: blocked with a clear message. Draft translation with `{age}`: tokens survive.
- [ ] **Step 4: Attack the API with `curl` without a cookie.** Every endpoint except login returns 401. With a valid cookie and a bad `Origin`: 403. With a `save` upload path of `api/save.js`: rejected. An SVG upload: rejected.
- [ ] **Step 5: Check a preview deployment of the branch.** `curl -I <preview>/admin` shows `Content-Security-Policy` and `X-Frame-Options: DENY`. The build succeeds with `sharp` on Linux. The preview login fails, since previews hold no secrets.
- [ ] **Step 6: Run the `vibe-security` skill on `api/` and `src/admin/`.** Fix every confirmed finding. Run `git log -p --all | grep -c "github_pat_"`. Expected: `0`.
- [ ] **Step 7: Run `npm test`, `npm run lint`, `npm run build`.** Report the output.
- [ ] **Step 8: Hand off for go-live.** Ask the owner to confirm before merging, then list what they do: add the four env vars in Vercel with Production scope only, delete the `admin-test` branch, and log in on a phone after the deploy.
