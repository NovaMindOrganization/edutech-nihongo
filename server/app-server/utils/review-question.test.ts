import { describe, expect, it } from 'vitest';

import { toClientReviewQuestion } from './review-question.js';

describe('toClientReviewQuestion', () => {
  const question = {
    id: 'q1',
    questionText: '「たべる」の意味は？',
    questionType: 'mcq',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'Ăn',
  };

  it('omits correctAnswer', () => {
    const client = toClientReviewQuestion(question, 'lesson-1', 'weakness');
    expect(client).not.toHaveProperty('correctAnswer');
    expect(client.id).toBe('q1');
    expect(client.lessonId).toBe('lesson-1');
  });

  it('adds flashcard flag when mode is flashcard', () => {
    const client = toClientReviewQuestion(question, 'lesson-1', 'flashcard');
    expect(client.flashcard).toBe(true);
  });
});
