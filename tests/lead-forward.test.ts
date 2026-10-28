import { afterEach, describe, it, expect, vi } from 'vitest';
import { forwardLead, toLeadPayload } from '@/lib/lead-forward';

const base = {
  name: '  Jane Doe ',
  business: 'Sunny Roofs Ltd',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
  jobsPerMonth: 8,
  utm: { utm_source: 'linkedin' },
};

describe('toLeadPayload', () => {
  it('maps the form fields to the flat Make body', () => {
    const p = toLeadPayload(base, new Date('2026-10-27T09:00:00Z'));
    expect(p).toEqual({
      name: 'Jane Doe',
      business: 'Sunny Roofs Ltd',
      email: 'jane@example.com',
      phone: '+44 7700 900000',
      installs_per_month: 8,
      page: '/book',
      utm_source: 'linkedin',
      received_at: '2026-10-27T09:00:00.000Z',
    });
  });

  it('drops empty optional fields', () => {
    const p = toLeadPayload({ ...base, business: '', message: '   ' });
    expect('business' in p).toBe(false);
    expect('message' in p).toBe(false);
  });
});

describe('forwardLead', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports not_configured when no webhook URL is set', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', '');
    expect(await forwardLead(toLeadPayload(base))).toEqual({ ok: false, reason: 'not_configured' });
  });

  it('reports failure after one retry instead of pretending success', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://hook.example/abc');
    const fetchMock = vi.fn().mockResolvedValue(new Response('no', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await forwardLead(toLeadPayload(base))).toEqual({ ok: false, reason: 'failed' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends the shared secret header when configured', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://hook.example/abc');
    vi.stubEnv('LEAD_WEBHOOK_SECRET', 's3');
    const fetchMock = vi.fn().mockResolvedValue(new Response('Accepted', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await forwardLead(toLeadPayload(base))).toEqual({ ok: true });
    expect(fetchMock.mock.calls[0]![1].headers['x-solardapt-secret']).toBe('s3');
  });
});
