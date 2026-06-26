'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/motion/Counter';
import { calculateRoi } from '@/lib/calculator';
import { formatCurrency } from '@/lib/utils';

type Region = 'GBP' | 'USD' | 'AED';
const REGION_DEFAULTS: Record<Region, { jobValue: number; symbol: string; label: string }> = {
  // ‹FILL› confirm region currency defaults with the owner.
  GBP: { jobValue: 8000, symbol: '£', label: 'UK (£)' },
  USD: { jobValue: 12000, symbol: '$', label: 'USA ($)' },
  AED: { jobValue: 35000, symbol: 'AED', label: 'Middle East (AED)' },
};

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
  const [region, setRegion] = useState<Region>('GBP');
  const [installs, setInstalls] = useState(8);
  const [jobValue, setJobValue] = useState(REGION_DEFAULTS.GBP.jobValue);
  const [closeRate, setCloseRate] = useState(30);

  const result = useMemo(
    () => calculateRoi({ installsPerMonth: installs, averageJobValue: jobValue, currentCloseRate: closeRate / 100 }),
    [installs, jobValue, closeRate],
  );

  const onRegion = (r: Region) => {
    setRegion(r);
    setJobValue(REGION_DEFAULTS[r].jobValue);
  };

  return (
    <section id="calculator" className="theme-paper scroll-mt-24 bg-paper py-28 text-ink-900">
      <div className="container">
        <SectionHeading
          eyebrow="ROI Calculator"
          title="See the revenue you're leaving on the table."
          subtitle="Move the sliders. The maths is yours — no email required."
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="rounded-md border border-ink-900/10 bg-paper-soft p-8">
            <div className="mb-6 flex flex-wrap gap-2">
              {(Object.keys(REGION_DEFAULTS) as Region[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onRegion(r)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    region === r
                      ? 'bg-solar-gradient text-white'
                      : 'border border-ink-900/15 text-ink-700 hover:border-solar-500'
                  }`}
                >
                  {REGION_DEFAULTS[r].label}
                </button>
              ))}
            </div>
            <div className="space-y-7">
              <Slider
                id="installs"
                label="Installs completed / month"
                min={1}
                max={60}
                step={1}
                value={installs}
                onChange={setInstalls}
                format={(v) => `${v} installs`}
              />
              <Slider
                id="jobValue"
                label="Average job value"
                min={2000}
                max={60000}
                step={500}
                value={jobValue}
                onChange={setJobValue}
                format={(v) => formatCurrency(v, region)}
              />
              <Slider
                id="closeRate"
                label="Current close rate"
                min={5}
                max={80}
                step={1}
                value={closeRate}
                onChange={setCloseRate}
                format={(v) => `${v}%`}
              />
            </div>
          </div>

          {/* Outputs */}
          <div className="flex flex-col rounded-md bg-ink-900 p-8 text-white">
            <div className="grid grid-cols-2 gap-6">
              <Output label="Extra appointments / month">
                <Counter value={result.extraAppointments} />
              </Output>
              <Output label="Added monthly revenue">
                <Counter value={result.addedMonthlyRevenue} format={(n) => formatCurrency(n, region)} />
              </Output>
              <Output label="Estimated ROI">
                <Counter value={result.estimatedRoi} suffix="x" format={(n) => n.toFixed(1)} />
              </Output>
              <Output label="Revenue lost / month">
                <span className="text-error">
                  <Counter value={result.revenueLost} format={(n) => formatCurrency(n, region)} />
                </span>
              </Output>
            </div>
            <p className="mt-6 text-xs text-white/50">
              Conservative, transparent assumptions. Your real numbers come out of the free audit.
            </p>
            <Button size="lg" className="mt-auto w-full" onClick={() => (window.location.href = '/book')}>
              See how we&apos;d build this for you <ArrowRight className="size-4" />
            </Button>
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
