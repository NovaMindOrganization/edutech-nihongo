import { useCallback, useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';

import { cn } from '@/utils/cn';

type WriterHandle = {
  animateCharacter: (options?: { onComplete?: (res: { canceled: boolean }) => void }) => Promise<unknown>;
  quiz: (options?: {
    quizStartStrokeNum?: number;
    onCorrectStroke?: () => void;
    onComplete?: (summary: { character: string; totalMistakes: number }) => void;
  }) => Promise<unknown>;
  cancelQuiz: () => void;
};

type KanjiDrawingBoardProps = {
  character: string;
  className?: string;
  onPracticeComplete?: () => void;
};

const CANVAS_MAX_PX = 320;

const controlBtnClass =
  'rounded-lg border border-gray-200 bg-white py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50';

export function KanjiDrawingBoard({
  character,
  className,
  onPracticeComplete,
}: KanjiDrawingBoardProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<WriterHandle | null>(null);
  const completedStrokesRef = useRef(0);
  const [canvasSize, setCanvasSize] = useState(CANVAS_MAX_PX);

  const startQuiz = useCallback(
    (fromStroke = 0) => {
      const writer = writerRef.current;
      if (!writer) return;

      completedStrokesRef.current = fromStroke;
      writer.cancelQuiz();
      void writer.quiz({
        quizStartStrokeNum: fromStroke,
        onCorrectStroke: () => {
          completedStrokesRef.current += 1;
        },
        onComplete: () => {
          onPracticeComplete?.();
          completedStrokesRef.current = 0;
        },
      });
    },
    [onPracticeComplete],
  );

  const mountWriter = useCallback(() => {
    if (!hostRef.current) return;

    hostRef.current.innerHTML = '';
    const size = canvasSize;

    const writer = HanziWriter.create(hostRef.current, character, {
      width: size,
      height: size,
      padding: 16,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 200,
      showOutline: true,
      showCharacter: false,
      strokeColor: '#1c1917',
      radicalColor: '#1c1917',
      drawingColor: '#2563eb',
      outlineColor: '#d6d3d1',
      highlightColor: '#f59e0b',
    }) as WriterHandle;

    writerRef.current = writer;
    completedStrokesRef.current = 0;

    void writer.animateCharacter({
      onComplete: (res) => {
        if (!res.canceled) startQuiz(0);
      },
    });
  }, [canvasSize, character, startQuiz]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateSize = () => {
      const next = Math.min(CANVAS_MAX_PX, Math.floor(el.clientWidth));
      if (next > 0) setCanvasSize(next);
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    mountWriter();
    return () => {
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
    };
  }, [mountWriter]);

  const handleUndo = () => {
    const prev = Math.max(0, completedStrokesRef.current - 1);
    startQuiz(prev);
  };

  const handleClear = () => {
    startQuiz(0);
  };

  const handleReplay = () => {
    const writer = writerRef.current;
    if (!writer) return;

    writer.cancelQuiz();
    completedStrokesRef.current = 0;
    void writer.animateCharacter({
      onComplete: (res) => {
        if (!res.canceled) startQuiz(0);
      },
    });
  };

  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center', className)}>
      <div
        ref={wrapperRef}
        className="aspect-square w-full max-w-[320px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-inner"
      >
        <div className="relative h-full w-full">
          <div
            className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2"
            aria-hidden
          >
            <div className="border-r border-b border-dashed border-gray-300" />
            <div className="border-b border-dashed border-gray-300" />
            <div className="border-r border-dashed border-gray-300" />
            <div />
          </div>
          <div
            ref={hostRef}
            className="absolute inset-0 flex items-center justify-center [&_svg]:mx-auto"
            aria-label={`Vùng vẽ nét cho chữ ${character}`}
          />
        </div>
      </div>

      <div className="mt-6 grid w-full max-w-[320px] grid-cols-3 gap-3">
        <button type="button" className={controlBtnClass} onClick={handleUndo}>
          Hoàn tác
        </button>
        <button type="button" className={controlBtnClass} onClick={handleClear}>
          Xóa
        </button>
        <button type="button" className={controlBtnClass} onClick={handleReplay}>
          Phát lại
        </button>
      </div>
    </div>
  );
}
