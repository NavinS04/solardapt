import type { Metadata } from 'next';
import { LeadForm } from '@/components/scenes/LeadForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book a Free Strategy Call',
  description: 'Book your free, no-obligation Solardapt strategy call.',
};

export default function BookPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-bg-0 pt-32">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-50" aria-hidden="true" />
      <div className="container relative grid gap-12 pb-24 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight">
            Book your free <span className="text-gradient">strategy call</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            No pitch, no obligation. We’ll audit your enquiry flow — ads, funnel, phones, diary —
            and show you exactly where the money leaks and how we’d fix it.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {['Postcode exclusivity checked for your districts', 'A tailored plan for a full, sorted survey diary', '30-day rolling terms — no long lock-in'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-solar-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          {site.calendlyUrl && (
            <div className="rounded-md glass p-4 sm:p-6">
              {/* Calendly inline embed. The iframe with embed params is what
                  Calendly's widget.js renders internally — same result, no
                  third-party script to load or consent-gate. Bookings flow to
                  GHL via /api/webhooks/calendly. */}
              <iframe
                src={`${site.calendlyUrl}?embed_type=Inline&embed_domain=${encodeURIComponent(site.domain)}`}
                title="Book a call with Solardapt"
                className="h-[700px] w-full rounded-md"
                loading="lazy"
              />
            </div>
          )}

          <details className="group rounded-md glass p-6" open={!site.calendlyUrl}>
            <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
              <span className="flex items-center justify-between">
                Prefer to write instead?
                <span className="text-sm font-normal text-solar-400 group-open:hidden">
                  Send an enquiry →
                </span>
              </span>
            </summary>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">
              Tell us about your business and what you want fixed — we&apos;ll come back to you the
              same working day.
            </p>
            <LeadForm />
          </details>
        </div>
      </div>
    </section>
  );
}
