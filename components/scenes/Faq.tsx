'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

// Objection-handling from the plan, rewritten customer-facing (BUILD_SPEC §6.12).
const FAQS = [
  { q: 'I tried Facebook ads and they didn’t work.', a: 'Most installer ads fail because they lack a niche offer and a nurture system. We rebuild the whole funnel — creative, qualification and follow-up — not just boost a post.' },
  { q: 'Does Facebook even work for solar?', a: 'Yes — with solar-specific creative frameworks and qualification. We target homeowners showing real intent and screen them before the call.' },
  { q: 'We already get enough referrals.', a: 'Referrals aren’t predictable or scalable. Paid inbound adds a second pipeline you control, so you’re never waiting on word of mouth.' },
  { q: 'We don’t have budget or capacity right now.', a: 'We start with one ad set and only scale once cost-per-appointment is proven profitable. You grow spend from results, not hope.' },
  { q: 'Lead quality is always terrible.', a: 'We qualify in the form (jobs per month, intent) and nurture by SMS and email, so the calls that reach you arrive pre-screened.' },
  { q: 'It’s too competitive — or we could run ads ourselves.', a: 'Book the free strategy call. The audit shows exactly where the gap is, with no obligation. If you can run it better yourself, we’ll tell you.' },
  // ‹FILL› pricing / terms questions once defined.
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
