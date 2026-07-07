import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { leadSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { pushLeadToGHL, toGHLPayload } from '@/lib/ghl';

/*
 * Public lead-capture endpoint (thin backend).
 *   validate (zod + honeypot) → rate-limit → consent-gate conversion →
 *   fire Meta CAPI → push lead to GHL (system of record) → return success.
 * GHL workflows then own nurture (SMS + email), pipeline and reminders.
 * A GHL failure never blocks the visitor — the lead is logged for recovery.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ua = req.headers.get('user-agent') ?? undefined;
  const policyVersion = process.env.POLICY_VERSION ?? 'unversioned';

  const limit = rateLimit(`lead:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot — silently accept to avoid tipping off bots.
  if (data.company_website) {
    return NextResponse.json({ ok: true });
  }

  const eventId = randomUUID();

  // Fire server-side conversion only with marketing consent (deduped with the
  // Pixel via eventId). Consent is captured client-side and forwarded here.
  if (data.consentMarketing) {
    await sendMetaCapiEvent({
      eventName: 'Lead',
      eventId,
      email: data.email,
      phone: data.phone,
      fbclid: data.fbclid,
      clientIp: ip,
      userAgent: ua,
    });
  }

  // Hand the lead to GHL. Consent + attribution travel as custom fields so GHL
  // remains the auditable record. Never block the visitor on failure.
  const ghl = await pushLeadToGHL(toGHLPayload(data, { ip, policyVersion }));

  return NextResponse.json({ ok: true, eventId, forwarded: ghl.ok });
}
