import { useEffect, useRef } from 'react';

import { cn } from '@/utils/cn';

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
    <div className={cn('relative overflow-hidden bg-zinc-900', className)}>
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={cn('h-full w-full object-cover', mirror && 'scale-x-[-1]')}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
          {placeholder}
        </div>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
          {label}
        </span>
      )}
    </div>
  );
}
