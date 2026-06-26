import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { leadSchema } from '@/lib/validators';
import { scoreLead } from '@/lib/scoring';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail, sendSms, sendMetaCapiEvent } from '@/lib/integrations';

/*
 * Public lead-capture endpoint (BUILD_SPEC §7). Validates → persists → enriches
 * → scores → fires conversion events → triggers nurture. Persistence is guarded
 * so the route works without a live DB (returns success, logs intent).
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ua = req.headers.get('user-agent') ?? undefined;

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

  const { score, grade } = scoreLead(data);
  const eventId = randomUUID();

  // Persist (best-effort; never block the user if the DB is unavailable).
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        business: data.business || null,
        jobsPerMonth: data.jobsPerMonth ?? null,
        market: data.market ?? null,
        source: data.source ?? 'meta',
        fbclid: data.fbclid ?? null,
        utm: data.utm ?? undefined,
        score,
        grade,
        consent: { marketing: Boolean(data.consentMarketing), ip, ts: new Date().toISOString() },
      },
    });
  } catch (err) {
    console.error('[lead] persistence skipped/failed:', (err as Error).message);
  }

  // Fire server-side conversion (deduped with the Pixel via eventId).
  await sendMetaCapiEvent({
    eventName: 'Lead',
    eventId,
    email: data.email,
    phone: data.phone,
    fbclid: data.fbclid,
    clientIp: ip,
    userAgent: ua,
  });

  // Immediate nurture — confirmation email + SMS (no-op without keys).
  await Promise.allSettled([
    sendEmail({
      to: data.email,
      subject: 'Your Solardapt strategy call',
      html: `<p>Hi ${data.name}, thanks for reaching out. We'll be in touch shortly to confirm your free strategy call.</p>`,
    }),
    sendSms({ to: data.phone, body: 'Solardapt: thanks! We will text to confirm your strategy call shortly.' }),
  ]);

  return NextResponse.json({ ok: true, eventId, score, grade });
}
