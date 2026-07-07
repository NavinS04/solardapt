'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { SunArc } from '@/components/ui/SunArc';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-bg-0 py-32">
      {/* Animated sunrise backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-[-40%] left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-solar-gradient opacity-20 blur-[120px]" />
      </div>
      <div className="container relative text-center">
        <SunArc className="mb-10" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-tight"
        >
          Ready for a diary that <span className="text-gradient">fills itself?</span>
        </motion.h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          A free, no-obligation strategy call. We’ll audit your enquiry flow and show you exactly
          where your last marketing budget died — and how we’d fix it. 30-day rolling terms if you
          go ahead. Your postcode districts, reserved.
        </p>
        <div className="mt-10 flex justify-center">
          <Magnetic>
            <Button size="lg" onClick={() => (window.location.href = '/book')}>
              Book Free Strategy Call <ArrowRight className="size-4" />
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
