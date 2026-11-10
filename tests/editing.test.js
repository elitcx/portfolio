import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  blankItem, changedFiles, draftInto, getIn, move, moveItem, normalizeLink, setIn, tokenMismatch,
  updateItem, updateList, usedUploads, withIds, withoutIds,
} from '../src/admin/editing.js';
import { encodeUnderLimit, fitSize } from '../src/admin/image.js';
import { SECTIONS, listsFor } from '../src/admin/sections.js';
import { SCHEMAS } from '../src/lib/contentSchema.js';

test('move swaps within bounds and ignores moves off the ends', () => {
  assert.deepEqual(move(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c']);
  assert.deepEqual(move(['a', 'b'], 0, -1), ['a', 'b']);
  assert.deepEqual(move(['a', 'b'], 1, 1), ['a', 'b']);
});

test('move does not change the original list', () => {
  const list = ['a', 'b'];
  move(list, 0, 1);
  assert.deepEqual(list, ['a', 'b']);
});

test('normalizeLink adds https only to bare addresses', () => {
  assert.equal(normalizeLink('github.com/x'), 'https://github.com/x');
  assert.equal(normalizeLink('  github.com/x '), 'https://github.com/x');
  assert.equal(normalizeLink('https://x.y'), 'https://x.y');
  assert.equal(normalizeLink('http://x.y'), 'http://x.y');
  assert.equal(normalizeLink('mailto:a@b.c'), 'mailto:a@b.c');
  assert.equal(normalizeLink(''), '');
});

test('normalizeLink does not turn a dangerous link into a safe-looking one', () => {
  assert.equal(normalizeLink('javascript:alert(1)'), 'javascript:alert(1)');
});

test('changedFiles names only what differs', () => {
  assert.deepEqual(changedFiles({ projects: [1], site: {} }, { projects: [2], site: {} }), ['projects']);
  assert.deepEqual(changedFiles({ projects: [1] }, { projects: [1] }), []);
});

test('blankItem fills only what a new row needs', () => {
  const item = blankItem(SCHEMAS.project);
  assert.deepEqual(item.description, { en: '', id: '' });
  assert.equal(item.title, '');
  assert.deepEqual(item.categories, []);
  assert.equal(item.link, undefined);
  assert.equal(blankItem(SCHEMAS.certificate).tier, 'gold');
  assert.equal(blankItem(SCHEMAS.skill).pct, 0);
  assert.equal(blankItem(SCHEMAS.skill).icon, '');
  assert.deepEqual(blankItem(SCHEMAS.skillGroup).items, []);
});

test('fitSize shrinks the long edge and never enlarges', () => {
  assert.deepEqual(fitSize(6000, 3000), { width: 2400, height: 1200 });
  assert.deepEqual(fitSize(3000, 6000), { width: 1200, height: 2400 });
  assert.deepEqual(fitSize(800, 600), { width: 800, height: 600 });
  assert.deepEqual(fitSize(2400, 2400), { width: 2400, height: 2400 });
});

const blobOf = (size) => ({ size });

test('encodeUnderLimit stops at the first quality that fits', async () => {
  const tried = [];
  const result = await encodeUnderLimit(async (q) => {
    tried.push(q);
    return blobOf(q > 0.7 ? 5000 : 900);
  }, 1000);
  assert.equal(result.size, 900);
  assert.deepEqual(tried, [0.85, 0.75, 0.65]);
});

test('encodeUnderLimit rejects a picture that never fits', async () => {
  await assert.rejects(encodeUnderLimit(async () => blobOf(5000), 1000), /Picture is too large/);
});

test('getIn and setIn walk nested lists without touching the original', () => {
  const data = { a: [{ b: 1 }, { b: 2 }] };
  assert.equal(getIn(data, ['a', 1, 'b']), 2);
  assert.deepEqual(getIn(data, []), data);
  const next = setIn(data, ['a', 1, 'b'], 9);
  assert.equal(next.a[1].b, 9);
  assert.equal(data.a[1].b, 2);
  assert.ok(Array.isArray(next.a));
  assert.equal(next.a[0], data.a[0]);
});

test('usedUploads drops a picture that was replaced before saving', () => {
  const edited = { projects: [{ image: '/images/new-1.jpg' }], site: {} };
  const uploads = [
    { path: 'public/images/new-1.jpg', blobSha: 'a' },
    { path: 'public/images/old-2.jpg', blobSha: 'b' },
    { path: 'public/Kenneth-Jehezkiel-MW-CV.pdf', blobSha: 'c' },
  ];
  assert.deepEqual(usedUploads(uploads, edited).map((u) => u.blobSha), ['a', 'c']);
});

test('skills section lists the groups, then one list per group', () => {
  const edited = { site: { skillGroups: [
    { group: { en: 'Languages' }, items: [{ lang: 'C++' }] },
    { group: { en: 'Tools' }, items: [] },
  ] } };
  const lists = listsFor('skills', edited);
  assert.deepEqual(lists.map((l) => l.label), ['Skill groups', 'Languages', 'Tools']);
  assert.deepEqual(lists[1].path, ['skillGroups', 0, 'items']);
  assert.equal(lists[0].canAdd, false);
  assert.equal(lists[1].canAdd, true);
  assert.equal(lists[1].titleOf({ lang: 'C++' }), 'C++');
});

test('contact rows can be edited and moved, but not added or deleted', () => {
  const [contact] = listsFor('contact', { site: { contact: [] } });
  assert.equal(contact.canAdd, false);
  assert.equal(contact.canDelete, false);
  assert.equal(contact.canMove, true);
});

test('every section has a label and the lists it promises', () => {
  const edited = { projects: [], certificates: [], site: { facts: [], stats: [], timeline: [], skillGroups: [], resume: [], contact: [] } };
  for (const section of SECTIONS) {
    assert.ok(section.label);
    if (section.kind === 'lists') assert.ok(listsFor(section.id, edited).length > 0, section.id);
  }
});

const projectsFile = () => withIds({
  projects: [{ title: 'A', description: { en: 'a' } }, { title: 'B', description: { en: 'b' } }],
  certificates: [],
  site: { text: { 'app.skip': { en: 'x' } }, skillGroups: [{ group: { en: 'G' }, items: [{ lang: 'C++' }] }] },
});

test('ids are added to list items only and never reach what gets saved', () => {
  const edited = projectsFile();
  assert.ok(edited.projects[0].__id);
  assert.ok(edited.site.skillGroups[0].items[0].__id);
  assert.notEqual(edited.projects[0].__id, edited.projects[1].__id);
  assert.equal(edited.site.text.__id, undefined);
  assert.deepEqual(withoutIds(edited), {
    projects: [{ title: 'A', description: { en: 'a' } }, { title: 'B', description: { en: 'b' } }],
    certificates: [],
    site: { text: { 'app.skip': { en: 'x' } }, skillGroups: [{ group: { en: 'G' }, items: [{ lang: 'C++' }] }] },
  });
});

test('an upload finishing late keeps everything typed while it ran', () => {
  let edited = projectsFile();
  const id = edited.projects[0].__id;
  // The owner picks a picture, then keeps typing while it uploads.
  edited = updateItem(edited, 'projects', 'projects', id, (it) => ({ ...it, title: 'Typed meanwhile' }));
  edited = updateItem(edited, 'projects', 'projects', edited.projects[1].__id, (it) => ({ ...it, title: 'Other typed' }));
  // Then the upload finishes.
  edited = updateItem(edited, 'projects', 'projects', id, (it) => ({ ...it, image: '/images/x.jpg' }));
  assert.equal(edited.projects[0].title, 'Typed meanwhile');
  assert.equal(edited.projects[0].image, '/images/x.jpg');
  assert.equal(edited.projects[1].title, 'Other typed');
});

test('a late upload follows its item after the list is reordered', () => {
  let edited = projectsFile();
  const id = edited.projects[0].__id;
  edited = updateList(edited, 'projects', 'projects', (items) => moveItem(items, id, 1));
  edited = updateItem(edited, 'projects', 'projects', id, (it) => ({ ...it, image: '/images/x.jpg' }));
  assert.equal(edited.projects[1].title, 'A');
  assert.equal(edited.projects[1].image, '/images/x.jpg');
  assert.equal(edited.projects[0].image, undefined);
});

test('a late upload for a deleted item changes nothing', () => {
  let edited = projectsFile();
  const id = edited.projects[0].__id;
  edited = updateList(edited, 'projects', 'projects', (items) => items.filter((it) => it.__id !== id));
  const after = updateItem(edited, 'projects', 'projects', id, (it) => ({ ...it, image: '/images/x.jpg' }));
  assert.deepEqual(after, edited);
});

test('moveItem moves by id and ignores moves off the ends', () => {
  const items = [{ __id: 'a' }, { __id: 'b' }];
  assert.deepEqual(moveItem(items, 'a', 1).map((i) => i.__id), ['b', 'a']);
  assert.equal(moveItem(items, 'a', -1), items);
  assert.equal(moveItem(items, 'missing', 1), items);
});

test('a skill list keeps its identity when groups are reordered', () => {
  const edited = withIds({ site: { skillGroups: [
    { group: { en: 'One' }, items: [{ lang: 'C++' }] },
    { group: { en: 'Two' }, items: [{ lang: 'SQL' }] },
  ] } });
  const keyOfTwo = listsFor('skills', edited)[2].key;
  const moved = updateList(edited, 'skills', 'skillGroups', (groups) => moveItem(groups, groups[1].__id, -1));
  const list = listsFor('skills', moved).find((l) => l.key === keyOfTwo);
  assert.equal(list.label, 'Two');
  assert.deepEqual(list.path, ['skillGroups', 0, 'items']);
});

test('a draft fills an empty box but never replaces what was typed meanwhile', () => {
  assert.deepEqual(draftInto({ en: 'x', id: '' }, 'id', 'draft'), { en: 'x', id: 'draft' });
  assert.deepEqual(draftInto({ en: 'x' }, 'id', 'draft'), { en: 'x', id: 'draft' });
  assert.deepEqual(draftInto({ en: 'x', id: 'typed' }, 'id', 'draft'), { en: 'x', id: 'typed' });
});

test('tokenMismatch notices a value missing from one language', () => {
  assert.equal(tokenMismatch({ en: 'I am {age}', id: 'Saya' }), true);
  assert.equal(tokenMismatch({ en: '{age} {years}', id: '{years} {age}' }), false);
  assert.equal(tokenMismatch({ en: 'I am {age}', id: '' }), false);
  assert.equal(tokenMismatch({ en: 'x' }), false);
  assert.equal(tokenMismatch(undefined), false);
});
