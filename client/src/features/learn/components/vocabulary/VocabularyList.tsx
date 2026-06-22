import { Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppIcon } from '@/components/usable/app-icon';
import { EmptyState, emptyStatePresets, VocabularyListSkeleton } from '@/components/usable/states';
import { buttonVariants } from '@/components/ui/button-variants';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
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
    return <VocabularyListSkeleton />;
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

        <Link
          to={paths.learn.lessonVocabularyFlashcards(lessonId)}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'hidden w-full gap-2 text-base font-semibold sm:inline-flex',
          )}
        >
          <AppIcon icon={Layers3} size="sm" className="bg-tertiary" />
          Bắt đầu học Flashcard
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState {...emptyStatePresets.vocabulary} />
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
          <Link
            to={paths.learn.lessonVocabularyFlashcards(lessonId)}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-14 w-full gap-2 text-base font-semibold',
            )}
          >
            <AppIcon icon={Layers3} size="sm" className="bg-tertiary" />
            Bắt đầu học Flashcard
          </Link>
        </div>
      )}
    </div>
  );
}
