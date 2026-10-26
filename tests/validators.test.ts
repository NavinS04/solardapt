import { describe, it, expect } from 'vitest';
import { leadSchema } from '@/lib/validators';

describe('leadSchema', () => {
  it('accepts a valid lead', () => {
    const r = leadSchema.safeParse({ name: 'Jane Doe', email: 'jane@example.com', phone: '+44 7700 900000' });
    expect(r.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const r = leadSchema.safeParse({ name: 'Jane', email: 'nope', phone: '+44 7700 900000' });
    expect(r.success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    const r = leadSchema.safeParse({ name: 'Jane Doe', email: 'jane@example.com', phone: '+44 7700 900000', company_website: 'spam' });
    expect(r.success).toBe(false);
  });
});
