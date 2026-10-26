import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { pushLeadToGHL } from '@/lib/ghl';

/*
 * Newsletter opt-in. Forwards the subscriber into GHL with source
 * "newsletter"; the GHL workflow sends the double opt-in confirmation and
 * manages unsubscribes, keeping all email compliance in one place.
 */
const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limit = rateLimit(`subscribe:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email.' }, { status: 422 });
  }

  const ghl = await pushLeadToGHL({
    first_name: '',
    last_name: '',
    email: parsed.data.email,
    phone: '',
    source: 'newsletter',
    consent_given: 'true',
    consent_timestamp: new Date().toISOString(),
    consent_ip: ip,
    consent_policy_version: process.env.POLICY_VERSION ?? 'unversioned',
  });

  return NextResponse.json({ ok: true, forwarded: ghl.ok });
}
