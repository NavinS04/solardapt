'use client';

import { MapPin, ShieldCheck, CalendarCheck, CalendarClock, Timer, KeyRound } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Tilt } from '@/components/motion/Tilt';
import { Reveal } from '@/components/motion/Reveal';

// The questions every installer asks, answered before they're asked. These
// are commitments of scope and process, not performance claims.
const CARDS = [
  {
    icon: MapPin,
    title: 'One installer per postcode district',
    detail:
      'Your districts are yours alone, written into the agreement. We never sell or share your enquiries with anyone else.',
  },
  {
    icon: Timer,
    title: 'A reply within a minute',
    detail:
      'Text and email go to the homeowner automatically, day or evening, while your team is on a roof. Quiet hours respected.',
  },
  {
    icon: ShieldCheck,
    title: 'Qualified before they are booked',
    detail:
      'Homeowner, property, roof, bill and timeframe, scored by fixed rules. Renters and browsers are thanked and filtered out.',
  },
  {
    icon: CalendarCheck,
    title: 'Reminders and no-show recovery',
    detail:
      'Confirmation, a reminder the day before and on the morning, and an automatic rebooking route if someone misses it.',
  },
  {
    icon: KeyRound,
    title: 'Your ad account, your data',
    detail:
      'Ads run in your own Meta account and you pay Meta directly. Budgets change only with your written OK. Leave and take everything.',
  },
  {
    icon: CalendarClock,
    title: 'Rolling monthly, 30 days notice',
    detail:
      'No long contract. If the agreed service milestones are not delivered, you can pause the monthly fee until they are.',
  },
];

export function WhyCards() {
  return (
    <section className="relative overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Why Solardapt"
          title="What you get, in writing."
        />
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06}>
              <Tilt className="group h-full">
                <div className="glow-border relative h-full rounded-md glass p-7 transition-colors duration-300 hover:border-solar-500/40">
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
