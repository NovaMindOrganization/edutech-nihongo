import { Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpeech } from '@/hooks/use-speech';
import type { DialogueLine } from '@/features/student/services/studentApi';
import { useLessonData } from '../context/lesson-context';

export function LessonDialogueView() {
  const { conversations } = useLessonData();
  const { playTts, speaking } = useSpeech();

  return (
    <div className="space-y-6">
      {conversations.length === 0 && (
        <p className="text-sm text-muted-foreground">Chưa có hội thoại mẫu cho tiết này.</p>
      )}
      {conversations.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <CardTitle>{c.title ?? 'Hội thoại mẫu'}</CardTitle>
            <p className="text-xs text-muted-foreground">Đọc nhập vai từng dòng — bấm loa để nghe TTS</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(c.dialogue as DialogueLine[]).map((line, i) => (
              <div
                key={i}
                className={`rounded-lg border px-4 py-3 ${
                  line.speaker === 'A' ? 'border-primary/30 bg-primary/5' : 'border-border/60'
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground">{line.speaker}</p>
                <p className="font-jp text-lg">{line.text}</p>
                {line.reading && <p className="text-sm text-primary/80">{line.reading}</p>}
                {line.translation && <p className="text-sm text-muted-foreground">{line.translation}</p>}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  disabled={speaking}
                  onClick={() => playTts(line.text)}
                >
                  <Volume2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
