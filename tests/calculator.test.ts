import { describe, it, expect } from 'vitest';
import { calculateLeakage } from '@/lib/calculator';

describe('calculateLeakage', () => {
  it('multiplies only the visitor inputs', () => {
    const r = calculateLeakage({ enquiriesPerMonth: 40, slowShare: 0.4, installRate: 0.1, profitPerInstall: 2500 });
    expect(r.coldEnquiries).toBe(16);
    expect(r.installsAtStake).toBe(1.6);
    expect(r.valueAtStake).toBe(4000);
  });

  it('is zero when every enquiry is contacted within the hour', () => {
    const r = calculateLeakage({ enquiriesPerMonth: 100, slowShare: 0, installRate: 0.2, profitPerInstall: 3000 });
    expect(r.valueAtStake).toBe(0);
  });

  it('handles zeros without NaN', () => {
    const r = calculateLeakage({ enquiriesPerMonth: 0, slowShare: 0, installRate: 0, profitPerInstall: 0 });
    expect(Number.isFinite(r.valueAtStake)).toBe(true);
    expect(r.valueAtStake).toBe(0);
  });

  it('clamps shares above 100% and below 0%', () => {
    const r = calculateLeakage({ enquiriesPerMonth: 10, slowShare: 1.5, installRate: -0.2, profitPerInstall: 2000 });
    expect(r.coldEnquiries).toBe(10);
    expect(r.valueAtStake).toBe(0);
  });
});
