/** Client-safe review question — never expose correctAnswer before submit. */
export function toClientReviewQuestion(
  question: {
    id: string;
    questionText: string;
    questionType: string;
    options: unknown;
    correctAnswer: string;
  },
  lessonId: string,
  mode: 'random' | 'weakness' | 'flashcard',
) {
  return {
    id: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    options: question.options,
    lessonId,
    ...(mode === 'flashcard' ? { flashcard: true as const } : {}),
  };
}
