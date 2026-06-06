export type McqOption = { label: string; text: string };

export const MCQ_LABELS = ["A", "B", "C", "D", "E", "F"] as const;

/** Fisher–Yates shuffle (copy). */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Cụm từ/câu dài — dùng đáp án nhiễu tiếng Nhật cùng độ dài. */
export function isLongJapanesePhrase(text: string): boolean {
  const t = text.trim();
  if (t.length >= 12) return true;
  return /[はがをにでへともの]/.test(t);
}

/** Số câu tối thiểu = ít nhất một nửa (làm tròn lên). */
export function minHalfCount(total: number): number {
  if (total <= 0) return 0;
  return Math.max(1, Math.ceil(total / 2));
}

/**
 * Chọn distractor có độ dài gần với mục tiêu (phù hợp câu/ cụm dài).
 * Ưu tiên cùng lesson, sau đó bổ sung từ pool rộng hơn.
 */
export function pickLengthSimilarDistractors(
  candidates: string[],
  correct: string,
  needed: number,
  targetLength?: number,
): string[] {
  const correctTrim = correct.trim();
  const len = targetLength ?? correctTrim.length;
  const unique = [
    ...new Set(
      candidates.map((c) => c.trim()).filter((c) => c.length > 0 && c !== correctTrim),
    ),
  ];

  const buckets = new Map<number, string[]>();
  for (const item of unique) {
    const distance = Math.abs(item.length - len);
    const list = buckets.get(distance) ?? [];
    list.push(item);
    buckets.set(distance, list);
  }

  const picked: string[] = [];
  for (const distance of [...buckets.keys()].sort((a, b) => a - b)) {
    for (const item of shuffle(buckets.get(distance)!)) {
      if (picked.length >= needed) break;
      if (!picked.includes(item)) picked.push(item);
    }
    if (picked.length >= needed) break;
  }

  return picked;
}

/**
 * Tạo options trắc nghiệm: 1 đáp án đúng + distractors, xáo label A..N.
 * `correctAnswer` là **text** đúng (minitest so khớp theo text).
 */
export function buildMcqOptions(params: {
  correctAnswer: string;
  distractorPool: string[];
  optionCount?: number;
  /** Gợi ý độ dài distractor (câu dài). */
  targetLength?: number;
}): { options: McqOption[]; correctAnswer: string } {
  const optionCount = Math.min(
    Math.max(params.optionCount ?? 4, 2),
    MCQ_LABELS.length,
  );
  const correct = params.correctAnswer.trim();
  const neededDistractors = optionCount - 1;

  const fromPool = pickLengthSimilarDistractors(
    params.distractorPool,
    correct,
    neededDistractors * 4,
    params.targetLength,
  );

  const distractors: string[] = [];
  for (const candidate of shuffle(fromPool)) {
    if (distractors.length >= neededDistractors) break;
    if (!distractors.includes(candidate)) distractors.push(candidate);
  }

  let fallbackIdx = 1;
  while (distractors.length < neededDistractors) {
    distractors.push(`Đáp án sai ${fallbackIdx}`);
    fallbackIdx += 1;
  }

  const shuffledTexts = shuffle([correct, ...distractors.slice(0, neededDistractors)]);
  const options: McqOption[] = shuffledTexts.map((text, index) => ({
    label: MCQ_LABELS[index],
    text,
  }));

  return { options, correctAnswer: correct };
}

/** @deprecated alias */
export function buildMeaningMcqOptions(params: {
  correctMeaning: string;
  distractorPool: string[];
  optionCount?: number;
}): { options: McqOption[]; correctAnswer: string } {
  return buildMcqOptions({
    correctAnswer: params.correctMeaning,
    distractorPool: params.distractorPool,
    optionCount: params.optionCount,
  });
}
