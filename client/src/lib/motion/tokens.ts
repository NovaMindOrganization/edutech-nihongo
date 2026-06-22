/** Mirrors design tokens in globals.css — single source for Framer Motion. */
export const motionDuration = {
  xs: 0.12,
  sm: 0.18,
  md: 0.26,
  lg: 0.42,
} as const;

export const motionEase = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  pop: [0.2, 0.9, 0.2, 1.25] as const,
};

export const motionDistance = {
  xs: 4,
  sm: 8,
  md: 12,
} as const;

export const motionTransition = {
  fast: { duration: motionDuration.sm, ease: motionEase.out },
  medium: { duration: motionDuration.md, ease: motionEase.out },
  slow: { duration: motionDuration.lg, ease: motionEase.out },
  pop: { duration: motionDuration.sm, ease: motionEase.pop },
  overlay: { duration: motionDuration.sm, ease: motionEase.out },
  drawer: { duration: motionDuration.md, ease: motionEase.out },
} as const;
