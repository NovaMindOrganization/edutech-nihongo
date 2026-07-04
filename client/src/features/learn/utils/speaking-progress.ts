export function speakingScoreSegmentClass(score: number | null | undefined): string {
  if (score == null) return 'bg-muted';
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 70) return 'bg-emerald-300';
  if (score >= 50) return 'bg-pink-400';
  return 'bg-red-500';
}

export const SPEAKING_PASS_SCORE = 80;
