/*
 * Enquiry handoff. The site stores nothing: a validated enquiry is POSTed as
 * JSON to a Make.com custom webhook (LEAD_WEBHOOK_URL), and the Make scenario
 * does the rest (email/alert to Navin, a row in the pipeline sheet, etc.).
 *
 * Unlike the old handoff, a failure is reported to the caller, so the form can
 * tell the visitor to email or call instead of showing a false "thank you".
 * An optional LEAD_WEBHOOK_SECRET is sent as a header so the Make scenario can
 * reject anything that didn't come from this site.
 */
import type { LeadInput } from './validators';

export interface LeadPayload {
  name: string;
  business?: string;
  email: string;
  phone: string;
  installs_per_month?: number;
  message?: string;
  page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  received_at: string;
}

export type ForwardResult = { ok: true } | { ok: false; reason: 'not_configured' | 'failed' };

export const leadForwardingConfigured = () => Boolean(process.env.LEAD_WEBHOOK_URL);

/** Map the validated form input to the flat JSON body Make receives. */
export function toLeadPayload(data: LeadInput, receivedAt = new Date()): LeadPayload {
  const utm = data.utm ?? {};
  const body: LeadPayload = {
    name: data.name.trim(),
    business: data.business?.trim() || undefined,
    email: data.email,
    phone: data.phone,
    installs_per_month: data.jobsPerMonth,
    message: data.message?.trim() || undefined,
    page: data.page ?? '/book',
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    received_at: receivedAt.toISOString(),
  };
  // Drop empty keys so the Make data structure stays clean.
  return Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as LeadPayload;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** POST the enquiry to Make. Never throws; retries once on failure. */
export async function forwardLead(payload: LeadPayload): Promise<ForwardResult> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return { ok: false, reason: 'not_configured' };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.LEAD_WEBHOOK_SECRET) headers['x-solardapt-secret'] = process.env.LEAD_WEBHOOK_SECRET;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { ok: true };
      console.error(`[lead] webhook non-2xx (attempt ${attempt + 1}):`, res.status);
    } catch (err) {
      console.error(`[lead] webhook error (attempt ${attempt + 1}):`, (err as Error).message);
    }
    if (attempt === 0) await sleep(400);
  }
  return { ok: false, reason: 'failed' };
}
