import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-0 text-center">
      <div className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-solar-gradient opacity-15 blur-[120px]" />
      <div className="container relative">
        <p className="font-display text-[clamp(4rem,14vw,10rem)] font-bold leading-none text-gradient">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold">This page set below the horizon.</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Button>Back to home</Button>
        </Link>
      </div>
    </main>
  );
}
