import type { Metadata } from 'next';
import { DemoHub } from '@/components/demo/DemoHub';

export const metadata: Metadata = {
  title: 'Live Demos',
  description:
    'See what Solardapt builds for UK solar installers: enquiries booked as surveys, old quotes back in play, evening messages answered, survey notes turned into proposals, and what it gives you back.',
};

export default function DemoPage() {
  return (
    <section className="relative overflow-hidden bg-bg-0 pb-28 pt-32">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-40" aria-hidden="true" />
      <div className="container relative">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-solar-500">Live demos</p>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-tight">
            Your time back. <span className="text-gradient">Your revenue back.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Five things we build for solar installers, working in front of you. Pick one.{' '}
            <strong className="text-foreground">
              Brightfield Solar is a fictional installer. Nothing on this page is sent anywhere
            </strong>
            , and timings are sped up.
          </p>
        </div>
        <DemoHub />
      </div>
    </section>
  );
}
