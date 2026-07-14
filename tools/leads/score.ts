/*
 * Lead scoring: turn each business into a 0–100 priority so the call sheet puts
 * the most workable leads first. We reward reachability (a named decision-maker
 * with a direct email/phone beats a generic info@) and completeness. The score
 * is a prioritisation aid for your day, not a quality guarantee.
 */
import type { BusinessLead, Seniority } from './types';

const SENIORITY_WEIGHT: Record<Seniority, number> = {
  c_suite: 25,
  director: 18,
  manager: 12,
  other: 6,
};

export function scoreLead(lead: BusinessLead): void {
  let score = 0;
  const reasons: string[] = [];

  // A reachable named decision-maker is the whole game.
  const ranked = [...lead.people].sort(
    (a, b) => SENIORITY_WEIGHT[b.seniority] - SENIORITY_WEIGHT[a.seniority],
  );
  const best = ranked[0];
  if (best) {
    score += SENIORITY_WEIGHT[best.seniority];
    reasons.push(`Decision-maker: ${best.name} (${best.role})`);
    if (best.email) {
      score += 20;
      reasons.push('Direct email');
    }
    if (best.phone) {
      score += 12;
      reasons.push('Direct phone');
    }
  }

  // Extra targeted people add a little, with diminishing returns.
  const extraPeople = Math.min(lead.people.length - (best ? 1 : 0), 3);
  if (extraPeople > 0) {
    score += extraPeople * 4;
    reasons.push(`${lead.people.length} named contacts`);
  }

  // Business-level reachability.
  if (lead.businessEmails.length) {
    score += 10;
    reasons.push('Business email');
  }
  if (lead.businessPhones.length) {
    score += 10;
    reasons.push('Business phone');
  }
  if (lead.website) {
    score += 5;
  } else {
    reasons.push('No website');
  }

  lead.score = Math.max(0, Math.min(100, score));
  lead.notes.push(...reasons);
}

/** Score every lead and return them sorted best-first for the call sheet. */
export function scoreAndRank(leads: BusinessLead[]): BusinessLead[] {
  for (const lead of leads) scoreLead(lead);
  return [...leads].sort((a, b) => b.score - a.score);
}
