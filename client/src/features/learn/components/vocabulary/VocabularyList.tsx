import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';
import { paths } from '@/router/paths';

import { useVocabularyList } from '../../hooks/use-vocabulary-list';
import { VocabularyListItem } from './VocabularyListItem';
import { VocabularyListOverview } from './VocabularyListOverview';

type VocabularyListProps = {
  lessonId: string;
  /** Fallback khi API chưa trả title */
  fallbackTitle?: string;
};

export function VocabularyList({ lessonId, fallbackTitle }: VocabularyListProps) {
  const { playTts, speaking } = useSpeech();
  const { items, lessonTitle, loading, total, masteredCount, masteredPercent, toggleStar } =
    useVocabularyList(lessonId);

  const title = lessonTitle || fallbackTitle || 'Bài học';

  const playItemAudio = (item: (typeof items)[0]) => {
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      void audio.play();
      return;
    }
    void playTts(item.reading ?? item.word);
  };

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">Đang tải danh sách từ vựng...</p>;
  }

  return (
    <div className="relative pb-28">
      <div className="sticky top-0 z-10 -mx-1 space-y-4 bg-background/95 px-1 pb-4 pt-1 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <VocabularyListOverview
          lessonTitle={title}
          total={total}
          masteredCount={masteredCount}
          masteredPercent={masteredPercent}
        />

        <Button asChild size="lg" className="hidden w-full text-base font-semibold shadow-md sm:flex">
          <Link to={paths.learn.lessonVocabularyFlashcards(lessonId)}>
            🚀 Bắt đầu học Flashcard
          </Link>
        </Button>
      </div>

      {total === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
          Chưa có từ vựng trong bài này.
        </p>
      ) : (
        <ul className="mt-2 space-y-3" aria-label="Danh sách từ vựng">
          {items.map((item) => (
            <li key={item.id}>
              <VocabularyListItem
                item={item}
                speaking={speaking}
                onPlayAudio={() => playItemAudio(item)}
                onToggleStar={() =>
                  toggleStar(item.id, !(item.progress?.isStarred ?? false))
                }
              />
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:hidden">
          <Button asChild size="lg" className="h-14 w-full text-base font-semibold shadow-lg">
            <Link to={paths.learn.lessonVocabularyFlashcards(lessonId)}>
              🚀 Bắt đầu học Flashcard
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
