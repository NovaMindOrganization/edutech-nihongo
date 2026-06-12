import { buildMcqOptions, shuffle, type McqOption } from './minitest-options.js';

export type JlptQuestionSource = {
  id: string;
  questionText: string;
  questionType: string;
  correctAnswer: string;
  section: string | null;
  audioUrl: string | null;
};

export type JlptExamQuestionPayload = {
  id: string;
  questionText: string;
  questionType: string;
  options: McqOption[];
  section: string | null;
  audioUrl: string | null;
};

/**
 * Xáo 4 đáp án trắc nghiệm từ kho đáp án đúng của đề (và pool bổ sung cùng cấp JLPT).
 */
export function buildJlptExamQuestions(
  questions: JlptQuestionSource[],
  extraAnswers: string[] = [],
  optionCount = 4,
): JlptExamQuestionPayload[] {
  const answerPool = [
    ...new Set(
      [
        ...questions.map((q) => q.correctAnswer.trim()),
        ...extraAnswers.map((a) => a.trim()),
      ].filter(Boolean),
    ),
  ];

  const prepared = questions.map((q) => {
    const correct = q.correctAnswer.trim();
    const { options } = buildMcqOptions({
      correctAnswer: correct,
      distractorPool: answerPool.filter((a) => a !== correct),
      optionCount,
    });

    return {
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options,
      section: q.section,
      audioUrl: q.audioUrl,
    };
  });

  return shuffle(prepared);
}
