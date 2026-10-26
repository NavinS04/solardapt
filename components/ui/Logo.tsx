import { cn } from '@/lib/utils';

/*
 * The Solardapt mark, redrawn as SVG from the supplied logo: five rays over a
 * dome sun on a baseline, wordmark beside it. The sun keeps its orange
 * gradient; the baseline and wordmark use currentColor so the mark adapts to
 * dark and light surfaces without the white background of the source file.
 */
export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label="Solardapt">
      <svg width="34" height="27" viewBox="0 0 56 44" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="sd-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--solar-400)" />
            <stop offset="55%" stopColor="var(--solar-500)" />
            <stop offset="100%" stopColor="var(--solar-600)" />
          </linearGradient>
        </defs>
        {/* Rays */}
        <g stroke="url(#sd-sun)" strokeWidth="3.6" strokeLinecap="round">
          <line x1="28" y1="20" x2="28" y2="13" />
          <line x1="37.7" y1="22.8" x2="41.2" y2="17.4" />
          <line x1="18.3" y1="22.8" x2="14.8" y2="17.4" />
          <line x1="44.3" y1="30.4" x2="50" y2="27.7" />
          <line x1="11.7" y1="30.4" x2="6" y2="27.7" />
        </g>
        {/* Dome sun */}
        <path d="M14 38a14 14 0 0 1 28 0z" fill="url(#sd-sun)" />
        {/* Baseline */}
        <line x1="7" y1="38" x2="49" y2="38" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
      </svg>
      {withWordmark && (
        <span className="text-lg font-bold lowercase tracking-tight">solardapt</span>
      )}
    </span>
  );
}
