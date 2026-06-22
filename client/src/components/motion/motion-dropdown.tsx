import { AnimatePresence, motion } from 'framer-motion';

import { dropdownVariants } from '@/lib/motion';
import { useSafeVariants } from '@/lib/motion/hooks';
import { uiBase } from '@/components/ui/recipes';
import { cn } from '@/lib/utils';

type MotionDropdownPanelProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
  role?: string;
  align?: 'left' | 'right';
};

/** Animated popover panel — use inside a positioned relative container. */
export function MotionDropdownPanel({
  open,
  children,
  className,
  id,
  role = 'menu',
  align = 'left',
}: MotionDropdownPanelProps) {
  const variants = useSafeVariants(dropdownVariants);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id={id}
          role={role}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            'absolute top-full z-40 mt-1 min-w-52 max-w-[calc(100vw-2rem)] py-1',
            align === 'right' ? 'right-0' : 'left-0',
            uiBase.popover,
            className,
          )}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type MotionCollapseProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Height collapse for sidebar / accordion sections. */
export function MotionCollapse({ open, children, className }: MotionCollapseProps) {
  const variants = useSafeVariants({
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
  });

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
