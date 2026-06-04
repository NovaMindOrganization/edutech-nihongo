import { Brain, Copy, Layers, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

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
    return <p className="py-12 text-center text-sm text-muted-foreground">Đang tải…</p>;
  }

  const grouped = groupItemsByType(set.items);
  const tabs = [...grouped.keys()];
  const tabItems = activeTab ? grouped.get(activeTab) ?? [] : [];

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <Link to={paths.student.studySets} className="text-sm text-primary hover:underline">
        ← Study sets
      </Link>

      <header className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
        {set.coverImageUrl && (
          <img
            src={studySetAssetUrl(set.coverImageUrl)}
            alt=""
            className="aspect-[3/1] w-full object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="font-display text-2xl font-bold">{set.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {set.owner?.displayName ?? set.owner?.email ?? '—'}
          </p>
          {set.description && <p className="mt-3 text-sm">{set.description}</p>}
          <StudySetTypeBadges typeCounts={set.typeCounts} className="mt-3" />
          <div className="mt-4 flex flex-wrap gap-2">
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
                className="inline-flex h-8 items-center rounded-lg border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
              >
                <Pencil className="mr-1 size-4" />
                Sửa
              </Link>
            )}
          </div>
        </div>
      </header>

      {tabs.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2 border-b pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                activeTab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {STUDY_SET_CONTENT_LABELS[t]}
            </button>
          ))}
        </nav>
      )}

      <div className="mt-6">
        {activeTab && <StudySetContentPanel type={activeTab} items={tabItems} />}
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
    </div>
  );
}
