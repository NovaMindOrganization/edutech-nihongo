import { motion, type HTMLMotionProps } from 'framer-motion';

import { Card } from '@/components/ui/card';
import { fadeUpVariants, popInVariants, staggerItemVariants } from '@/lib/motion';
import { useSafeVariants, useStickerLiftProps } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

type MotionCardProps = React.ComponentProps<typeof Card> & {
  /** Sticker lift on hover — Playful Geometric default */
  lift?: boolean;
  /** Entrance animation style */
  entrance?: 'fade-up' | 'pop-in' | 'none';
};

export function MotionCard({
  lift = true,
  entrance = 'fade-up',
  className,
  ...props
}: MotionCardProps) {
  const liftProps = useStickerLiftProps(lift);
  const variants = useSafeVariants(
    entrance === 'pop-in' ? popInVariants : entrance === 'fade-up' ? fadeUpVariants : {},
  );

  return (
    <motion.div
      variants={entrance === 'none' ? undefined : variants}
      initial={entrance === 'none' ? false : 'initial'}
      animate={entrance === 'none' ? undefined : 'animate'}
      {...liftProps}
    >
      <Card className={cn(lift && 'card-lift hover:shadow-premium-hover', className)} {...props} />
    </motion.div>
  );
}

export function FadeUp({ className, children, ...props }: HTMLMotionProps<'div'>) {
  const variants = useSafeVariants(fadeUpVariants);

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PopIn({ className, children, ...props }: HTMLMotionProps<'div'>) {
  const variants = useSafeVariants(popInVariants);

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ className, children, ...props }: HTMLMotionProps<'div'>) {
  const variants = useSafeVariants({
    initial: {},
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  });

  return (
    <motion.div className={className} variants={variants} initial="initial" animate="animate" {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children, ...props }: HTMLMotionProps<'div'>) {
  const variants = useSafeVariants(staggerItemVariants);

  return (
    <motion.div className={className} variants={variants} {...props}>
      {children}
    </motion.div>
  );
}
