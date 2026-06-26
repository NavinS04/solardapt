import Image from 'next/image';
import { cn } from '@/lib/utils';

/*
 * Solardapt wordmark with rising half-sun. The real PNG lives at
 * /public/brand/solardapt-logo.png (owner-supplied — see §14). Until it is
 * present we render an on-brand inline SVG so the build never breaks.
 */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label="Solardapt">
      <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--solar-400)" />
            <stop offset="50%" stopColor="var(--solar-500)" />
            <stop offset="100%" stopColor="var(--solar-600)" />
          </linearGradient>
        </defs>
        <path d="M6 30a18 18 0 0 1 36 0" stroke="url(#sun)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="24" cy="30" r="8" fill="url(#sun)" />
        <line x1="2" y1="38" x2="46" y2="38" stroke="url(#sun)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {withWordmark && (
        <span className="text-lg font-semibold tracking-tight">
          solar<span className="text-gradient">dapt</span>
        </span>
      )}
    </span>
  );
}

/** Optional <Image> variant used once the real asset is dropped in. */
export function LogoImage({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/solardapt-logo.png"
      alt="Solardapt"
      width={160}
      height={40}
      className={className}
      priority
    />
  );
}
