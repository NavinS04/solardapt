'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

// Objection-handling from the ICP manual (§7), rewritten customer-facing.
const FAQS = [
  {
    q: 'I’ve been burned by agencies and lead companies before.',
    a: 'So has almost every installer we speak to — the shared-lead treadmill and the “free grant” clickbait pattern are exactly why we built this differently. We start with a bounded trial on 30-day rolling terms, with a written replacement policy for no-shows and screen-failures. The first step is small, time-boxed and reversible.',
  },
  {
    q: 'How do I know my competitor down the road isn’t getting the same appointments?',
    a: 'Postcode-district exclusivity, in writing, in the agreement. An enquiry generated in your districts is only ever booked to you, and we cap the number of clients per region as a matter of policy. We’ll name the exclusivity boundary in the contract before you ask.',
  },
  {
    q: 'Homeowners only want free panels — won’t the leads all be grant tourists?',
    a: 'Every appointment is qualified on homeownership, roof basics, and — depending on your model — either private-pay finance readiness or genuine grant eligibility. If you don’t do grant work, grant-seekers are screened out before they ever reach your diary.',
  },
  {
    q: 'Show rate is what kills me — scaffold costs money.',
    a: 'Agreed, which is why reliability beats raw volume. Every booking gets a confirmation call, a reminder sequence and live reschedule handling, backed by a replacement policy for no-shows. You should never erect scaffold for a maybe.',
  },
  {
    q: 'Your retainer sounds like every other agency’s retainer.',
    a: 'An ad agency runs ads and sends you a report. We run the ads, build and own the funnel, answer every enquiry live in your trading name, qualify the caller, and put a confirmed survey in your diary. One question separates us from the last lot: did they answer your phone?',
  },
  {
    q: 'I don’t want to hand my phones to an outsider.',
    a: 'You approve the qualification script word-for-word, calls are answered in your trading name, recordings are available to review, and bookings follow your rules — service radius, job types, slot lengths. We start with new-enquiry handling only; you keep existing customer and aftercare calls.',
  },
  {
    q: 'What happens when the 0% VAT window ends in March 2027?',
    a: 'VAT reverts to 5%, not 20% — and the underlying drivers stay: high grid prices, SEG export income, battery time-of-use economics and solar on new-builds. The months between now and then are the strongest homeowner-urgency window in years, which is exactly why the diary should be full now, with a partner you can scale or switch off on 30 days’ notice.',
  },
  // ‹FILL› pricing/terms questions once retainer structure is public.
];

export function Faq() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section id="faq" className="theme-paper scroll-mt-24 bg-paper-soft py-28 text-ink-900">
      <div className="container">
        <SectionHeading eyebrow="FAQ" title="The questions every installer asks." />

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              aria-label="Search FAQ"
              className="h-12 w-full rounded-full border border-ink-900/15 bg-white pl-11 pr-4 text-sm text-ink-900 outline-none focus:border-solar-500"
            />
          </div>

          <ul className="space-y-3">
            {filtered.map((faq) => {
              const idx = FAQS.indexOf(faq);
              const isOpen = open === idx;
              return (
                <li key={faq.q} className="overflow-hidden rounded-md border border-ink-900/10 bg-white">
                  <button
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-ink-900">{faq.q}</span>
                    <ChevronDown className={`size-5 shrink-0 text-solar-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-5 pb-5 text-sm text-ink-700">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-ink-900/15 p-6 text-center text-sm text-ink-500">
                No questions match “{query}”. Book a call and ask us directly.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
