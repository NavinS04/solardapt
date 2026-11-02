'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, PoundSterling, TrendingUp } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { calculateGiveBack, WORKING_WEEKS } from '@/lib/giveback';
import { gbp } from './kit';

/*
 * "What it gives you back": time, revenue and a calmer business, worked out
 * from the visitor's own numbers only. Defaults are placeholders to change.
 */
function Field({
  id, label, hint, value, onChange, min, max, step, suffix,
}: {
  id: string; label: string; hint?: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            aria-label={`${label} value`}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 rounded-md border border-border bg-bg-0 px-2 py-1 text-right text-sm tabular-nums"
          />
          {suffix && <span className="w-10 text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--solar-500)]"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const BETTER = [
  'You see every enquiry, survey and quote in one weekly report, instead of guessing.',
  'Nobody is left waiting for a reply, so fewer homeowners go to whoever rang first.',
  'Evenings and weekends stop being for admin.',
  'The business runs the same way whether you’re on a roof, on holiday or off sick.',
];

export function GiveBack() {
  const [hoursChasing, setChasing] = useState(6);
  const [hoursQuoting, setQuoting] = useState(4);
  const [hoursEvening, setEvening] = useState(2);
  const [sharePct, setShare] = useState(50);
  const [hourValue, setRate] = useState(40);
  const [quietQuotes, setQuiet] = useState(40);
  const [reopenPct, setReopen] = useState(5);
  const [profit, setProfit] = useState(1800);

  const r = useMemo(
    () =>
      calculateGiveBack({
        hoursChasing, hoursQuoting, hoursEvening, shareOff: sharePct / 100, hourValue,
        quietQuotes, reopenRate: reopenPct / 100, profitPerInstall: profit,
      }),
    [hoursChasing, hoursQuoting, hoursEvening, sharePct, hourValue, quietQuotes, reopenPct, profit],
  );

  return (
    <div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-md glass p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-bold">
            <Clock className="size-5 text-solar-400" /> Your time back
          </h3>
          <div className="space-y-5">
            <Field id="gb-chase" label="Chasing enquiries and reminders" value={hoursChasing} onChange={setChasing} min={0} max={30} step={1} suffix="hrs/wk" />
            <Field id="gb-quote" label="Typing up quotes and forms" value={hoursQuoting} onChange={setQuoting} min={0} max={30} step={1} suffix="hrs/wk" />
            <Field id="gb-eve" label="Answering messages after hours" value={hoursEvening} onChange={setEvening} min={0} max={20} step={1} suffix="hrs/wk" />
            <Field id="gb-share" label="How much could come off your plate?" hint="Your own guess." value={sharePct} onChange={setShare} min={0} max={100} step={5} suffix="%" />
            <Field id="gb-rate" label="What an hour of your time is worth" value={hourValue} onChange={setRate} min={0} max={200} step={5} suffix="£/hr" />
          </div>
        </div>

        <div className="rounded-md glass p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-bold">
            <PoundSterling className="size-5 text-solar-400" /> Revenue you’ve already paid for
          </h3>
          <div className="space-y-5">
            <Field id="gb-quiet" label="Quotes that went quiet in the last year" value={quietQuotes} onChange={setQuiet} min={0} max={300} step={5} suffix="quotes" />
            <Field id="gb-reopen" label="How many might still go ahead if asked?" hint="Your own guess. Even a small share adds up." value={reopenPct} onChange={setReopen} min={0} max={30} step={1} suffix="%" />
            <Field id="gb-profit" label="Average profit per install" value={profit} onChange={setProfit} min={0} max={6000} step={100} suffix="£" />
          </div>
        </div>

        <div className="glow-border flex flex-col rounded-md glass p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-bold">
            <TrendingUp className="size-5 text-solar-400" /> On your numbers
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-muted-foreground">Hours back</dt>
              <dd className="font-display text-3xl font-bold tabular-nums">
                {r.hoursPerWeek} <span className="text-base font-semibold text-muted-foreground">a week</span>
              </dd>
              <dd className="text-sm text-muted-foreground">{r.hoursPerYear} hours a year, worth {gbp(r.timeValuePerYear)} of your time</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">From quotes that went quiet</dt>
              <dd className="font-display text-3xl font-bold tabular-nums text-solar-400">{gbp(r.quoteProfitPerYear)}</dd>
              <dd className="text-sm text-muted-foreground">profit, if {r.installsFromQuotes} of them go ahead</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-2 text-xs text-muted-foreground">A better business (no numbers needed)</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {BETTER.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-solar-400">•</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/book" className={buttonVariants({ className: 'mt-6 w-full' })}>
            Go through your numbers with me <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Worked out from {WORKING_WEEKS} working weeks a year. An estimate built on your inputs, not a promise of results.
      </p>
    </div>
  );
}
