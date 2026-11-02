'use client';

import { useState } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bubble, ColLabel, INSTALLER, OWNER, Phone, Timeline, Typing, quiet, useEvents, useRunner } from './kit';

/*
 * Evening message assistant demo. The homeowner picks a question; the reply is
 * built only from answers the installer approved at setup. Anything outside
 * them (complaints, finance, exact prices) goes to the owner, never guessed.
 * Scripted and fictional: nothing is sent.
 */
interface Topic {
  id: string;
  ask: string;
  reply: string;
  source: string; // which approved answer it used
  handoff?: boolean;
  books?: boolean;
}

const TOPICS: Topic[] = [
  {
    id: 'battery',
    ask: 'Do you fit batteries as well?',
    reply: 'We do. Most of our installs now include a battery, and we can add one to existing panels too. The surveyor will look at your usage and tell you honestly whether it’s worth it for you.',
    source: 'Approved answer: “Batteries”',
  },
  {
    id: 'price',
    ask: 'Roughly how much for a 3-bed semi?',
    reply: 'Most 3-bed homes we do come in between £6,000 and £9,000, depending on the roof and whether you want a battery. The free survey gives you an exact, fixed price. Want me to find you a time?',
    source: 'Approved answer: “Price guide” (your range, never an exact quote)',
  },
  {
    id: 'east',
    ask: 'My roof faces east. Is that any good?',
    reply: 'East-facing roofs work well, usually producing most in the morning. The surveyor checks shading and roof condition on the visit, so you’ll know for sure.',
    source: 'Approved answer: “Roof direction”',
  },
  {
    id: 'complaint',
    ask: 'You fitted mine last year and the inverter keeps beeping.',
    reply: `Sorry to hear that. I’ve passed this straight to ${OWNER}, who looks after aftercare. He’ll call you tomorrow before 10am. If it shows a fault code, a photo of the screen helps.`,
    source: 'Rule: aftercare and complaints always go to you',
    handoff: true,
  },
  {
    id: 'book',
    ask: 'Can I book a survey?',
    reply: 'Of course. I can do Thursday at 10:00, Friday at 13:00 or Saturday at 09:30. Which suits you best?',
    source: 'Your survey diary (live availability)',
    books: true,
  },
];

const RULES = [
  'Says up front that it’s an assistant, not a person.',
  'Only uses answers you’ve approved. If it doesn’t know, it says so and passes it to you.',
  'Never gives an exact price, finance terms or a promise about savings.',
  'Complaints and aftercare go straight to you, with a time you’ve agreed.',
  'Replies only when the homeowner messages first. No late-night marketing texts.',
];

interface Msg { me: boolean; text: string; when: string }

export function AfterHours() {
  const { begin, stop, wait } = useRunner();
  const { events, add, clear } = useEvents();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [clock, setClock] = useState(21 * 60 + 47);
  const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  const reset = () => {
    stop();
    clear();
    setMsgs([]);
    setTyping(false);
    setUsed([]);
    setBusy(false);
    setSlots(false);
    setAnswered(0);
    setClock(21 * 60 + 47);
  };

  const askTopic = (tp: Topic) => {
    const t = begin();
    const now = hhmm(clock);
    setBusy(true);
    setSlots(false);
    setMsgs((m) => [...m, { me: true, text: tp.ask, when: now }]);
    quiet(
      (async () => {
        await wait(t, 500);
        setTyping(true);
        await wait(t, 1400);
        setTyping(false);
        setMsgs((m) => [...m, { me: false, text: tp.reply, when: now }]);
        setUsed((u) => (u.includes(tp.id) ? u : [...u, tp.id]));
        setAnswered((n) => n + 1);
        add(
          tp.handoff
            ? { t: now, icon: '!', kind: 'you', title: 'Needs you: aftercare, inverter beeping', detail: `Customer told ${OWNER} will call before 10am. On your list for the morning.` }
            : { t: now, icon: '✓', kind: '', title: `Answered: “${tp.ask}”`, detail: tp.source },
        );
        if (tp.books) setSlots(true);
        setClock((c) => c + 3);
        setBusy(false);
      })(),
    );
  };

  const book = (slot: string) => {
    const t = begin();
    const now = hhmm(clock);
    setSlots(false);
    setBusy(true);
    setMsgs((m) => [...m, { me: true, text: slot, when: now }]);
    quiet(
      (async () => {
        await wait(t, 500);
        setTyping(true);
        await wait(t, 1100);
        setTyping(false);
        setMsgs((m) => [...m, { me: false, text: `Booked: ${slot}. You’ll get a confirmation now and a reminder the day before. Thanks!`, when: now }]);
        add({ t: now, icon: '★', kind: 'ok', title: `Survey booked: ${slot}`, detail: 'Booked at night, without you lifting a finger. In your diary with their answers attached.' });
        setBusy(false);
      })(),
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Button size="lg" variant="secondary" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
        <span className="text-sm text-muted-foreground">It’s 9:47pm. You’re off. Ask it something as the homeowner.</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div>
          <ColLabel>Homeowner’s phone</ColLabel>
          <Phone clock={hhmm(clock)} label="Homeowner phone texting the installer in the evening">
            <p className="mb-4 text-center text-xs font-semibold text-zinc-500">
              {INSTALLER}
              <span className="block font-normal">Automated assistant. {OWNER}’s team picks up anything it can’t answer.</span>
            </p>
            {msgs.length === 0 && <p className="mt-6 text-center text-sm text-zinc-500">Pick a question below to text {INSTALLER}.</p>}
            {msgs.map((m, i) => (
              <Bubble key={i} fromMe={m.me} when={m.when}>
                {m.text}
              </Bubble>
            ))}
            {typing && <Typing />}
            {slots && !busy && (
              <div className="mt-2 grid gap-1.5">
                {['Thursday 10:00', 'Friday 13:00', 'Saturday 09:30'].map((s) => (
                  <button key={s} onClick={() => book(s)} className="rounded-lg border-[1.5px] border-zinc-200 bg-white py-2.5 text-sm font-semibold hover:border-emerald-600 hover:bg-emerald-50">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {!slots && (
              <div className="mt-4 grid gap-1.5 border-t border-zinc-200 pt-3">
                {TOPICS.map((tp) => (
                  <button
                    key={tp.id}
                    disabled={busy}
                    onClick={() => askTopic(tp)}
                    className="rounded-xl bg-white px-3 py-2 text-left text-[13px] text-zinc-700 shadow-sm transition-colors hover:bg-emerald-50 disabled:opacity-40"
                  >
                    {tp.ask}
                  </button>
                ))}
              </div>
            )}
          </Phone>
        </div>

        <div className="min-w-0">
          <ColLabel>What you see in the morning</ColLabel>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-bg-surface/60 p-4">
              <span className="block text-xs text-muted-foreground">Answered while you were off</span>
              <b className="font-display text-3xl tabular-nums text-solar-400">{answered}</b>
            </div>
            <div className="rounded-md border border-border bg-bg-surface/60 p-4">
              <span className="block text-xs text-muted-foreground">Approved answers it drew on</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TOPICS.filter((tp) => !tp.handoff && !tp.books).map((tp) => (
                  <span key={tp.id} className={cn('rounded-full px-2 py-0.5 text-xs', used.includes(tp.id) ? 'bg-solar-500/15 text-solar-400' : 'bg-muted text-muted-foreground')}>
                    {tp.id === 'battery' ? 'Batteries' : tp.id === 'price' ? 'Price guide' : 'Roof direction'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Timeline events={events} empty={<>Each message it handles shows up here, with the approved answer it used.</>} />

          <div className="mt-5 rounded-md glass p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-5 text-solar-400" /> The rules it can’t break
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {RULES.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-solar-400">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
