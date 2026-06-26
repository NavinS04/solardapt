'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

/*
 * "Watch How It Works" VSL modal. Lazy player, poster, no autoplay-with-sound.
 * ‹FILL› real video URL — until then we show a branded "coming soon" state.
 * Captions/transcript required for accessibility (BUILD_SPEC §6.9).
 */
const VSL_URL = process.env.NEXT_PUBLIC_VSL_URL ?? '';

export function VslModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-bg-0/90 p-4 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="How Solardapt works"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-md glass"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-bg-0/60 p-2 hover:bg-bg-0"
              aria-label="Close video"
            >
              <X className="size-4" />
            </button>
            {VSL_URL ? (
              <video controls poster="/brand/vsl-poster.jpg" className="h-full w-full">
                <source src={VSL_URL} type="video/mp4" />
                {/* TODO: add <track kind="captions"> once captions exist. */}
              </video>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center mesh-bg">
                <span className="text-sm uppercase tracking-widest text-solar-500">Coming soon</span>
                <p className="max-w-sm text-balance text-muted-foreground">
                  Our walkthrough of the Solardapt Engine is on its way. Prefer a live version?
                </p>
                <a href="/book" className="text-gradient font-semibold">
                  Book a free strategy call →
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
