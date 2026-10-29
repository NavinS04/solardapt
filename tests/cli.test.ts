import { afterEach, describe, it, expect, vi } from 'vitest';
import { main, matchOption } from '@/cli/solardapt';
import { QUESTIONS } from '@/lib/qualify';

async function cli(args: string[], stdin = '') {
  const out: string[] = [];
  const err: string[] = [];
  const code = await main(args, {
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    stdin: async () => stdin,
  });
  return { code, out: out.join('\n'), err: err.join('\n') };
}

const lead = ['--name', 'Jane Doe', '--email', 'jane@example.com', '--phone', '+44 7700 900000'];

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('cli', () => {
  it('prints help, and exits 2 on an unknown command', async () => {
    expect((await cli([])).out).toMatch(/lead validate/);
    expect((await cli(['nope'])).code).toBe(2);
  });

  it('calc takes percentages like the homepage sliders', async () => {
    const r = await cli([
      'calc',
      '--enquiries',
      '40',
      '--slow',
      '40',
      '--install-rate',
      '10',
      '--profit',
      '2500',
      '--json',
    ]);
    expect(JSON.parse(r.out).result).toEqual({
      coldEnquiries: 16,
      installsAtStake: 1.6,
      valueAtStake: 4000,
    });
    expect((await cli(['calc', '--slow', 'lots'])).code).toBe(2);
  });

  it('qualify resolves answers by number or partial label', async () => {
    expect(matchOption(QUESTIONS[2]!, '1')).toBe('Over £150');
    expect(matchOption(QUESTIONS[3]!, 'soon')).toBe('As soon as possible');
    expect(() => matchOption(QUESTIONS[0]!, 'e')).toThrow(/Ambiguous/);
    const r = await cli([
      'qualify',
      '--type',
      'semi',
      '--roof',
      'south',
      '--bill',
      '2',
      '--when',
      'soon',
      '--json',
    ]);
    expect(JSON.parse(r.out)).toMatchObject({ score: 93, qualified: true, outcome: 'qualified' });
  });

  it('faqs searches questions and answers', async () => {
    const hits = JSON.parse((await cli(['faqs', 'gdpr', '--json'])).out);
    expect(hits).toHaveLength(1);
    expect(hits[0].q).toMatch(/GDPR/);
  });

  it('lead validate shows the Make payload, merging stdin JSON with flags', async () => {
    const r = await cli(
      ['lead', 'validate', '--stdin', '--jobs', '8', '--utm', 'source=linkedin', '--json'],
      JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com', phone: '+44 7700 900000' }),
    );
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out).payload).toMatchObject({
      name: 'Jane Doe',
      installs_per_month: 8,
      utm_source: 'linkedin',
    });
    expect(
      (await cli(['lead', 'validate', '--name', 'J', '--email', 'x', '--phone', '1'])).code,
    ).toBe(1);
  });

  it('lead send is a dry run without --yes', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://hook.example/abc');
    const fetchMock = vi.fn().mockResolvedValue(new Response('Accepted', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const dry = JSON.parse((await cli(['lead', 'send', ...lead, '--json'])).out);
    expect(dry).toMatchObject({ dryRun: true, webhookHost: 'hook.example' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await cli(['lead', 'send', ...lead, '--yes'])).code).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('api calls the real route handlers in-process', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', '');
    const health = JSON.parse((await cli(['api', 'health', '--json'])).out);
    expect(health).toMatchObject({
      status: 200,
      body: { status: 'ok', leadWebhook: 'unconfigured' },
    });
    const r = await cli(['api', 'lead', ...lead, '--json']);
    expect(r.code).toBe(1);
    expect(JSON.parse(r.out)).toMatchObject({ status: 503, body: { error: 'not_configured' } });
  });
});
