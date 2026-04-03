import { useState, useEffect } from 'react';

const TYPE_SPEED       = 80;    // ms per character typed
const DELETE_SPEED     = 45;    // ms per character deleted
const PAUSE_AFTER_TYPE = 1800;  // ms to hold the completed word
const PAUSE_AFTER_DELETE = 400; // ms to pause before typing next word

/**
 * Loops through `words`, typing and deleting each one.
 * Returns the currently-displayed string.
 */
export function useTypewriter(words) {
  const [displayed,  setDisplayed]  = useState('');
  const [wordIndex,  setWordIndex]  = useState(0);
  const [phase,      setPhase]      = useState('typing'); // 'typing' | 'deleting'

  useEffect(() => {
    const current = words[wordIndex];

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        const t = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length + 1)),
          TYPE_SPEED
        );
        return () => clearTimeout(t);
      }
      // Word complete — pause then start deleting
      const t = setTimeout(() => setPhase('deleting'), PAUSE_AFTER_TYPE);
      return () => clearTimeout(t);
    }

    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), DELETE_SPEED);
        return () => clearTimeout(t);
      }
      // Word cleared — pause then advance to next word
      const t = setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length);
        setPhase('typing');
      }, PAUSE_AFTER_DELETE);
      return () => clearTimeout(t);
    }
  }, [displayed, phase, wordIndex, words]);

  return displayed;
}