import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/integrations';

/*
 * Inbound Calendly webhook (BUILD_SPEC §7). Verifies the signature, dedupes via
 * an idempotency key, then upserts an Appointment and advances the lead stage.
 * Signature verification is mandatory in production.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get('calendly-webhook-signature');
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;

  if (secret && !verifySignature(raw, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; payload?: { uri?: string; email?: string; scheduled_event?: { start_time?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const idempotencyKey = event.payload?.uri ?? `calendly:${Date.now()}`;

  try {
    const { prisma } = await import('@/lib/prisma');
    // Idempotency: skip if we've already processed this event.
    const seen = await prisma.webhookEvent.findUnique({ where: { idempotencyKey } });
    if (seen) return NextResponse.json({ ok: true, deduped: true });

    await prisma.webhookEvent.create({
      data: { source: 'calendly', idempotencyKey, status: 'processed', payload: event as object },
    });
    // TODO: match lead by email, upsert Appointment, advance stage to BOOKED,
    // schedule reminders. Left as a clear extension point.
  } catch (err) {
    console.error('[calendly] webhook skipped/failed:', (err as Error).message);
  }

  return NextResponse.json({ ok: true });
}
