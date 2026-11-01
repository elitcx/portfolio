// Editable text supports exactly three things: **bold**, line breaks, and
// tokens for values that must stay computed. Anything malformed renders
// literally, because a typo in the dashboard must never crash the public page.

export const ALLOWED_TOKENS = ['age', 'years', 'count'];

const TOKEN = /\{([a-zA-Z]+)\}/g;

export function findTokens(str) {
  return [...String(str ?? '').matchAll(TOKEN)].map((m) => m[1]);
}

function substitute(str, vars) {
  return str.replace(TOKEN, (whole, name) => (name in vars ? String(vars[name]) : whole));
}

function parseLine(line) {
  const parts = line.split('**');
  // An even part count means one ** has no partner, so that last one is literal.
  if (parts.length % 2 === 0) parts[parts.length - 2] += `**${parts.pop()}`;
  return parts
    .map((value, i) => ({ type: i % 2 ? 'bold' : 'text', value }))
    .filter((segment) => segment.value);
}

export function parseRichText(str, vars = {}) {
  if (!str) return [];
  return substitute(String(str), vars)
    .split('\n')
    .flatMap((line, i) => (i ? [{ type: 'br' }, ...parseLine(line)] : parseLine(line)));
}

export function plainText(str, vars = {}) {
  return parseRichText(str, vars)
    .map((segment) => (segment.type === 'br' ? ' ' : segment.value))
    .join('');
}
