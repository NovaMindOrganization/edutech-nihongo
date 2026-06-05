import type { ImportQuestionBody } from '../services/adminApi';

function resolveCorrectAnswer(
  ans: string,
  options: Array<{ label: string; text: string }>,
): string {
  const trimmed = ans.trim();
  const byLabel = options.find(
    (o) => o.label.toUpperCase() === trimmed.toUpperCase(),
  );
  if (byLabel) return byLabel.text;
  const byText = options.find((o) => o.text.trim() === trimmed);
  return byText?.text ?? trimmed;
}

function parseBlock(lines: string[]): ImportQuestionBody | null {
  const data: Record<string, string> = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z]{2,4}|Q):\s*(.*)$/i);
    if (!m) continue;
    data[m[1].toUpperCase()] = m[2].trim();
  }
  if (!data.Q) return null;

  const options: Array<{ label: string; text: string }> = [];
  for (const label of ['A', 'B', 'C', 'D']) {
    if (data[label]) options.push({ label, text: data[label] });
  }
  if (options.length < 2) return null;

  const ans = data.ANS ?? data.ANSWER ?? '';
  if (!ans) return null;

  return {
    questionText: data.Q,
    options,
    correctAnswer: resolveCorrectAnswer(ans, options),
    explanation: data.EXP || data.EXPLANATION,
    questionCategory: data.CAT || data.CATEGORY,
    section: data.CAT || data.SECTION || data.CATEGORY,
    questionType: 'multiple_choice',
  };
}

export function parseJlptImportText(raw: string): ImportQuestionBody[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as ImportQuestionBody[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through to text parser */
    }
  }

  const blocks = trimmed.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const results: ImportQuestionBody[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const item = parseBlock(lines);
    if (item) results.push(item);
  }

  return results;
}
