import { useState } from 'react';
import { toast } from 'sonner';

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
    <Card>
      <CardHeader>
        <CardTitle>Nghe nói — trò chuyện với AI (Gemini)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Prompt hướng dẫn AI trong tiết học (vai trò, chủ đề, mức độ). Học viên dùng màn hình Nói chuyện
          trong bài học.
        </p>
        <textarea
          className="min-h-[160px] w-full rounded-lg border bg-background p-3 text-sm"
          placeholder="Ví dụ: Bạn là giáo viên tiếng Nhật N5. Chủ đề: giới thiệu bản thân. Trả lời ngắn, sửa lỗi nhẹ nhàng."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu…' : 'Lưu prompt'}
        </Button>
      </CardContent>
    </Card>
  );
}
