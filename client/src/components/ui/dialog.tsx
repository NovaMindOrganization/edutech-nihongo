import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uiBase, uiMotion } from './recipes';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ open, onOpenChange, title, children, className }: DialogProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

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
        dialogRef.current?.querySelectorAll<HTMLElement>(
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
      } else if (active instanceof HTMLElement && !dialogRef.current?.contains(active)) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-foreground/40 glass-overlay"
            {...uiMotion.overlay}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            {...uiMotion.pop}
            className={cn(
              'relative z-10 max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto p-4 sm:p-6',
              uiBase.popover,
              className,
            )}
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
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
