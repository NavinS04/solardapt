'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // TODO: report to Sentry when SENTRY_DSN is configured.
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-0 text-center">
      <div className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-solar-gradient opacity-15 blur-[120px]" />
      <div className="container relative">
        <p className="font-display text-[clamp(3rem,10vw,7rem)] font-bold leading-none text-gradient">
          500
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Something went wrong on our end.</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          We’ve logged the issue. Please try again.
        </p>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
