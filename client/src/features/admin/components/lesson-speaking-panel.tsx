import { Bot, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppIcon } from '@/components/usable/app-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { updateLesson } from '../services/adminApi';

type Props = {
  lessonId: string;
  initialPrompt: string | null;
  onSaved: () => void;
};

export function LessonSpeakingPanel({ lessonId, initialPrompt, onSaved }: Props) {
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateLesson(lessonId, { speakingPrompt: prompt.trim() || null });
      toast.success('Đã lưu prompt AI nói chuyện');
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden bg-background">
      <CardHeader className="border-b border-border bg-surface-paper">
        <div className="flex items-center gap-3">
          <AppIcon icon={Bot} size="md" className="bg-secondary" />
          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
              Lesson editor
            </p>
            <CardTitle>Nghe nói — AI conversation prompt</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="rounded-3xl border border-dashed border-border bg-surface-paper p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="font-display text-sm font-extrabold">Prompt block</p>
          </div>
          <p className="text-sm font-medium leading-6 text-muted-foreground">
            Prompt hướng dẫn AI trong tiết học: vai trò, chủ đề, mức độ, cách sửa lỗi. Học viên dùng prompt này ở màn hình Nói chuyện.
          </p>
        </div>
        <textarea
          className="min-h-[220px] w-full rounded-xl border border-border bg-surface-paper p-4 text-sm font-medium leading-6 outline-none shadow-premium card-lift focus:ring-2 focus:ring-primary/30"
          placeholder="Ví dụ: Bạn là giáo viên tiếng Nhật N5. Chủ đề: giới thiệu bản thân. Trả lời ngắn, sửa lỗi nhẹ nhàng."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? 'Đang lưu…' : 'Lưu prompt'}
        </Button>
      </CardContent>
    </Card>
  );
}
