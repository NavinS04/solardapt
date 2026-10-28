import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Mail, Phone } from 'lucide-react';
import { LeadForm } from '@/components/scenes/LeadForm';
import { buttonVariants } from '@/components/ui/button';
import { site } from '@/lib/site';
import { leadForwardingConfigured } from '@/lib/lead-forward';

export const metadata: Metadata = {
  title: 'Book a Walkthrough',
  description: 'Book a 20-minute walkthrough of the Solar Survey Engine, using your own enquiry numbers.',
};

const EXPECT = [
  'A look at your current enquiry flow, from ad to survey',
  'Your numbers: enquiries, response times, survey show rate',
  'Which postcode districts are still free in your area',
  'A straight answer on whether this is a fit',
];

export default function BookPage() {
  const tel = site.phone.replace(/\s/g, '');
  const showForm = leadForwardingConfigured();

  return (
    <section className="relative min-h-screen overflow-hidden bg-bg-0 pt-32">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-50" aria-hidden="true" />
      <div className="container relative grid grid-cols-1 gap-12 pb-24 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight">
            Book a 20-minute <span className="text-gradient">walkthrough</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            No script and no pressure. You talk to me, Navin, the person who would build and run your system.
          </p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-solar-500">
            What we cover
          </p>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {EXPECT.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-solar-500" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">
            Want to see it first?{' '}
            <Link href="/demo" className="text-solar-400 underline">
              Try the live demo
            </Link>
            .
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-md glass p-6 sm:p-8">
            {site.bookingUrl ? (
              <>
                <CalendarDays className="mb-4 size-8 text-solar-400" />
                <h2 className="text-xl font-semibold">Pick a time that suits you</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Opens the booking calendar. You get a confirmation and a calendar invite straight away.
                </p>
                <a href={site.bookingUrl} className={buttonVariants({ size: 'lg', className: 'mt-6 w-full' })}>
                  Choose a time <ArrowRight className="size-4" />
                </a>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Get in touch to book</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Email or call with a couple of times that suit you, and I will confirm by return.
                </p>
              </>
            )}
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2">
              <a href={`mailto:${site.email}?subject=Walkthrough`} className={buttonVariants({ variant: 'secondary' })}>
                <Mail className="size-4" /> Email me
              </a>
              <a href={`tel:${tel}`} className={buttonVariants({ variant: 'secondary' })}>
                <Phone className="size-4" /> {site.phone}
              </a>
            </div>
          </div>

          {showForm && (
            <details className="group rounded-md glass p-6">
              <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
                <span className="flex items-center justify-between">
                  Prefer to write instead?
                  <span className="text-sm font-normal text-solar-400 group-open:hidden">Send an enquiry →</span>
                </span>
              </summary>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">
                Tell me about your business and what you want fixed. I reply within one working day.
              </p>
              <LeadForm />
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
