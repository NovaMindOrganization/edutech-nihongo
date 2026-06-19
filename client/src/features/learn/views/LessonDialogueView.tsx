import { ChevronLeft, ChevronRight, EyeOff, Languages, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpeech } from '@/hooks/use-speech';
import type { DialogueLine, JapaneseSegment } from '@/features/student/services/studentApi';
import { useLessonData } from '../context/lesson-context';

type DialogueLineView = Partial<DialogueLine> & {
  segments?: JapaneseSegment[];
  vi?: string;
};

function FuriganaText({ segments = [] }: { segments?: JapaneseSegment[] }) {
  return (
    <span className="font-jp leading-9">
      {segments.map((segment, index) => {
        if ('kanji' in segment) {
          return (
            <ruby key={index} className="mx-[1px]">
              {segment.kanji}
              <rt className="text-[0.58em] text-muted-foreground">{segment.reading}</rt>
            </ruby>
          );
        }

        return <span key={index}>{segment.text}</span>;
      })}
    </span>
  );
}

function segmentText(segments: JapaneseSegment[] = []) {
  return segments.map((segment) => ('kanji' in segment ? segment.kanji : segment.text)).join('');
}

function lineText(line: DialogueLineView) {
  return line.text ?? segmentText(line.segments);
}

function lineTranslation(line: DialogueLineView) {
  return line.translation ?? line.vi;
}

export function LessonDialogueView() {
  const { conversations } = useLessonData();
  const { playTts, speaking } = useSpeech();
  const [conversationIndex, setConversationIndex] = useState(0);
  const [translationVisibility, setTranslationVisibility] = useState<Record<string, boolean>>({});

  const activeIndex = conversations.length === 0 ? 0 : Math.min(conversationIndex, conversations.length - 1);
  const activeConversation = conversations[activeIndex];
  const dialogue = useMemo(
    () => (activeConversation?.dialogue ?? []) as DialogueLineView[],
    [activeConversation],
  );

  function goPrevious() {
    setConversationIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setConversationIndex((current) => Math.min(conversations.length - 1, current + 1));
  }

  function isTranslationVisible(key: string) {
    return translationVisibility[key] ?? false;
  }

  function toggleTranslation(key: string) {
    setTranslationVisibility((current) => ({
      ...current,
      [key]: !(current[key] ?? true),
    }));
  }

  return (
    <div className="space-y-4">
      {conversations.length === 0 && (
        <p className="rounded-3xl border border-dashed border-border bg-surface-paper py-12 text-center text-sm font-medium text-muted-foreground shadow-premium card-lift">
          Chưa có hội thoại mẫu cho tiết này.
        </p>
      )}

      {activeConversation && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-surface-paper px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <AppIcon icon={Volume2} size="lg" className="bg-secondary" />
                <div>
                  <Badge className="bg-tertiary text-tertiary-foreground">Audio Dialogue</Badge>
                  <CardTitle className="mt-2 font-display text-2xl">
                    {activeConversation.title ?? 'Hội thoại mẫu'}
                  </CardTitle>
                </div>
              </div>
              <span className="rounded-lg border border-border bg-background px-3 py-1.5 font-display text-sm font-extrabold tabular-nums shadow-premium card-lift">
                {activeIndex + 1} / {conversations.length}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 bg-background p-4 sm:p-8">
            {dialogue.map((line, index) => {
              const speaker = line.speaker ?? (index % 2 === 0 ? 'A' : 'B');
              const isLeft = speaker === 'A';
              const text = lineText(line);
              const translation = lineTranslation(line);
              const translationKey = `${activeConversation.id}-${index}`;
              const showTranslation = isTranslationVisible(translationKey);

              return (
                <div
                  key={`${speaker}-${index}`}
                  className={`flex items-end gap-3 ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  {isLeft && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-tertiary font-display font-extrabold text-foreground shadow-premium card-lift">
                      {speaker}
                    </div>
                  )}

                  <div
                    className={`relative max-w-[82%] rounded-xl border border-border bg-surface-paper px-5 py-4 shadow-premium card-lift ${
                      isLeft
                        ? 'rounded-bl-md'
                        : 'rounded-br-md bg-primary/10'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                        Speaker {speaker}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 px-3"
                        disabled={speaking || !text}
                        onClick={() => playTts(text)}
                      >
                        <Volume2 className="size-4" />
                        Nghe
                      </Button>
                    </div>
                    <p className="font-jp text-lg leading-9 text-foreground sm:text-xl">
                      {line.segments?.length ? <FuriganaText segments={line.segments} /> : text}
                    </p>
                    {line.reading && <p className="mt-1 text-sm text-primary/80">{line.reading}</p>}
                    {translation && (
                      <div className="mt-3 border-t-2 border-dashed border-border pt-3">
                        {showTranslation && (
                          <p className="text-sm font-medium leading-6 text-muted-foreground">{translation}</p>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 px-0 text-xs font-extrabold text-primary"
                          onClick={() => toggleTranslation(translationKey)}
                        >
                          {showTranslation ? <EyeOff className="size-3.5" /> : <Languages className="size-3.5" />}
                          {showTranslation ? 'Ẩn dịch' : 'Dịch'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isLeft && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-display font-extrabold text-foreground shadow-premium card-lift">
                      {speaker}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={activeIndex === 0}
                onClick={goPrevious}
              >
                <ChevronLeft className="size-4" />
                Hội thoại trước
              </Button>
              <span className="text-sm font-bold text-muted-foreground">
                {activeIndex + 1} / {conversations.length}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={activeIndex >= conversations.length - 1}
                onClick={goNext}
              >
                Hội thoại tiếp theo
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
