import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { detectLang, readStoredLang } from '../src/i18n/detect.js';
import { findTokens } from '../src/lib/richText.js';
import { indexProjects } from '../src/lib/projects.js';

const read = (name) =>
  JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'));

test('detectLang prefers the stored choice, then the browser language', () => {
  assert.equal(detectLang({ stored: 'id', navigatorLanguage: 'en-US' }), 'id');
  assert.equal(detectLang({ stored: 'en', navigatorLanguage: 'id-ID' }), 'en');
  assert.equal(detectLang({ stored: null, navigatorLanguage: 'id-ID' }), 'id');
  assert.equal(detectLang({ stored: null, navigatorLanguage: 'de' }), 'en');
  assert.equal(detectLang({ stored: 'xx', navigatorLanguage: undefined }), 'en');
});

test('readStoredLang survives blocked storage', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem() { throw new Error('blocked'); } },
  });
  try {
    assert.equal(readStoredLang(), null);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});

test('indexProjects resolves text and search per language', () => {
  const [p] = indexProjects(
    [{
      title: 'T',
      period: { en: 'May', id: 'Mei' },
      description: { en: 'hello', id: 'halo' },
      categories: ['React'],
      image: '/images/a.webp',
    }],
    'id',
  );
  assert.equal(p.description, 'halo');
  assert.equal(p.period, 'Mei');
  assert.ok(p.haystack.includes('halo') && p.haystack.includes('react'));
  assert.equal(p.thumb, '/images/thumb/a.webp');
  assert.equal(p.full, '/images/full/a.webp');
});

test('indexProjects copes with a project that has no picture yet', () => {
  const [p] = indexProjects(
    [{ title: 'T', period: { en: 'x' }, description: { en: 'x' }, categories: [] }],
    'en',
  );
  assert.equal(p.thumb, null);
  assert.equal(p.full, null);
});

test('all existing content has Indonesian with matching tokens', () => {
  const site = read('site');
  const fields = [
    ...Object.values(site.text),
    ...site.stats.flatMap((s) => [s.value, s.label]),
    ...site.facts.flatMap((f) => [f.label, f.value]),
    ...site.timeline.map((t) => t.text),
    ...site.skillGroups.flatMap((g) => [
      g.group,
      g.meta,
      ...g.items.flatMap((i) => [i.level, i.detail]),
    ]),
    ...read('projects').flatMap((p) => [p.period, p.description]),
    ...read('certificates').map((c) => c.result),
  ];
  for (const field of fields) {
    assert.ok(field.id, `no Indonesian for: ${field.en}`);
    assert.deepEqual(findTokens(field.id), findTokens(field.en), field.en);
  }
});
