import type { Metadata } from 'next';
import Script from 'next/script';
import { LeadForm } from '@/components/scenes/LeadForm';

export const metadata: Metadata = {
  title: 'Book a Free Planning Call',
  description: 'Book your free, no obligation Solardapt planning call.',
};

export default function BookPage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-bg-0 pt-32">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-50" aria-hidden="true" />
      <div className="container relative grid gap-12 pb-24 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight">
            Book your free <span className="text-gradient">planning call</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            No pitch and no obligation. We will map your enquiry flow, from ads to funnel to phones
            to diary, and show you exactly where the money leaks and how we would fix it.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {['Postcode exclusivity checked for your districts', 'A tailored plan for a full, sorted survey diary', '30 day rolling terms with no long contracts'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-solar-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-md glass p-4 sm:p-6">
            {/* GHL booking calendar — bookings land natively in the GHL
                calendar and trigger its workflows. form_embed.js auto-sizes
                the iframe height. */}
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/HI2HqxTYWVGJylVnUPpQ"
              id="HI2HqxTYWVGJylVnUPpQ_1783627244587"
              title="Book a call with Solardapt"
              scrolling="no"
              className="rounded-md"
              style={{ width: '100%', minHeight: 700, border: 'none', overflow: 'hidden' }}
            />
            <Script
              src="https://link.msgsndr.com/js/form_embed.js"
              strategy="lazyOnload"
            />
          </div>

          <details className="group rounded-md glass p-6">
            <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
              <span className="flex items-center justify-between">
                Prefer to write instead?
                <span className="text-sm font-normal text-solar-400 group-open:hidden">
                  Send an enquiry →
                </span>
              </span>
            </summary>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">
              Tell us about your business and what you want fixed. We will come back to you the same
              working day.
            </p>
            <LeadForm />
          </details>
        </div>
      </div>
    </section>
  );
}
