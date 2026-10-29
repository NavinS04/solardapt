'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, FastForward, Play, RotateCcw, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { EXAMPLE_CHANGES, EXAMPLE_REPORT, exampleCostPerAttended } from '@/lib/example-report';
import { QUALIFY_AT, QUESTIONS, type QuestionKey } from '@/lib/qualify';

/*
 * Solar Survey Engine demo. Entirely client-side: nothing is sent anywhere.
 * Qualification is a fixed points table (rules, not AI): same answers, same
 * score. Async sequences are cancelled on reset through a run token: every
 * wait() rejects once the run has moved on, so a stale sequence never writes
 * into a fresh demo.
 */
const INSTALLER = 'Brightfield Solar';

type Kind = '' | 'ok' | 'bad';
type StageKey = 'new' | 'qualified' | 'booked' | 'attended' | 'filtered';
type Screen =
  | { name: 'ad' }
  | { name: 'owner' }
  | { name: 'question'; index: number }
  | { name: 'details' }
  | { name: 'slots' }
  | { name: 'nurture' }
  | { name: 'renter' }
  | { name: 'booked' };

interface Evt { id: number; t: string; icon: string; kind: Kind; title: string; detail?: string }
interface Msg { text: string; fromMe: boolean; when: string }
interface Slot { day: Date; time: string; label: string }
interface AlertInfo { score: number; qualified: boolean; bookedLine?: string }

const STAGES: { key: StageKey; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'booked', label: 'Booked' },
  { key: 'attended', label: 'Attended' },
  { key: 'filtered', label: 'Filtered out' },
];
const ZERO: Record<StageKey, number> = { new: 0, qualified: 0, booked: 0, attended: 0, filtered: 0 };

const fresh = () => ({
  answers: {} as Partial<Record<QuestionKey, string>>,
  points: {} as Partial<Record<QuestionKey, number>>,
  name: 'Sam',
  t0: 0,
  slot: null as Slot | null,
  intro: Promise.resolve() as Promise<void>,
});

// Weekdays starting the day after tomorrow, so the day-before reminder is
// always in the future.
function nextWeekdays(n: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() % 6) out.push(new Date(d));
  }
  return out;
}
const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const dayName = (d: Date) => fmtDay(d).split(' ')[0] ?? '';

export function SurveyDemo() {
  const run = useRef(0);
  const s = useRef(fresh());
  const eventId = useRef(0);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLOListElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const [screen, setScreen] = useState<Screen>({ name: 'ad' });
  const [events, setEvents] = useState<Evt[]>([]);
  const [stages, setStages] = useState(ZERO);
  const [sms, setSms] = useState<Msg[]>([]);
  const [notif, setNotif] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [speed, setSpeed] = useState<string | null>(null);
  const [after, setAfter] = useState(false);
  const [afterLocked, setAfterLocked] = useState(false);
  const [report, setReport] = useState(false);
  const [clock, setClock] = useState('09:41');

  useEffect(() => {
    setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    return () => {
      // Intentional: bumping the run token on unmount cancels pending sequences.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      run.current++;
      clearTimeout(notifTimer.current);
    };
  }, []);
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [screen]);
  useEffect(() => {
    const tl = timelineRef.current;
    if (tl) tl.scrollTop = tl.scrollHeight;
  }, [events]);
  useEffect(() => {
    if (report) reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [report]);

  // ---------- helpers ----------
  const wait = useCallback((ms: number) => {
    const my = run.current;
    return new Promise<void>((ok, no) => setTimeout(() => (my === run.current ? ok() : no(new Error('reset'))), ms));
  }, []);

  const elapsed = () => {
    const sec = Math.max(0, (Date.now() - s.current.t0) / 1000);
    return `+${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  };

  const log = (icon: string, kind: Kind, title: string, detail?: string, t?: string) => {
    const evt = { id: ++eventId.current, t: t ?? elapsed(), icon, kind, title, detail };
    setEvents((e) => [...e, evt]);
  };

  const bump = (key: StageKey) => setStages((st) => ({ ...st, [key]: st[key] + 1 }));

  const text = (body: string, fromMe = false, when = 'now') => {
    setSms((m) => [...m, { text: body, fromMe, when }]);
    if (fromMe) return;
    setNotif(body.length > 90 ? `${body.slice(0, 88)}…` : body);
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(null), 3200);
  };

  const score = () => Object.values(s.current.points).reduce((a, b) => a + (b ?? 0), 0);

  // ---------- controls ----------
  const reset = () => {
    run.current++;
    s.current = fresh();
    clearTimeout(notifTimer.current);
    setScreen({ name: 'ad' });
    setEvents([]);
    setStages(ZERO);
    setSms([]);
    setNotif(null);
    setAlert(null);
    setSpeed(null);
    setAfter(false);
    setAfterLocked(false);
    setReport(false);
  };

  const start = () => {
    reset();
    setScreen({ name: 'owner' });
    phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---------- homeowner flow ----------
  const answer = (index: number, label: string, pts: number) => {
    const q = QUESTIONS[index]!;
    s.current.answers[q.key] = label;
    s.current.points[q.key] = pts;
    setScreen(index + 1 === QUESTIONS.length ? { name: 'details' } : { name: 'question', index: index + 1 });
  };

  const renter = () => {
    setScreen({ name: 'renter' });
    s.current.t0 = Date.now();
    log('✕', 'bad', 'Filtered out: not the homeowner', 'No survey booked, no contact details taken, no follow-up messages. Your surveyor’s day stays free for real buyers.');
    bump('filtered');
  };

  const introSequence = async (total: number, qualified: boolean) => {
    const { answers, points } = s.current;
    try {
      await wait(700);
      const parts = QUESTIONS.map((q) => `${answers[q.key]?.toLowerCase()} ${points[q.key]}`).join(' + ');
      if (qualified) {
        log('✓', 'ok', `Qualified: score ${total}/100`, `${parts}. A fixed points table, not AI: the same answers always give the same score.`);
        bump('qualified');
      } else {
        log('◐', '', `Not ready yet: score ${total}/100`, `${parts}. Below ${QUALIFY_AT}: they get the guide, with no chasing and no survey push.`);
      }
      await wait(900);
      const name = s.current.name;
      text(
        qualified
          ? `Hi ${name}, thanks for your enquiry with ${INSTALLER}! Pick a time for your free home survey here: brightfield-solar.example/book. Reply STOP to opt out.`
          : `Hi ${name}, thanks for checking with ${INSTALLER}. We’ve emailed you our solar guide. Reply any time when you’re ready to book a free survey. Reply STOP to opt out.`,
      );
      log('✉', 'ok', 'Text sent to homeowner', 'Sent from the installer’s own number. Stops automatically if they reply, book or text STOP.');
      setSpeed(`${((Date.now() - s.current.t0) / 1000).toFixed(1)}s (sped up)`);
      await wait(600);
      log('✉', 'ok', 'Email sent to homeowner', qualified ? 'Booking link, what happens at the survey, who’s coming.' : 'Solar guide. No follow-up sequence.');
      await wait(600);
      setAlert({ score: total, qualified });
      log('🔔', '', 'Installer alerted', 'Push notification and email to the office, with the homeowner’s answers and score.');
    } catch {
      /* reset */
    }
  };

  const submitted = (name: string) => {
    s.current.name = name;
    const total = score();
    const qualified = total >= QUALIFY_AT;
    const { answers } = s.current;
    s.current.t0 = Date.now();
    log('●', '', `New enquiry: ${name}, WV6`, `${answers.type}, ${answers.roof?.toLowerCase()} roof, bill ${answers.bill?.toLowerCase()}, ${answers.when?.toLowerCase()}`);
    bump('new');
    setScreen(qualified ? { name: 'slots' } : { name: 'nurture' });
    s.current.intro = introSequence(total, qualified);
  };

  const booked = async (day: Date, time: string) => {
    const slot = { day, time, label: `${fmtDay(day)}, ${time}` };
    s.current.slot = slot;
    setScreen({ name: 'booked' });
    try {
      await s.current.intro; // keep the installer timeline in real order even if the homeowner books fast
      await wait(300);
      log('📅', 'ok', `Survey booked: ${slot.label}`, 'Added to the survey calendar. No phone tag.');
      bump('booked');
      setAlert({ score: score(), qualified: true, bookedLine: slot.label });
      await wait(700);
      text(`Confirmed: your free solar survey with ${INSTALLER} is ${slot.label}. Reply R to rearrange.`);
      log('✉', 'ok', 'Confirmation text sent');
      await wait(700);
      const prev = new Date(day);
      prev.setDate(prev.getDate() - 1);
      log('⏰', '', 'Reminders scheduled', `${fmtDay(prev)} 18:00 (day before) and ${fmtDay(day)} 08:30 (morning of). Nothing is sent between 20:00 and 08:00.`);
      setAfter(true);
    } catch {
      /* reset */
    }
  };

  // ---------- after booking ----------
  const reminderPath = async () => {
    const slot = s.current.slot;
    if (!slot) return;
    setAfterLocked(true);
    const prev = new Date(slot.day);
    prev.setDate(prev.getDate() - 1);
    try {
      text(`Hi ${s.current.name}, reminder: your solar survey with ${INSTALLER} is tomorrow at ${slot.time}. Reply C to confirm or R to rearrange.`, false, `${fmtDay(prev)} 18:00`);
      log('⏰', '', 'Day-before reminder sent', undefined, `${dayName(prev)} 18:00`);
      await wait(1300);
      text('C', true, `${fmtDay(prev)} 18:04`);
      log('✓', 'ok', 'Homeowner confirmed (replied C)', 'Surveyor’s route for tomorrow updated.', `${dayName(prev)} 18:04`);
      await wait(1200);
      log('✓', 'ok', 'Survey attended', 'Surveyor marked it done in one tap. It now counts in the weekly report.', `${dayName(slot.day)} ${slot.time}`);
      bump('attended');
    } catch {
      /* reset */
    }
  };

  const noShowPath = async () => {
    const slot = s.current.slot;
    if (!slot) return;
    setAfterLocked(true);
    const d = dayName(slot.day);
    const later = slot.time.replace(':00', ':20');
    try {
      log('✕', 'bad', 'Surveyor marked no-show', undefined, `${d} ${slot.time}`);
      await wait(800);
      text(`Sorry we missed you today, ${s.current.name}. No problem: pick a new time here: brightfield-solar.example/book. Reply STOP to opt out.`, false, `${d} ${later}`);
      log('↻', '', 'Rebooking text sent automatically', undefined, `${d} ${later}`);
      await wait(800);
      log('☎', '', 'Callback task created for the office', `Call ${s.current.name} today. One more message tomorrow if they haven’t rebooked, then it stops: never chased more than twice.`);
      await wait(1400);
      text('Sorry, got held up at work! Booking Thursday now', true, `${d} 12:41`);
      log('📅', 'ok', `${s.current.name} rebooked`, 'The survey is back in the diary. The slot would otherwise have been written off.', `${d} 12:43`);
    } catch {
      /* reset */
    }
  };

  // ---------- render ----------
  const thread = (
    <div className="mt-4 flex flex-col gap-2 text-left">
      {sms.map((m, i) => (
        <div
          key={i}
          className={cn(
            'max-w-[86%] rounded-2xl px-3 py-2 text-[13px] leading-snug',
            m.fromMe ? 'self-end bg-blue-500 text-white' : 'self-start bg-zinc-200 text-zinc-900',
          )}
        >
          {m.text}
          <small className="mt-0.5 block text-[11px] opacity-60">{m.when}</small>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={start}>
          <Play className="size-4" /> Start the demo
        </Button>
        <Button size="lg" variant="secondary" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        {/* Homeowner phone */}
        <div>
          <ColLabel>Homeowner’s phone</ColLabel>
          <div
            ref={phoneRef}
            className="relative mx-auto h-[600px] w-full max-w-[360px] scroll-mt-28 rounded-[44px] bg-black p-3.5 shadow-card ring-1 ring-white/10 sm:h-[680px]"
          >
            <div className="flex justify-between px-5 pb-2 pt-1 text-xs font-semibold text-white">
              <span>{clock}</span>
              <span>●●● 5G</span>
            </div>
            {notif && (
              <div className="absolute left-6 right-6 top-12 z-10 rounded-2xl bg-white/95 px-3.5 py-2.5 text-[13px] text-zinc-800 shadow-lg animate-in fade-in slide-in-from-top-4">
                <b className="block text-xs text-zinc-600">{INSTALLER}</b>
                {notif}
              </div>
            )}
            <div
              ref={screenRef}
              className="relative h-[calc(100%-30px)] overflow-y-auto rounded-[32px] bg-zinc-100 px-4 py-5 text-zinc-900"
            >
              {screen.name === 'ad' && <AdScreen onCheck={() => setScreen({ name: 'owner' })} />}

              {screen.name === 'owner' && (
                <div>
                  <QHead step={1} title="Do you own your home?" sub="Solar needs the homeowner’s go-ahead." />
                  <Opt onClick={() => setScreen({ name: 'question', index: 0 })}>Yes, I own it</Opt>
                  <Opt onClick={renter}>No, I rent</Opt>
                </div>
              )}

              {screen.name === 'question' && (
                <div>
                  <QHead step={screen.index + 2} title={QUESTIONS[screen.index]!.title} sub={QUESTIONS[screen.index]!.sub} />
                  {QUESTIONS[screen.index]!.opts.map(([label, pts]) => (
                    <Opt key={label} onClick={() => answer(screen.index, label, pts)}>
                      {label}
                    </Opt>
                  ))}
                </div>
              )}

              {screen.name === 'details' && <DetailsScreen onSubmit={submitted} />}

              {screen.name === 'slots' && <SlotsScreen name={s.current.name} onPick={booked} />}

              {screen.name === 'renter' && (
                <Done tick="i" tone="muted" title="Thanks for checking">
                  Solar panels need the homeowner’s permission, so we can’t book a survey for a rented
                  home. If your landlord’s interested, they’re welcome to get in touch.
                </Done>
              )}

              {screen.name === 'nurture' && (
                <Done tick="✉" tone="sun" title={`Thanks, ${s.current.name}`}>
                  We’ve emailed you our guide to solar for your home. When you’re ready, reply to book a
                  free survey.
                  {thread}
                </Done>
              )}

              {screen.name === 'booked' && s.current.slot && (
                <Done tick="✓" tone="ok" title="You’re booked in">
                  Free solar survey: {s.current.slot.label}. We’ll text you a reminder the day before.
                  <span className="mt-5 block text-xs font-bold tracking-wide text-solar-600">MESSAGES</span>
                  {thread}
                </Done>
              )}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground lg:hidden">
            The installer’s view updates below as you go.
          </p>
        </div>

        {/* Installer console */}
        <div className="min-w-0">
          <ColLabel>Installer’s view</ColLabel>
          <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {STAGES.map(({ key, label }) => (
              <div
                key={key}
                className={cn(
                  'rounded-sm border border-border bg-bg-surface/60 px-3 py-2.5 transition-colors duration-300',
                  stages[key] > 0 && (key === 'filtered' ? 'border-error/60 bg-error/10' : 'border-success/60 bg-success/10'),
                )}
              >
                <span className="block text-xs text-muted-foreground">{label}</span>
                <b className="font-display text-2xl">{stages[key]}</b>
              </div>
            ))}
          </div>

          {speed && (
            <div className="mb-4 rounded-sm border border-solar-500/30 bg-bg-0 px-4 py-3 animate-in fade-in">
              Enquiry → first text: <b className="font-display text-xl text-solar-400">{speed}</b>
              <small className="block text-muted-foreground">Live system designed to reply within about a minute</small>
            </div>
          )}

          {alert && s.current.answers.type && (
            <div className="mb-4 rounded-sm border border-border border-l-4 border-l-solar-500 bg-bg-surface/80 px-4 py-3.5 animate-in fade-in slide-in-from-top-2">
              <h3 className="mb-2 font-semibold">
                {alert.qualified
                  ? `New qualified enquiry: ${s.current.name} (score ${alert.score})`
                  : `Low-priority enquiry: ${s.current.name} (score ${alert.score})`}
              </h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Property</dt>
                <dd>{s.current.answers.type}, WV6</dd>
                <dt className="text-muted-foreground">Roof</dt>
                <dd>{s.current.answers.roof}</dd>
                <dt className="text-muted-foreground">Bill</dt>
                <dd>{s.current.answers.bill}</dd>
                <dt className="text-muted-foreground">Timeframe</dt>
                <dd>{s.current.answers.when}</dd>
                <dt className="text-muted-foreground">Survey</dt>
                <dd>{alert.bookedLine ?? (alert.qualified ? 'Choosing a slot…' : 'Not booked: guide sent')}</dd>
              </dl>
            </div>
          )}

          <ol
            ref={timelineRef}
            aria-live="polite"
            className="max-h-[420px] overflow-y-auto rounded-md border border-border bg-bg-surface/60"
          >
            {events.length === 0 && (
              <li className="p-6 text-muted-foreground">
                Press <b className="text-foreground">Start the demo</b>, then answer as the homeowner.
                Try saying you rent, too.
              </li>
            )}
            {events.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-[56px_24px_1fr] gap-2 border-b border-border px-4 py-3 text-sm last:border-b-0 animate-in fade-in slide-in-from-bottom-1"
              >
                <span className="pt-0.5 text-xs font-semibold tabular-nums text-muted-foreground">{e.t}</span>
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
                    e.kind === 'ok' ? 'bg-success/15 text-success' : e.kind === 'bad' ? 'bg-error/15 text-error' : 'bg-solar-500/15 text-solar-400',
                  )}
                  aria-hidden="true"
                >
                  {e.icon}
                </span>
                <div>
                  <b className="block font-semibold">{e.title}</b>
                  {e.detail && <span className="text-muted-foreground">{e.detail}</span>}
                </div>
              </li>
            ))}
          </ol>

          {after && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={reminderPath} disabled={afterLocked}>
                <FastForward className="size-4" /> Skip to the day before
              </Button>
              <Button variant="secondary" size="sm" onClick={noShowPath} disabled={afterLocked}>
                <X className="size-4" /> Simulate a no-show
              </Button>
              <Button size="sm" onClick={() => setReport(true)}>
                <BarChart3 className="size-4" /> Show the weekly report
              </Button>
            </div>
          )}
        </div>
      </div>

      {report && <Report ref={reportRef} />}

      <div className="mt-20 text-center">
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight">
          Want this running for your business?
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/book" className={buttonVariants({ size: 'lg' })}>
            Book a 20-minute walkthrough <ArrowRight className="size-4" />
          </Link>
          <Link href="/" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
            Back to the homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------- pieces ----------
function ColLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{children}</p>;
}

function QHead({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <>
      <p className="text-xs font-bold tracking-wide text-solar-600">{INSTALLER.toUpperCase()}</p>
      <div className="my-3 h-1.5 overflow-hidden rounded-full bg-zinc-200">
        <div className="h-full rounded-full bg-solar-600 transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }} />
      </div>
      <h4 className="font-display text-lg font-bold leading-snug">{title}</h4>
      <p className="mb-4 mt-1 text-sm text-zinc-500">{sub}</p>
    </>
  );
}

function Opt({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-2 block w-full rounded-xl border-[1.5px] border-zinc-200 bg-white px-4 py-3.5 text-left text-[15px] font-medium transition-colors hover:border-solar-600 hover:bg-orange-50"
    >
      {children}
    </button>
  );
}

function Done({ tick, tone, title, children }: { tick: string; tone: 'ok' | 'sun' | 'muted'; title: string; children: React.ReactNode }) {
  return (
    <div className="pt-6 text-center">
      <div
        className={cn(
          'mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-2xl text-white',
          tone === 'ok' ? 'bg-emerald-600' : tone === 'sun' ? 'bg-solar-600' : 'bg-zinc-400',
        )}
      >
        {tick}
      </div>
      <h4 className="font-display text-lg font-bold">{title}</h4>
      <div className="mt-2 text-sm text-zinc-600">{children}</div>
    </div>
  );
}

function AdScreen({ onCheck }: { onCheck: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center gap-2.5 p-3 text-sm">
        <div className="flex size-9 items-center justify-center rounded-full bg-solar-500 font-bold text-white">B</div>
        <div>
          <b className="block">{INSTALLER}</b>
          <small className="text-xs text-zinc-500">Sponsored</small>
        </div>
      </div>
      <p className="px-3 pb-3 text-sm">
        Thinking about solar before the 0% VAT window closes in March 2027? Take our 60-second check
        to see if your home is suitable. A local, MCS-certified team, no pressure.
      </p>
      <svg viewBox="0 0 320 170" className="block h-[170px] w-full" role="img" aria-label="Illustration of a house with solar panels in the sun">
        <rect width="320" height="110" className="fill-sky-200" />
        <circle cx="262" cy="42" r="24" className="fill-amber-300" />
        <rect y="110" width="320" height="60" className="fill-lime-800" />
        <rect x="88" y="92" width="144" height="58" className="fill-stone-200" />
        <polygon points="74,94 160,40 246,94" className="fill-slate-700" />
        <polygon points="128,80 160,60 206,80 206,86 128,86" className="fill-blue-900" />
        <rect x="146" y="116" width="26" height="34" className="fill-slate-600" />
      </svg>
      <div className="flex items-center justify-between bg-zinc-50 p-3 text-xs text-zinc-500">
        <span>brightfield-solar.example</span>
        <button onClick={onCheck} className="rounded-full bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white">
          Check my home
        </button>
      </div>
    </div>
  );
}

function DetailsScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('Sam');
  const [consent, setConsent] = useState(false);
  const input = 'mb-2 w-full rounded-lg border-[1.5px] border-zinc-200 bg-white px-3.5 py-3 text-[15px] outline-none focus:border-solar-600';
  return (
    <div>
      <QHead step={6} title="Last step: where should we send your survey times?" sub="We’ll only use these for this enquiry." />
      <input className={input} value={name} onChange={(e) => setName(e.target.value)} aria-label="First name" />
      <input className={input} defaultValue="WV6 7AA" aria-label="Postcode" />
      <input className={input} defaultValue="07700 900123" aria-label="Mobile" />
      <input className={input} defaultValue="sam@example.com" aria-label="Email" />
      <label className="mb-4 mt-1.5 flex items-start gap-2 text-xs text-zinc-600">
        <input type="checkbox" className="mt-0.5 accent-[var(--solar-600)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        I agree to {INSTALLER} contacting me about this enquiry by phone, text and email. Reply STOP at any time.
      </label>
      <button
        disabled={!consent}
        onClick={() => onSubmit((name.trim() || 'Sam').slice(0, 30))}
        className="w-full rounded-xl bg-ink-900 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        See my survey times
      </button>
    </div>
  );
}

function SlotsScreen({ name, onPick }: { name: string; onPick: (day: Date, time: string) => void }) {
  const [days] = useState(() => nextWeekdays(3));
  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-solar-600">{INSTALLER.toUpperCase()}</p>
      <h4 className="mt-2 font-display text-lg font-bold leading-snug">Great news, {name}. Pick your free survey time</h4>
      <p className="mb-4 mt-1 text-sm text-zinc-500">About 45 minutes. A surveyor checks the roof, fuse board and your usage.</p>
      <div className="grid gap-3">
        {days.map((d) => (
          <div key={d.toDateString()}>
            <b className="mb-1.5 block text-sm">{fmtDay(d)}</b>
            <div className="flex gap-1.5">
              {['10:00', '13:00', '16:00'].map((t) => (
                <button
                  key={t}
                  onClick={() => onPick(d, t)}
                  className="flex-1 rounded-lg border-[1.5px] border-zinc-200 bg-white px-1 py-2.5 text-sm font-semibold transition-colors hover:border-emerald-600 hover:bg-emerald-50"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Report = forwardRef<HTMLDivElement>(function Report(_props, ref) {
  const stats = [
    { label: 'Ad spend', value: `£${EXAMPLE_REPORT.spend}` },
    { label: 'Enquiries', value: EXAMPLE_REPORT.enquiries },
    { label: 'Qualified', value: EXAMPLE_REPORT.qualified },
    { label: 'Surveys booked', value: EXAMPLE_REPORT.booked },
    { label: 'Surveys attended', value: EXAMPLE_REPORT.attended },
  ];
  const funnel = [
    { label: 'Enquiries', value: EXAMPLE_REPORT.enquiries },
    { label: 'Qualified', value: EXAMPLE_REPORT.qualified },
    { label: 'Booked', value: EXAMPLE_REPORT.booked },
    { label: 'Attended', value: EXAMPLE_REPORT.attended },
  ];
  return (
    <div ref={ref} className="mt-12 scroll-mt-28 rounded-lg glass p-6 animate-in fade-in slide-in-from-bottom-4 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Weekly report: {INSTALLER}</h2>
        <Badge>Example figures showing the report format. Not client results.</Badge>
      </div>
      <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((st) => (
          <div key={st.label} className="rounded-sm bg-bg-0/70 p-4">
            <span className="block text-xs text-muted-foreground">{st.label}</span>
            <b className="font-display text-2xl">{st.value}</b>
          </div>
        ))}
        <div className="rounded-sm border border-solar-500/40 bg-bg-0 p-4">
          <span className="block text-xs text-muted-foreground">Cost per attended survey</span>
          <b className="font-display text-2xl text-solar-400">£{exampleCostPerAttended.toFixed(2)}</b>
        </div>
      </div>
      <div className="space-y-1.5" aria-hidden="true">
        {funnel.map((f) => (
          <div
            key={f.label}
            className="min-w-[140px] rounded-sm bg-solar-gradient px-3 py-2 text-sm font-semibold text-white"
            style={{ width: `${(f.value / EXAMPLE_REPORT.enquiries) * 100}%` }}
          >
            {f.label} {f.value}
          </div>
        ))}
      </div>
      <p className="mt-5 text-muted-foreground">
        <b className="text-foreground">What we changed this week:</b> {EXAMPLE_CHANGES.changed}{' '}
        <b className="text-foreground">Next week:</b> {EXAMPLE_CHANGES.next}
      </p>
    </div>
  );
});
