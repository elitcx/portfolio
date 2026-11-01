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
