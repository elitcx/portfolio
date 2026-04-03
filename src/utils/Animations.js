// ─── Shared Animation Variants ────────────────────────────────────────────────

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  viewport: { once: true, amount: 0.2 },
};

export const stagger = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 },
  viewport: { once: true, amount: 0.2 },
});