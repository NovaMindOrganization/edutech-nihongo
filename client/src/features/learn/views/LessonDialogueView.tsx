import { ChevronLeft, ChevronRight, EyeOff, Languages, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';

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
        <p className="text-sm text-muted-foreground">Chưa có hội thoại mẫu cho tiết này.</p>
      )}

      {activeConversation && (
        <Card className="overflow-hidden">
          <CardHeader className="items-center border-b bg-muted/20 px-6 py-5 text-center">
            <CardTitle className="font-display text-xl">
              {activeConversation.title ?? 'Hội thoại mẫu'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 bg-background p-5 sm:p-8">
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
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted font-semibold text-muted-foreground">
                      {speaker}
                    </div>
                  )}

                  <div
                    className={`relative max-w-[78%] rounded-2xl border bg-card px-5 py-3 shadow-sm ${
                      isLeft
                        ? 'rounded-bl-sm border-primary/20'
                        : 'rounded-br-sm border-border'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-muted-foreground">Speaker {speaker}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
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
                      <div className="mt-2 border-t pt-2">
                        {showTranslation && (
                          <p className="text-sm text-muted-foreground">{translation}</p>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 px-0 text-xs"
                          onClick={() => toggleTranslation(translationKey)}
                        >
                          {showTranslation ? <EyeOff className="size-3.5" /> : <Languages className="size-3.5" />}
                          {showTranslation ? 'Ẩn dịch' : 'Dịch'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isLeft && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-primary/10 font-semibold text-primary">
                      {speaker}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={activeIndex === 0}
                onClick={goPrevious}
              >
                <ChevronLeft className="size-4" />
                Hội thoại trước
              </Button>
              <span className="text-sm text-muted-foreground">
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
