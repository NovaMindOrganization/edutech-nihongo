import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpeech } from '@/hooks/use-speech';
import { webrtcEvaluate, webrtcMatch, webrtcReport } from '@/features/student/services/studentApi';
import { paths } from '@/router/paths';

export function CommunityCallView() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Array<{ speaker: string; text: string }>>([]);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const { startRecording, stopRecording, recording } = useSpeech();

  async function match() {
    try {
      const data = await webrtcMatch();
      if (data.matched) {
        setRoomId(data.roomId);
        toast.success('Đã ghép cặp — dùng mic để ghi transcript (demo STT)');
      } else {
        toast.message('Đang chờ người học khác…');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  async function captureMySpeech() {
    if (!recording) {
      await startRecording();
      toast.message('Đang ghi… bấm lại để dừng');
      return;
    }
    const text = await stopRecording();
    if (text) {
      setTranscripts((t) => [...t, { speaker: 'me', text }]);
    }
  }

  async function evaluate() {
    try {
      const res = await webrtcEvaluate({ roomId: roomId ?? undefined, transcripts });
      setEvaluation(res.summary);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link to={paths.student.community} className="text-sm text-primary hover:underline">
        ← Cộng đồng
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">Gọi luyện nói</h1>
      <Button className="mt-4" onClick={match}>
        Tìm bạn luyện nói
      </Button>
      {roomId && (
        <div className="mt-6 space-y-3 rounded-lg border p-4">
          <p className="text-sm">Room: {roomId}</p>
          <Button variant="outline" onClick={captureMySpeech}>
            {recording ? 'Dừng & STT' : 'Ghi âm (STT)'}
          </Button>
          <ul className="text-sm space-y-1">
            {transcripts.map((t, i) => (
              <li key={i}>
                <strong>{t.speaker}:</strong> {t.text}
              </li>
            ))}
          </ul>
          <Button onClick={evaluate}>Đánh giá (Gemini)</Button>
          {evaluation && <p className="text-sm rounded bg-muted p-3">{evaluation}</p>}
          <Input placeholder="Lý do báo cáo" id="report-reason" />
          <Button
            variant="destructive"
            onClick={() =>
              webrtcReport({ roomId, reason: 'Inappropriate behavior' }).then(() =>
                toast.success('Đã gửi báo cáo'),
              )
            }
          >
            Báo cáo
          </Button>
        </div>
      )}
    </div>
  );
}
