import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import {
  startPlacementTest,
  submitPlacementTest,
  type ApiQuestion,
} from '@/features/student/services/studentApi';
import { useAuthStore } from '@/features/auth';
import { isStaffRole } from '@/features/auth/utils/auth-routes';
import { paths } from '@/router/paths';

export function PlacementTestView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<{ recommendedLevel: string } | null>(null);

  useEffect(() => {
    startPlacementTest()
      .then(setQuestions)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải placement test'));
  }, []);

  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;

  async function handleFinish() {
    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? '',
      }));
      const data = await submitPlacementTest(payload);
      setResult({ recommendedLevel: data.recommendedLevel });
      setResultOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nộp bài thất bại');
    } finally {
      setLoading(false);
    }
  }

  function pickOption(text: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: text }));
  }

  function next() {
    if (index < questions.length - 1) setIndex((i) => i + 1);
    else handleFinish();
  }

  if (questions.length === 0) {
    return <p className="text-muted-foreground">Đang tải câu hỏi...</p>;
  }

  if (!current) return null;

  const opts = (current.options as Array<{ label: string; text: string }> | null) ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-display text-sm tracking-widest text-primary uppercase">Placement Test</p>
      <h1 className="font-display mt-2 text-3xl font-bold">Xác định trình độ JLPT</h1>
      <p className="mt-2 text-muted-foreground">
        Câu {index + 1}/{questions.length}
        {user ? ` — ${user.email}` : ' — không cần đăng nhập'}
      </p>

      <motion.div key={current.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <CardTitle className="font-jp text-xl">{current.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {opts.map((opt) => (
              <Button
                key={opt.label}
                type="button"
                variant={selected === opt.text ? 'default' : 'outline'}
                className="h-auto justify-start py-3 text-left"
                onClick={() => pickOption(opt.text)}
              >
                {opt.label}: {opt.text}
              </Button>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-6 flex justify-between gap-3">
        <Button variant="ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Quay lại
        </Button>
        <Button disabled={!selected || loading} onClick={next}>
          {index < questions.length - 1 ? 'Tiếp' : loading ? 'Đang chấm...' : 'Hoàn thành'}
        </Button>
      </div>

      <p className="mt-8 text-center text-sm">
        {user ? (
          <>
            {isStaffRole(user.role) && (
              <Link to={paths.admin.dashboard} className="mr-4 text-primary hover:underline">
                ← Quản trị
              </Link>
            )}
            <Link to={paths.learn.hub} className="text-primary hover:underline">
              Vào lộ trình học (kết quả gắn tài khoản hiện tại)
            </Link>
          </>
        ) : (
          <>
            <Link to={paths.login} state={{ returnTo: paths.placementTest }} className="text-primary hover:underline">
              Đăng nhập để lưu kết quả
            </Link>
            {' · '}
            <Link to={paths.register} className="text-primary hover:underline">
              Đăng ký
            </Link>
          </>
        )}
      </p>

      <Dialog open={resultOpen} onOpenChange={setResultOpen} title="Kết quả Placement">
        {result && (
          <div className="space-y-4">
            <p className="font-display text-2xl font-bold text-primary">{result.recommendedLevel}</p>
            <p className="text-sm text-muted-foreground">Gợi ý lộ trình bắt đầu</p>
            <Button
              className="w-full"
              onClick={() => {
                setResultOpen(false);
                navigate(paths.learn.hub);
              }}
            >
              Xem khóa học
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
