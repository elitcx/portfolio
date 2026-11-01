import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { isSafeLink, validateFile } from '../src/lib/contentSchema.js';

const read = (name) =>
  JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'));

const project = {
  title: 'A',
  period: { en: 'x' },
  description: { en: 'x' },
  categories: ['React'],
  link: 'https://github.com/a',
  image: '/images/a.webp',
};
const badProject = (patch) => validateFile('projects', [{ ...project, ...patch }]).length > 0;

test('the real content files are valid', () => {
  assert.deepEqual(validateFile('projects', read('projects')), []);
  assert.deepEqual(validateFile('certificates', read('certificates')), []);
  assert.deepEqual(validateFile('site', read('site')), []);
});

test('a valid project passes', () => {
  assert.deepEqual(validateFile('projects', [project]), []);
});

test('unknown fields and missing text are rejected', () => {
  assert.ok(badProject({ extra: 1 }));
  assert.ok(badProject({ title: '' }));
  assert.ok(badProject({ description: { en: '', id: '' } }));
  assert.ok(badProject({ description: { en: 'x', fr: 'y' } }));
  assert.ok(badProject({ categories: 'React' }));
});

test('dangerous links and image paths are rejected', () => {
  assert.ok(badProject({ link: 'javascript:alert(1)' }));
  assert.ok(badProject({ deployed: 'data:text/html,x' }));
  assert.ok(badProject({ image: '/images/../../secret.webp' }));
  assert.ok(badProject({ image: '/images/a.svg' }));
  assert.ok(badProject({ image: 'https://evil.example/a.webp' }));
});

test('unknown tokens are rejected', () => {
  assert.ok(badProject({ description: { en: '{evil}' } }));
  assert.ok(!badProject({ description: { en: '{age} {years} {count}' } }));
});

test('picture and repo link are optional only while in progress', () => {
  assert.ok(badProject({ image: undefined }));
  assert.ok(badProject({ link: undefined }));
  assert.deepEqual(
    validateFile('projects', [{ ...project, current: true, image: undefined, link: undefined }]),
    [],
  );
  assert.ok(badProject({ current: 'yes' }));
});

test('duplicate titles and wrong shapes are rejected', () => {
  assert.ok(validateFile('projects', [project, project]).length > 0);
  assert.ok(validateFile('projects', {}).length > 0);
  assert.ok(validateFile('projects', [null]).length > 0);
  assert.ok(validateFile('nope', []).length > 0);
});

test('error messages name the item and field', () => {
  const [message] = validateFile('projects', [{ ...project, link: 'javascript:x' }]);
  assert.match(message, /A/);
  assert.match(message, /Repo link/);
});

test('certificates need a known tier and unique titles', () => {
  const cert = { image: '/images/certificates/a.webp', title: 'C', result: { en: 'x' }, tier: 'gold' };
  assert.deepEqual(validateFile('certificates', [cert]), []);
  assert.ok(validateFile('certificates', [{ ...cert, tier: 'platinum' }]).length > 0);
  assert.ok(validateFile('certificates', [cert, cert]).length > 0);
});

test('site rejects bad text keys, scores and contact links', () => {
  const site = read('site');
  const bad = (patch) => validateFile('site', { ...site, ...patch }).length > 0;

  const { 'app.skip': removed, ...missing } = site.text;
  assert.ok(removed);
  assert.ok(bad({ text: missing }));
  assert.ok(bad({ text: { ...site.text, 'evil.key': { en: 'x' } } }));
  assert.ok(bad({ extra: 1 }));
  assert.ok(bad({ banner: '/images/a.svg' }));

  const withSkill = (skill) => [{ ...site.skillGroups[0], items: [{ ...site.skillGroups[0].items[0], ...skill }] }];
  assert.ok(bad({ skillGroups: withSkill({ pct: 101 }) }));
  assert.ok(bad({ skillGroups: withSkill({ pct: 'high' }) }));
  assert.ok(bad({ skillGroups: withSkill({ color: 'url(evil)' }) }));
  assert.ok(!bad({ skillGroups: withSkill({ icon: '' }) }));
  assert.ok(!bad({ skillGroups: [{ ...site.skillGroups[0], items: [] }] }));

  assert.ok(bad({ contact: [{ ...site.contact[0], href: 'javascript:alert(1)' }] }));
  assert.ok(!bad({ contact: [{ ...site.contact[0], href: 'mailto:a@b.c' }] }));
  assert.ok(bad({ timeline: [{ ...site.timeline[0], color: 'red; background:url(x)' }] }));
});

test('isSafeLink allows only web links, and mailto when asked', () => {
  assert.equal(isSafeLink('mailto:a@b.c', { mailto: true }), true);
  assert.equal(isSafeLink('mailto:a@b.c'), false);
  assert.equal(isSafeLink('https://x.y'), true);
  assert.equal(isSafeLink('http://x.y'), true);
  assert.equal(isSafeLink('not a url'), false);
  assert.equal(isSafeLink('javascript:alert(1)', { mailto: true }), false);
  assert.equal(isSafeLink(undefined), false);
});

test('inherited property names do not count as known fields', () => {
  assert.ok(badProject({ constructor: 'x' }));
  assert.ok(validateFile('projects', [{ ...project, ...JSON.parse('{"__proto__":{"x":1}}') }]).length > 0);
});

test('list fields must be present, because the public pages read them directly', () => {
  assert.ok(badProject({ categories: undefined }));
  const site = read('site');
  const { items, ...noItems } = site.skillGroups[0];
  assert.ok(items);
  assert.ok(validateFile('site', { ...site, skillGroups: [noItems] }).length > 0);
});

test('a picture must be in the folder the image build reads for that kind', () => {
  assert.ok(badProject({ image: '/images/certificates/a.webp' }));
  const site = read('site');
  assert.ok(validateFile('site', { ...site, banner: '/images/certificates/a.webp' }).length > 0);
  const cert = { image: '/images/a.webp', title: 'C', result: { en: 'x' }, tier: 'gold' };
  assert.ok(validateFile('certificates', [cert]).length > 0);
});
