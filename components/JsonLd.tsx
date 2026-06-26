import { site } from '@/lib/site';

// Crawlable structured data (BUILD_SPEC §9). Review/AggregateRating are
// intentionally omitted until real reviews exist.
export function JsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      url: site.url,
      email: site.email,
      founder: { '@type': 'Person', name: site.founder },
      areaServed: site.markets,
      description: site.description,
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
      serviceType: 'Meta advertising for solar installers',
      provider: { '@type': 'Organization', name: site.name },
      areaServed: site.markets,
      description:
        'Done-for-you Meta advertising funnels delivering exclusive, pre-qualified homeowner appointments to solar installation companies.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does Facebook advertising work for solar installers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — with solar-specific creative and qualification. Solardapt targets homeowners showing real intent and screens them before the call.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are the leads exclusive?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every appointment is exclusive to your business — never shared, never resold.',
          },
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
