import { site } from '@/lib/site';
import { FAQS } from '@/lib/faqs';

// Crawlable structured data. Review/AggregateRating are intentionally omitted
// until real reviews exist.
export function JsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      url: site.url,
      email: site.email,
      founder: { '@type': 'Person', name: site.founder },
      areaServed: { '@type': 'Country', name: 'United Kingdom' },
      description: site.description,
      sameAs: Object.values(site.social),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Solar Survey Engine',
      serviceType: 'Enquiry-to-survey system for solar installers',
      provider: { '@type': 'Organization', name: site.name },
      areaServed: { '@type': 'Country', name: 'United Kingdom' },
      description:
        'Exclusive Meta ads, qualifying questions, a reply to every homeowner within about a minute, self-serve survey booking, reminders, no-show recovery and a weekly spend-to-survey report.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
