/*
 * GoHighLevel (GHL) lead handoff. GHL is the system of record for leads,
 * pipeline, nurture (SMS + email) and reminders. The website's only job is to
 * push a validated, consent-gated lead into GHL via an inbound webhook; GHL
 * workflows take over from there.
 *
 * Provider-agnostic by design: `GHL_MODE` switches between the inbound
 * `webhook` (implemented) and the GHL `api` (stubbed for a future swap to
 * API key + Location ID) without changing any caller.
 */
import type { LeadInput } from './validators';

export interface GHLLeadPayload {
  name: string;
  email: string;
  phone: string;
  business?: string;
  jobsPerMonth?: number;
  market?: string;
  source?: string;
  // Attribution + consent forwarded as custom fields so GHL is fully auditable.
  utm?: Record<string, string>;
  fbclid?: string;
  consent?: { marketing: boolean; ip: string; ts: string; policyVersion: string };
}

export interface GHLResult {
  ok: boolean;
  status?: number;
  error?: string;
}

const mode = () => (process.env.GHL_MODE === 'api' ? 'api' : 'webhook');

/** Map our internal lead shape to a flat payload of GHL contact fields. */
export function toGHLPayload(
  data: LeadInput,
  meta: { ip: string; policyVersion: string },
): GHLLeadPayload {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    business: data.business || undefined,
    jobsPerMonth: data.jobsPerMonth,
    market: data.market,
    source: data.source ?? 'meta',
    utm: data.utm,
    fbclid: data.fbclid,
    consent: {
      marketing: Boolean(data.consentMarketing),
      ip: meta.ip,
      ts: new Date().toISOString(),
      policyVersion: meta.policyVersion,
    },
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Push a lead to GHL. Never throws — callers must not block the visitor on a
 * GHL failure. Retries once with backoff; logs failures for manual recovery
 * (Sentry if configured, else structured console).
 */
export async function pushLeadToGHL(payload: GHLLeadPayload): Promise<GHLResult> {
  if (mode() === 'api') {
    // TODO: implement GHL API path (GHL_API_KEY + GHL_LOCATION_ID) when ready.
    console.info('[ghl:api:stub] would create contact via GHL API', payload.email);
    return { ok: false, error: 'api mode not implemented' };
  }

  const url = process.env.GHL_INBOUND_WEBHOOK_URL;
  if (!url) {
    console.info('[ghl:noop] GHL_INBOUND_WEBHOOK_URL missing — would push', payload.email);
    return { ok: false, error: 'webhook url not configured' };
  }

  // Flatten consent for GHL custom-field mapping.
  const body = {
    ...payload,
    consent_marketing: payload.consent?.marketing,
    consent_ts: payload.consent?.ts,
    consent_ip: payload.consent?.ip,
    consent_policy_version: payload.consent?.policyVersion,
    ...payload.utm,
  };

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
  console.error('[ghl] FAILED to push lead — manual recovery needed:', JSON.stringify(payload));
  return { ok: false, error: 'ghl push failed after retry' };
}
