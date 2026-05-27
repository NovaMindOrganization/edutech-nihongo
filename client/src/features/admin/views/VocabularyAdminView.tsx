import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import {
  AdminListFilters,
  AdminSearchFilter,
  CourseFilter,
  JlptLevelFilter,
  LessonFilter,
} from '../components/admin-list-filters';
import { JLPT_ALL, JLPT_LEVELS } from '../constants';
import { useCourseLessons } from '../hooks/use-course-lessons';
import {
  createVocabulary,
  deleteVocabulary,
  getCourse,
  listCourses,
  listVocabulary,
  updateVocabulary,
  type CourseDetail,
  type CourseItem,
  type VocabItem,
} from '../services/adminApi';

const emptyForm = {
  word: '',
  reading: '',
  meaning: '',
  meaningEn: '',
  jlptLevel: 'N5',
  partOfSpeech: '',
  courseId: '',
  lessonId: '',
};

export function VocabularyAdminView() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VocabItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [lessonOptions, setLessonOptions] = useState<CourseDetail['lessons']>([]);
  const [jlptLevel, setJlptLevel] = useState(JLPT_ALL);
  const [search, setSearch] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterLessonId, setFilterLessonId] = useState('');
  const filterLessons = useCourseLessons(filterCourseId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listVocabulary({
        page,
        limit: 30,
        ...(jlptLevel ? { jlptLevel } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(filterCourseId ? { courseId: filterCourseId } : {}),
        ...(filterLessonId ? { lessonId: filterLessonId } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [page, jlptLevel, search, filterCourseId, filterLessonId]);

  useEffect(() => {
    listCourses().then(setCourses).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!form.courseId) {
      setLessonOptions([]);
      return;
    }
    getCourse(form.courseId)
      .then((c) => setLessonOptions(c.lessons))
      .catch(() => setLessonOptions([]));
  }, [form.courseId]);

  function resetFilters() {
    setJlptLevel(JLPT_ALL);
    setSearch('');
    setFilterCourseId('');
    setFilterLessonId('');
    setPage(1);
  }

  const hasFilters = Boolean(jlptLevel || search.trim() || filterCourseId || filterLessonId);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: VocabItem) {
    setEditing(item);
    setForm({
      word: item.word,
      reading: item.reading ?? '',
      meaning: item.meaning,
      meaningEn: item.meaningEn ?? '',
      jlptLevel: item.jlptLevel,
      partOfSpeech: item.partOfSpeech ?? '',
      courseId: item.courseId ?? '',
      lessonId: item.lessonId ?? '',
    });
    setOpen(true);
  }

  async function handleSave() {
    const payload = {
      word: form.word,
      reading: form.reading || undefined,
      meaning: form.meaning,
      meaningEn: form.meaningEn || undefined,
      jlptLevel: form.jlptLevel,
      partOfSpeech: form.partOfSpeech || undefined,
      courseId: form.courseId || undefined,
      lessonId: form.lessonId || undefined,
    };
    try {
      if (editing) {
        await updateVocabulary(editing.id, payload);
        toast.success('Đã cập nhật từ vựng');
      } else {
        await createVocabulary(payload);
        toast.success('Đã thêm từ vựng');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa từ vựng này?')) return;
    try {
      await deleteVocabulary(id);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Từ vựng</h1>
          <p className="text-sm text-muted-foreground">
            {total} mục — gán theo khóa học và tiết. Nên quản lý chi tiết tại{' '}
            <Link to={paths.admin.courses} className="text-primary hover:underline">
              Khóa học → Tiết → Từ vựng
            </Link>
            .
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Thêm từ
        </Button>
      </div>

      <AdminListFilters onReset={hasFilters ? resetFilters : undefined}>
        <JlptLevelFilter
          value={jlptLevel}
          onChange={(v) => {
            setJlptLevel(v);
            setPage(1);
          }}
        />
        <AdminSearchFilter
          value={search}
          placeholder="Từ, đọc, nghĩa…"
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <CourseFilter
          value={filterCourseId}
          courses={courses}
          onChange={(v) => {
            setFilterCourseId(v);
            setFilterLessonId('');
            setPage(1);
          }}
        />
        <LessonFilter
          value={filterLessonId}
          lessons={filterLessons}
          disabled={!filterCourseId}
          onChange={(v) => {
            setFilterLessonId(v);
            setPage(1);
          }}
        />
      </AdminListFilters>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Không có kết quả.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-muted/40"
                >
                  <div className="min-w-[120px] font-jp text-lg font-medium">{item.word}</div>
                  <div className="text-sm text-muted-foreground">{item.reading}</div>
                  <div className="flex-1 text-sm">{item.meaning}</div>
                  <Badge variant="outline">{item.jlptLevel}</Badge>
                  {item.lesson ? (
                    <Badge variant="outline">
                      {item.course?.jlptLevel} · Tiết {item.lesson.orderIndex}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Chưa gán tiết</Badge>
                  )}
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </Button>
        <span className="flex items-center text-sm">
          Trang {page} / {Math.max(1, Math.ceil(total / 30))}
        </span>
        <Button variant="outline" disabled={page * 30 >= total} onClick={() => setPage((p) => p + 1)}>
          Sau
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} title={editing ? 'Sửa từ vựng' : 'Thêm từ vựng'} className="max-w-lg">
        <div className="grid gap-3">
          <Input placeholder="Từ (kanji/kana)" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} />
          <Input placeholder="Cách đọc" value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })} />
          <Input placeholder="Nghĩa tiếng Việt" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
          <select
            className="rounded-lg border bg-background px-3 py-2 text-sm"
            value={form.jlptLevel}
            onChange={(e) => setForm({ ...form, jlptLevel: e.target.value })}
          >
            {JLPT_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border bg-background px-3 py-2 text-sm"
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value, lessonId: '' })}
          >
            <option value="">— Khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.jlptLevel})
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border bg-background px-3 py-2 text-sm"
            value={form.lessonId}
            disabled={!form.courseId}
            onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
          >
            <option value="">— Tiết học —</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>
                #{l.orderIndex} {l.title}
              </option>
            ))}
          </select>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </Dialog>
    </div>
  );
}
