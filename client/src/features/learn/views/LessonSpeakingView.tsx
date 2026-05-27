import { Mic, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSpeech } from '@/hooks/use-speech';
import { postLessonSpeaking } from '@/features/student/services/studentApi';
import { useLessonData } from '../context/lesson-context';

export function LessonSpeakingView() {
  const lesson = useLessonData();
  const { playTts, recording, startRecording, stopRecording, speaking } = useSpeech();
  const [text, setText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await postLessonSpeaking(lesson.lesson.id, {
        text,
        sessionId,
        conversationHistory: history,
      });
      setSessionId(res.sessionId);
      setHistory((h) => [
        ...h,
        { role: 'user', content: text },
        { role: 'assistant', content: res.AI_Reply },
      ]);
      setText('');
      if (res.Correction) toast.message(`Gợi ý: ${res.Correction}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi AI');
    } finally {
      setLoading(false);
    }
  }

  async function toggleMic() {
    try {
      if (!recording) {
        await startRecording();
        toast.message('Đang ghi âm…');
        return;
      }
      const transcript = await stopRecording();
      if (!transcript) {
        toast.error('Không nhận dạng được');
        return;
      }
      setLoading(true);
      const res = await postLessonSpeaking(lesson.lesson.id, {
        text: transcript,
        sessionId,
        conversationHistory: history,
      });
      setSessionId(res.sessionId);
      setHistory((h) => [
        ...h,
        { role: 'user', content: transcript },
        { role: 'assistant', content: res.AI_Reply },
      ]);
      if (res.Correction) toast.message(`Gợi ý: ${res.Correction}`);
    } catch {
      toast.error('Không ghi âm được');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Luyện nói theo tiết (Gemini)</CardTitle>
        {lesson.lesson.speakingPrompt && (
          <p className="text-sm text-muted-foreground">{lesson.lesson.speakingPrompt}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3 text-sm">
          {history.length === 0 && (
            <p className="text-muted-foreground">Chào! Hãy nói về nội dung bài học này.</p>
          )}
          {history.map((m, i) => (
            <p key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <span className="font-medium">{m.role === 'user' ? 'Bạn' : 'Sensei'}:</span> {m.content}
              {m.role === 'assistant' && (
                <button
                  type="button"
                  className="ml-2 inline text-primary"
                  onClick={() => playTts(m.content)}
                  disabled={speaking}
                >
                  <Volume2 className="inline size-4" />
                </button>
              )}
            </p>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập tiếng Nhật…" />
          <Button onClick={send} disabled={loading}>
            Gửi
          </Button>
          <Button variant={recording ? 'default' : 'outline'} onClick={toggleMic} disabled={loading}>
            <Mic className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
