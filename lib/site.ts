// Centralised site config: copy, contact, booking and legal details.
// Solardapt sells the Solar Survey Engine to established UK solar installers:
// exclusive ads → qualifying questions → reply within a minute → self-serve
// survey booking → reminders and no-show recovery → weekly report.
export const site = {
  name: 'Solardapt',
  domain: 'solardapt.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solardapt.com',
  tagline: 'Booked Solar Surveys for UK Installers. Not More Leads.',
  description:
    'Solardapt builds and runs the Solar Survey Engine for established UK solar installers. Every enquiry gets a reply within a minute, is qualified, books its own survey and is reminded until it turns up. One installer per postcode district, rolling monthly.',
  email: 'navinsonsana@solardapt.com',
  phone: '+44 7427 845540',
  founder: 'Navin Sonsana',
  markets: ['UK'],
  social: {
    instagram: 'https://instagram.com/solardapt/',
    facebook: 'https://www.facebook.com/profile.php?id=61591406844292',
    tiktok: 'https://www.tiktok.com/@solardaptco',
    linkedin: 'https://www.linkedin.com/company/solardapt/',
  },
  // Cal.com event link for the 20-minute walkthrough. Empty → the /book page
  // offers email and phone instead, so nothing breaks before it is set.
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? '',
  // Legal identity for the privacy notice and company details page. Lines whose
  // value is empty are left out of those pages rather than shown as blanks.
  legal: {
    name: process.env.NEXT_PUBLIC_LEGAL_NAME ?? '',
    address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? '',
    companyNumber: process.env.NEXT_PUBLIC_COMPANY_NUMBER ?? '',
    icoNumber: process.env.NEXT_PUBLIC_ICO_NUMBER ?? '',
  },
} as const;

export const nav = [
  { label: 'How it works', href: '/#engine' },
  { label: 'Live demo', href: '/demo' },
  { label: 'Calculator', href: '/#calculator' },
  { label: 'FAQ', href: '/#faq' },
] as const;
