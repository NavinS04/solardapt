'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { buttonVariants } from '@/components/ui/button';
import { Counter } from '@/components/motion/Counter';
import { calculateLeakage } from '@/lib/calculator';
import { formatCurrency } from '@/lib/utils';

function Slider({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink-800">
          {label}
        </label>
        {/* Number input mirrors the slider for accessibility (BUILD_SPEC §6.6). */}
        <input
          type="number"
          aria-label={`${label} value`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 rounded-md border border-ink-900/15 bg-white px-2 py-1 text-right text-sm text-ink-900"
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-900/10 accent-[var(--solar-500)]"
      />
      <p className="mt-1 text-xs text-ink-500">{format(value)}</p>
    </div>
  );
}

export function Calculator() {
  const [enquiries, setEnquiries] = useState(40);
  const [slow, setSlow] = useState(40);
  const [installRate, setInstallRate] = useState(10);
  const [profit, setProfit] = useState(2500);

  const result = useMemo(
    () =>
      calculateLeakage({
        enquiriesPerMonth: enquiries,
        slowShare: slow / 100,
        installRate: installRate / 100,
        profitPerInstall: profit,
      }),
    [enquiries, slow, installRate, profit],
  );

  return (
    <section id="calculator" className="theme-paper scroll-mt-24 bg-paper py-28 text-ink-900">
      <div className="container">
        <SectionHeading
          eyebrow="Your numbers, not ours"
          title="What slow follow-up is costing you."
          subtitle="Move the sliders to your own figures. This shows the value at stake in enquiries that go cold. It is not a forecast of what we will recover."
        />

        <div className="mx-auto mt-16 grid grid-cols-1 max-w-5xl gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-7 rounded-md border border-ink-900/10 bg-paper-soft p-8">
            <Slider
              id="enquiries"
              label="Enquiries per month"
              min={5}
              max={300}
              step={5}
              value={enquiries}
              onChange={setEnquiries}
              format={(v) => `${v} enquiries`}
            />
            <Slider
              id="slow"
              label="Not contacted within an hour"
              min={0}
              max={90}
              step={5}
              value={slow}
              onChange={setSlow}
              format={(v) => `${v}% of enquiries`}
            />
            <Slider
              id="installRate"
              label="Enquiries that become installs"
              min={1}
              max={40}
              step={1}
              value={installRate}
              onChange={setInstallRate}
              format={(v) => `${v}%`}
            />
            <Slider
              id="profit"
              label="Profit per install"
              min={500}
              max={8000}
              step={100}
              value={profit}
              onChange={setProfit}
              format={(v) => formatCurrency(v, 'GBP')}
            />
          </div>

          {/* Outputs */}
          <div className="flex flex-col rounded-md bg-ink-900 p-8 text-white" aria-live="polite">
            <p className="text-sm text-white/60">Value at stake in slow follow-up, per month</p>
            <div className="mt-2 font-display text-5xl font-bold text-gradient sm:text-6xl">
              <Counter value={result.valueAtStake} format={(n) => formatCurrency(n, 'GBP')} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <Output label="Enquiries going cold each month">
                <Counter value={result.coldEnquiries} />
              </Output>
              <Output label="Installs those would be at your rate">
                <Counter value={result.installsAtStake} format={(n) => n.toFixed(1)} />
              </Output>
            </div>
            <p className="mt-6 text-xs text-white/50">
              Calculated only from the figures you enter: enquiries × share not contacted within an
              hour × your install rate × your profit per install.
            </p>
            <Link href="/book" className={buttonVariants({ size: 'lg', className: 'mt-8 w-full lg:mt-auto' })}>
              Talk through your numbers <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Output({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold sm:text-4xl">{children}</div>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </div>
  );
}
