import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/*
 * Uptime-friendly health probe. The backend is stateless (no datastore) — it
 * validates, fires conversion events and hands leads to GHL — so this simply
 * confirms the app is serving and whether the GHL handoff is configured.
 */
export async function GET() {
  const ghl =
    process.env.GHL_MODE === 'api'
      ? process.env.GHL_API_KEY
        ? 'configured'
        : 'unconfigured'
      : process.env.GHL_INBOUND_WEBHOOK_URL
        ? 'configured'
        : 'unconfigured';

  return NextResponse.json({ status: 'ok', ghl, ts: new Date().toISOString() });
}
