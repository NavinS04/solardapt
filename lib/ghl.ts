/*
 * GoHighLevel (GHL) lead handoff. GHL is the system of record for leads,
 * pipeline, nurture (SMS + email) and reminders. The website's only job is to
 * push a validated, consent-gated lead into GHL via an inbound webhook; GHL
 * workflows take over from there.
 *
 * Provider-agnostic by design: `GHL_MODE` switches between the inbound
 * `webhook` (implemented) and the GHL `api` (stubbed for a future swap to
 * API key + Location ID) without changing any caller.
 *
 * The webhook body uses the exact field keys configured on the GHL inbound
 * webhook trigger — see `GHLWebhookBody`. Keep this in sync with the field
 * mapping in GHL (docs/RUNBOOK.md).
 */
import type { LeadInput } from './validators';

/** The exact, flat field keys the GHL inbound webhook expects. */
export interface GHLWebhookBody {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business?: string;
  // Sent as a string to match GHL's confirmed webhook field types (e.g. "8").
  jobs_per_month?: string;
  market?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  /** Free-text enquiry message from the form or Calendly invitee questions. */
  message?: string;
  // Booking metadata forwarded from the Calendly webhook bridge.
  booking_status?: 'booked' | 'cancelled';
  booking_start?: string;
  booking_event?: string;
  // Sent as a string ("true" / "false") to match GHL's confirmed webhook types.
  consent_given: string;
  consent_timestamp: string;
  // Additional audit context (forwarded for compliance; GHL ignores any field
  // not mapped on the trigger).
  consent_ip?: string;
  consent_policy_version?: string;
}

export interface GHLResult {
  ok: boolean;
  status?: number;
  error?: string;
}

const mode = () => (process.env.GHL_MODE === 'api' ? 'api' : 'webhook');

/** Split a full name into first / last for GHL's contact fields. */
export function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/);
  const first_name = parts.shift() ?? '';
  return { first_name, last_name: parts.join(' ') };
}

/**
 * Map our internal lead shape to the exact flat body the GHL inbound webhook
 * expects. Attribution and consent travel as their own keys so GHL is fully
 * auditable.
 */
export function toGHLPayload(
  data: LeadInput,
  meta: { ip: string; policyVersion: string },
): GHLWebhookBody {
  const { first_name, last_name } = splitName(data.name);
  const utm = data.utm ?? {};

  return {
    first_name,
    last_name,
    email: data.email,
    phone: data.phone,
    business: data.business || undefined,
    jobs_per_month: data.jobsPerMonth !== undefined ? String(data.jobsPerMonth) : undefined,
    market: data.market,
    source: data.source ?? 'meta',
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    fbclid: data.fbclid,
    message: data.message || undefined,
    consent_given: String(Boolean(data.consentMarketing)),
    consent_timestamp: new Date().toISOString(),
    consent_ip: meta.ip,
    consent_policy_version: meta.policyVersion,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Drop undefined keys so the webhook body is clean. */
function compact(body: GHLWebhookBody): Record<string, unknown> {
  return Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
}

/**
 * Push a lead to GHL. Never throws — callers must not block the visitor on a
 * GHL failure. Retries once with backoff; logs failures for manual recovery
 * (Sentry if configured, else structured console).
 */
export async function pushLeadToGHL(
  payload: GHLWebhookBody,
  opts?: { webhookUrl?: string },
): Promise<GHLResult> {
  if (mode() === 'api') {
    // TODO: implement GHL API path (GHL_API_KEY + GHL_LOCATION_ID) when ready.
    console.info('[ghl:api:stub] would create contact via GHL API', payload.email);
    return { ok: false, error: 'api mode not implemented' };
  }

  const url = opts?.webhookUrl || process.env.GHL_INBOUND_WEBHOOK_URL;
  if (!url) {
    console.info('[ghl:noop] GHL_INBOUND_WEBHOOK_URL missing — would push', payload.email);
    return { ok: false, error: 'webhook url not configured' };
  }

  const body = compact(payload);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return { ok: true, status: res.status };
      // Non-2xx: retry once, then give up gracefully.
      console.error(`[ghl] webhook non-2xx (attempt ${attempt + 1}):`, res.status);
    } catch (err) {
      console.error(`[ghl] webhook error (attempt ${attempt + 1}):`, (err as Error).message);
    }
    if (attempt === 0) await sleep(400);
  }

  // Final failure — log enough to recover the lead manually. Wire Sentry here.
  console.error('[ghl] FAILED to push lead — manual recovery needed:', JSON.stringify(body));
  return { ok: false, error: 'ghl push failed after retry' };
}
