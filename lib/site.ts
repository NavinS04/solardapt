// Centralised site config — copy, markets, contact. Grounded in the ICP/GTM
// manual: Solardapt is the installer's entire front office (ads + funnel +
// live call answering + qualified, confirmed surveys in a sorted diary),
// UK-first, postcode-exclusive, 30-day rolling terms.
export const site = {
  name: 'Solardapt',
  domain: 'solardapt.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solardapt.com',
  tagline: 'Full Diaries for Solar Installers. Ads, Phones and Bookings, Handled.',
  description:
    'Solardapt runs the front office for established solar installers. We run the ads, answer every enquiry live in your name, qualify each caller and put confirmed surveys straight into your diary. Exclusive by postcode district, on 30 day rolling terms.',
  email: 'navinsonsana@solardapt.com',
  phone: '+44 7427 845540',
  founder: 'Navin Sonsana',
  // UK-first; expansion markets per the ICP manual.
  markets: ['UK', 'Ireland', 'USA', 'Australia', 'Middle East'],
  social: {
    instagram: 'https://instagram.com/solardapt/',
    facebook: 'https://www.facebook.com/profile.php?id=61591406844292',
    tiktok: 'https://www.tiktok.com/@solardaptco',
    linkedin: 'https://www.linkedin.com/company/solardapt/',
  },
  calendlyUrl:
    process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/navinsonsana-solardapt/30min',
} as const;

export const nav = [
  { label: 'How it works', href: '/#engine' },
  { label: 'Results', href: '/#results' },
  { label: 'Calculator', href: '/#calculator' },
  { label: 'FAQ', href: '/#faq' },
] as const;
