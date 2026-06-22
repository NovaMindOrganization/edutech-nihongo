import { cn } from '@/lib/utils';
import { uiBase } from './recipes';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'flex',
        uiBase.control,
        uiBase.controlFocus,
        uiBase.placeholder,
        uiBase.interactive,
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}
