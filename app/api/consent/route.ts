import { NextRequest, NextResponse } from 'next/server';

/*
 * Consent audit log. We must record consent (timestamp, scope, IP, policy
 * version) before any tracker fires, even though lead data itself lives in GHL.
 * This writes a structured, greppable audit line — serverless-friendly and
 * captured by the host's log drain / Sentry breadcrumbs. Lead-level consent is
 * additionally forwarded into GHL as custom fields on submit (see lib/ghl.ts).
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const policyVersion = process.env.POLICY_VERSION ?? 'unversioned';

  let body: { analytics?: boolean; marketing?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Structured audit record — keep the tag stable for log queries.
  console.info(
    'CONSENT_AUDIT',
    JSON.stringify({
      subject: `anon:${ip}`,
      analytics: Boolean(body.analytics),
      marketing: Boolean(body.marketing),
      ip,
      policyVersion,
      ts: new Date().toISOString(),
    }),
  );

  return NextResponse.json({ ok: true });
}
