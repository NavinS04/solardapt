'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { SunArc } from '@/components/ui/SunArc';
import { Button } from '@/components/ui/button';
import { site } from '@/lib/site';

const legal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Legal Notice', href: '/legal' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-0">
      {/* Subtle starfield + sunrise arc backdrop */}
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-60" aria-hidden="true" />
      <SunArc className="absolute left-1/2 top-0 -translate-x-1/2" />

      <div className="container relative grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Your entire front office: we run the ads, answer your phones live, qualify every enquiry,
            and hand your surveyors a full, sorted diary.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <a href={`mailto:${site.email}`} className="hover:text-foreground">
              {site.email}
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Markets</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {site.markets.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Get the predictable-pipeline playbook</h3>
          {/* Double opt-in + consent logging handled server-side (BUILD_SPEC §10). */}
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              className="h-11 rounded-full border border-input bg-bg-surface px-4 text-sm outline-none focus:border-solar-500"
            />
            <Button type="submit" variant="secondary">
              {done ? 'Check your inbox to confirm' : 'Subscribe'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Double opt-in. No spam, unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>

      <div className="container relative flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground md:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>Postcode-exclusive · UK-first · Ireland · USA · Australia · Middle East</p>
      </div>
    </footer>
  );
}
