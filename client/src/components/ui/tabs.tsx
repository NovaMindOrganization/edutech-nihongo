import { createContext, useContext, useId, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { uiBase } from './recipes';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>.');
  }
  return context;
}

type TabsProps = React.ComponentProps<'div'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function Tabs({
  value,
  defaultValue = '',
  onValueChange,
  className,
  ...props
}: TabsProps) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value ?? internalValue;

  const contextValue = useMemo(
    () => ({
      value: activeValue,
      baseId,
      setValue: (nextValue: string) => {
        if (value === undefined) setInternalValue(nextValue);
        onValueChange?.(nextValue);
      },
    }),
    [activeValue, baseId, onValueChange, value],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted p-1 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<'button'> & {
  value: string;
};

export function TabsTrigger({ value, className, onKeyDown, ...props }: TabsTriggerProps) {
  const context = useTabsContext();
  const selected = context.value === value;

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    const tablist = event.currentTarget.closest('[role="tablist"]');
    const triggers = Array.from(
      tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
    );
    const currentIndex = triggers.indexOf(event.currentTarget);
    if (currentIndex < 0 || triggers.length === 0) return;

    event.preventDefault();
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? triggers.length - 1
          : event.key === 'ArrowRight'
            ? (currentIndex + 1) % triggers.length
            : (currentIndex - 1 + triggers.length) % triggers.length;
    triggers[nextIndex]?.focus();
    triggers[nextIndex]?.click();
  }

  return (
    <button
      type="button"
      role="tab"
      id={`${context.baseId}-trigger-${value}`}
      aria-selected={selected}
      aria-controls={`${context.baseId}-content-${value}`}
      data-state={selected ? 'active' : 'inactive'}
      tabIndex={selected || context.value === '' ? 0 : -1}
      className={cn(
        'rounded-md px-3 py-1.5 font-sans text-sm font-medium transition-all duration-200',
        uiBase.interactive,
        selected
          ? 'border border-border-strong bg-brand-soft text-brand shadow-premium'
          : 'border border-transparent bg-transparent text-muted-foreground shadow-sm hover:border-border hover:bg-surface-paper hover:text-foreground hover:shadow-premium active:scale-[0.98] active:shadow-pressed',
        className,
      )}
      onClick={() => context.setValue(value)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

type TabsContentProps = React.ComponentProps<'div'> & {
  value: string;
};

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const context = useTabsContext();
  const selected = context.value === value;

  if (!selected) return null;

  return (
    <div
      role="tabpanel"
      id={`${context.baseId}-content-${value}`}
      aria-labelledby={`${context.baseId}-trigger-${value}`}
      data-state="active"
      className={cn('mt-4 view-transition motion-fade-up', className)}
      {...props}
    />
  );
}
