import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { LessonConversationsPanel } from '../components/lesson-conversations-panel';
import { LessonGrammarPanel } from '../components/lesson-grammar-panel';
import { LessonKanjiPanel } from '../components/lesson-kanji-panel';
import { LessonSpeakingPanel } from '../components/lesson-speaking-panel';
import { LessonVocabularyPanel } from '../components/lesson-vocabulary-panel';
import { getLesson, type LessonDetail } from '../services/adminApi';

const tabs = [
  { id: 'speaking', label: 'Nghe nói (AI)' },
  { id: 'vocabulary', label: 'Từ vựng' },
  { id: 'grammar', label: 'Ngữ pháp' },
  { id: 'conversations', label: 'Hội thoại' },
  { id: 'kanji', label: 'Kanji' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function LessonDetailAdminView() {
  const { courseId = '', lessonId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);

  const activeTab = (searchParams.get('tab') as TabId) || 'speaking';

  const load = useCallback(async () => {
    try {
      setLesson(await getLesson(lessonId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được tiết');
      navigate(paths.admin.courseDetail(courseId));
    }
  }, [lessonId, courseId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  function setTab(tab: TabId) {
    setSearchParams({ tab });
  }

  if (!lesson) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div>
      <Link
        to={paths.admin.courseDetail(courseId)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {lesson.course.title}
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold">
        Tiết {lesson.orderIndex}: {lesson.title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {lesson.course.jlptLevel} — chỉnh 5 mục nội dung của tiết học
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border/70">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === t.id
                ? 'border-b-2 border-primary bg-muted/50 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'speaking' && (
          <LessonSpeakingPanel
            lessonId={lesson.id}
            initialPrompt={lesson.speakingPrompt}
            onSaved={load}
          />
        )}
        {activeTab === 'vocabulary' && (
          <LessonVocabularyPanel
            lessonId={lesson.id}
            courseId={courseId}
            jlptLevel={lesson.course.jlptLevel}
            items={lesson.vocabulary}
            onUpdated={load}
          />
        )}
        {activeTab === 'grammar' && (
          <LessonGrammarPanel
            lessonId={lesson.id}
            jlptLevel={lesson.course.jlptLevel}
            items={lesson.grammar}
            onUpdated={load}
          />
        )}
        {activeTab === 'conversations' && (
          <LessonConversationsPanel
            lessonId={lesson.id}
            jlptLevel={lesson.course.jlptLevel}
            items={lesson.conversations}
            onUpdated={load}
          />
        )}
        {activeTab === 'kanji' && (
          <LessonKanjiPanel
            lessonId={lesson.id}
            jlptLevel={lesson.course.jlptLevel}
            items={lesson.kanji}
            onUpdated={load}
          />
        )}
      </div>
    </div>
  );
}
