/** Class name helper for Tailwind (extend with clsx + tailwind-merge if you add them). */
export type ClassValue = string | undefined | null | false;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
