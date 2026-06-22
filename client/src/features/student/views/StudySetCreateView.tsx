import { Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageShell, pageContentClass } from '@/components/usable/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import {
  emptyItem,
  StudySetItemForm,
  StudySetItemTypePicker,
} from '../components/study-set-item-form';
import {
  createStudySet,
  getStudySet,
  updateStudySet,
  uploadStudySetFile,
} from '../services/studySetApi';
import type { StudySetContentType, StudySetItemInput } from '../types/study-set.types';

export function StudySetCreateView() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [items, setItems] = useState<StudySetItemInput[]>([emptyItem('vocabulary')]);
  const [newItemType, setNewItemType] = useState<StudySetContentType>('vocabulary');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getStudySet(id)
      .then((set) => {
        if (!set.canEdit) {
          toast.error('Không có quyền sửa');
          navigate(paths.student.studySetDetail(id));
          return;
        }
        setTitle(set.title);
        setDescription(set.description ?? '');
        setIsPublic(set.isPublic);
        setCoverImageUrl(set.coverImageUrl ?? '');
        setItems(
          set.items.map((it) => ({
            contentType: it.contentType,
            content: it.content,
          })),
        );
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'));
  }, [id, navigate]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const { storagePath } = await uploadStudySetFile(file);
      return storagePath;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Nhập tiêu đề');
      return;
    }
    if (!isEdit && !isPublic) {
      toast.error('Bật "Công khai cộng đồng" để gửi kiểm duyệt');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        coverImageUrl: coverImageUrl || undefined,
        isPublic,
        items,
      };
      if (isEdit && id) {
        await updateStudySet(id, body);
        toast.success('Đã cập nhật');
        navigate(paths.student.studySetDetail(id));
      } else {
        const created = await createStudySet(body);
        toast.success(isPublic ? 'Đã gửi chờ kiểm duyệt' : 'Đã tạo study set');
        navigate(paths.student.studySetDetail(created.id));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      className={pageContentClass}
      eyebrow="Study Sets"
      title={isEdit ? 'Sửa study set' : 'Tạo study set'}
      description="Thêm từ vựng, kanji hoặc ngữ pháp — lưu riêng hoặc gửi cộng đồng sau kiểm duyệt."
      icon={Sparkles}
      iconClassName="bg-tertiary"
      tone="brand"
      chips={['Từ vựng', 'Kanji', 'Ngữ pháp', 'Nghe · Nói']}
      footer="Bật công khai cộng đồng để gửi kiểm duyệt — bộ riêng tư chỉ bạn xem được."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <section className="space-y-4 rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          <h2 className="font-display text-lg font-extrabold">Thông tin bộ</h2>
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ảnh bìa (URL hoặc upload)</label>
            <Input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="study-sets/... hoặc URL"
            />
            <Input
              type="file"
              accept="image/*"
              className="mt-2"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const path = await handleUpload(file);
                setCoverImageUrl(path);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <label htmlFor="public" className="text-sm">
              Công khai cộng đồng (cần kiểm duyệt)
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-surface-paper/50 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-extrabold">Nội dung ({items.length})</h2>
            <div className="flex items-center gap-2">
              <StudySetItemTypePicker value={newItemType} onChange={setNewItemType} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((prev) => [...prev, emptyItem(newItemType)])}
              >
                <Plus className="mr-1 size-4" />
                Thêm mục
              </Button>
            </div>
          </div>

          {items.map((item, index) => (
            <StudySetItemForm
              key={index}
              item={item}
              index={index}
              uploading={uploading}
              onUploadAudio={
                item.contentType === 'listening' || item.contentType === 'speaking'
                  ? handleUpload
                  : undefined
              }
              onChange={(next) =>
                setItems((prev) => prev.map((p, i) => (i === index ? next : p)))
              }
              onRemove={() => setItems((prev) => prev.filter((_, i) => i !== index))}
            />
          ))}
        </section>

        <Button type="submit" disabled={saving} className="min-h-11 px-6">
          {saving ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Tạo bộ'}
        </Button>
      </form>
    </PageShell>
  );
}
