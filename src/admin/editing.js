import { findTokens } from '../lib/richText.js';
import { listsFor } from './sections.js';

export function getIn(data, path) {
  return path.reduce((node, key) => node?.[key], data);
}

export function setIn(data, [key, ...rest], value) {
  const next = rest.length ? setIn(data[key], rest, value) : value;
  if (Array.isArray(data)) return data.map((item, i) => (i === key ? next : item));
  return { ...data, [key]: next };
}

export function move(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

let lastId = 0;
export const newId = () => {
  lastId += 1;
  return `item-${lastId}`;
};

// Every list item gets an id while it is being edited, so the form and any
// upload still in flight stay attached to that item when the list reorders.
// The ids live only in the browser: withoutIds runs before validating or saving.
export function withIds(node) {
  if (Array.isArray(node)) {
    return node.map((entry) => (
      entry !== null && typeof entry === 'object' ? { ...withIds(entry), __id: newId() } : entry
    ));
  }
  if (node === null || typeof node !== 'object') return node;
  return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, withIds(value)]));
}

export function withoutIds(node) {
  if (Array.isArray(node)) return node.map(withoutIds);
  if (node === null || typeof node !== 'object') return node;
  return Object.fromEntries(
    Object.entries(node).filter(([key]) => key !== '__id').map(([key, value]) => [key, withoutIds(value)]),
  );
}

// These take the current state rather than a value captured earlier, so a slow
// upload or draft cannot overwrite what was typed while it ran.
export function updateList(edited, sectionId, listKey, change) {
  const list = listsFor(sectionId, edited).find((candidate) => candidate.key === listKey);
  if (!list) return edited;
  const next = change(getIn(edited[list.file], list.path));
  return {
    ...edited,
    [list.file]: list.path.length ? setIn(edited[list.file], list.path, next) : next,
  };
}

export function updateItem(edited, sectionId, listKey, id, change) {
  return updateList(edited, sectionId, listKey, (items) => (
    items.some((item) => item.__id === id)
      ? items.map((item) => (item.__id === id ? change(item) : item))
      : items
  ));
}

export function moveItem(items, id, delta) {
  const index = items.findIndex((item) => item.__id === id);
  return index < 0 ? items : move(items, index, delta);
}

export function draftInto(value, lang, text) {
  return value?.[lang]?.trim() ? value : { ...value, [lang]: text };
}

export function tokenMismatch(value) {
  if (!value?.en || !value?.id) return false;
  const sorted = (text) => findTokens(text).sort().join();
  return sorted(value.en) !== sorted(value.id);
}

export function blankItem(schema) {
  const item = {};
  for (const [key, field] of Object.entries(schema)) {
    if (field.type === 'text') item[key] = '';
    if (field.type === 'loc' || field.type === 'locLong') item[key] = { en: '', id: '' };
    if (field.type === 'number') item[key] = field.min;
    if (field.type === 'tags' || field.type === 'list') item[key] = [];
    if (field.type === 'select') item[key] = field.options[0].value;
  }
  return item;
}

// Only a bare address gets https://. Anything with a scheme is left alone so
// the validator can still reject it, rather than this hiding it behind a prefix.
export function normalizeLink(value) {
  const link = value.trim();
  if (!link || /^[a-z][a-z0-9+.-]*:/i.test(link)) return link;
  return `https://${link}`;
}

export function changedFiles(saved, edited) {
  return Object.keys(edited).filter(
    (name) => JSON.stringify(saved[name]) !== JSON.stringify(edited[name]),
  );
}

// A picture replaced before saving is already in git as a loose blob, but it
// should not be committed as a file nothing uses.
export function usedUploads(uploads, edited) {
  const content = JSON.stringify(edited);
  return uploads.filter(
    ({ path }) => !path.startsWith('public/images/') || content.includes(path.replace(/^public/, '')),
  );
}
