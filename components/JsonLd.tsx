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
      serviceType: 'Front-office growth partner for solar installers',
      provider: { '@type': 'Organization', name: site.name },
      areaServed: site.markets,
      description:
        'Done-for-you front office for solar installers: exclusive Meta advertising, conversion funnel, live call answering, qualification, and confirmed surveys booked into the installer\u2019s diary.',
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
          name: 'Are the appointments exclusive?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Exclusivity is contractual by postcode district — an enquiry generated in your districts is only ever booked to your business.',
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
