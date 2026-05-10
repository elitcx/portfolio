// ─── Shared Animation Variants ────────────────────────────────────────────────

const expo = [0.16, 1, 0.3, 1];

// Fade + moderate lift for labels and secondary content.
export const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: expo },
  viewport: { once: true, amount: 0.1 },
};

// Staggered item reveal — larger travel than fadeUp.
export const stagger = (i = 0) => ({
  initial: { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: expo, delay: i * 0.12 },
  viewport: { once: true, amount: 0.1 },
});

// Bold heading entrance — unmissable 80px drop.
export const revealUp = {
  initial: { opacity: 0, y: 80 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: expo },
  viewport: { once: true, amount: 0.05 },
};

// Slide from left — used for skill rows.
export const slideInLeft = (i = 0) => ({
  initial: { opacity: 0, x: -64 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: expo, delay: i * 0.1 },
  viewport: { once: true, amount: 0.15 },
});
