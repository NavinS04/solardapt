/*
 * Suppression / do-not-contact list. Load a file of emails, domains and phone
 * numbers that must never be contacted (opt-outs, competitors, existing clients,
 * TPS/DNC entries you maintain) and strip any matching data from the leads
 * before export. Honouring opt-outs is both a legal duty and good practice.
 *
 * File format: one entry per line — an email, a bare domain, or a phone number.
 * Lines starting with # are comments.
 */
import { readFileSync } from 'node:fs';
import type { BusinessLead } from './types';

export interface Suppression {
  emails: Set<string>;
  domains: Set<string>;
  phones: Set<string>;
}

const digits = (s: string) => s.replace(/[^\d]/g, '');

export function loadSuppression(path?: string): Suppression {
  const sup: Suppression = { emails: new Set(), domains: new Set(), phones: new Set() };
  if (!path) return sup;
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    console.error(`[suppress] could not read "${path}": ${(err as Error).message}`);
    return sup;
  }
  for (const line of raw.split(/\r?\n/)) {
    const v = line.trim().toLowerCase();
    if (!v || v.startsWith('#')) continue;
    if (v.includes('@')) sup.emails.add(v);
    else if (/[a-z]/.test(v) && v.includes('.')) sup.domains.add(v.replace(/^www\./, ''));
    else if (digits(v).length >= 7) sup.phones.add(digits(v));
  }
  return sup;
}

/** Remove suppressed emails/phones; drop a lead entirely if its domain is listed. */
export function applySuppression(leads: BusinessLead[], sup: Suppression): BusinessLead[] {
  const isEmailSuppressed = (e: string) =>
    sup.emails.has(e.toLowerCase()) || sup.domains.has(e.split('@')[1]?.toLowerCase() ?? '');
  const isPhoneSuppressed = (p: string) => sup.phones.has(digits(p));

  const out: BusinessLead[] = [];
  for (const lead of leads) {
    if (lead.domain && sup.domains.has(lead.domain)) continue; // whole business opted out
    lead.businessEmails = lead.businessEmails.filter((e) => !isEmailSuppressed(e));
    lead.businessPhones = lead.businessPhones.filter((p) => !isPhoneSuppressed(p));
    for (const person of lead.people) {
      if (person.email && isEmailSuppressed(person.email)) person.email = undefined;
      if (person.phone && isPhoneSuppressed(person.phone)) person.phone = undefined;
    }
    out.push(lead);
  }
  return out;
}
