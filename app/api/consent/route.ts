import { NextRequest, NextResponse } from 'next/server';

/*
 * Logs a consent decision to ConsentRecord with timestamp, scope, IP and policy
 * version (BUILD_SPEC §10). Guarded so it succeeds without a live DB.
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

  const subject = `anon:${ip}`;
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$transaction([
      prisma.consentRecord.create({
        data: { subject, purpose: 'analytics', value: Boolean(body.analytics), ip, policyVersion },
      }),
      prisma.consentRecord.create({
        data: { subject, purpose: 'marketing', value: Boolean(body.marketing), ip, policyVersion },
      }),
    ]);
  } catch (err) {
    console.error('[consent] log skipped/failed:', (err as Error).message);
  }

  return NextResponse.json({ ok: true });
}
