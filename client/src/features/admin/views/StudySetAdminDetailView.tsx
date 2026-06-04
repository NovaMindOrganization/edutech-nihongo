import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { StudySetApproveFields } from '../components/study-set-approve-fields';
import {
  groupItemsByType,
  StudySetContentPanel,
} from '@/features/student/components/study-set-content-panels';
import { StudySetTypeBadges } from '@/features/student/components/study-set-type-badges';
import {
  getStudySetAdmin,
  moderateStudySet,
  type StudySetAdminDetail,
} from '../services/adminApi';
import {
  QUIZ_QUESTION_COUNT_MAX,
  QUIZ_QUESTION_COUNT_MIN,
  STUDY_SET_CONTENT_LABELS,
  suggestQuizQuestionCount,
  type StudySetContentType,
} from '@/features/student/types/study-set.types';

export function StudySetAdminDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<StudySetAdminDetail | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [quizQuestionCount, setQuizQuestionCount] = useState(10);
  const [activeTab, setActiveTab] = useState<StudySetContentType | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getStudySetAdmin(id)
      .then((data) => {
        setSet(data);
        setQuizQuestionCount(
          data.quizQuestionCount ?? suggestQuizQuestionCount(data.itemCount),
        );
        const grouped = groupItemsByType(data.items);
        setActiveTab([...grouped.keys()][0] ?? null);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [id]);

  async function moderate(status: 'approved' | 'rejected') {
    if (!id || !set) return;
    if (status === 'approved') {
      if (
        quizQuestionCount < QUIZ_QUESTION_COUNT_MIN ||
        quizQuestionCount > QUIZ_QUESTION_COUNT_MAX
      ) {
        toast.error(`Số câu quiz: ${QUIZ_QUESTION_COUNT_MIN}–${QUIZ_QUESTION_COUNT_MAX}`);
        return;
      }
    }
    setApproving(true);
    try {
      await moderateStudySet(id, status, {
        moderationNote: status === 'rejected' ? rejectNote : undefined,
        quizQuestionCount: status === 'approved' ? quizQuestionCount : undefined,
      });
      toast.success(
        status === 'approved'
          ? `Đã duyệt · LLM đang tạo ${quizQuestionCount} câu quiz`
          : 'Đã từ chối',
      );
      navigate(paths.admin.studySets);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setApproving(false);
    }
  }

  if (!set) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }

  const grouped = groupItemsByType(set.items);
  const tabItems = activeTab ? grouped.get(activeTab) ?? [] : [];

  return (
    <div>
      <Link to={paths.admin.studySets} className="text-sm text-primary hover:underline">
        ← Kiểm duyệt study sets
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold">{set.title}</h1>
      <p className="text-sm text-muted-foreground">
        {set.owner?.displayName ?? set.owner?.email} · {set.itemCount} mục ·{' '}
        {set.moderationStatus}
        {set.quizQuestionCount != null && ` · Quiz: ${set.quizQuestionCount} câu`}
      </p>
      {set.description && <p className="mt-2 text-sm">{set.description}</p>}
      <StudySetTypeBadges typeCounts={set.typeCounts} className="mt-3" />

      <nav className="mt-6 flex flex-wrap gap-2">
        {[...grouped.keys()].map((t) => (
          <Button
            key={t}
            type="button"
            size="sm"
            variant={activeTab === t ? 'default' : 'outline'}
            onClick={() => setActiveTab(t)}
          >
            {STUDY_SET_CONTENT_LABELS[t]}
          </Button>
        ))}
      </nav>
      <div className="mt-4">
        {activeTab && <StudySetContentPanel type={activeTab} items={tabItems} />}
      </div>

      {set.moderationStatus === 'pending' && (
        <div className="mt-8 space-y-4 rounded-lg border p-4">
          <StudySetApproveFields
            itemCount={set.itemCount}
            quizQuestionCount={quizQuestionCount}
            onQuizQuestionCountChange={setQuizQuestionCount}
          />
          <div>
            <label className="text-sm font-medium">Lý do từ chối (tuỳ chọn)</label>
            <Input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button disabled={approving} onClick={() => moderate('approved')}>
              {approving ? 'Đang duyệt + tạo quiz…' : 'Duyệt & tạo quiz'}
            </Button>
            <Button
              variant="destructive"
              disabled={approving}
              onClick={() => moderate('rejected')}
            >
              Từ chối
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
