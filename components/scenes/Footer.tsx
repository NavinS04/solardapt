'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
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

/** TikTok mark in the same stroke style as the lucide icons. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const socials = [
  { label: 'Instagram', href: site.social.instagram, Icon: Instagram },
  { label: 'Facebook', href: site.social.facebook, Icon: Facebook },
  { label: 'TikTok', href: site.social.tiktok, Icon: TikTokIcon },
  { label: 'LinkedIn', href: site.social.linkedin, Icon: Linkedin },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-0">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-60" aria-hidden="true" />
      <SunArc className="absolute left-1/2 top-0 -translate-x-1/2" />

      <div className="container relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Your entire front office. We run the ads, answer your phones live, qualify every
            enquiry and hand your surveyors a full, sorted diary.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <a href={`mailto:${site.email}`} className="hover:text-foreground">
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, '')}`}
              className="mt-1 block hover:text-foreground"
            >
              {site.phone}
            </a>
          </p>

          {/* Social row: glass chips with a solar lift on hover */}
          <ul className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Solardapt on ${label}`}
                  className="group flex size-11 items-center justify-center rounded-full glass transition-all duration-300 hover:-translate-y-1 hover:border-solar-500/50 hover:shadow-glow"
                >
                  <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-solar-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Markets</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {['UK', 'USA', 'Australia', 'Middle East'].map((m) => (
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
          <h3 className="text-sm font-semibold">One idea a week that fills diaries</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Short, practical notes on winning exclusive, sat surveys. Written for installers, not
            marketers.
          </p>
          <form className="mt-4 flex flex-col gap-3" onSubmit={subscribe}>
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
            <Button type="submit" variant="secondary" disabled={status === 'sending'}>
              {status === 'done'
                ? 'Check your inbox to confirm'
                : status === 'sending'
                  ? 'Sending…'
                  : 'Get the weekly note'}
            </Button>
            {status === 'error' && (
              <p className="text-xs text-error">Something went wrong. Please try again.</p>
            )}
            <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </form>
        </div>
      </div>

      <div className="container relative flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground md:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>Postcode exclusive · UK · USA · Australia · Middle East</p>
      </div>
    </footer>
  );
}
