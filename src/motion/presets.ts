/** Calm, product-grade easing — no bounce or overshoot. */
export const easeSmooth = [0.22, 1, 0.36, 1] as const;

export const transitionFast = {
  duration: 0.28,
  ease: easeSmooth,
} as const;

export const transitionPage = {
  duration: 0.4,
  ease: easeSmooth,
} as const;

export const transitionReveal = {
  duration: 0.45,
  ease: easeSmooth,
} as const;

export const fadeUpHidden = { opacity: 0, y: 12 };
export const fadeUpVisible = { opacity: 1, y: 0 };

export const fadeHidden = { opacity: 0 };
export const fadeVisible = { opacity: 1 };

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: fadeUpHidden,
  visible: {
    ...fadeUpVisible,
    transition: transitionReveal,
  },
};

export const viewportOnce = {
  once: true,
  amount: 0.15,
  margin: '-48px 0px -48px 0px',
} as const;
