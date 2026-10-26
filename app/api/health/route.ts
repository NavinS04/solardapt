import { NextResponse } from 'next/server';
import { site } from '@/lib/site';
import { leadForwardingConfigured } from '@/lib/lead-forward';

export const dynamic = 'force-dynamic';

/*
 * Health probe. The site is stateless, so this confirms it is serving and
 * whether the enquiry webhook and booking link are set (values never shown).
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    leadWebhook: leadForwardingConfigured() ? 'configured' : 'unconfigured',
    bookingLink: site.bookingUrl ? 'configured' : 'unconfigured',
    ts: new Date().toISOString(),
  });
}
