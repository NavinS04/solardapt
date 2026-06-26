import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Uptime-friendly health probe (BUILD_SPEC §11). Reports DB connectivity when
// configured, but stays green for the static/no-DB case.
export async function GET() {
  let db: 'ok' | 'unconfigured' | 'error' = 'unconfigured';
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'error';
    }
  }
  return NextResponse.json({ status: 'ok', db, ts: new Date().toISOString() });
}
