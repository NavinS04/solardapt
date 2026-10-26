import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { forwardLead, toLeadPayload } from '@/lib/lead-forward';

/*
 * Public enquiry endpoint: validate (zod + honeypot) → rate-limit → forward to
 * the Make.com webhook. Success is only returned once Make has accepted the
 * enquiry; otherwise the form tells the visitor to email or call instead.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

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

  // Honeypot — silently accept to avoid tipping off bots.
  if (parsed.data.company_website) {
    return NextResponse.json({ ok: true });
  }

  const result = await forwardLead(toLeadPayload(parsed.data));
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.reason === 'not_configured' ? 503 : 502 });
  }
  return NextResponse.json({ ok: true });
}
