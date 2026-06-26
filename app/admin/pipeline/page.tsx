import { getLeads, STAGES } from '@/lib/admin-data';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

// Read-only Kanban view. Drag-and-drop with optimistic updates is the
// production enhancement (BUILD_SPEC §8); the columns + cards render live data.
export default async function PipelinePage() {
  const { leads, demo } = await getLeads();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Pipeline</h1>
        {demo && <Badge>Illustrative data</Badge>}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = leads.filter((l) => l.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{stage}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((lead) => (
                  <div key={lead.id} className="rounded-md glass p-3">
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.business ?? '—'}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{lead.market?.replace('_', ' ') ?? '—'}</span>
                      <span className="text-solar-400">Score {lead.score}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
