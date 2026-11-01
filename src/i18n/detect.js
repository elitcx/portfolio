// Kept free of React so plain Node tests can import it.
export const LANGS = ['en', 'id'];

export function detectLang({ stored, navigatorLanguage }) {
  if (LANGS.includes(stored)) return stored;
  return navigatorLanguage?.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function readStoredLang() {
  try {
    return localStorage.getItem('lang');
  } catch {
    return null;
  }
}
