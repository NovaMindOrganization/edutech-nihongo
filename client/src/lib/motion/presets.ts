import type { TargetAndTransition, Transition, Variants } from 'framer-motion';

import { motionDistance, motionDuration, motionEase, motionTransition } from './tokens';

/** Card lift — vertical soft minimal hover */
export const stickerLiftHover: TargetAndTransition = {
  y: -2,
  transition: motionTransition.fast,
};

export const stickerLiftTap: TargetAndTransition = {
  scale: 0.98,
  transition: motionTransition.fast,
};

/** Button press — scale down on tap */
export const buttonPressHover: TargetAndTransition = {
  y: -2,
  transition: motionTransition.fast,
};

export const buttonPressTap: TargetAndTransition = {
  scale: 0.98,
  transition: motionTransition.fast,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: motionDistance.sm },
  animate: { opacity: 1, y: 0, transition: motionTransition.medium },
  exit: { opacity: 0, y: -motionDistance.xs, transition: motionTransition.fast },
};

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: motionDistance.sm },
  animate: { opacity: 1, y: 0, transition: motionTransition.medium },
  exit: { opacity: 0, y: motionDistance.xs, transition: motionTransition.fast },
};

export const popInVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: motionDistance.sm },
  animate: { opacity: 1, scale: 1, y: 0, transition: motionTransition.pop },
  exit: { opacity: 0, scale: 0.98, y: motionDistance.sm, transition: motionTransition.fast },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: motionTransition.overlay },
  exit: { opacity: 0, transition: motionTransition.overlay },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: motionDistance.sm },
  animate: { opacity: 1, scale: 1, y: 0, transition: motionTransition.pop },
  exit: { opacity: 0, scale: 0.96, y: motionDistance.sm, transition: motionTransition.fast },
};

export function drawerVariants(side: 'left' | 'right' = 'right'): Variants {
  const offset = side === 'left' ? '-100%' : '100%';
  return {
    initial: { opacity: 0, x: offset },
    animate: { opacity: 1, x: 0, transition: motionTransition.drawer },
    exit: { opacity: 0, x: offset, transition: motionTransition.drawer },
  };
}

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -motionDistance.xs, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: motionTransition.pop },
  exit: { opacity: 0, y: -motionDistance.xs, scale: 0.98, transition: motionTransition.fast },
};

export const collapseVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: motionTransition.medium },
  exit: { opacity: 0, height: 0, transition: motionTransition.fast },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: motionDistance.sm },
  animate: { opacity: 1, y: 0, transition: motionTransition.medium },
  exit: { opacity: 0, y: motionDistance.xs, transition: motionTransition.fast },
};

export const loadingPulseVariants: Variants = {
  initial: { opacity: 0.55, scale: 1 },
  animate: {
    opacity: [0.55, 1, 0.55],
    scale: [1, 1.02, 1],
    transition: { duration: motionDuration.lg, ease: motionEase.inOut, repeat: Infinity },
  },
};

export const loadingDotVariants: Variants = {
  initial: { y: 0, opacity: 0.5 },
  animate: {
    y: [-2, -6, -2],
    opacity: [0.5, 1, 0.5],
    transition: { duration: motionDuration.md, ease: motionEase.inOut, repeat: Infinity },
  },
};

export const loadingSpinnerTransition: Transition = {
  duration: motionDuration.lg,
  ease: motionEase.inOut,
  repeat: Infinity,
};

/** Spreadable props for legacy uiMotion consumers (dialog, drawer). */
export const uiMotion = {
  overlay: {
    variants: overlayVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  pop: {
    variants: modalVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  drawer: {
    variants: drawerVariants('right'),
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
} as const;
