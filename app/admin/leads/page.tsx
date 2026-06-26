import { getLeads } from '@/lib/admin-data';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

const gradeColor: Record<string, string> = {
  A: 'text-success',
  B: 'text-solar-400',
  C: 'text-warn',
  D: 'text-error',
};

export default async function LeadsPage() {
  const { leads, demo } = await getLeads();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Leads</h1>
        {demo && <Badge>Illustrative data</Badge>}
      </div>

      <div className="overflow-x-auto rounded-md glass">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Market</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-muted">
                <td className="px-4 py-3 font-medium">{lead.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.business ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.market?.replace('_', ' ') ?? '—'}</td>
                <td className="px-4 py-3">{lead.score}</td>
                <td className={`px-4 py-3 font-semibold ${gradeColor[lead.grade ?? ''] ?? ''}`}>
                  {lead.grade ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs">
                    {lead.stage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
