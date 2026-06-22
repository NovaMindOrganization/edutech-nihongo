export type McqExamQuestion = {
  id: string;
  questionText: string;
  options?: Array<{ label: string; text: string }> | null;
  section?: string | null;
  questionCategory?: string | null;
};

const SECTION_LABELS: Record<string, string> = {
  mini_test_vocab: 'Từ vựng',
  mini_test_vocab_phrase: 'Cụm từ',
  mini_test_kanji: 'Kanji',
};

function normalizeSectionKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function sectionLabelForQuestion(q: McqExamQuestion): string {
  const raw = q.section?.trim() || q.questionCategory?.trim();
  if (!raw) return 'Tổng hợp';
  return SECTION_LABELS[normalizeSectionKey(raw)] ?? raw;
}

export function groupQuestionsBySection(questions: McqExamQuestion[]) {
  const map = new Map<string, McqExamQuestion[]>();
  for (const q of questions) {
    const key = sectionLabelForQuestion(q);
    const list = map.get(key) ?? [];
    list.push(q);
    map.set(key, list);
  }
  return [...map.entries()];
}

export function questionDomId(prefix: string, index: number) {
  return `${prefix}-q-${index + 1}`;
}

export const EXAM_ROOT = 'flex h-full min-h-0 w-full flex-col';
