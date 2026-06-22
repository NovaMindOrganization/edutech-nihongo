import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { drawerVariants } from '@/lib/motion';
import { uiBase, uiMotion } from './recipes';

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: 'right' | 'left';
};

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  className,
  contentClassName,
  side = 'right',
}: DrawerProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const panelMotion = {
    variants: drawerVariants(side),
    initial: 'initial' as const,
    animate: 'animate' as const,
    exit: 'exit' as const,
  };

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (active instanceof HTMLElement && !drawerRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onOpenChange, open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-foreground/40 glass-overlay"
            {...uiMotion.overlay}
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              'absolute top-0 flex h-dvh max-h-dvh w-[min(100%,28rem)] flex-col overflow-hidden p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5',
              side === 'left' ? 'left-0 rounded-r-3xl' : 'right-0 rounded-l-3xl',
              uiBase.popover,
              className,
            )}
            {...panelMotion}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </h2>
              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Đóng"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className={cn('min-h-0 flex-1 overflow-y-auto', contentClassName)}>
              {children}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
