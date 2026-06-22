import { Brain, Copy, Layers, LibraryBig, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import {
  groupItemsByType,
  StudySetContentPanel,
} from '../components/study-set-content-panels';
import { StudySetFlashcard } from '../components/study-set-flashcard';
import { StudySetQuiz } from '../components/study-set-quiz';
import { StudySetTypeBadges } from '../components/study-set-type-badges';
import {
  cloneStudySet,
  getStudySet,
  studySetAssetUrl,
} from '../services/studySetApi';
import {
  STUDY_SET_CONTENT_LABELS,
  type StudySetContentType,
  type StudySetDetail,
} from '../types/study-set.types';

function StudySetContentTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: StudySetContentType[];
  activeTab: StudySetContentType | null;
  onChange: (tab: StudySetContentType) => void;
}) {
  if (tabs.length === 0) return null;

  return (
    <nav
      className="flex flex-wrap rounded-lg border border-border bg-surface-paper p-1 shadow-premium card-lift"
      aria-label="Loại nội dung study set"
    >
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors',
            activeTab === t
              ? 'bg-brand text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {STUDY_SET_CONTENT_LABELS[t]}
        </button>
      ))}
    </nav>
  );
}

export function StudySetDetailView() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<StudySetDetail | null>(null);
  const [activeTab, setActiveTab] = useState<StudySetContentType | null>(null);
  const [flashcard, setFlashcard] = useState(false);
  const [quiz, setQuiz] = useState(false);

  useEffect(() => {
    if (!id) return;
    getStudySet(id)
      .then((data) => {
        setSet(data);
        const grouped = groupItemsByType(data.items);
        const first = [...grouped.keys()][0] ?? null;
        setActiveTab(first);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [id]);

  async function handleClone() {
    if (!id) return;
    try {
      await cloneStudySet(id);
      toast.success('Đã sao chép vào bộ của bạn');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  if (!set) {
    return <p className="py-12 text-center text-sm font-medium text-muted-foreground">Đang tải…</p>;
  }

  const grouped = groupItemsByType(set.items);
  const tabs = [...grouped.keys()];
  const tabItems = activeTab ? grouped.get(activeTab) ?? [] : [];
  const ownerLabel = set.owner?.displayName ?? set.owner?.email ?? '—';

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Study Set"
      subtitle={`${set.items.length} mục · bởi ${ownerLabel}`}
      title={set.title}
      description={set.description ?? 'Ôn nhanh bằng flashcard hoặc quiz — sao chép về tài khoản nếu muốn chỉnh sửa.'}
      icon={LibraryBig}
      iconClassName="bg-quaternary"
      tone="quaternary"
      chips={tabs.map((t) => STUDY_SET_CONTENT_LABELS[t])}
      footer="Dùng Flashcard hoặc Quiz để ôn — nội dung được nhóm theo loại ở tab bên dưới."
      headerExtra={
        <div className="flex w-full max-w-xs flex-col gap-2">
          {set.coverImageUrl && (
            <img
              src={studySetAssetUrl(set.coverImageUrl)}
              alt=""
              className="aspect-[16/10] w-full rounded-xl border border-border object-cover shadow-premium card-lift"
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setFlashcard(true)}>
              <Layers className="mr-1 size-4" />
              Flashcard
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setQuiz(true)}>
              <Brain className="mr-1 size-4" />
              Quiz
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleClone}>
              <Copy className="mr-1 size-4" />
              Sao chép
            </Button>
            {set.canEdit && (
              <Link
                to={paths.student.studySetEdit(set.id)}
                className="inline-flex min-h-9 items-center rounded-xl border border-border bg-surface-paper px-3 text-xs font-extrabold shadow-premium card-lift transition-all hover:-translate-y-0.5 hover:bg-muted"
              >
                <Pencil className="mr-1 size-4" />
                Sửa
              </Link>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StudySetTypeBadges typeCounts={set.typeCounts} />
        </div>

        {tabs.length > 0 && (
          <section className="rounded-xl border border-border bg-background p-4 shadow-premium card-lift">
            <StudySetContentTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </section>
        )}

        <div className="rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          {activeTab ? (
            <StudySetContentPanel type={activeTab} items={tabItems} />
          ) : (
            <p className="text-center text-sm font-medium text-muted-foreground">
              Bộ học chưa có nội dung.
            </p>
          )}
        </div>
      </div>

      {flashcard && (
        <StudySetFlashcard items={set.items} onClose={() => setFlashcard(false)} />
      )}
      {quiz && (
        <StudySetQuiz
          studySetId={set.id}
          initialQuiz={set.quiz}
          quizGeneratedAt={set.quizGeneratedAt}
          onClose={() => setQuiz(false)}
        />
      )}
    </PageShell>
  );
}
