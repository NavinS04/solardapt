'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Bubble, ColLabel, INSTALLER, OWNER, Phone, Stat, Timeline, Typing, gbp, quiet, useEvents, useRunner } from './kit';

/*
 * Quote revival demo: quotes that went quiet get one personal, polite text.
 * Scripted with fictional customers. Rules shown on screen are the real rules:
 * opted-out contacts are never messaged, prices always come from the owner,
 * at most one follow-up, STOP stops everything.
 */
interface Quote { id: string; name: string; system: string; value: number; age: string; note: string; optedOut?: boolean }

const QUOTES: Quote[] = [
  { id: 'priya', name: 'Priya Patel', system: '4.2kW + 5kWh battery', value: 8950, age: '7 months', note: 'Wanted to wait for summer' },
  { id: 'gareth', name: 'Gareth Hughes', system: '6kW panels', value: 7400, age: '11 months', note: 'Comparing another quote' },
  { id: 'jo', name: 'Jo Clarke', system: '3.6kW panels', value: 6200, age: '5 months', note: 'Partner unsure' },
  { id: 'dev', name: 'Dev Morgan', system: '5kW + 10kWh battery', value: 10300, age: '9 months', note: 'No reason given' },
  { id: 'lee', name: 'Lee Turner', system: '10kWh battery only', value: 5400, age: '6 months', note: 'Went quiet after survey' },
  { id: 'amira', name: 'Amira Khan', system: '4kW panels', value: 6850, age: '14 months', note: 'Said she might move' },
  { id: 'chris', name: 'Chris Allen', system: '5kW panels', value: 7100, age: '8 months', note: 'Asked not to be contacted', optedOut: true },
];

const first = (q: Quote) => q.name.split(' ')[0] ?? q.name;
const draft = (q: Quote) =>
  `Hi ${first(q)}, it’s ${OWNER} at ${INSTALLER}. We quoted you for ${q.system} a while back. ` +
  (q.note === 'Wanted to wait for summer'
    ? 'You mentioned waiting for the summer, so I thought I’d check in. '
    : q.note === 'Partner unsure'
      ? 'No pressure at all, just checking whether it’s still on your list. '
      : 'Just checking whether it’s still on your mind. ') +
  'Happy to refresh the numbers if useful. Reply STOP to opt out.';

type Status = 'idle' | 'skipped' | 'sent' | 'booked' | 'you' | 'stopped' | 'quiet';
const LABEL: Record<Status, string> = {
  idle: 'Not contacted',
  skipped: 'Opted out: never messaged',
  sent: 'Text sent',
  booked: 'Revisit booked',
  you: 'Needs you',
  stopped: 'Said STOP: removed',
  quiet: 'No reply: one reminder, then stops',
};

interface Thread { from: 'them' | 'us'; text: string; when: string }

export function QuoteRevival() {
  const { begin, stop, wait } = useRunner();
  const { events, add, clear } = useEvents();
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [thread, setThread] = useState<Thread[]>([]);
  const [typing, setTyping] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const set = (id: string, st: Status) => setStatus((s) => ({ ...s, [id]: st }));
  const q = (id: string) => QUOTES.find((x) => x.id === id)!;
  const reBooked = Object.entries(status).filter(([, s]) => s === 'booked').reduce((sum, [id]) => sum + q(id).value, 0);
  const count = (st: Status) => Object.values(status).filter((s) => s === st).length;

  const reset = () => {
    stop();
    clear();
    setStatus({});
    setThread([]);
    setTyping(false);
    setRunning(false);
    setDone(false);
  };

  const start = () => {
    reset();
    const t = begin();
    setRunning(true);
    quiet(
      (async () => {
        await wait(t, 400);
        add({ t: 'Mon 09:00', icon: '✓', kind: '', title: '7 quotes older than 3 months found', detail: 'From your quote list. Total quoted: ' + gbp(QUOTES.reduce((a, b) => a + b.value, 0)) });
        await wait(t, 900);
        set('chris', 'skipped');
        add({ t: 'Mon 09:00', icon: '⊘', kind: 'bad', title: 'Chris Allen left out', detail: 'He asked not to be contacted. Opted-out people are never messaged.' });
        await wait(t, 900);
        add({ t: 'Mon 09:01', icon: '✎', kind: '', title: '6 personal texts drafted', detail: 'Each mentions their own quote and what they told you. You approved the wording once, at setup.' });
        for (const x of QUOTES.filter((x) => !x.optedOut)) {
          await wait(t, 350);
          set(x.id, 'sent');
        }
        setThread([{ from: 'us', text: draft(q('priya')), when: 'Mon 10:00' }]);
        add({ t: 'Mon 10:00', icon: '→', kind: '', title: '6 texts sent, spaced out over the morning', detail: 'Business hours only, from your own number.' });

        await wait(t, 1600);
        setThread((th) => [...th, { from: 'them', text: 'Oh good timing! Yes, we’d like to go ahead this year. Can someone come back out?', when: 'Mon 10:42' }]);
        await wait(t, 700);
        setTyping(true);
        await wait(t, 1100);
        setTyping(false);
        setThread((th) => [...th, { from: 'us', text: 'Brilliant, Priya. I can do Thursday at 10:00 or Friday at 14:00 for a quick revisit. Which suits?', when: 'Mon 10:42' }]);
        await wait(t, 1300);
        setThread((th) => [...th, { from: 'them', text: 'Thursday 10 please', when: 'Mon 10:44' }]);
        await wait(t, 600);
        setThread((th) => [...th, { from: 'us', text: 'Booked: Thursday 10:00. You’ll get a reminder the day before. Thanks Priya!', when: 'Mon 10:44' }]);
        set('priya', 'booked');
        add({ t: 'Mon 10:44', icon: '★', kind: 'ok', title: 'Priya Patel: revisit booked Thu 10:00', detail: gbp(8950) + ' quote back in play. In your diary.' });

        await wait(t, 1500);
        set('gareth', 'you');
        add({ t: 'Mon 11:20', icon: '!', kind: 'you', title: `Needs you: Gareth Hughes asked for today’s price`, detail: `Prices always come from you. Reply sent: “${OWNER} will send you an updated price today.”` });

        await wait(t, 1500);
        set('lee', 'stopped');
        add({ t: 'Mon 12:05', icon: '⊘', kind: 'bad', title: 'Lee Turner replied STOP', detail: 'Removed from every message straight away and added to your suppression list.' });

        await wait(t, 1500);
        set('jo', 'booked');
        add({ t: 'Mon 18:10', icon: '★', kind: 'ok', title: 'Jo Clarke: evening call booked Wed 18:30', detail: '“Partner’s keen now.” ' + gbp(6200) + ' quote back in play.' });

        await wait(t, 1500);
        set('dev', 'quiet');
        set('amira', 'quiet');
        add({ t: 'Sat 10:00', icon: '…', kind: '', title: 'Dev and Amira: no reply yet', detail: 'One gentle reminder on Saturday, then they’re left alone. Never more than two messages.' });
        setRunning(false);
        setDone(true);
      })(),
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={start} disabled={running}>
          <Play className="size-4" /> Run the quote revival
        </Button>
        <Button size="lg" variant="secondary" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div>
          <ColLabel>Priya’s phone</ColLabel>
          <Phone clock="10:44" label="Homeowner phone showing the text conversation">
            <p className="mb-4 text-center text-xs font-semibold text-zinc-500">{INSTALLER}</p>
            {thread.length === 0 && (
              <p className="mt-24 text-center text-sm text-zinc-500">Press “Run the quote revival” to see what Priya receives.</p>
            )}
            {thread.map((m, i) => (
              <Bubble key={i} fromMe={m.from === 'them'} when={m.when}>
                {m.text}
              </Bubble>
            ))}
            {typing && <Typing />}
          </Phone>
        </div>

        <div className="min-w-0">
          <ColLabel>Your quote list</ColLabel>
          <div className="mb-5 overflow-hidden rounded-md border border-border">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-bg-surface/80 text-xs text-muted-foreground">
                <tr>
                  <th className="w-[34%] px-3 py-2 font-medium sm:w-[30%]">Customer</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell sm:w-[26%]">Quote</th>
                  <th className="w-[22%] px-3 py-2 font-medium sm:w-[16%]">Value</th>
                  <th className="w-[44%] px-3 py-2 font-medium sm:w-[28%]">Status</th>
                </tr>
              </thead>
              <tbody>
                {QUOTES.map((x) => {
                  const st = status[x.id] ?? 'idle';
                  return (
                    <tr key={x.id} className="border-t border-border">
                      <td className="px-3 py-2.5">
                        <b className="block truncate font-semibold">{x.name}</b>
                        <span className="block truncate text-xs text-muted-foreground">{x.age} ago</span>
                      </td>
                      <td className="hidden truncate px-3 py-2.5 text-muted-foreground sm:table-cell">{x.system}</td>
                      <td className="px-3 py-2.5 tabular-nums">{gbp(x.value)}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-0.5 text-xs',
                            st === 'booked' ? 'bg-success/15 text-success'
                              : st === 'you' ? 'bg-sky-500/15 text-sky-300'
                              : st === 'stopped' || st === 'skipped' ? 'bg-error/15 text-error'
                              : st === 'idle' ? 'bg-muted text-muted-foreground'
                              : 'bg-solar-500/15 text-solar-400',
                          )}
                        >
                          {LABEL[st]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Timeline events={events} empty={<>Press <b className="text-foreground">Run the quote revival</b>. You’ll see every step it takes, and every one it refuses to take.</>} />

          {done && (
            <div className="mt-5 grid grid-cols-2 gap-3 animate-in fade-in sm:grid-cols-4">
              <Stat label="Texts sent" value={6} />
              <Stat label="Booked back in" value={count('booked')} />
              <Stat label="Passed to you" value={count('you')} />
              <Stat label="Quotes back in play" value={gbp(reBooked)} accent />
            </div>
          )}
          {done && (
            <p className="mt-3 text-sm text-muted-foreground">
              <Badge>Example</Badge> Fictional customers. “Back in play” means a conversation re-opened, not a sale. Your team still
              does the revisit and the close.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
