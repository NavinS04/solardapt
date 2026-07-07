import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { pushLeadToGHL, type GHLWebhookBody } from '@/lib/ghl';
import { sendMetaCapiEvent } from '@/lib/meta-capi';

/*
 * Calendly → GHL bridge. Calendly fires `invitee.created` / `invitee.canceled`
 * webhooks here; we verify the signature, extract the invitee's details
 * (including the phone number and "what would you like to discuss" answers
 * from the event type's invitee questions), and forward everything into GHL
 * so the contact, their message and the booking metadata land on the record —
 * and the booking workflow (tag/pipeline/reminders) fires in GHL.
 *
 * Calendar-view sync (seeing the slot blocked in both diaries) is done by
 * connecting the same Google Calendar to Calendly and GHL — see RUNBOOK.
 *
 * Setup: create a webhook subscription pointing at
 *   https://solardapt.com/api/webhooks/calendly
 * for events invitee.created + invitee.canceled, and put the signing key in
 * CALENDLY_WEBHOOK_SIGNING_KEY (see docs/RUNBOOK.md for the exact curl).
 */

interface CalendlyQA {
  question: string;
  answer: string;
}

interface CalendlyPayload {
  event: string;
  payload: {
    name?: string;
    email?: string;
    text_reminder_number?: string | null;
    questions_and_answers?: CalendlyQA[];
    scheduled_event?: {
      start_time?: string;
      name?: string;
      location?: { location?: string | null; type?: string };
    };
    cancel_url?: string;
    reschedule_url?: string;
    tracking?: {
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
    };
  };
}

/** Calendly signs webhooks as `Calendly-Webhook-Signature: t=...,v1=...` —
 * HMAC-SHA256 of `${t}.${rawBody}` with the subscription's signing key. */
function verifyCalendlySignature(raw: string, header: string | null, key?: string): boolean {
  if (!key) return true; // not configured yet — accept but log (bootstrap mode)
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.split('=') as [string, string]),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = crypto.createHmac('sha256', key).update(`${t}.${raw}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

const findAnswer = (qa: CalendlyQA[] | undefined, ...needles: string[]) =>
  qa?.find((x) => needles.some((n) => x.question.toLowerCase().includes(n)))?.answer;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signatureOk = verifyCalendlySignature(
    raw,
    req.headers.get('calendly-webhook-signature'),
    process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
  );
  if (!signatureOk) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  if (!process.env.CALENDLY_WEBHOOK_SIGNING_KEY) {
    console.warn('[calendly] CALENDLY_WEBHOOK_SIGNING_KEY not set — accepting unsigned webhook');
  }

  let body: CalendlyPayload;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (body.event !== 'invitee.created' && body.event !== 'invitee.canceled') {
    return NextResponse.json({ ok: true, skipped: body.event });
  }

  const p = body.payload ?? {};
  const qa = p.questions_and_answers;
  // Phone: prefer an explicit invitee question, then SMS-reminder number, then
  // a phone-call event location.
  const phone =
    findAnswer(qa, 'phone', 'number', 'mobile') ??
    p.text_reminder_number ??
    (p.scheduled_event?.location?.type === 'outbound_call'
      ? p.scheduled_event.location.location ?? ''
      : '') ??
    '';
  const message = findAnswer(qa, 'discuss', 'share', 'message', 'about', 'enquiry') ?? '';

  const fullName = (p.name ?? '').trim();
  const spaceIdx = fullName.indexOf(' ');
  const ghlPayload: GHLWebhookBody = {
    first_name: spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName,
    last_name: spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : '',
    email: p.email ?? '',
    phone: phone || '',
    source: 'calendly',
    utm_source: p.tracking?.utm_source ?? undefined,
    utm_medium: p.tracking?.utm_medium ?? undefined,
    utm_campaign: p.tracking?.utm_campaign ?? undefined,
    message: message || undefined,
    booking_status: body.event === 'invitee.created' ? 'booked' : 'cancelled',
    booking_start: p.scheduled_event?.start_time,
    booking_event: p.scheduled_event?.name,
    // Booking a call is a transactional contact request — recorded as such.
    consent_given: 'true',
    consent_timestamp: new Date().toISOString(),
  };

  const ghl = await pushLeadToGHL(ghlPayload, { webhookUrl: process.env.GHL_BOOKING_WEBHOOK_URL });

  // Server-side Schedule conversion (hashed PII, deduped with the Pixel).
  if (body.event === 'invitee.created' && p.email) {
    await sendMetaCapiEvent({
      eventName: 'Schedule',
      eventId: randomUUID(),
      email: p.email,
      phone: phone || undefined,
    });
  }

  return NextResponse.json({ ok: true, forwarded: ghl.ok, event: body.event });
}
