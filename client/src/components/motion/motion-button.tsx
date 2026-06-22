import { motion, type HTMLMotionProps } from 'framer-motion';
import type { VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/ui/button-variants';
import { useButtonPressProps } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

type MotionButtonProps = HTMLMotionProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    motion?: boolean;
  };

/** Framer-powered button — use when CSS lift is insufficient (e.g. icon-only clusters). */
export function MotionButton({
  className,
  variant = 'default',
  size = 'default',
  motion: motionEnabled = true,
  type = 'button',
  ...props
}: MotionButtonProps) {
  const pressProps = useButtonPressProps(motionEnabled && variant !== 'link');

  return (
    <motion.button
      type={type}
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        'hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0 active:shadow-none',
        className,
      )}
      {...pressProps}
      {...props}
    />
  );
}
