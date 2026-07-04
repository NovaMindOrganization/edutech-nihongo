import { Gauge, Mic, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { JapaneseSegment } from '@/features/student/services/studentApi';
import { postPronunciationAssessment } from '@/features/student/services/speechApi';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
import {
  speakingScoreSegmentClass,
} from '../utils/speaking-progress';
import {
  allowsJpd1PronunciationFallback,
  JPD1_SPEAKING_PASS_SCORE,
  speakingPassScoreForCourse,
} from '../utils/jpd1-speaking';
import {
  formatPronunciationFeedback,
  isPronunciationConfigError,
} from '../utils/pronunciation-feedback';

type GrammarDrill = {
  labelVi: string;
  modelJa: string;
  segments?: JapaneseSegment[];
  vi?: string;
  hintVi?: string;
};

function FuriganaText({ segments = [] }: { segments?: JapaneseSegment[] }) {
  return (
    <span className="font-jp leading-relaxed">
      {segments.map((segment, index) => {
        if ('kanji' in segment) {
          return (
            <ruby key={index} className="mx-[1px]">
              {segment.kanji}
              <rt className="text-[0.52em] font-normal text-muted-foreground">{segment.reading}</rt>
            </ruby>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </span>
  );
}

function segmentsToText(segments: JapaneseSegment[] = []) {
  return segments.map((s) => ('kanji' in s ? s.kanji : s.text)).join('');
}

type Props = {
  drills: GrammarDrill[];
  scores: Record<number, number | null>;
  onScore: (index: number, score: number) => void;
  jlptLevel?: string | null;
};

export function GrammarDrillPanel({ drills, scores, onScore, jlptLevel }: Props) {
  const { playTts, speaking, recording, startRecording, stopRecording } = useSpeech();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [activeDrillIndex, setActiveDrillIndex] = useState<number | null>(null);
  const passScore = speakingPassScoreForCourse(jlptLevel);
  const jpd1Fallback = allowsJpd1PronunciationFallback(jlptLevel, true);

  async function handleMic(index: number, modelJa: string) {
    try {
      if (!recording || activeDrillIndex !== index) {
        setActiveDrillIndex(index);
        await startRecording();
        toast.message('Nói theo câu mẫu…');
        return;
      }
      setLoadingIndex(index);
      const recorded = await stopRecording();
      setActiveDrillIndex(null);
      const referenceText = modelJa.trim();
      if (!recorded.audioBase64 || !referenceText) {
        toast.error('Không ghi âm được');
        return;
      }
      const result = await postPronunciationAssessment({
        referenceText,
        audioBase64: recorded.audioBase64,
        language: 'ja',
        mimeType: recorded.mimeType ?? 'audio/webm',
        passThreshold: passScore,
      });
      const feedback = formatPronunciationFeedback(result.error ?? result.feedbackVi);
      if (result.error || isPronunciationConfigError(feedback)) {
        if (jpd1Fallback) {
          toast.message('Chưa chấm phát âm — ghi nhận lượt luyện nhại.');
          onScore(index, JPD1_SPEAKING_PASS_SCORE);
          return;
        }
        toast.error(feedback);
        return;
      }
      onScore(index, result.overallScore);
      if (result.overallScore >= passScore) {
        toast.success(`Đạt ${Math.round(result.overallScore)}/100 — có thể tiếp tục!`);
      } else {
        toast.message(`Điểm ${Math.round(result.overallScore)}/100 — cần ≥${passScore} để qua`);
      }
    } catch {
      toast.error('Không ghi âm được');
    } finally {
      setLoadingIndex(null);
    }
  }

  return (
    <section className="px-6 py-8 sm:px-10 sm:py-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
        言ってみよう — Nhại theo
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Nghe mẫu, rồi ghi âm nhại lại. Cần ít nhất {passScore} điểm mỗi câu để sang điểm ngữ pháp tiếp theo.
      </p>
      <ul className="space-y-5">
        {drills.map((drill, index) => {
          const score = scores[index];
          const passed = score != null && score >= passScore;
          const text = drill.segments?.length ? segmentsToText(drill.segments) : drill.modelJa;
          return (
            <li
              key={index}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                passed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-[#F8FAFC]',
              )}
            >
              <p className="text-sm font-medium text-muted-foreground">{drill.labelVi}</p>
              <p className="mt-2 font-jp text-xl font-semibold leading-9 text-foreground">
                {drill.segments?.length ? (
                  <FuriganaText segments={drill.segments} />
                ) : (
                  drill.modelJa
                )}
              </p>
              {drill.vi && (
                <p className="mt-1 text-sm text-muted-foreground">{drill.vi}</p>
              )}
              {drill.hintVi && (
                <p className="mt-2 text-xs text-primary/80">{drill.hintVi}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={speaking || loadingIndex !== null}
                  onClick={() => void playTts(text)}
                >
                  <Volume2 className="size-4" />
                  Nghe mẫu
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={recording && activeDrillIndex === index ? 'default' : 'secondary'}
                  className="gap-1.5"
                  disabled={loadingIndex !== null && loadingIndex !== index}
                  onClick={() => void handleMic(index, text)}
                >
                  <Mic className="size-4" />
                  {recording && activeDrillIndex === index ? 'Dừng & chấm' : 'Ghi âm'}
                </Button>
                {score != null && (
                  <span
                    className={cn(
                      'ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-white',
                      speakingScoreSegmentClass(score),
                    )}
                  >
                    <Gauge className="size-3.5" />
                    {Math.round(score)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
