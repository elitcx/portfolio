import { useCallback, useEffect, useState } from 'react';

/**
 * One IntersectionObserver shared by every reveal on the page.
 *
 * The alternative — a motion component per row — mounts an observer and an
 * animation subscription for each of the ~40 revealed elements. Here each
 * element costs one `observe()` call and the transition itself runs on the
 * compositor via the `.is-revealed` class.
 */
let observer = null;

function getObserver() {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );

  return observer;
}

/**
 * Returns a ref callback. Spread `{...useReveal()}`-style usage is not needed —
 * attach it directly: `<div data-reveal ref={useReveal()} />`.
 */
export function useReveal() {
  return useCallback((node) => {
    if (!node) return undefined;

    const io = getObserver();
    if (!io) {
      node.classList.add('is-revealed');
      return undefined;
    }

    io.observe(node);
    return () => io.unobserve(node);
  }, []);
}

/** Matches framer-motion's useReducedMotion without pulling in the library. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
