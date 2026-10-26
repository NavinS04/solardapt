'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';

const TERMS = [
  'One installer per postcode district, written into the agreement',
  'A fixed monthly fee and a one-off setup, agreed on the call',
  'Ad spend paid by you, directly to Meta, changed only with your written OK',
  'Weekly report, plus a short weekly call in the first month',
  'Rolling monthly, 30 days notice, no lock-in',
  'A testimonial only if you are genuinely happy. Never a condition',
];

export function Founding() {
  return (
    <section id="founding" className="relative scroll-mt-24 overflow-hidden bg-bg-0 py-28">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-40" aria-hidden="true" />
      <div className="container relative">
        <Reveal>
          <div className="glow-border grid grid-cols-1 gap-10 rounded-lg glass p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-solar-500">
                Founding installer programme
              </p>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
                Five founding installers. <span className="text-gradient">Then the price goes up.</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                I build and run everything personally: no juniors, no outsourcing. Five is the number
                I can do properly. Founding partners get a reduced rate, held for six months, in
                exchange for letting me document the results.
              </p>
              <Link href="/book" className={buttonVariants({ size: 'lg', className: 'mt-8' })}>
                Ask about a founding place <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {TERMS.map((term) => (
                <li key={term} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-solar-500/15 text-solar-400">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-muted-foreground">{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
