import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startJlptSim, submitJlptSim, type ApiQuestion } from '@/features/student/services/studentApi';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export function JlptSimView() {
  const [level, setLevel] = useState('N5');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const data = await startJlptSim(level);
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers({});
      toast.success(`Bắt đầu thi — ${data.durationMinutes} phút`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không bắt đầu được');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const payload = questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? '' }));
      const data = await submitJlptSim(sessionId, payload);
      toast.success(`Điểm: ${JSON.stringify(data.score)}`);
      setSessionId(null);
      setQuestions([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">JLPT Simulator</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Button key={l} variant={level === l ? 'default' : 'outline'} onClick={() => setLevel(l)}>
            {l}
          </Button>
        ))}
      </div>
      {!sessionId ? (
        <Button className="mt-6" disabled={loading} onClick={handleStart}>
          Bắt đầu thi
        </Button>
      ) : (
        <div className="mt-6 space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-sm font-jp">{q.questionText}</CardTitle>
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
          ))}
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            Nộp bài
          </Button>
        </div>
      )}
    </div>
  );
}
