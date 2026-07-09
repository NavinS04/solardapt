'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MARKETS } from '@/lib/validators';

/** Short "request a call" form. CAPTCHA/honeypot + rate limiting on the server. */
export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrors({});
    const form = new FormData(e.currentTarget);

    // Capture Meta tracking params from the URL for attribution.
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });

    const payload = {
      name: form.get('name'),
      business: form.get('business'),
      email: form.get('email'),
      phone: form.get('phone'),
      jobsPerMonth: form.get('jobsPerMonth') ? Number(form.get('jobsPerMonth')) : undefined,
      market: form.get('market') || undefined,
      message: form.get('message') || undefined,
      company_website: form.get('company_website'), // honeypot
      source: 'meta',
      fbclid: params.get('fbclid') ?? undefined,
      utm: Object.keys(utm).length ? utm : undefined,
      consentMarketing: form.get('consent') === 'on',
    };

    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      window.location.href = '/thank-you';
    } else if (res.status === 422) {
      const body = await res.json();
      setErrors(body.issues ?? {});
      setStatus('error');
    } else {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Honeypot — hidden from humans, must stay empty. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden="true"
      />

      <Field label="Your name" name="name" required errors={errors.name} />
      <Field label="Business name" name="business" errors={errors.business} />
      <Field label="Email" name="email" type="email" required errors={errors.email} />
      <Field label="Phone" name="phone" type="tel" required errors={errors.phone} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Installs / month" name="jobsPerMonth" type="number" errors={errors.jobsPerMonth} />
        <div>
          <label htmlFor="market" className="mb-1.5 block text-sm font-medium">
            Market
          </label>
          <select
            id="market"
            name="market"
            className="h-11 w-full rounded-md border border-input bg-bg-surface px-3 text-sm outline-none focus:border-solar-500"
          >
            <option value="">Select…</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Anything we should know?
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={2000}
          placeholder="Your service area, current lead sources, what you want fixed…"
          className="w-full rounded-md border border-input bg-bg-surface px-3 py-2 text-sm outline-none focus:border-solar-500"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="consent" className="mt-0.5 accent-[var(--solar-500)]" />
        I agree to be contacted about my enquiry and accept the{' '}
        <a href="/privacy" className="underline">
          privacy policy
        </a>
        .
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request my planning call'}
      </Button>
      {status === 'error' && Object.keys(errors).length === 0 && (
        <p className="text-sm text-error">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-solar-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={errors ? true : undefined}
        className="h-11 w-full rounded-md border border-input bg-bg-surface px-3 text-sm outline-none focus:border-solar-500"
      />
      {errors?.map((err) => (
        <p key={err} className="mt-1 text-xs text-error">
          {err}
        </p>
      ))}
    </div>
  );
}
