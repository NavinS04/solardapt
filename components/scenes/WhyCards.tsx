'use client';

import { Shield, CalendarCheck, Settings, BarChart3, Sun, KeyRound } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Tilt } from '@/components/motion/Tilt';
import { Reveal } from '@/components/motion/Reveal';

const CARDS = [
  { icon: Shield, title: 'Exclusive leads', detail: 'Never shared, never resold. Your pipeline only — homeowners only you get to call.' },
  { icon: CalendarCheck, title: 'Booked appointments, not clicks', detail: 'Qualified homeowners land on your calendar with a confirmed time, not a maybe.' },
  { icon: Settings, title: 'Done-for-you', detail: 'We build, run and optimise the entire funnel — creative, copy, qualification, follow-up.' },
  { icon: BarChart3, title: 'Predictable & trackable', detail: 'Cost per lead, per appointment, show rate, close rate. No guessing, ever.' },
  { icon: Sun, title: 'Specialists in solar only', detail: 'We do one thing: fill solar installers’ calendars. The frameworks are battle-tested for your niche.' },
  { icon: KeyRound, title: 'You own the system', detail: 'The pipeline, the data and the assets are yours — not locked inside an agency black box.' },
];

export function WhyCards() {
  return (
    <section className="relative overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Why Solardapt"
          title="Built to make your calendar the dependable part of the business."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06}>
              <Tilt className="group h-full">
                <div className="relative h-full overflow-hidden rounded-md glass p-7 transition-colors duration-300 hover:border-solar-500/40">
                  <div className="absolute inset-0 -z-10 bg-solar-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-10" />
                  <div className="mb-5 inline-flex size-12 items-center justify-center rounded-md bg-solar-500/10 text-solar-400">
                    <card.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
