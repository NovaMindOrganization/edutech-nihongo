/** Map technical pronunciation errors to learner-friendly Vietnamese. */
export function formatPronunciationFeedback(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('ffmpeg')) {
    return 'Không chuyển được file ghi âm (thiếu ffmpeg). Chạy: pip install imageio-ffmpeg trong env edutech-nihongo, rồi restart ai-server.';
  }
  if (lower.includes('azure_speech') || lower.includes('azure speech')) {
    return 'Chưa cấu hình Azure Speech (AZURE_SPEECH_KEY + AZURE_SPEECH_REGION trong ai-server/.env).';
  }
  if (lower.includes('too short')) {
    return 'Ghi âm quá ngắn. Hãy nói rõ ít nhất 1–2 giây rồi thử lại.';
  }
  if (lower.includes('silent') || lower.includes('too quiet')) {
    return 'Không nghe thấy giọng — kiểm tra micro và nói to hơn.';
  }
  return message;
}

export function isPronunciationConfigError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('ffmpeg') ||
    lower.includes('azure_speech') ||
    lower.includes('azure speech') ||
    lower.includes('engineconfiguration')
  );
}
