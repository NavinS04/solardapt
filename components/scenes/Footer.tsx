'use client';

import Link from 'next/link';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SunArc } from '@/components/ui/SunArc';
import { site } from '@/lib/site';

const explore = [
  { label: 'How it works', href: '/#engine' },
  { label: 'Live demo', href: '/demo' },
  { label: 'Calculator', href: '/#calculator' },
  { label: 'Founding programme', href: '/#founding' },
  { label: 'Book a walkthrough', href: '/book' },
];

const legal = [
  { label: 'Privacy notice', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Terms', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Company details', href: '/legal' },
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
  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-0">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-60" aria-hidden="true" />
      <SunArc className="absolute left-1/2 top-0 -translate-x-1/2" />

      <div className="container relative grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The Solar Survey Engine for established UK solar installers. From ad to attended
            survey, in your name.
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
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
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
      </div>

      <div className="container relative flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground md:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>Serving solar installers in the United Kingdom only</p>
      </div>
    </footer>
  );
}
