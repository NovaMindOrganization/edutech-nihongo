import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { PencilLine, Play, Square, RotateCcw, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useLessonData } from "../context/lesson-context";
import { useSpeech } from "@/hooks/use-speech";
import { kanjiMemoryImageAssetUrl } from "@/services/httpClient";

export function LessonKanjiView() {
  const { kanji } = useLessonData();
  const { playTts, speaking } = useSpeech();
  const [activeKanjiId, setActiveKanjiId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<{
    animateCharacter: () => void;
    quiz: () => void;
    cancelQuiz: () => void;
  } | null>(null);

  const activeKanji = kanji.find((item) => item.id === activeKanjiId) ?? null;

  useEffect(() => {
    if (!activeKanji || !hostRef.current) return;

    hostRef.current.innerHTML = "";
    const writer = HanziWriter.create(hostRef.current, activeKanji.character, {
      width: 260,
      height: 260,
      padding: 12,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 220,
      showOutline: true,
      showCharacter: false,
      strokeColor: "#000000",
      radicalColor: "#000000",
    });

    writerRef.current = writer;
    setQuizMode(false);
    writer.animateCharacter();

    return () => {
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
      setQuizMode(false);
    };
  }, [activeKanji?.character]);

  function replayStroke() {
    writerRef.current?.cancelQuiz();
    setQuizMode(false);
    writerRef.current?.animateCharacter();
  }

  function startQuiz() {
    setQuizMode(true);
    writerRef.current?.quiz();
  }

  function stopQuiz() {
    writerRef.current?.cancelQuiz();
    setQuizMode(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-jp">
            Kanji tiết học ({kanji.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {kanji.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có kanji.</p>
          )}
          {kanji.length > 0 && (
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Kanji</th>
                  <th className="px-3 py-2">Han-Viet Pronunciation</th>
                  <th className="px-3 py-2">Kun</th>
                  <th className="px-3 py-2">On</th>
                  <th className="px-3 py-2">Meaning</th>
                  <th className="px-3 py-2">Bộ thủ chính</th>
                  <th className="px-3 py-2">Word 1</th>
                  <th className="px-3 py-2">Word 2</th>
                  <th className="px-3 py-2">Word 3</th>
                  <th className="px-3 py-2">MemoryTip</th>
                  <th className="px-3 py-2">StrokeCount</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Stroke</th>
                </tr>
              </thead>
              <tbody>
                {kanji.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-border/40 align-top last:border-0"
                  >
                    <td className="px-3 py-3 font-jp text-2xl font-semibold">
                      {k.character}
                    </td>
                    <td className="px-3 py-3">
                      {k.hanVietPronunciation ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {k.readingsKun.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {k.readingsKun.map((reading, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span>{reading}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0 h-6 w-6"
                                disabled={speaking}
                                onClick={() => playTts(reading)}
                              >
                                <Volume2 className="size-3" />
                              </Button>
                              {i < k.readingsKun.length - 1 && <span className="text-muted-foreground">,</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {k.readingsOn.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {k.readingsOn.map((reading, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span>{reading}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0 h-6 w-6"
                                disabled={speaking}
                                onClick={() => playTts(reading)}
                              >
                                <Volume2 className="size-3" />
                              </Button>
                              {i < k.readingsOn.length - 1 && <span className="text-muted-foreground">,</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">{k.meaning}</td>
                    <td className="px-3 py-3 font-jp text-xl font-semibold">
                      {k.radical ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {k.examples[0] ? (
                        <div>
                          <p className="font-medium">{k.examples[0].word}</p>
                          <p className="text-muted-foreground">
                            {k.examples[0].reading ?? "—"}
                          </p>
                          <p>{k.examples[0].meaning}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {k.examples[1] ? (
                        <div>
                          <p className="font-medium">{k.examples[1].word}</p>
                          <p className="text-muted-foreground">
                            {k.examples[1].reading ?? "—"}
                          </p>
                          <p>{k.examples[1].meaning}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {k.examples[2] ? (
                        <div>
                          <p className="font-medium">{k.examples[2].word}</p>
                          <p className="text-muted-foreground">
                            {k.examples[2].reading ?? "—"}
                          </p>
                          <p>{k.examples[2].meaning}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">{k.memoryTip ?? "—"}</td>
                    <td className="px-3 py-3">{k.strokeCount ?? "—"}</td>
                    <td className="px-3 py-3">{k.jlptLevel}</td>
                    <td className="px-3 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveKanjiId(k.id)}
                      >
                        <PencilLine className="size-4" />
                        Vẽ nét
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(activeKanji)}
        onOpenChange={(open) => {
          if (!open) {
            writerRef.current?.cancelQuiz();
            setQuizMode(false);
            setActiveKanjiId(null);
          }
        }}
        title={activeKanji ? `Vẽ nét: ${activeKanji.character}` : "Vẽ nét"}
        className="max-w-3xl"
      >
        {activeKanji && (
          <div className="grid gap-4 md:grid-cols-[280px,1fr]">
            <div className="space-y-3">
              <div
                ref={hostRef}
                className="mx-auto flex h-[260px] w-[260px] items-center justify-center rounded-xl border border-border/60 bg-muted/20"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={replayStroke}
                >
                  <Play className="size-4" />
                  Animate
                </Button>
                {!quizMode ? (
                  <Button type="button" size="sm" onClick={startQuiz}>
                    <PencilLine className="size-4" />
                    Quiz
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopQuiz}
                  >
                    <Square className="size-4" />
                    Stop
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={replayStroke}
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Kanji:</span>{" "}
                <span className="font-jp text-lg">{activeKanji.character}</span>
              </p>
              <p>
                <span className="font-medium">Han-Viet:</span>{" "}
                {activeKanji.hanVietPronunciation ?? "—"}
              </p>
              <div className="flex items-start gap-2">
                <span className="font-medium mt-1">Kun:</span>
                {activeKanji.readingsKun.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    {activeKanji.readingsKun.map((reading, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span>{reading}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 h-6 w-6"
                          disabled={speaking}
                          onClick={() => playTts(reading)}
                        >
                          <Volume2 className="size-3" />
                        </Button>
                        {i < activeKanji.readingsKun.length - 1 && <span className="text-muted-foreground">,</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="mt-1">—</span>
                )}
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium mt-1">On:</span>
                {activeKanji.readingsOn.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    {activeKanji.readingsOn.map((reading, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span>{reading}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 h-6 w-6"
                          disabled={speaking}
                          onClick={() => playTts(reading)}
                        >
                          <Volume2 className="size-3" />
                        </Button>
                        {i < activeKanji.readingsOn.length - 1 && <span className="text-muted-foreground">,</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="mt-1">—</span>
                )}
              </div>
              <p>
                <span className="font-medium">Nghĩa:</span>{" "}
                {activeKanji.meaning}
              </p>
              <p>
                <span className="font-medium">Bộ thủ chính:</span>{" "}
                <span className="font-jp text-lg">
                  {activeKanji.radical ?? "—"}
                </span>
              </p>
              <p>
                <span className="font-medium">Số nét:</span>{" "}
                {activeKanji.strokeCount ?? "—"}
              </p>
              {activeKanji.memoryImageUrl && (
                <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tượng hình / Cách nhớ
                  </p>
                  <img
                    src={kanjiMemoryImageAssetUrl(activeKanji.id)}
                    alt={`Memoric ${activeKanji.character}`}
                    className="mt-2 w-full max-w-[420px] rounded object-contain"
                  />
                </div>
              )}
              <p className="text-muted-foreground">
                Mẹo: {activeKanji.memoryTip ?? "Chưa có mẹo nhớ cho chữ này."}
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
