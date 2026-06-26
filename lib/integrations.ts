/*
 * Thin, dependency-light integration layer. Each function degrades gracefully
 * when its provider env vars are absent (logging instead of throwing), so the
 * app builds and runs in any environment. Swap the TODO bodies for the real
 * SDK calls (Resend, Twilio, Meta CAPI) once keys are supplied — see §14.
 */
import crypto from 'node:crypto';

const isConfigured = (...keys: string[]) => keys.every((k) => Boolean(process.env[k]));

/** Send a transactional email via Resend. */
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!isConfigured('RESEND_API_KEY')) {
    console.info('[email:noop] RESEND_API_KEY missing — would send', opts.subject, 'to', opts.to);
    return { id: 'noop', delivered: false };
  }
  // TODO: replace with `resend.emails.send(...)` using emails/* React Email templates.
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? 'Solardapt <hello@solardapt.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });
  return { id: res.ok ? 'sent' : 'error', delivered: res.ok };
}

/** Send an SMS via Twilio. */
export async function sendSms(opts: { to: string; body: string }) {
  if (!isConfigured('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM')) {
    console.info('[sms:noop] Twilio not configured — would text', opts.to);
    return { sid: 'noop', delivered: false };
  }
  // TODO: replace with the Twilio SDK. Quiet-hours/throttling enforced upstream.
  return { sid: 'queued', delivered: true };
}

/**
 * Fire a server-side Meta Conversions API event with hashed PII, deduped with
 * the browser Pixel via a shared event_id (BUILD_SPEC §7).
 */
export async function sendMetaCapiEvent(opts: {
  eventName: 'Lead' | 'Schedule';
  eventId: string;
  email?: string;
  phone?: string;
  fbclid?: string;
  clientIp?: string;
  userAgent?: string;
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    console.info('[capi:noop] Meta CAPI not configured — would send', opts.eventName);
    return { sent: false };
  }
  const sha256 = (v?: string) =>
    v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined;

  const body = {
    data: [
      {
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId, // dedupe key shared with the Pixel
        action_source: 'website',
        user_data: {
          em: sha256(opts.email) ? [sha256(opts.email)] : undefined,
          ph: sha256(opts.phone) ? [sha256(opts.phone)] : undefined,
          fbc: opts.fbclid ? `fb.1.${Date.now()}.${opts.fbclid}` : undefined,
          client_ip_address: opts.clientIp,
          client_user_agent: opts.userAgent,
        },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );
  return { sent: res.ok };
}

/** Verify a signed webhook payload (Calendly / Twilio / Resend / Meta). */
export function verifySignature(payload: string, signature: string | null, secret?: string) {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
