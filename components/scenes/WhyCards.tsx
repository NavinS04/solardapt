'use client';

import { MapPin, PhoneCall, ShieldCheck, CalendarCheck, Timer, Layers } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Tilt } from '@/components/motion/Tilt';
import { Reveal } from '@/components/motion/Reveal';

// The six audit questions every installer asks, answered before they're asked
// (ICP §5.2). These are commitments of scope/process, not performance claims.
const CARDS = [
  {
    icon: MapPin,
    title: 'Postcode-district exclusivity',
    detail:
      'Your districts are yours alone — in writing, in the agreement. One installer per area, capped as a matter of policy.',
  },
  {
    icon: PhoneCall,
    title: 'Your phone, answered live',
    detail:
      'Every enquiry answered in your trading name, to a script you approve word-for-word, with recordings you can review.',
  },
  {
    icon: ShieldCheck,
    title: 'Screened before they’re booked',
    detail:
      'Homeowner, roof basics, finance-readiness — or genuine grant eligibility if that’s your model. Grant tourists screened out.',
  },
  {
    icon: CalendarCheck,
    title: 'Show-rate protection',
    detail:
      'Confirmation call, reminder sequence, live reschedule handling — because a no-show after scaffold is booked costs real money.',
  },
  {
    icon: Timer,
    title: '30-day rolling terms',
    detail:
      'No long lock-in. Start with a bounded trial, scale up or switch off on 30 days’ notice. You stay in control.',
  },
  {
    icon: Layers,
    title: 'The whole front office',
    detail:
      'Ads, funnel, phones, qualification, diary — one partner, one throat to choke. Your only job is to send a surveyor.',
  },
];

export function WhyCards() {
  return (
    <section className="relative overflow-hidden bg-bg-0 py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Why Solardapt"
          title="The questions you’d audit us on — answered up front."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
