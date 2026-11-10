import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { RICH_TEXT_KEYS, TEXT_KEYS } from '../src/content/textKeys.js';

const read = (name) =>
  JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'));

test('site text has exactly the known keys, each with English', () => {
  const { text } = read('site');
  assert.deepEqual(Object.keys(text).sort(), [...TEXT_KEYS].sort());
  for (const key of TEXT_KEYS) assert.ok(text[key].en, `${key} has no English`);
});

test('the first certificate is a gold first place', () => {
  const certificates = read('certificates');
  assert.equal(certificates[0].tier, 'gold');
  assert.equal(certificates[0].result.en, '1st Place');
});

test('certificate tiers follow the badge colours the regexes used to pick', () => {
  const byResult = Object.fromEntries(read('certificates').map((c) => [c.result.en, c.tier]));
  assert.equal(byResult['2nd Place'], 'silver');
  assert.equal(byResult['Silver Medalist'], 'silver');
  assert.equal(byResult['3rd Place'], 'bronze');
  assert.equal(byResult.Finalist, 'other');
  assert.equal(byResult.Participant, 'other');
});

test('every picture the content names exists in public/', () => {
  const site = read('site');
  const paths = [
    site.banner,
    ...read('projects').map((p) => p.image),
    ...read('certificates').map((c) => c.image),
  ];
  for (const path of paths) {
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
  }
});

test('text marked as formatted is real page text', () => {
  assert.ok(RICH_TEXT_KEYS.length > 0);
  for (const key of RICH_TEXT_KEYS) assert.ok(TEXT_KEYS.includes(key), key);
});
