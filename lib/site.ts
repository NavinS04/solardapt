// Centralised site config — copy, markets, contact. Marketing can later move
// editable fields into the Content/CMS-lite table (BUILD_SPEC §8).
export const site = {
  name: 'Solardapt',
  domain: 'solardapt.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solardapt.com',
  tagline: 'Predictable Solar Leads. Booked Every Week.',
  description:
    'Solardapt builds high-converting Meta advertising systems that deliver exclusive, pre-qualified homeowner appointments directly into solar installers’ calendars. Never shared, never resold.',
  email: 'navinsonsana@solardapt.com',
  phone: '', // ‹FILL› business phone
  founder: 'Navin Sonsana',
  markets: ['UK', 'USA', 'Australia', 'Middle East'],
  // ‹FILL› real URLs only — omit any account that doesn't exist.
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    x: '',
    tiktok: '',
    youtube: '',
  },
  // ‹FILL› Calendly event link.
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? '',
} as const;

export const nav = [
  { label: 'How it works', href: '/#engine' },
  { label: 'Results', href: '/#results' },
  { label: 'Calculator', href: '/#calculator' },
  { label: 'FAQ', href: '/#faq' },
] as const;
