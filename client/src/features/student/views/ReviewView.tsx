import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateReview, submitReview, type ApiQuestion } from '@/features/student/services/studentApi';

export function ReviewView() {
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function load(mode: 'random' | 'weakness' | 'flashcard') {
    setLoading(true);
    try {
      const data = await generateReview(mode, 10);
      setQuestions(data.questions);
      setIndex(0);
      setAnswers({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tạo quiz');
    } finally {
      setLoading(false);
    }
  }

  const q = questions[index];

  async function finish() {
    const results = questions.map((item) => ({
      questionId: item.id,
      correct: answers[item.id] === (item as ApiQuestion & { correctAnswer?: string }).correctAnswer,
      answer: answers[item.id],
    }));
    try {
      await submitReview(results);
      toast.success('Đã lưu kết quả ôn tập');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold">Ôn tập</h1>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" disabled={loading} onClick={() => load('random')}>
          Random
        </Button>
        <Button variant="outline" disabled={loading} onClick={() => load('weakness')}>
          Weakness
        </Button>
        <Button variant="outline" disabled={loading} onClick={() => load('flashcard')}>
          Flashcard
        </Button>
      </div>

      {q && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-jp text-base">{q.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {((q.options as Array<{ label: string; text: string }>) ?? []).map((opt) => (
              <Button
                key={opt.label}
                variant={answers[q.id] === opt.text ? 'default' : 'outline'}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.text }))}
              >
                {opt.text}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="mt-6 flex justify-between">
          <Button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            Trước
          </Button>
          {index < questions.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>Sau</Button>
          ) : (
            <Button onClick={finish}>Hoàn thành</Button>
          )}
        </div>
      )}
    </div>
  );
}
