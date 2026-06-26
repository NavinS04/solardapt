'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { nav } from '@/lib/site';
import { cn } from '@/lib/utils';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'py-2' : 'py-4',
        )}
      >
        <nav
          className={cn(
            'container flex items-center justify-between rounded-full px-4 transition-all duration-300',
            scrolled ? 'glass py-2 shadow-card' : 'py-2',
          )}
          aria-label="Primary"
        >
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Magnetic>
              <Button onClick={() => (window.location.href = '/book')}>
                Book Free Strategy Call
              </Button>
            </Magnetic>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-bg-0/95 backdrop-blur-xl md:hidden"
          >
            <div className="container flex items-center justify-between py-4">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>
            <motion.ul
              className="container flex flex-1 flex-col justify-center gap-6"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {nav.map((item) => (
                <motion.li
                  key={item.href}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-3xl font-semibold tracking-tight"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
                <Button
                  size="lg"
                  className="mt-4 w-full"
                  onClick={() => (window.location.href = '/book')}
                >
                  Book Free Strategy Call
                </Button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
