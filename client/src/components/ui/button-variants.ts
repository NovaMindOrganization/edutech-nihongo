import { cva } from 'class-variance-authority';

import { uiBase } from '@/components/ui/recipes';
import { cn } from '@/lib/utils';

const pressable =
  'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:shadow-pressed';

const brandedWhiteButton = cn(
  'border-2 border-brand bg-white text-brand shadow-premium',
  'hover:border-brand-hover hover:bg-white hover:text-brand-hover',
  pressable,
);

export const buttonVariants = cva(
  cn(
    'group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding text-center font-sans text-xs font-semibold leading-tight tracking-tight select-none',
    'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
    uiBase.interactive,
  ),
  {
    variants: {
      variant: {
        default: cn(
          'border-brand-hover/30 bg-brand text-white shadow-cta',
          'hover:bg-brand-hover hover:border-brand-hover hover:shadow-lg',
          pressable,
        ),
        brand: cn(
          'border-brand-hover/30 bg-brand text-white shadow-cta',
          'hover:bg-brand-hover hover:border-brand-hover',
          pressable,
        ),
        outline: brandedWhiteButton,
        secondary: brandedWhiteButton,
        ghost: cn(
          'border-transparent bg-transparent text-foreground shadow-none',
          'hover:border-border hover:bg-muted hover:shadow-sm',
          'active:scale-[0.98]',
        ),
        destructive: cn(
          'border-transparent bg-destructive text-white shadow-cta',
          'hover:brightness-110',
          pressable,
        ),
        link: 'border-transparent bg-transparent text-brand shadow-none underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        default:
          'h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: 'h-8 gap-1 rounded-md px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*="size-"])]:size-3',
        sm: 'h-9 gap-1.5 px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*="size-"])]:size-3.5',
        lg: 'h-11 gap-2 px-6 text-sm has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5',
        icon: 'size-10',
        'icon-xs': 'size-8 rounded-md [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-9',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
