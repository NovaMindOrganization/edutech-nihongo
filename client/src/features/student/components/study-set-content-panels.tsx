import { Volume2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpeech } from '@/hooks/use-speech';
import { studySetAssetUrl } from '@/features/student/services/studySetApi';

import {
  STUDY_SET_CONTENT_LABELS,
  type StudySetContentType,
  type StudySetGrammarContent,
  type StudySetItemRow,
  type StudySetKanjiContent,
  type StudySetListeningContent,
  type StudySetSpeakingContent,
  type StudySetVocabContent,
} from '../types/study-set.types';

function VocabPanel({ items }: { items: StudySetItemRow[] }) {
  const { playTts, speaking } = useSpeech();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const c = item.content as StudySetVocabContent;
        const primaryText = c.reading ?? c.word;
        const kanjiText = c.reading ? c.word : null;
        return (
          <div
            key={item.id}
            className="rounded-lg border border-border/60 bg-gradient-to-br from-card to-[var(--nc-cream)]/40 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-jp text-xl font-semibold">{primaryText}</p>
                {kanjiText && <p className="text-sm text-primary/80">{kanjiText}</p>}
                <p className="mt-1 text-sm">{c.meaning}</p>
                {c.exampleSentence && (
                  <p className="mt-2 font-jp text-xs text-muted-foreground">{c.exampleSentence}</p>
                )}
                {c.exampleTranslation && (
                  <p className="text-xs text-muted-foreground">{c.exampleTranslation}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={speaking}
                onClick={() => playTts(c.reading ?? c.word)}
              >
                <Volume2 className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GrammarPanel({ items }: { items: StudySetItemRow[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const c = item.content as StudySetGrammarContent;
        return (
          <div key={item.id} className="rounded-lg border p-4">
            <p className="font-medium">{c.title}</p>
            <p className="font-jp mt-1 text-lg text-primary">{c.pattern}</p>
            <p className="mt-1 text-sm">{c.meaningVi}</p>
            {c.usage && <p className="mt-2 text-sm text-muted-foreground">{c.usage}</p>}
            {c.examples?.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm">
                {c.examples.map((ex, i) => (
                  <li key={i}>
                    <span className="font-jp">{ex.jp}</span>
                    <span className="text-muted-foreground"> — {ex.vi}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KanjiPanel({ items }: { items: StudySetItemRow[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const c = item.content as StudySetKanjiContent;
        return (
          <div key={item.id} className="rounded-lg border p-4">
            <p className="font-jp text-4xl font-bold">{c.character}</p>
            <p className="mt-1 text-sm">{c.meaning}</p>
            <p className="text-xs text-muted-foreground">
              On: {c.readingsOn?.join(', ') || '—'} · Kun: {c.readingsKun?.join(', ') || '—'}
            </p>
            {c.memoryTip && <p className="mt-2 text-xs italic">{c.memoryTip}</p>}
          </div>
        );
      })}
    </div>
  );
}

function ListeningPanel({ items }: { items: StudySetItemRow[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const c = item.content as StudySetListeningContent;
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <audio controls className="w-full" src={studySetAssetUrl(c.audioUrl)} />
              {c.transcript && (
                <p className="whitespace-pre-wrap font-jp text-sm">{c.transcript}</p>
              )}
              {c.questions?.map((q, qi) => (
                <div key={qi} className="rounded border p-3 text-sm">
                  <p className="font-medium">{q.question}</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {q.options.map((o, oi) => (
                      <li key={oi}>{o}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SpeakingPanel({ items }: { items: StudySetItemRow[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const c = item.content as StudySetSpeakingContent;
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap text-sm">{c.prompt}</p>
              {c.audioUrl && (
                <audio controls className="w-full" src={studySetAssetUrl(c.audioUrl)} />
              )}
              {c.sampleDialogue?.map((line, i) => (
                <div key={i} className="rounded border px-3 py-2 text-sm">
                  <span className="font-semibold text-primary">{line.speaker}: </span>
                  <span className="font-jp">{line.text}</span>
                  {line.translation && (
                    <p className="text-xs text-muted-foreground">{line.translation}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const PANELS: Record<
  StudySetContentType,
  (props: { items: StudySetItemRow[] }) => ReactNode
> = {
  vocabulary: VocabPanel,
  grammar: GrammarPanel,
  kanji: KanjiPanel,
  listening: ListeningPanel,
  speaking: SpeakingPanel,
};

export function StudySetContentPanel({
  type,
  items,
}: {
  type: StudySetContentType;
  items: StudySetItemRow[];
}) {
  const Panel = PANELS[type];
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Chưa có nội dung loại này.</p>;
  }
  return (
    <div>
      <h3 className="mb-3 font-medium">{STUDY_SET_CONTENT_LABELS[type]}</h3>
      <Panel items={items} />
    </div>
  );
}

export function groupItemsByType(items: StudySetItemRow[]) {
  const map = new Map<StudySetContentType, StudySetItemRow[]>();
  for (const item of items) {
    const list = map.get(item.contentType) ?? [];
    list.push(item);
    map.set(item.contentType, list);
  }
  return map;
}
