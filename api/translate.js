import { guard } from './_lib/guard.js';
import { isLanguage, requestDraft, tokensPreserved } from './_lib/translate.js';

const MAX_TEXT = 4000;

export default async function handler(req, res) {
  if (!guard(req, res, { method: 'POST' })) return;

  const { text, to } = req.body ?? {};
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT || !isLanguage(to)) {
    res.status(400).json({ error: 'That text cannot be translated' });
    return;
  }

  try {
    const draft = await requestDraft(text, to, process.env.GEMINI_API_KEY);
    res.status(200).json(
      tokensPreserved(text, draft)
        ? { text: draft }
        : { text: draft, warning: 'Check this draft: a {value} or **bold** marker changed' },
    );
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'Draft translation failed. You can type it yourself' });
  }
}
