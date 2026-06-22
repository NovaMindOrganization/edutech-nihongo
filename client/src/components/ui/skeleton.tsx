import { MotionSkeleton } from '@/components/motion';

export function Skeleton(props: React.ComponentProps<typeof MotionSkeleton>) {
  return <MotionSkeleton {...props} />;
}
