import { EmptyState, type EmptyStateProps } from '@/components/usable/states/empty-state';

/** Compact empty state for tables, panels, and inset regions. */
export function InsetEmpty(props: Omit<EmptyStateProps, 'embedded' | 'size'>) {
  return <EmptyState embedded size="sm" {...props} />;
}
