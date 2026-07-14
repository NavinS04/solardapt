/*
 * Merge duplicate businesses that surfaced from more than one source or query.
 * Two leads are "the same" if they share a domain, or (domainless) a normalised
 * name. Contacts, people and provenance are unioned into the survivor.
 */
import { mergePerson } from './enrich/website';
import type { BusinessLead } from './types';

function normName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(ltd|limited|inc|llc|plc|gmbh|co|company|solar|energy)\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export function dedupeLeads(leads: BusinessLead[]): BusinessLead[] {
  const byKey = new Map<string, BusinessLead>();

  for (const lead of leads) {
    const key = lead.domain ? `d:${lead.domain}` : `n:${normName(lead.name)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, lead);
      continue;
    }
    // Merge lead into existing.
    existing.businessEmails = [...new Set([...existing.businessEmails, ...lead.businessEmails])];
    existing.businessPhones = [...new Set([...existing.businessPhones, ...lead.businessPhones])];
    existing.website ??= lead.website;
    existing.domain ??= lead.domain;
    existing.address ??= lead.address;
    existing.city ??= lead.city;
    existing.region ??= lead.region;
    existing.country ??= lead.country;
    existing.category ??= lead.category;
    for (const [k, v] of Object.entries(lead.socials)) {
      const sk = k as keyof BusinessLead['socials'];
      if (v && !existing.socials[sk]) existing.socials[sk] = v;
    }
    for (const p of lead.people) mergePerson(existing.people, p);
    existing.notes.push(...lead.notes);
    existing.provenance.push(...lead.provenance);
  }

  return [...byKey.values()];
}
