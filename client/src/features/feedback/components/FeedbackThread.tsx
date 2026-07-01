import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import type { FeedbackMessage } from '../services/feedbackApi';

type FeedbackThreadProps = {
  messages: FeedbackMessage[];
  showInternal?: boolean;
  currentUserId?: string;
};

function authorLabel(msg: FeedbackMessage) {
  if (msg.author.displayName?.trim()) return msg.author.displayName;
  return msg.author.email;
}

function isStaffAuthor(msg: FeedbackMessage) {
  return msg.author.role === 'admin' || msg.author.role === 'instructor';
}

export function FeedbackThread({
  messages,
  showInternal = false,
  currentUserId,
}: FeedbackThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const visible = showInternal ? messages : messages.filter((m) => !m.isInternal);

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có tin nhắn.</p>;
  }

  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
      {visible.map((msg) => {
        const mine = currentUserId === msg.authorId;
        const staff = isStaffAuthor(msg);
        return (
          <div
            key={msg.id}
            className={cn('flex', mine ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                msg.isInternal
                  ? 'border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
                  : mine
                    ? 'bg-primary text-primary-foreground'
                    : staff
                      ? 'border border-border bg-muted'
                      : 'border border-border bg-background',
              )}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs opacity-80">
                <span className="font-semibold">{authorLabel(msg)}</span>
                {msg.isInternal ? (
                  <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase dark:bg-amber-900/60">
                    Nội bộ
                  </span>
                ) : null}
                <span>{new Date(msg.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
