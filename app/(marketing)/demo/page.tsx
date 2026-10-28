import type { Metadata } from 'next';
import { SurveyDemo } from '@/components/demo/SurveyDemo';

export const metadata: Metadata = {
  title: 'Live Demo',
  description:
    'Watch the Solar Survey Engine handle a homeowner enquiry end to end: qualification, instant reply, survey booking, reminders and no-show recovery.',
};

export default function DemoPage() {
  return (
    <section className="relative overflow-hidden bg-bg-0 pb-28 pt-32">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-40" aria-hidden="true" />
      <div className="container relative">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-solar-500">Live demo</p>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-tight">
            One enquiry, <span className="text-gradient">start to finish.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Left: what the homeowner sees. Right: what the installer gets.{' '}
            <strong className="text-foreground">
              Brightfield Solar is a fictional installer. Nothing on this page is sent anywhere
            </strong>
            , and timings are sped up.
          </p>
        </div>
        <SurveyDemo />
      </div>
    </section>
  );
}
