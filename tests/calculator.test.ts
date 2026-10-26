import { describe, it, expect } from 'vitest';
import { calculateRoi } from '@/lib/calculator';

describe('calculateRoi', () => {
  it('produces more appointments than current installs', () => {
    const r = calculateRoi({ installsPerMonth: 10, averageJobValue: 8000, currentCloseRate: 0.3 });
    expect(r.extraAppointments).toBeGreaterThan(10);
  });

  it('scales added revenue with job value and close rate', () => {
    const low = calculateRoi({ installsPerMonth: 10, averageJobValue: 5000, currentCloseRate: 0.2 });
    const high = calculateRoi({ installsPerMonth: 10, averageJobValue: 15000, currentCloseRate: 0.4 });
    expect(high.addedMonthlyRevenue).toBeGreaterThan(low.addedMonthlyRevenue);
  });

  it('handles zeros without NaN', () => {
    const r = calculateRoi({ installsPerMonth: 0, averageJobValue: 0, currentCloseRate: 0 });
    expect(Number.isFinite(r.addedMonthlyRevenue)).toBe(true);
    expect(r.addedMonthlyRevenue).toBe(0);
  });

  it('clamps close rate above 100%', () => {
    const r = calculateRoi({ installsPerMonth: 5, averageJobValue: 8000, currentCloseRate: 1.5 });
    expect(Number.isFinite(r.estimatedRoi)).toBe(true);
  });
});
