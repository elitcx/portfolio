// A translatable field is { en, id }. Either language may be empty, so the
// lookup falls back both ways rather than leaving a blank spot on the page.
export function localize(field, lang) {
  if (typeof field === 'string') return field;
  if (!field) return '';
  return field[lang] || field.en || field.id || '';
}
