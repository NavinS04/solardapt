/*
 * Pluggable, licensed enrichment providers. These are OPTIONAL and OFF unless
 * you supply an API key. Providers are the lawful way to fill contact gaps you
 * can't get from a company's own site — they license their data and handle their
 * own compliance. We deliberately do NOT scrape LinkedIn or any site that
 * forbids it; that path is a terms-of-service and legal risk, so it isn't here.
 *
 * Currently wired: Hunter.io "Domain Search" (finds published role emails for a
 * domain). Add more providers by following the same shape.
 */
import { classifyTitle } from '../roles';
import { mergePerson } from './website';
import type { BusinessLead, Person, RunConfig } from '../types';

function nowIso(): string {
  return new Date().toISOString();
}

interface HunterEmail {
  value?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  phone_number?: string;
  confidence?: number;
}

/** Query Hunter.io for a domain's public role emails. Returns [] on any error. */
async function hunterDomainSearch(
  domain: string,
  apiKey: string,
): Promise<{ emails: string[]; people: Person[] }> {
  const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(
    domain,
  )}&api_key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { emails: [], people: [] };
    const json = (await res.json()) as { data?: { emails?: HunterEmail[] } };
    const rows = json.data?.emails ?? [];
    const emails: string[] = [];
    const people: Person[] = [];
    for (const row of rows) {
      if (!row.value) continue;
      emails.push(row.value.toLowerCase());
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
      const title = row.position?.trim();
      if (name && title) {
        const { role, seniority } = classifyTitle(title);
        if (role !== 'unknown') {
          people.push({
            name,
            title,
            role,
            seniority,
            email: row.value.toLowerCase(),
            phone: row.phone_number || undefined,
            provenance: [{ source: 'provider:hunter', url, collectedAt: nowIso() }],
          });
        }
      }
    }
    return { emails, people };
  } catch {
    return { emails: [], people: [] };
  }
}

/** Fill gaps in a lead using any configured provider. No-op without keys. */
export async function mergeProviderContacts(lead: BusinessLead, cfg: RunConfig): Promise<void> {
  if (!lead.domain) return;

  if (cfg.hunterKey) {
    const { emails, people } = await hunterDomainSearch(lead.domain, cfg.hunterKey);
    lead.businessEmails.push(...emails);
    for (const p of people) mergePerson(lead.people, p);
    if (people.length) lead.notes.push(`Hunter added ${people.length} role contact(s).`);
  }
}
