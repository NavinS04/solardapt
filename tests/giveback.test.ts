import { describe, expect, it } from 'vitest';
import { calculateGiveBack, WORKING_WEEKS } from '@/lib/giveback';

const base = {
  hoursChasing: 6,
  hoursQuoting: 4,
  hoursEvening: 2,
  shareOff: 0.5,
  hourValue: 40,
  quietQuotes: 40,
  reopenRate: 0.05,
  profitPerInstall: 1800,
};

describe('calculateGiveBack', () => {
  it('uses only the visitor’s own numbers', () => {
    const r = calculateGiveBack(base);
    expect(r.hoursPerWeek).toBe(6);
    expect(r.hoursPerYear).toBe(6 * WORKING_WEEKS);
    expect(r.timeValuePerYear).toBe(6 * WORKING_WEEKS * 40);
    expect(r.installsFromQuotes).toBe(2);
    expect(r.quoteProfitPerYear).toBe(3600);
  });

  it('clamps shares and ignores negative or missing inputs', () => {
    const r = calculateGiveBack({ ...base, shareOff: 2, reopenRate: -1, hoursEvening: -5, hourValue: Number.NaN });
    expect(r.hoursPerWeek).toBe(10);
    expect(r.timeValuePerYear).toBe(0);
    expect(r.installsFromQuotes).toBe(0);
  });

  it('returns zero when nothing could come off the plate', () => {
    expect(calculateGiveBack({ ...base, shareOff: 0 }).hoursPerYear).toBe(0);
  });
});
