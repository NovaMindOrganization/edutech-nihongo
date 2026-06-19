import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

import { pageVariants } from '@/lib/motion';
import { useSafeVariants } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
  /** Route key — defaults to pathname */
  routeKey?: string;
};

/** Wraps route content with a consistent page enter/exit. */
export function PageTransition({ children, className, routeKey }: PageTransitionProps) {
  const location = useLocation();
  const key = routeKey ?? location.pathname;
  const variants = useSafeVariants(pageVariants);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className={cn('w-full', className)}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Drop-in replacement for `<Outlet />` in layouts. */
export function AnimatedOutlet({ className }: { className?: string }) {
  const location = useLocation();
  const outlet = useOutlet();
  const variants = useSafeVariants(pageVariants);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={cn('w-full', className)}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
