import { useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import {
  buttonPressHover,
  buttonPressTap,
  stickerLiftHover,
  stickerLiftTap,
} from './presets';

export function usePrefersReducedMotion() {
  return useReducedMotion() ?? false;
}

export function useMotionProps<T extends Record<string, unknown>>(full: T, reduced?: Partial<T>): T {
  const reduce = usePrefersReducedMotion();
  if (!reduce) return full;
  return { ...full, ...reduced } as T;
}

export function useStickerLiftProps(enabled = true) {
  const reduce = usePrefersReducedMotion();
  if (!enabled || reduce) return {};
  return {
    whileHover: stickerLiftHover,
    whileTap: stickerLiftTap,
  };
}

export function useButtonPressProps(enabled = true) {
  const reduce = usePrefersReducedMotion();
  if (!enabled || reduce) return {};
  return {
    whileHover: buttonPressHover,
    whileTap: buttonPressTap,
  };
}

/** Returns instant variants when user prefers reduced motion. */
export function useSafeVariants(variants: Variants): Variants {
  const reduce = usePrefersReducedMotion();
  if (!reduce) return variants;

  const instant = { transition: { duration: 0 } };
  return Object.fromEntries(
    Object.entries(variants).map(([key, value]) => [
      key,
      typeof value === 'object' && value !== null
        ? { ...value, ...instant }
        : value,
    ]),
  ) as Variants;
}
