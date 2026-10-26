'use client';

import Link from 'next/link';
import { MousePointerClick, KeyRound, Gauge } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';

/*
 * Proof section. Solardapt has no client results yet, so this says so and
 * offers what an installer can check instead. Real, named results replace it
 * only with the installer's written permission. Invented reviews are banned
 * practice under the UK DMCC Act 2024, so we do not publish any.
 */
const CARDS = [
  {
    icon: MousePointerClick,
    title: 'See it before you pay',
    body: (
      <>
        The <Link href="/demo">live demo</Link> handles an enquiry end to end, in front of you. What
        you see is what gets built for you, in your name.
      </>
    ),
  },
  {
    icon: KeyRound,
    title: 'You keep everything',
    body: 'The ad account is yours and you pay Meta directly. Your enquiry data is yours. Leave with 30 days notice and take it all with you.',
  },
  {
    icon: Gauge,
    title: 'Built by an engineer',
    body: 'Founded by Navin Sonsana, a product-integrity engineer. Every step is measured, traceable and reported weekly, so you can judge it on numbers.',
  },
];

export function SocialProof() {
  return (
    <section id="proof" className="relative scroll-mt-24 overflow-hidden bg-bg-1 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Straight talk"
          title="Why trust someone new?"
          subtitle="You shouldn’t take our word for it, and you don’t have to. We don’t have client case studies yet, and we won’t invent any. Here is what you can check instead."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-md glass p-7 [&_a]:text-solar-400 [&_a]:underline">
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-md bg-solar-500/10 text-solar-400">
                  <card.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
          Results will be published here, with real numbers and the installer’s written permission,
          as they come in. Until then, nothing on this site is a client result.
        </p>
      </div>
    </section>
  );
}
