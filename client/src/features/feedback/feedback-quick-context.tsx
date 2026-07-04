import { createContext, useContext } from 'react';

import type { FeedbackQuickDialogInitial } from './components/FeedbackQuickDialog';

type FeedbackQuickContextValue = {
  openFeedback: (initial?: FeedbackQuickDialogInitial) => void;
};

export const FeedbackQuickContext = createContext<FeedbackQuickContextValue | null>(null);

export function useFeedbackQuick() {
  const ctx = useContext(FeedbackQuickContext);
  if (!ctx) {
    return { openFeedback: () => {} };
  }
  return ctx;
}
