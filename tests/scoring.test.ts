import { describe, it, expect } from 'vitest';
import { scoreLead } from '@/lib/scoring';

describe('scoreLead', () => {
  it('grades a high-volume UK Meta lead as A', () => {
    const { grade } = scoreLead({ jobsPerMonth: 20, market: 'UK', source: 'meta-ads' });
    expect(grade).toBe('A');
  });

  it('grades a sparse lead lower', () => {
    const { grade } = scoreLead({ jobsPerMonth: 1, market: null, source: 'other' });
    expect(['C', 'D']).toContain(grade);
  });

  it('caps the jobs-per-month contribution', () => {
    const a = scoreLead({ jobsPerMonth: 100 });
    const b = scoreLead({ jobsPerMonth: 1000 });
    expect(a.score).toBe(b.score);
  });
});
