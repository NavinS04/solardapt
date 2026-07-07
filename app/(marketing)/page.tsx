import { Hero } from '@/components/scenes/Hero';
import { Marquee } from '@/components/scenes/Marquee';
import { Problem } from '@/components/scenes/Problem';
import { OldWay } from '@/components/scenes/OldWay';
import { Engine } from '@/components/scenes/Engine';
import { Dashboard } from '@/components/scenes/Dashboard';
import { Calculator } from '@/components/scenes/Calculator';
import { WhyCards } from '@/components/scenes/WhyCards';
import { Services } from '@/components/scenes/Services';
import { WorldMap } from '@/components/scenes/WorldMap';
import { SocialProof } from '@/components/scenes/SocialProof';
import { Faq } from '@/components/scenes/Faq';
import { FinalCta } from '@/components/scenes/FinalCta';
import { JsonLd } from '@/components/JsonLd';

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Marquee />
      <Problem />
      <OldWay />
      <Engine />
      <Dashboard />
      <Calculator />
      <WhyCards />
      <Services />
      <WorldMap />
      <SocialProof />
      <Faq />
      <FinalCta />
    </>
  );
}
