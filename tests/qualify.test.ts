import { describe, it, expect } from 'vitest';
import { QUALIFY_AT, qualify } from '@/lib/qualify';

describe('qualify', () => {
  it('adds up the fixed points table', () => {
    const r = qualify({
      type: 'Detached',
      roof: 'South',
      bill: 'Over £150',
      when: 'As soon as possible',
    });
    expect(r.score).toBe(100);
    expect(r.qualified).toBe(true);
  });

  it('nurtures scores below the threshold', () => {
    const r = qualify({
      type: 'Flat or maisonette',
      roof: 'North',
      bill: 'Under £75',
      when: 'Just researching',
    });
    expect(r.score).toBe(18);
    expect(r.score).toBeLessThan(QUALIFY_AT);
    expect(r.qualified).toBe(false);
  });

  it('matches labels case-insensitively and rejects unknown answers', () => {
    expect(
      qualify({ type: 'terraced', roof: 'not sure', bill: '£75 to £150', when: 'in 3 to 6 months' })
        .score,
    ).toBe(60);
    expect(() =>
      qualify({ type: 'Castle', roof: 'South', bill: 'Over £150', when: 'As soon as possible' }),
    ).toThrow(/type/);
  });
});
