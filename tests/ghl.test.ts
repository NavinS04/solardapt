import { describe, it, expect } from 'vitest';
import { toGHLPayload } from '@/lib/ghl';
import type { LeadInput } from '@/lib/validators';

describe('toGHLPayload', () => {
  const base: LeadInput = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+44 7700 900000',
    business: 'Bright Roof Solar',
    jobsPerMonth: 12,
    market: 'UK',
    source: 'meta',
    fbclid: 'abc123',
    utm: { utm_source: 'fb', utm_campaign: 'spring' },
    consentMarketing: true,
  };

  it('maps core lead fields', () => {
    const p = toGHLPayload(base, { ip: '1.2.3.4', policyVersion: '2026-06-01' });
    expect(p.name).toBe('Jane Doe');
    expect(p.email).toBe('jane@example.com');
    expect(p.business).toBe('Bright Roof Solar');
    expect(p.market).toBe('UK');
  });

  it('forwards consent metadata for auditability', () => {
    const p = toGHLPayload(base, { ip: '1.2.3.4', policyVersion: '2026-06-01' });
    expect(p.consent?.marketing).toBe(true);
    expect(p.consent?.ip).toBe('1.2.3.4');
    expect(p.consent?.policyVersion).toBe('2026-06-01');
  });

  it('preserves attribution (utm + fbclid)', () => {
    const p = toGHLPayload(base, { ip: '1.2.3.4', policyVersion: '2026-06-01' });
    expect(p.fbclid).toBe('abc123');
    expect(p.utm?.utm_source).toBe('fb');
  });

  it('drops empty business to undefined', () => {
    const p = toGHLPayload({ ...base, business: '' }, { ip: 'x', policyVersion: 'v' });
    expect(p.business).toBeUndefined();
  });
});
