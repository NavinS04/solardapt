import { describe, it, expect } from 'vitest';
import { toGHLPayload, splitName } from '@/lib/ghl';
import type { LeadInput } from '@/lib/validators';

describe('splitName', () => {
  it('splits first and last name', () => {
    expect(splitName('Daniel Whitmore')).toEqual({ first_name: 'Daniel', last_name: 'Whitmore' });
  });
  it('keeps multi-word surnames in last_name', () => {
    expect(splitName('Ana Maria del Rio')).toEqual({ first_name: 'Ana', last_name: 'Maria del Rio' });
  });
  it('handles a single name', () => {
    expect(splitName('Cher')).toEqual({ first_name: 'Cher', last_name: '' });
  });
});

describe('toGHLPayload', () => {
  const base: LeadInput = {
    name: 'Daniel Whitmore',
    email: 'daniel@brightroofsolar.co.uk',
    phone: '+447700900123',
    business: 'Bright Roof Solar',
    jobsPerMonth: 12,
    market: 'UK',
    source: 'meta',
    fbclid: 'abc123',
    utm: { utm_source: 'facebook', utm_medium: 'paid_social', utm_campaign: 'uk-q3' },
    consentMarketing: true,
  };

  it('emits the exact GHL field keys', () => {
    const p = toGHLPayload(base, { ip: '1.2.3.4', policyVersion: '2026-06-01' });
    expect(p.first_name).toBe('Daniel');
    expect(p.last_name).toBe('Whitmore');
    expect(p.email).toBe('daniel@brightroofsolar.co.uk');
    expect(p.phone).toBe('+447700900123');
    expect(p.jobs_per_month).toBe('12');
    expect(p.market).toBe('UK');
    expect(p.source).toBe('meta');
  });

  it('maps utm params to individual keys', () => {
    const p = toGHLPayload(base, { ip: '1.2.3.4', policyVersion: '2026-06-01' });
    expect(p.utm_source).toBe('facebook');
    expect(p.utm_medium).toBe('paid_social');
    expect(p.utm_campaign).toBe('uk-q3');
    expect(p.fbclid).toBe('abc123');
  });

  it('forwards consent as consent_given + consent_timestamp (auditable)', () => {
    const p = toGHLPayload(base, { ip: '1.2.3.4', policyVersion: '2026-06-01' });
    expect(p.consent_given).toBe('true');
    expect(typeof p.consent_timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(p.consent_timestamp))).toBe(false);
    expect(p.consent_ip).toBe('1.2.3.4');
    expect(p.consent_policy_version).toBe('2026-06-01');
  });

  it('sets consent_given false without marketing consent', () => {
    const p = toGHLPayload({ ...base, consentMarketing: false }, { ip: 'x', policyVersion: 'v' });
    expect(p.consent_given).toBe('false');
  });

  it('drops empty business to undefined', () => {
    const p = toGHLPayload({ ...base, business: '' }, { ip: 'x', policyVersion: 'v' });
    expect(p.business).toBeUndefined();
  });
});
