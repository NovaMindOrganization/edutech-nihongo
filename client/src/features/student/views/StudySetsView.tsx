import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { paths } from '@/router/paths';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  createStudySet,
  listMyStudySets,
  listPublicStudySets,
  type StudySetRow,
} from '@/features/student/services/studentApi';

export function StudySetsView() {
  const [mine, setMine] = useState<StudySetRow[]>([]);
  const [pub, setPub] = useState<StudySetRow[]>([]);

  useEffect(() => {
    listMyStudySets().then(setMine).catch(() => {});
    listPublicStudySets().then(setPub).catch(() => {});
  }, []);

  async function handleCreate() {
    try {
      await createStudySet({
        title: 'Bộ mới',
        cards: [{ front: 'こんにちは', back: 'Xin chào' }],
      });
      toast.success('Đã tạo study set');
      listMyStudySets().then(setMine);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={paths.student.community} className="text-sm text-primary hover:underline">
        ← Cộng đồng
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Study sets</h1>
        <Button onClick={handleCreate}>Tạo bộ mới</Button>
      </div>
      <h2 className="mt-8 font-medium">Của tôi</h2>
      <Card className="mt-2">
        <CardContent className="p-4">
          {mine.map((s) => (
            <p key={s.id} className="py-1 text-sm">
              {s.title}
            </p>
          ))}
        </CardContent>
      </Card>
      <h2 className="mt-6 font-medium">Cộng đồng (đã kiểm duyệt)</h2>
      <Card className="mt-2">
        <CardContent className="p-4">
          {pub.map((s) => (
            <p key={s.id} className="py-1 text-sm">
              {s.title}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
