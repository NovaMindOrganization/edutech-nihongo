import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import {
  getLesson,
  getMiniTest,
  submitMiniTest,
  type ApiQuestion,
} from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

export function MiniTestView() {
  const { lessonId = '' } = useParams();
  const [title, setTitle] = useState('');
  const [passThreshold, setPassThreshold] = useState(70);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    getLesson(lessonId)
      .then((d) => {
        setTitle(d.lesson.title);
        setPassThreshold(d.lesson.passThreshold);
      })
      .catch(() => {});

    getMiniTest(lessonId)
      .then(setQuestions)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải MiniTest'));
  }, [lessonId]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      const data = await submitMiniTest(lessonId, payload);
      setResult({ score: data.score, passed: data.passed });
      setResultOpen(true);
      if (data.passed) toast.success('Vượt MiniTest — bài tiếp theo đã mở');
      else toast.error(`Chưa đạt — cần ≥ ${data.passThreshold}%`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={paths.learn.lesson(lessonId)} className="text-sm text-primary hover:underline">
        ← Bài học
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">MiniTest: {title || '...'}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ngưỡng đạt: {passThreshold}%</p>

      <div className="mt-8 space-y-4">
        {questions.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-jp">{q.questionText}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {(q.options as Array<{ label: string; text: string }> | null)?.map((opt) => (
                  <Button
                    key={opt.label}
                    type="button"
                    variant={answers[q.id] === opt.text ? 'default' : 'outline'}
                    className="h-auto justify-start py-2"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.text }))}
                  >
                    {opt.label}: {opt.text}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        className="mt-8 w-full"
        disabled={Object.keys(answers).length < questions.length || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Đang nộp...' : 'Nộp bài'}
      </Button>

      <Dialog open={resultOpen} onOpenChange={setResultOpen} title="Kết quả MiniTest">
        {result && (
          <div className="space-y-3">
            <p className="font-display text-3xl font-bold text-primary">{result.score}%</p>
            <p className="text-sm">{result.passed ? 'Đạt — tiếp tục bài sau' : 'Chưa đạt — ôn lại và thử lại'}</p>
            <Link to={paths.learn.lesson(lessonId)}>
              <Button className="w-full" variant={result.passed ? 'default' : 'outline'}>
                Về bài học
              </Button>
            </Link>
          </div>
        )}
      </Dialog>
    </div>
  );
}
