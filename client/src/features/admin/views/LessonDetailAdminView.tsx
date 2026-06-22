import { ArrowLeft, BookOpen, Bot, Languages, MessageSquare, ScrollText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';

import { LessonConversationsPanel } from '../components/lesson-conversations-panel';
import { LessonGrammarPanel } from '../components/lesson-grammar-panel';
import { LessonKanjiPanel } from '../components/lesson-kanji-panel';
import { LessonSpeakingPanel } from '../components/lesson-speaking-panel';
import { LessonVocabularyPanel } from '../components/lesson-vocabulary-panel';
import { getLesson, type LessonDetail } from '../services/adminApi';

const tabs = [
  { id: 'speaking', label: 'Nghe nói (AI)', icon: Bot },
  { id: 'vocabulary', label: 'Từ vựng', icon: Languages },
  { id: 'grammar', label: 'Ngữ pháp', icon: BookOpen },
  { id: 'conversations', label: 'Hội thoại', icon: MessageSquare },
  { id: 'kanji', label: 'Kanji', icon: ScrollText },
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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  function setTab(tab: TabId) {
    setSearchParams({ tab });
  }

  if (!lesson) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        to={paths.admin.courseDetail(courseId)}
        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        {lesson.course.title}
      </Link>

      <section className="rounded-xl border border-border bg-surface-paper p-5 shadow-premium card-lift">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AppIcon icon={BookOpen} size="lg" active />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{lesson.course.jlptLevel}</Badge>
                <Badge variant="outline">Tiết {lesson.orderIndex}</Badge>
                {lesson.isBonus && <Badge className="bg-tertiary text-tertiary-foreground">Bonus</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
                {lesson.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                Gán nội dung theo từng nhóm để lesson sẵn sàng cho học viên: speaking, vocabulary, grammar, conversations và kanji.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg border border-border bg-background p-3 shadow-premium card-lift">
              <p className="font-mono text-lg font-black">{lesson.vocabulary.length}</p>
              <p className="font-bold text-muted-foreground">Vocab</p>
            </div>
            <div className="rounded-lg border border-border bg-quaternary/15 p-3 shadow-premium card-lift">
              <p className="font-mono text-lg font-black">{lesson.grammar.length}</p>
              <p className="font-bold text-muted-foreground">Grammar</p>
            </div>
            <div className="rounded-lg border border-border bg-tertiary/20 p-3 shadow-premium card-lift">
              <p className="font-mono text-lg font-black">{lesson.kanji.length}</p>
              <p className="font-bold text-muted-foreground">Kanji</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/15 p-3 shadow-premium card-lift">
              <p className="font-mono text-lg font-black">{lesson.conversations.length}</p>
              <p className="font-bold text-muted-foreground">Talk</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden bg-background">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-extrabold shadow-premium card-lift transition-all hover:-translate-y-0.5',
              activeTab === t.id
                ? 'bg-brand text-white'
                : 'bg-surface-paper text-muted-foreground hover:text-foreground',
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
          </div>
        </CardContent>
      </Card>

      <div>
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
