import { getLeads } from '@/lib/admin-data';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { leads, demo } = await getLeads();
  const total = leads.length;
  const booked = leads.filter((l) => ['BOOKED', 'SHOWED', 'WON'].includes(l.stage)).length;
  const avgScore = total ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total) : 0;
  const won = leads.filter((l) => l.stage === 'WON').length;

  const stats = [
    { label: 'Total leads', value: total },
    { label: 'Booked / showed / won', value: booked },
    { label: 'Average lead score', value: avgScore },
    { label: 'Won', value: won },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        {demo && <Badge>Illustrative data (no DB connected)</Badge>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md glass p-6">
            <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md glass p-6">
        <h2 className="mb-4 text-sm font-semibold">Leads by stage</h2>
        <div className="space-y-2">
          {['NEW', 'CONTACTED', 'BOOKED', 'SHOWED', 'WON', 'LOST'].map((stage) => {
            const count = leads.filter((l) => l.stage === stage).length;
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted-foreground">{stage}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-solar-gradient" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
