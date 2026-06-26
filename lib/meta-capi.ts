/*
 * Meta Conversions API (CAPI) — server-side conversion events with hashed PII,
 * deduped with the browser Pixel via a shared event_id. Degrades to a no-op
 * when the Pixel/CAPI env vars are absent so the app builds without secrets.
 */
import crypto from 'node:crypto';

const sha256 = (v?: string) =>
  v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined;

export async function sendMetaCapiEvent(opts: {
  eventName: 'Lead' | 'Schedule';
  eventId: string;
  email?: string;
  phone?: string;
  fbclid?: string;
  clientIp?: string;
  userAgent?: string;
}): Promise<{ sent: boolean }> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    console.info('[capi:noop] Meta CAPI not configured — would send', opts.eventName);
    return { sent: false };
  }

  const emHash = sha256(opts.email);
  const phHash = sha256(opts.phone);
  const body = {
    data: [
      {
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId, // dedupe key shared with the Pixel
        action_source: 'website',
        user_data: {
          em: emHash ? [emHash] : undefined,
          ph: phHash ? [phHash] : undefined,
          fbc: opts.fbclid ? `fb.1.${Date.now()}.${opts.fbclid}` : undefined,
          client_ip_address: opts.clientIp,
          client_user_agent: opts.userAgent,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );
    return { sent: res.ok };
  } catch (err) {
    console.error('[capi] send failed:', (err as Error).message);
    return { sent: false };
  }
}
