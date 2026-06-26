import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThankYouTracking } from '@/components/scenes/ThankYouTracking';

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-bg-0">
      <div className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-solar-gradient opacity-20 blur-[120px]" />
      <div className="container relative text-center">
        <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full bg-solar-gradient text-2xl">
          ☀
        </div>
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold tracking-tight">
          You’re all set.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
          Thanks — we’ve got your details. Keep an eye on your inbox and phone; we’ll reach out
          shortly to confirm your free strategy call.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </div>
      <ThankYouTracking />
    </section>
  );
}
