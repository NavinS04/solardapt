'use client';

import { useState } from 'react';
import { CheckCircle2, FileText, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ColLabel, INSTALLER, OWNER, gbp, quiet, useRunner } from './kit';

/*
 * Survey-to-proposal demo: the surveyor's rough notes become a customer-ready
 * proposal and a pre-filled grid connection form. Prices come only from the
 * installer's own price list; generation figures are marked as estimates.
 * Nothing sends until the owner approves it. Scripted and fictional.
 */
const NOTES = [
  'Mrs R. Ahmed, 14 Larch Close, WV6',
  '3-bed semi, built ~1995',
  'Main roof SSW, ~35° pitch, tiles good, no shading',
  'Room for 10 panels on main roof',
  'Bill ~£140/month, home most days (works from home)',
  'Wants battery. Interested in EV charger later',
  'Fuse board: modern, 100A main fuse',
  'Scaffold: front only, drive access fine',
];

const PRICE_LIST = [
  { item: '10 × 435W panels (4.35kWp) incl. mounting', price: 4650 },
  { item: '5.2kWh battery + hybrid inverter', price: 2890 },
  { item: 'Scaffold (front elevation)', price: 480 },
  { item: 'Bird mesh', price: 220 },
];
const TOTAL = PRICE_LIST.reduce((a, b) => a + b.price, 0);

interface Section { title: string; body: string }
const SECTIONS: Section[] = [
  {
    title: 'Your system',
    body: '10 black 435W panels on your south-south-west roof (4.35kWp), a 5.2kWh battery and a hybrid inverter, so the power you make in the day can run your home in the evening.',
  },
  {
    title: 'What it should generate',
    body: 'Around 3,700 kWh a year (estimate). With you home in the day and a battery, most of it gets used in your own home rather than exported.',
  },
  {
    title: 'Your price',
    body: `${gbp(TOTAL)} fixed, including scaffold, bird mesh, installation, commissioning and grid notification. 0% VAT applies to residential solar and batteries.`,
  },
  {
    title: 'Ready for later',
    body: 'You mentioned an EV charger. The inverter we’ve chosen works with one, so adding it later is simple.',
  },
  {
    title: 'What happens next',
    body: 'Accept online, pick an install date, and we handle the grid notification. Installs usually take one to two days.',
  },
];

const G98 = [
  ['Installation address', '14 Larch Close, WV6'],
  ['Generation type', 'Solar PV + battery storage'],
  ['Inverter capacity', '3.68kW (G98 limit)'],
  ['Panel capacity', '4.35kWp'],
  ['Storage', '5.2kWh'],
  ['Installer', INSTALLER],
];

export function SurveyToQuote() {
  const { begin, stop, wait } = useRunner();
  const [step, setStep] = useState(0); // 0 idle, 1 drafting, 2 drafted, 3 approved
  const [shown, setShown] = useState(0);
  const [checks, setChecks] = useState<string[]>([]);

  const reset = () => {
    stop();
    setStep(0);
    setShown(0);
    setChecks([]);
  };

  const generate = () => {
    reset();
    const t = begin();
    setStep(1);
    quiet(
      (async () => {
        for (let i = 1; i <= SECTIONS.length; i++) {
          await wait(t, 750);
          setShown(i);
        }
        for (const c of ['Every price matched to your price list', 'Inverter within the G98 limit for a single phase', 'Customer’s own words picked up: battery now, EV charger later', 'Generation marked as an estimate, no savings promised']) {
          await wait(t, 450);
          setChecks((x) => [...x, c]);
        }
        setStep(2);
      })(),
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={generate} disabled={step === 1}>
          <Sparkles className="size-4" /> <span className="sm:hidden">Write the proposal</span><span className="hidden sm:inline">Turn the notes into a proposal</span>
        </Button>
        <Button size="lg" variant="secondary" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div>
          <ColLabel>The surveyor’s notes, typed on site</ColLabel>
          <div className="rounded-md bg-amber-50 p-5 font-mono text-[13px] leading-relaxed text-zinc-800 shadow-card">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-amber-700">Survey: Tue 14:10</p>
            <ul className="space-y-1">
              {NOTES.map((n) => (
                <li key={n}>– {n}</li>
              ))}
            </ul>
          </div>
          <ColLabel>
            <span className="mt-6 block">Your price list</span>
          </ColLabel>
          <div className="rounded-md border border-border bg-bg-surface/60 p-4 text-sm">
            {PRICE_LIST.map((p) => (
              <div key={p.item} className="flex justify-between gap-3 border-b border-border py-1.5 last:border-0">
                <span className="text-muted-foreground">{p.item}</span>
                <span className="tabular-nums">{gbp(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <ColLabel>Draft ready for your approval</ColLabel>
          <div className="rounded-md bg-white p-5 text-zinc-900 shadow-card sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 pb-3">
              <b className="font-display text-lg">Your solar proposal</b>
              <span className="text-xs text-zinc-500">{INSTALLER} · for Mrs R. Ahmed</span>
            </div>
            {step === 0 && <p className="py-16 text-center text-sm text-zinc-500">Press “Turn the notes into a proposal”.</p>}
            {SECTIONS.slice(0, shown).map((s) => (
              <div key={s.title} className="border-b border-zinc-100 py-3 last:border-0 animate-in fade-in slide-in-from-bottom-1">
                <h4 className="text-sm font-bold text-solar-600">{s.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-zinc-700">{s.body}</p>
              </div>
            ))}
          </div>

          {checks.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-md glass p-5">
                <h3 className="mb-3 font-semibold">Checked before you see it</h3>
                <ul className="space-y-2 text-sm">
                  {checks.map((c) => (
                    <li key={c} className="flex gap-2 animate-in fade-in">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> <span className="text-muted-foreground">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md glass p-5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <FileText className="size-4 text-solar-400" /> Grid notification (G98), pre-filled
                </h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  {G98.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="mt-5 flex flex-wrap items-center gap-3 animate-in fade-in">
              <Button onClick={() => setStep(3)} disabled={step === 3} className={cn(step === 3 && 'opacity-60')}>
                {step === 3 ? 'Approved and sent' : 'Approve and send to customer'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {step === 3
                  ? `Sent from ${OWNER}’s email. A follow-up is set for 3 days’ time if she hasn’t replied.`
                  : 'Nothing goes to the customer until you press this. Edit anything first.'}
              </span>
            </div>
          )}
          {step >= 2 && (
            <p className="mt-3 text-sm text-muted-foreground">
              <Badge>Example</Badge> Fictional survey and price list. Generation is an estimate; your own price list, wording and
              branding are used in the real build.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
