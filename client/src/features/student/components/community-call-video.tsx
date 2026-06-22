import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

type CommunityCallVideoProps = {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  label?: string;
  className?: string;
  placeholder?: string;
};

export function CommunityCallVideo({
  stream,
  muted = false,
  mirror = false,
  label,
  className,
  placeholder = 'Đang chờ video…',
}: CommunityCallVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
  }, [stream]);

  return (
    <div className={cn('relative overflow-hidden bg-ink', className)}>
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={cn('h-full w-full object-cover', mirror && 'scale-x-[-1]')}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-background/60">
          {placeholder}
        </div>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-ink/60 px-2 py-1 text-xs text-background">
          {label}
        </span>
      )}
    </div>
  );
}
