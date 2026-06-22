import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, GraduationCap } from 'lucide-react';

import { HubLinkCard, HubLinkCardTag } from '@/components/usable/hub-link-card';
import { PageShell } from '@/components/usable/page-shell';
import { getDashboard } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

const kanjiAccents = ['bg-tertiary', 'bg-secondary', 'bg-quaternary', 'bg-brand-soft'] as const;

export function KanjiHubView() {
  const [enrollments, setEnrollments] = useState<
    Array<{ course: { id: string; title: string; jlptLevel: string } }>
  >([]);

  useEffect(() => {
    getDashboard()
      .then((d) => setEnrollments(d.enrollments))
      .catch(() => setEnrollments([]));
  }, []);

  return (
    <PageShell
      eyebrow="Học"
      title="Kanji"
      description="Học kanji theo khóa đang ghi danh hoặc sổ tay cá nhân."
      icon={GraduationCap}
      iconClassName="bg-tertiary"
      tone="quaternary"
      chips={['On · Kun', 'Bộ thủ', 'Stroke order', 'Sổ tay']}
      footer="Kanji theo khóa mở dần theo tiến độ bài học — sổ tay gom mục bạn tự thêm."
    >
      <div className="space-y-10">
        {enrollments.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight">Kanji theo khóa</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Kanji từ các tiết đã mở trong khóa bạn đang học.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {enrollments.map((e, index) => (
                <HubLinkCard
                  key={e.course.id}
                  to={paths.learn.kanjiCourse(e.course.id)}
                  icon={GraduationCap}
                  accent={kanjiAccents[index % kanjiAccents.length]}
                  title={`Kanji ${e.course.title}`}
                  description={`${e.course.jlptLevel} · Luyện nghĩa, âm đọc và nét viết`}
                  cta="Mở khóa kanji"
                  tag={<HubLinkCardTag label="Theo khóa" variant="enrolled" />}
                />
              ))}
            </div>
          </section>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm font-medium text-muted-foreground">
            <Link to={paths.learn.hub} className="font-extrabold text-primary hover:underline">
              Ghi danh khóa học
            </Link>{' '}
            để xem kanji theo lộ trình.
          </p>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Sổ tay kanji</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Kanji bạn tự thêm từ OCR hoặc khi học.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <HubLinkCard
              to={paths.student.notebookCollected('kanji')}
              icon={BookMarked}
              accent="bg-pink"
              title="Sổ tay kanji"
              description="Ôn nhanh nghĩa, âm đọc và bộ thủ từ sưu tập riêng"
              cta="Xem sổ tay"
              tag={<HubLinkCardTag label="Sưu tập" variant="available" />}
            />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
