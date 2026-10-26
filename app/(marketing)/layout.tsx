import { Nav } from '@/components/scenes/Nav';
import { Footer } from '@/components/scenes/Footer';
import { ScrollProgress } from '@/components/scenes/ScrollProgress';
import { CookieConsent } from '@/components/scenes/CookieConsent';
import { CursorGlow } from '@/components/motion/CursorGlow';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <CookieConsent />
      <CursorGlow />
    </>
  );
}
