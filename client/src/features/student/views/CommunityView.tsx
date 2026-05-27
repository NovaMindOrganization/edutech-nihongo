import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { webrtcMatch, webrtcReport } from '@/features/student/services/studentApi';

export function CommunityView() {
  const [roomId, setRoomId] = useState<string | null>(null);

  async function match() {
    try {
      const data = await webrtcMatch();
      if (data.matched) {
        setRoomId(data.roomId);
        toast.success('Đã ghép cặp — dùng WebSocket signaling (P2P)');
      } else {
        toast.message('Đang chờ người học khác...');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  async function report() {
    try {
      await webrtcReport({ roomId: roomId ?? undefined, reason: 'Inappropriate behavior' });
      toast.success('Đã gửi báo cáo');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi');
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold">Cộng đồng</h1>
      <p className="mt-2 text-sm text-muted-foreground">WebRTC peer matching + abuse reports</p>
      <Button className="mt-6" onClick={match}>
        Tìm bạn luyện nói
      </Button>
      {roomId && (
        <div className="mt-4 space-y-2 rounded-lg border p-4">
          <p className="text-sm">Room: {roomId}</p>
          <Input placeholder="Lý do báo cáo" />
          <Button variant="destructive" onClick={report}>
            Báo cáo
          </Button>
        </div>
      )}
    </div>
  );
}
