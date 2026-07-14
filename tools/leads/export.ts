/*
 * Export stage. Flattens businesses into a call-sheet layout — one row per
 * decision-maker (with a business-level row when no named contact was found) —
 * and writes:
 *
 *   leads-master.csv   every row, ranked best-first
 *   call-sheet-NN.csv  daily batches of ~batchSize contacts (default 100) so you
 *                      can work a fixed number of calls/emails per day
 *   leads.json         full structured data incl. per-field provenance
 *   _SUMMARY.txt       counts + a compliance reminder
 *
 * The CSV carries empty `status` / `last_contacted` / `outcome` columns for you
 * to fill as you work the list, so it doubles as a lightweight tracker.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { toCsv } from './csvutil';
import { ROLE_LABELS } from './roles';
import type { BusinessLead, Person } from './types';

/** Column order for the call sheet — reads left-to-right the way you'd work it. */
const COLUMNS = [
  'priority',
  'status',
  'last_contacted',
  'outcome',
  'business',
  'category',
  'contact_name',
  'role',
  'job_title',
  'contact_email',
  'contact_phone',
  'business_email',
  'business_phone',
  'website',
  'city',
  'region',
  'country',
  'linkedin',
  'business_linkedin',
  'confidence',
  'source',
  'source_url',
  'notes',
  'collected_at',
] as const;

type Row = Record<(typeof COLUMNS)[number], string>;

function confidenceOf(person: Person | undefined): string {
  if (!person) return 'business-only';
  const sources = person.provenance.map((p) => p.source);
  if (sources.some((s) => s.includes('jsonld') || s.includes('provider'))) return 'high';
  if (sources.some((s) => s.includes('team'))) return 'medium';
  return 'low';
}

function collectedAt(lead: BusinessLead): string {
  return lead.provenance[0]?.collectedAt ?? new Date().toISOString();
}

function baseRow(lead: BusinessLead): Row {
  return {
    priority: String(lead.score),
    status: 'Not started',
    last_contacted: '',
    outcome: '',
    business: lead.name,
    category: lead.category ?? '',
    contact_name: '',
    role: '',
    job_title: '',
    contact_email: '',
    contact_phone: '',
    business_email: lead.businessEmails[0] ?? '',
    business_phone: lead.businessPhones[0] ?? '',
    website: lead.website ?? '',
    city: lead.city ?? '',
    region: lead.region ?? '',
    country: lead.country ?? '',
    linkedin: '',
    business_linkedin: lead.socials.linkedin ?? '',
    confidence: 'business-only',
    source: lead.provenance.map((p) => p.source).join('|'),
    source_url: lead.provenance.find((p) => p.url)?.url ?? '',
    notes: [...new Set(lead.notes)].join(' · '),
    collected_at: collectedAt(lead),
  };
}

/** One CSV row per targeted person; a single business row if none were found. */
function flatten(lead: BusinessLead): Row[] {
  if (lead.people.length === 0) return [baseRow(lead)];
  const ranked = [...lead.people].sort((a, b) => a.role.localeCompare(b.role));
  return ranked.map((person) => ({
    ...baseRow(lead),
    contact_name: person.name,
    role: ROLE_LABELS[person.role],
    job_title: person.title ?? '',
    contact_email: person.email ?? '',
    contact_phone: person.phone ?? '',
    linkedin: person.linkedin ?? '',
    confidence: confidenceOf(person),
  }));
}

/** Pack rows into day-sized batches without splitting a business across files. */
function batchRows(groups: Row[][], batchSize: number): Row[][] {
  const batches: Row[][] = [];
  let current: Row[] = [];
  for (const group of groups) {
    if (current.length > 0 && current.length + group.length > batchSize) {
      batches.push(current);
      current = [];
    }
    current.push(...group);
  }
  if (current.length) batches.push(current);
  return batches;
}

export interface ExportResult {
  outDir: string;
  totalBusinesses: number;
  totalRows: number;
  withDecisionMaker: number;
  withEmail: number;
  withPhone: number;
  batches: number;
}

const COMPLIANCE_NOTE = `IMPORTANT — before you contact anyone on this list:
- This data was collected from businesses' own public websites and the named
  sources. Treat it as B2B business contact data.
- You are responsible for lawful outreach in each market: check local rules
  (UK GDPR/PECR, EU GDPR, US CAN-SPAM + TCPA/state DNC, CASL in Canada, etc.).
- Screen phone numbers against the relevant Do-Not-Call / TPS / CTPS registers
  before calling.
- Every marketing email must offer a working opt-out; honour opt-outs
  immediately and add them to your suppression file.
- Keep a lawful basis (usually legitimate interest for B2B) documented, and
  record it in your CRM.
This tool records provenance per field to support that — it does not replace
your own compliance process or legal advice.`;

export function exportLeads(
  leads: BusinessLead[],
  outDir: string,
  batchSize: number,
): ExportResult {
  mkdirSync(outDir, { recursive: true });

  const groups = leads.map(flatten);
  const allRows = groups.flat();

  // Master sheet.
  writeFileSync(join(outDir, 'leads-master.csv'), toCsv(allRows, [...COLUMNS]), 'utf8');

  // Daily call-sheet batches.
  const batches = batchRows(groups, batchSize);
  batches.forEach((rows, i) => {
    const n = String(i + 1).padStart(2, '0');
    writeFileSync(join(outDir, `call-sheet-${n}.csv`), toCsv(rows, [...COLUMNS]), 'utf8');
  });

  // Full structured data for downstream tooling / re-import.
  writeFileSync(join(outDir, 'leads.json'), JSON.stringify(leads, null, 2), 'utf8');

  const withDecisionMaker = leads.filter((l) => l.people.length > 0).length;
  const withEmail = allRows.filter((r) => r.contact_email || r.business_email).length;
  const withPhone = allRows.filter((r) => r.contact_phone || r.business_phone).length;

  const summary = [
    `Solar leads export — ${new Date().toISOString()}`,
    '',
    `Businesses:            ${leads.length}`,
    `Contact rows:          ${allRows.length}`,
    `With a decision-maker: ${withDecisionMaker}`,
    `Rows with an email:    ${withEmail}`,
    `Rows with a phone:     ${withPhone}`,
    `Call-sheet batches:    ${batches.length} (~${batchSize} contacts each)`,
    '',
    'Files:',
    '  leads-master.csv    — everything, ranked best-first',
    '  call-sheet-NN.csv   — work one per day',
    '  leads.json          — full data + provenance',
    '',
    COMPLIANCE_NOTE,
  ].join('\n');
  writeFileSync(join(outDir, '_SUMMARY.txt'), `${summary}\n`, 'utf8');

  return {
    outDir,
    totalBusinesses: leads.length,
    totalRows: allRows.length,
    withDecisionMaker,
    withEmail,
    withPhone,
    batches: batches.length,
  };
}
