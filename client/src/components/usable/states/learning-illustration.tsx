import { cn } from '@/lib/utils';

/** Shared visual tone for empty / loading / error states. */
export type StateTone =
  | 'default'
  | 'courses'
  | 'vocabulary'
  | 'kanji'
  | 'grammar'
  | 'flashcards'
  | 'community'
  | 'admin'
  | 'exam'
  | 'speaking'
  | 'search'
  | 'error';

type LearningIllustrationProps = {
  tone?: StateTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'size-20',
  md: 'size-28',
  lg: 'size-36',
} as const;

const toneAccents: Record<StateTone, { ring: string; fill: string; ink: string; sticker: string }> = {
  default: { ring: 'bg-tertiary/50', fill: 'bg-primary/15', ink: 'text-primary', sticker: 'bg-secondary/70' },
  courses: { ring: 'bg-sky-200/80', fill: 'bg-primary/12', ink: 'text-primary', sticker: 'bg-quaternary/70' },
  vocabulary: { ring: 'bg-tertiary/60', fill: 'bg-tertiary/20', ink: 'text-tertiary', sticker: 'bg-secondary/60' },
  kanji: { ring: 'bg-amber-200/90', fill: 'bg-amber-100/80', ink: 'text-amber-800', sticker: 'bg-red-100/90' },
  grammar: { ring: 'bg-primary/25', fill: 'bg-primary/10', ink: 'text-primary', sticker: 'bg-brand-muted' },
  flashcards: { ring: 'bg-quaternary/50', fill: 'bg-quaternary/20', ink: 'text-foreground/70', sticker: 'bg-tertiary/60' },
  community: { ring: 'bg-secondary/60', fill: 'bg-secondary/25', ink: 'text-primary', sticker: 'bg-quaternary/70' },
  admin: { ring: 'bg-muted', fill: 'bg-muted/80', ink: 'text-muted-foreground', sticker: 'bg-tertiary/50' },
  exam: { ring: 'bg-primary/30', fill: 'bg-primary/10', ink: 'text-primary', sticker: 'bg-secondary/60' },
  speaking: { ring: 'bg-sky-200/70', fill: 'bg-sky-100/60', ink: 'text-sky-800', sticker: 'bg-quaternary/60' },
  search: { ring: 'bg-primary/20', fill: 'bg-primary/8', ink: 'text-primary/80', sticker: 'bg-tertiary/50' },
  error: { ring: 'bg-destructive/15', fill: 'bg-destructive/8', ink: 'text-destructive', sticker: 'bg-secondary/50' },
};

function IllustrationSvg({ tone }: { tone: StateTone }) {
  const { ring, fill, ink } = toneAccents[tone];
  const fillCls = cn('stroke-ink', fill);
  const inkCls = cn('fill-current stroke-current', ink);

  switch (tone) {
    case 'kanji':
      return (
        <>
          <rect x="34" y="28" width="52" height="64" rx="8" className={fillCls} strokeWidth="2" />
          <text x="60" y="74" textAnchor="middle" className={cn('font-jp text-[28px] font-bold', inkCls)}>漢</text>
          <path d="M78 88 L88 98 M88 88 L78 98" className={inkCls} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    case 'vocabulary':
    case 'flashcards':
      return (
        <>
          <rect x="28" y="36" width="48" height="56" rx="8" className={fillCls} strokeWidth="2" transform="rotate(-8 52 64)" />
          <rect x="36" y="30" width="48" height="56" rx="8" className="fill-surface-paper stroke-ink" strokeWidth="2" />
          <text x="60" y="66" textAnchor="middle" className={cn('font-jp text-xl font-semibold', inkCls)}>あ</text>
          <circle cx="82" cy="34" r="6" className={cn('stroke-ink', ring)} strokeWidth="2" />
        </>
      );
    case 'grammar':
      return (
        <>
          <path d="M30 38 C30 30 38 26 60 26 C82 26 90 30 90 38 V78 C90 86 82 90 60 90 C38 90 30 86 30 78 Z" className={fillCls} strokeWidth="2" />
          <path d="M42 44 H78 M42 56 H72 M42 68 H66" className={inkCls} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
        </>
      );
    case 'courses':
      return (
        <>
          <path d="M24 82 H96" className={cn('stroke-ink', ring)} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 82 V52 L60 38 L84 52 V82" className={fillCls} strokeWidth="2" strokeLinejoin="round" fill="currentColor" />
          <rect x="50" y="58" width="20" height="24" rx="3" className={cn('stroke-ink', ring)} strokeWidth="2" />
        </>
      );
    case 'community':
      return (
        <>
          <rect x="22" y="40" width="44" height="30" rx="12" className={fillCls} strokeWidth="2" />
          <text x="44" y="60" textAnchor="middle" className={cn('font-jp text-sm font-semibold', inkCls)}>は</text>
          <rect x="54" y="50" width="44" height="30" rx="12" className="fill-surface-paper stroke-ink" strokeWidth="2" />
          <text x="76" y="70" textAnchor="middle" className={cn('font-jp text-sm font-semibold', inkCls)}>こ</text>
        </>
      );
    case 'admin':
      return (
        <>
          <rect x="26" y="32" width="68" height="56" rx="8" className={fillCls} strokeWidth="2" />
          <path d="M26 48 H94 M46 32 V88 M66 32 V88" className={cn('stroke-ink', ring)} strokeWidth="2" />
          <circle cx="36" cy="40" r="4" className={inkCls} />
        </>
      );
    case 'error':
      return (
        <>
          <circle cx="60" cy="56" r="36" className={cn('stroke-ink', fill)} strokeWidth="2" />
          <path d="M44 44 L76 76 M76 44 L44 76" className={inkCls} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      );
    default:
      return (
        <>
          <circle cx="60" cy="60" r="44" className={cn('stroke-ink', ring)} strokeWidth="2" />
          <rect x="44" y="52" width="32" height="24" rx="6" className="fill-surface-paper stroke-ink" strokeWidth="2" />
          <text x="60" y="70" textAnchor="middle" className={cn('font-jp text-base font-semibold', inkCls)}>学</text>
        </>
      );
  }
}

/** Playful Geometric SVG sticker — decorative, aria-hidden. */
export function LearningIllustration({
  tone = 'default',
  size = 'md',
  className,
}: LearningIllustrationProps) {
  const accent = toneAccents[tone];

  return (
    <div
      aria-hidden
      className={cn('relative mx-auto shrink-0', sizes[size], className)}
    >
      <div
        className={cn(
          'absolute -right-1 -top-1 size-5 rotate-12 rounded-lg border border-border shadow-premium',
          accent.sticker,
        )}
      />
      <div
        className={cn(
          'relative flex size-full items-center justify-center rounded-xl border border-border bg-surface-paper p-2 shadow-premium',
        )}
      >
        <svg viewBox="0 0 120 120" className="size-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <IllustrationSvg tone={tone} />
        </svg>
      </div>
    </div>
  );
}
