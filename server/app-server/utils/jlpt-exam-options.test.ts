import { describe, expect, it } from 'vitest';

import { buildJlptExamQuestions } from './jlpt-exam-options.js';

describe('buildJlptExamQuestions', () => {
  it('builds 4 shuffled options from exam answer pool', () => {
    const questions = buildJlptExamQuestions([
      {
        id: 'q1',
        questionText: '「たべる」の意味は？',
        questionType: 'multiple_choice',
        correctAnswer: 'ăn',
        section: '文字語彙',
        audioUrl: null,
      },
      {
        id: 'q2',
        questionText: '「のむ」の意味は？',
        questionType: 'multiple_choice',
        correctAnswer: 'uống',
        section: '文字語彙',
        audioUrl: null,
      },
      {
        id: 'q3',
        questionText: '「みる」の意味は？',
        questionType: 'multiple_choice',
        correctAnswer: 'xem',
        section: '文字語彙',
        audioUrl: null,
      },
      {
        id: 'q4',
        questionText: '「いく」の意味は？',
        questionType: 'multiple_choice',
        correctAnswer: 'đi',
        section: '文字語彙',
        audioUrl: null,
      },
    ]);

    expect(questions).toHaveLength(4);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      const texts = q.options.map((o) => o.text);
      expect(new Set(texts).size).toBe(4);
      expect(texts).not.toContain('sai');
      expect(texts).not.toContain('わからない');
    }
  });
});
