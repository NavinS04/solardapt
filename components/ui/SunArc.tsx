import { cn } from '@/lib/utils';

/** The repeated sunrise-arc motif used as a section divider / accent (§4). */
export function SunArc({ className, animated = true }: { className?: string; animated?: boolean }) {
  return (
    <div
      className={cn('sun-arc w-full max-w-xl mx-auto rounded-full', animated && 'animate-shimmer', className)}
      aria-hidden="true"
    />
  );
}
