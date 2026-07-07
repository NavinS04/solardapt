// Centralised site config — copy, markets, contact. Grounded in the ICP/GTM
// manual: Solardapt is the installer's entire front office (ads + funnel +
// live call answering + qualified, confirmed surveys in a sorted diary),
// UK-first, postcode-exclusive, 30-day rolling terms.
export const site = {
  name: 'Solardapt',
  domain: 'solardapt.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solardapt.com',
  tagline: 'Full Diaries for Solar Installers. Ads, Phones & Bookings — Handled.',
  description:
    'Solardapt is the front office for established solar installers: we run the ads, build the funnel, answer every enquiry live in your name, qualify each caller, and put confirmed surveys straight into your diary. Exclusive by postcode district. 30-day rolling terms.',
  email: 'navinsonsana@solardapt.com',
  phone: '', // ‹FILL› GHL UK number once ready for public display
  founder: 'Navin Sonsana',
  // UK-first; expansion markets per the ICP manual.
  markets: ['UK', 'Ireland', 'USA', 'Australia', 'Middle East'],
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
