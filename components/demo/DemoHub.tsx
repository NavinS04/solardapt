'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Calculator, FileText, MessageCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SurveyDemo } from './SurveyDemo';
import { QuoteRevival } from './QuoteRevival';
import { AfterHours } from './AfterHours';
import { SurveyToQuote } from './SurveyToQuote';
import { GiveBack } from './GiveBack';

/*
 * One page, five demos. Each tab says which of the three things it buys back:
 * revenue, time or a better-run business. ?d=<id> deep-links a tab, so a single
 * demo can be texted to an installer after a call.
 */
const DEMOS = [
  { id: 'enquiry', label: 'New enquiry to booked survey', buys: 'Revenue', icon: CalendarCheck, intro: 'An enquiry lands while you’re on a roof. Left: what the homeowner sees. Right: what you get.', el: <SurveyDemo /> },
  { id: 'quotes', label: 'Old quotes, back in play', buys: 'Revenue', icon: RefreshCcw, intro: 'Quotes that went quiet are money you’ve already spent. One polite, personal text each, and the replies come to you.', el: <QuoteRevival /> },
  { id: 'evenings', label: 'Messages answered at 9pm', buys: 'Time', icon: MessageCircle, intro: 'Homeowners message in the evening. It answers from what you’ve approved, books surveys and leaves the rest for you.', el: <AfterHours /> },
  { id: 'proposal', label: 'Survey notes to proposal', buys: 'Time', icon: FileText, intro: 'Rough notes from the survey become a customer-ready proposal and a pre-filled grid form, waiting for your OK.', el: <SurveyToQuote /> },
  { id: 'numbers', label: 'What it gives you back', buys: 'Time + revenue', icon: Calculator, intro: 'Put in your own numbers. Nothing here is our promise or a forecast: it adds up what you tell it, so you can see what’s worth fixing first.', el: <GiveBack /> },
] as const;
type DemoId = (typeof DEMOS)[number]['id'];

export function DemoHub() {
  const [active, setActive] = useState<DemoId>('enquiry');

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get('d');
    if (d && DEMOS.some((x) => x.id === d)) setActive(d as DemoId);
  }, []);

  const pick = (id: DemoId) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set('d', id);
    window.history.replaceState(null, '', url);
  };

  const demo = DEMOS.find((x) => x.id === active) ?? DEMOS[0];

  return (
    <div>
      <div role="tablist" aria-label="Demos" className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={active === d.id}
            onClick={() => pick(d.id)}
            className={cn(
              'flex items-start gap-3 rounded-md border p-3.5 text-left transition-colors',
              active === d.id ? 'border-solar-500/60 bg-solar-500/10' : 'border-border bg-bg-surface/50 hover:border-solar-500/30',
            )}
          >
            <d.icon className={cn('mt-0.5 size-5 shrink-0', active === d.id ? 'text-solar-400' : 'text-muted-foreground')} />
            <span className="min-w-0">
              <b className="block text-sm font-semibold leading-snug">{d.label}</b>
              <span className="text-xs text-muted-foreground">Buys back: {d.buys.toLowerCase()}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="mb-8 max-w-3xl text-lg text-muted-foreground">{demo.intro}</p>
      <div key={demo.id} role="tabpanel" className="animate-in fade-in">
        {demo.el}
      </div>
    </div>
  );
}
