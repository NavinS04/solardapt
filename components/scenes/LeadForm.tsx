'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { site } from '@/lib/site';

/** Short enquiry form. Honeypot + rate limiting on the server. */
export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrors({});
    const form = new FormData(e.currentTarget);

    // Capture campaign params from the URL for attribution.
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
      message: form.get('message') || undefined,
      company_website: form.get('company_website'), // honeypot
      page: window.location.pathname,
      utm: Object.keys(utm).length ? utm : undefined,
    };

    let res: Response;
    try {
      res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      setStatus('error');
      return;
    }

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

      <Field label="Installs per month (roughly)" name="jobsPerMonth" type="number" errors={errors.jobsPerMonth} />

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

      <p className="text-xs text-muted-foreground">
        We use these details only to reply to your enquiry. See our{' '}
        <a href="/privacy" className="underline">
          privacy notice
        </a>
        .
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send my enquiry'}
      </Button>
      {status === 'error' && Object.keys(errors).length === 0 && (
        <p className="text-sm text-error" role="alert">
          Sorry, that didn&apos;t go through. Please email{' '}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>{' '}
          or call{' '}
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="underline">
            {site.phone}
          </a>
          .
        </p>
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
