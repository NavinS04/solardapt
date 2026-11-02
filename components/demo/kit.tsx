'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
 * Shared pieces for the scripted demos: a phone frame, the installer's event
 * timeline and a run token. Every wait() rejects once the run has moved on, so
 * a stale sequence never writes into a reset demo. Nothing here sends anything.
 */
export const INSTALLER = 'Brightfield Solar';
export const OWNER = 'Dan';

export type Kind = '' | 'ok' | 'bad' | 'you';
export interface Evt { id: number; t: string; icon: string; kind: Kind; title: string; detail?: string }

export class Stale extends Error {}

export function useRunner() {
  const run = useRef(0);
  useEffect(() => {
    return () => {
      // Intentional: bumping the run token on unmount cancels pending sequences.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      run.current++;
    };
  }, []);
  const begin = useCallback(() => ++run.current, []);
  const stop = useCallback(() => {
    run.current++;
  }, []);
  const wait = useCallback(
    (token: number, ms: number) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (token === run.current ? resolve() : reject(new Stale())), ms),
      ),
    [],
  );
  return { begin, stop, wait };
}

/** Swallow the cancellation of a reset sequence; rethrow anything real. */
export function quiet(p: Promise<unknown>) {
  p.catch((e) => {
    if (!(e instanceof Stale)) throw e;
  });
}

export function useEvents() {
  const [events, setEvents] = useState<Evt[]>([]);
  const id = useRef(0);
  const add = useCallback((e: Omit<Evt, 'id'>) => setEvents((list) => [...list, { ...e, id: ++id.current }]), []);
  const clear = useCallback(() => setEvents([]), []);
  return { events, add, clear };
}

export function ColLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

export function Phone({ clock, children, label }: { clock: string; children: ReactNode; label: string }) {
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  return (
    <div
      aria-label={label}
      className="relative mx-auto h-[560px] w-full max-w-[360px] rounded-[44px] bg-black p-3.5 shadow-card ring-1 ring-white/10 sm:h-[640px]"
    >
      <div className="flex justify-between px-5 pb-2 pt-1 text-xs font-semibold text-white">
        <span>{clock}</span>
        <span>●●● 5G</span>
      </div>
      <div ref={screen} className="relative h-[calc(100%-30px)] overflow-y-auto rounded-[32px] bg-zinc-100 px-4 py-5 text-zinc-900">
        {children}
      </div>
    </div>
  );
}

export function Bubble({ fromMe, children, when }: { fromMe?: boolean; children: ReactNode; when?: string }) {
  return (
    <div className={cn('mb-2 flex flex-col animate-in fade-in slide-in-from-bottom-1', fromMe ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug',
          fromMe ? 'rounded-br-md bg-emerald-600 text-white' : 'rounded-bl-md bg-white text-zinc-900 shadow-sm',
        )}
      >
        {children}
      </div>
      {when && <span className="mt-0.5 px-1 text-[10px] text-zinc-400">{when}</span>}
    </div>
  );
}

export function Typing() {
  return (
    <div className="mb-2 flex animate-in fade-in" aria-label="Typing">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
        {[0, 150, 300].map((d) => (
          <span key={d} className="size-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function Timeline({ events, empty, className }: { events: Evt[]; empty: ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);
  return (
    <ol ref={ref} aria-live="polite" className={cn('max-h-[420px] overflow-y-auto rounded-md border border-border bg-bg-surface/60', className)}>
      {events.length === 0 && <li className="p-6 text-muted-foreground">{empty}</li>}
      {events.map((e) => (
        <li
          key={e.id}
          className="grid grid-cols-[64px_24px_1fr] gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 animate-in fade-in slide-in-from-bottom-1"
        >
          <span className="pt-0.5 text-xs font-semibold tabular-nums text-muted-foreground">{e.t}</span>
          <span
            className={cn(
              'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
              e.kind === 'ok'
                ? 'bg-success/15 text-success'
                : e.kind === 'bad'
                  ? 'bg-error/15 text-error'
                  : e.kind === 'you'
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-solar-500/15 text-solar-400',
            )}
            aria-hidden="true"
          >
            {e.icon}
          </span>
          <div className="min-w-0">
            <b className="block font-semibold">{e.title}</b>
            {e.detail && <span className="break-words text-muted-foreground">{e.detail}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className={cn('rounded-sm p-3.5', accent ? 'border border-solar-500/40 bg-bg-0' : 'bg-bg-0/70')}>
      <span className="block text-xs text-muted-foreground">{label}</span>
      <b className={cn('font-display text-xl tabular-nums sm:text-2xl', accent && 'text-solar-400')}>{value}</b>
    </div>
  );
}

export const gbp = (n: number) => '£' + Math.round(n).toLocaleString('en-GB');
