import {
  BookMarked,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  Languages,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { HubLinkCard } from '@/components/usable/hub-link-card';
import { EmptyState, emptyStatePresets } from '@/components/usable/states';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import {
  NOTEBOOK_POOLS,
  NOTEBOOK_TYPES,
  POOL_LABELS,
  POOL_TAGLINES,
  TYPE_LABELS,
  type NotebookPool,
  type NotebookType,
} from './notebook-types';

export const POOL_CARD_META: Record<
  NotebookPool,
  { icon: LucideIcon; accent: string }
> = {
  learned: {
    icon: GraduationCap,
    accent: 'bg-brand-light',
  },
  collected: {
    icon: BookMarked,
    accent: 'bg-pink',
  },
};

export const TYPE_META: Record<
  NotebookType,
  { icon: LucideIcon; accent: string; emptyTone: 'kanji' | 'vocabulary' | 'grammar' }
> = {
  kanji: { icon: Languages, accent: 'bg-amber-200 text-amber-950', emptyTone: 'kanji' },
  vocabulary: { icon: BookOpen, accent: 'bg-brand-soft text-brand', emptyTone: 'vocabulary' },
  grammar: { icon: FileText, accent: 'bg-secondary/30 text-secondary-foreground', emptyTone: 'grammar' },
};

export function NotebookPoolHub() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {NOTEBOOK_POOLS.map((p) => {
        const meta = POOL_CARD_META[p];
        return (
          <HubLinkCard
            key={p}
            to={paths.student.notebookPool(p)}
            icon={meta.icon}
            accent={meta.accent}
            title={POOL_LABELS[p]}
            description={POOL_TAGLINES[p]}
            cta="Xem sổ tay"
          />
        );
      })}
    </div>
  );
}

type NotebookTypeTabsProps = {
  type: NotebookType;
  onTypeChange: (type: NotebookType) => void;
};

export function NotebookTypeTabs({ type, onTypeChange }: NotebookTypeTabsProps) {
  return (
    <nav
      className="flex flex-wrap rounded-lg border border-border bg-surface-paper p-1 shadow-premium card-lift"
      aria-label="Loại nội dung sổ tay"
    >
      {NOTEBOOK_TYPES.map((t) => {
        const Icon = TYPE_META[t].icon;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onTypeChange(t)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors',
              type === t
                ? 'bg-brand text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {TYPE_LABELS[t]}
          </button>
        );
      })}
    </nav>
  );
}

/** @deprecated Use NotebookPoolHub + NotebookTypeTabs */
type NotebookNavProps = {
  pool: NotebookPool;
  type: NotebookType;
  onPoolChange: (pool: NotebookPool) => void;
  onTypeChange: (type: NotebookType) => void;
};

export function NotebookNav({
  type,
  onTypeChange,
}: NotebookNavProps) {
  return (
    <div className="space-y-4">
      <NotebookPoolHub />
      <NotebookTypeTabs type={type} onTypeChange={onTypeChange} />
    </div>
  );
}

type NotebookSearchToolbarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  total: number;
  filtered: number;
  pool: NotebookPool;
  trailing?: ReactNode;
  hideSearch?: boolean;
};

export function NotebookSearchToolbar({
  value,
  onChange,
  placeholder,
  total,
  filtered,
  pool,
  trailing,
  hideSearch = false,
}: NotebookSearchToolbarProps) {
  const showingFiltered = value.trim().length > 0 && filtered !== total;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {!hideSearch && (
        <div className="relative min-w-0 max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-11 rounded-xl border-border bg-surface-paper pl-10 shadow-sm"
          />
        </div>
      )}
      <div
        className={cn(
          'flex flex-wrap items-center gap-3',
          hideSearch ? 'w-full justify-end' : 'shrink-0 sm:justify-end',
        )}
      >
        {!hideSearch && (
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {showingFiltered ? `${filtered} / ${total}` : `${total}`} mục
            {pool === 'collected' ? ' · sưu tập' : ' · lộ trình'}
          </p>
        )}
        {trailing}
      </div>
    </div>
  );
}

export function NotebookEmptyState({
  pool,
  type,
}: {
  pool: NotebookPool;
  type: NotebookType;
}) {
  if (pool === 'collected' && type === 'grammar') {
    return (
      <EmptyState
        tone="grammar"
        title="Ngữ pháp tự thêm sắp ra mắt"
        description="Hiện tại bạn vẫn có thể ôn ngữ pháp trong Lộ trình học. Sưu tập riêng sẽ được bổ sung sau."
        size="lg"
      />
    );
  }

  const preset = emptyStatePresets[TYPE_META[type].emptyTone];

  if (pool === 'collected') {
    return (
      <EmptyState
        tone={preset.tone}
        title="Sưu tập đang trống"
        description="Quét văn bản bằng OCR hoặc đánh dấu yêu thích khi học để gom mục vào đây."
        size="lg"
        action={
          <Link
            to={paths.student.ocr}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-brand px-4 text-sm font-extrabold text-primary-foreground shadow-premium card-lift"
          >
            <Sparkles className="mr-2 size-4" />
            Mở OCR
          </Link>
        }
      />
    );
  }

  return (
    <EmptyState
      tone={preset.tone}
      title={preset.title}
      description={
        type === 'grammar'
          ? 'Hoàn thành thêm bài học để thấy mẫu ngữ pháp từ lộ trình của bạn.'
          : 'Mở khóa và học thêm bài — nội dung sẽ xuất hiện tại đây để bạn xem và ôn tập.'
      }
      size="lg"
      action={
        <Link
          to={paths.learn.hub}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface-paper px-4 text-sm font-extrabold shadow-premium card-lift"
        >
          Khám phá khóa học
        </Link>
      }
    />
  );
}

export function NotebookKanjiCard({
  character,
  meaning,
  jlptLevel,
  hanViet,
  readingsOn,
  readingsKun,
  selected,
  selectable,
  onToggleSelect,
  favorite,
  onToggleFavorite,
  note,
}: {
  character: string;
  meaning: string;
  jlptLevel: string;
  hanViet?: string | null;
  readingsOn?: string[];
  readingsKun?: string[];
  selected?: boolean;
  selectable?: boolean;
  onToggleSelect?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  note?: string | null;
}) {
  const onReading = readingsOn?.[0];
  const kunReading = readingsKun?.[0];

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <Badge className="bg-amber-200 text-amber-950">{jlptLevel}</Badge>
        {selectable && (
          <span
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-lg border-2 transition-colors',
              selected
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-background text-transparent',
            )}
          >
            <Check className="size-3.5 stroke-[3]" />
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center text-center">
        <span className="font-jp text-5xl font-black leading-none text-foreground sm:text-6xl">
          {character}
        </span>
        {hanViet && (
          <span className="mt-2 font-display text-sm font-extrabold text-muted-foreground">
            {hanViet}
          </span>
        )}
        <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-foreground/85">
          {meaning}
        </p>
      </div>

      {(onReading || kunReading) && (
        <div className="mt-4 grid gap-2 text-xs font-bold">
          {onReading && (
            <div className="rounded-xl border border-dashed border-border bg-red-50/80 px-3 py-2 text-red-900/80">
              On: <span className="font-jp text-red-700">{onReading}</span>
            </div>
          )}
          {kunReading && (
            <div className="rounded-xl border border-dashed border-border bg-blue-50/80 px-3 py-2 text-blue-900/80">
              Kun: <span className="font-jp text-blue-700">{kunReading}</span>
            </div>
          )}
        </div>
      )}

      {note && (
        <p className="mt-3 rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
          {note}
        </p>
      )}
    </>
  );

  const className = cn(
    'relative flex h-full flex-col rounded-2xl border border-border bg-surface-paper p-4 shadow-premium transition-all duration-200',
    'hover:-translate-y-0.5 hover:shadow-premium-hover',
    selected && 'border-brand ring-2 ring-brand/25 ring-offset-2',
  );

  if (selectable) {
    return (
      <button type="button" onClick={onToggleSelect} className={cn(className, 'text-left')}>
        {body}
        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }
            }}
            className={cn(
              'absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background shadow-sm transition-colors',
              favorite && 'border-brand bg-brand text-white',
            )}
            aria-label={favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Star className={cn('size-4', favorite && 'fill-current')} />
          </span>
        )}
      </button>
    );
  }

  return <article className={className}>{body}</article>;
}

export function NotebookVocabCard({
  word,
  reading,
  meaning,
  jlptLevel,
  selected,
  selectable,
  onToggleSelect,
  favorite,
  onToggleFavorite,
}: {
  word: string;
  reading?: string | null;
  meaning: string;
  jlptLevel?: string | null;
  selected?: boolean;
  selectable?: boolean;
  onToggleSelect?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const primary = reading ?? word;
  const kanjiLine = reading ? word : null;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {jlptLevel && <Badge className="bg-brand-soft text-brand">{jlptLevel}</Badge>}
        </div>
        {selectable && (
          <span
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-lg border-2 transition-colors',
              selected
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-background text-transparent',
            )}
          >
            <Check className="size-3.5 stroke-[3]" />
          </span>
        )}
      </div>

      <div className="mt-4 min-w-0">
        <p className="font-jp truncate text-2xl font-bold text-foreground sm:text-3xl">{primary}</p>
        {kanjiLine && (
          <p className="mt-1 truncate font-jp text-base font-medium text-muted-foreground">
            {kanjiLine}
          </p>
        )}
        <p className="mt-3 text-base font-bold leading-snug text-foreground">{meaning}</p>
      </div>
    </>
  );

  const className = cn(
    'relative flex h-full flex-col rounded-2xl border border-border bg-surface-paper p-4 shadow-premium transition-all duration-200',
    'hover:-translate-y-0.5 hover:shadow-premium-hover',
    selected && 'border-brand ring-2 ring-brand/25 ring-offset-2',
  );

  if (selectable) {
    return (
      <button type="button" onClick={onToggleSelect} className={cn(className, 'text-left')}>
        {body}
        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }
            }}
            className={cn(
              'absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background shadow-sm transition-colors',
              favorite && 'border-brand bg-brand text-white',
            )}
            aria-label={favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          >
            <Star className={cn('size-4', favorite && 'fill-current')} />
          </span>
        )}
      </button>
    );
  }

  return <article className={className}>{body}</article>;
}

export function NotebookGrammarCard({
  pattern,
  meaningVi,
  title,
  jlpt,
}: {
  pattern: string;
  meaningVi: string;
  title?: string | null;
  jlpt?: string | null;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface-paper p-4 shadow-premium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium-hover">
      <div className="flex flex-wrap gap-2">
        {jlpt && <Badge className="bg-secondary/30 text-secondary-foreground">{jlpt}</Badge>}
      </div>
      {title && (
        <p className="mt-3 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <p className="mt-2 font-jp text-xl font-bold leading-relaxed text-foreground sm:text-2xl">
        {pattern}
      </p>
      <p className="mt-3 flex-1 text-sm font-semibold leading-7 text-foreground/90">{meaningVi}</p>
    </article>
  );
}
