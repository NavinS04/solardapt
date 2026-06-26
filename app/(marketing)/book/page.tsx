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
            No pitch, no obligation. We’ll audit your current pipeline and show you exactly how we’d
            fill your calendar with exclusive homeowner appointments.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {['A clear picture of your lead-gen gap', 'A tailored plan for predictable appointments', 'Honest numbers — no inflated promises'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-solar-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md glass p-8">
          {site.calendlyUrl ? (
            // Lazy Calendly embed once the event link is supplied (§14).
            <iframe
              src={site.calendlyUrl}
              title="Book a call with Solardapt"
              className="h-[680px] w-full rounded-md"
              loading="lazy"
            />
          ) : (
            <>
              <h2 className="mb-1 text-lg font-semibold">Request your call</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Tell us a little about your business and we’ll be in touch to confirm a time.
              </p>
              <LeadForm />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
