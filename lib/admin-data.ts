/*
 * Admin data access. Reads from Postgres via Prisma when a real DATABASE_URL is
 * configured; otherwise returns clearly-labelled illustrative data so the CRM
 * UI is reviewable without a database. Replace the demo fallback with live data
 * in production (BUILD_SPEC §8).
 */
import type { LeadStage } from '@prisma/client';

export interface AdminLead {
  id: string;
  name: string;
  business: string | null;
  email: string;
  market: string | null;
  score: number;
  grade: string | null;
  stage: LeadStage;
  createdAt: Date;
  demo?: boolean;
}

const DEMO_LEADS: AdminLead[] = [
  { id: 'demo-1', name: 'Sample Installer A', business: 'Bright Roof Solar', email: 'a@example.com', market: 'UK', score: 64, grade: 'A', stage: 'BOOKED', createdAt: new Date(), demo: true },
  { id: 'demo-2', name: 'Sample Installer B', business: 'Sunline Energy', email: 'b@example.com', market: 'USA', score: 48, grade: 'B', stage: 'CONTACTED', createdAt: new Date(), demo: true },
  { id: 'demo-3', name: 'Sample Installer C', business: 'Coastal PV', email: 'c@example.com', market: 'AUSTRALIA', score: 32, grade: 'C', stage: 'NEW', createdAt: new Date(), demo: true },
  { id: 'demo-4', name: 'Sample Installer D', business: 'Desert Sun Co', email: 'd@example.com', market: 'MIDDLE_EAST', score: 71, grade: 'A', stage: 'SHOWED', createdAt: new Date(), demo: true },
];

const hasDb = () => Boolean(process.env.DATABASE_URL) && !process.env.DATABASE_URL!.includes('localhost');

export async function getLeads(): Promise<{ leads: AdminLead[]; demo: boolean }> {
  if (!hasDb()) return { leads: DEMO_LEADS, demo: true };
  try {
    const { prisma } = await import('@/lib/prisma');
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, name: true, business: true, email: true, market: true, score: true, grade: true, stage: true, createdAt: true },
    });
    return { leads: leads as AdminLead[], demo: false };
  } catch {
    return { leads: DEMO_LEADS, demo: true };
  }
}

export const STAGES: LeadStage[] = ['NEW', 'CONTACTED', 'BOOKED', 'SHOWED', 'WON', 'LOST'];
