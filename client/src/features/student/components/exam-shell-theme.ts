/** Class chrome dùng chung cho JLPT / MiniTest / Placement — màu primary hệ thống. */
export const examChrome = {
  header: 'border-b border-primary/20 bg-primary text-primary-foreground',
  footer: 'border-t border-primary/20 bg-primary text-primary-foreground',
  eyebrow: 'text-primary-foreground/70',
  fg: 'text-primary-foreground',
  fgMuted: 'text-primary-foreground/80',
  fgSoft: 'text-primary-foreground/90',
  btnSolid:
    'rounded-md bg-primary text-primary-foreground transition-colors hover:opacity-90',
  btnOnChrome:
    'rounded-md border border-primary-foreground bg-primary-foreground text-primary transition-colors hover:opacity-90',
  btnOnChromeDisabled:
    'cursor-not-allowed border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground/50',
  timer: 'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground',
} as const;
