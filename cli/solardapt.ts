/*
 * Solardapt CLI: one command line for every program in the repo.
 *
 *   calc         the "cost of slow follow-up" calculator      (lib/calculator)
 *   qualify      the demo's homeowner qualification score     (lib/qualify)
 *   report       the example weekly report                    (lib/example-report)
 *   faqs         list or search the FAQs                      (lib/faqs)
 *   site         site config and environment status           (lib/site, .env.example)
 *   routes       sitemap and robots rules                     (app/sitemap, app/robots)
 *   lead         validate / preview / send an enquiry         (lib/validators, lib/lead-forward)
 *   api          call /api/health and /api/lead, in-process or against a live URL
 *   check        run the CI steps: type-check, lint, test (and build)
 *
 * Nothing here has side effects at import time; cli/index.ts loads env files
 * and calls main(). Anything that would POST an enquiry to Make needs --yes,
 * otherwise it prints what would be sent and stops.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, type ParseArgsConfig } from 'node:util';
import { calculateLeakage } from '@/lib/calculator';
import { QUALIFY_AT, QUESTIONS, qualify, type Question, type QuestionKey } from '@/lib/qualify';
import { EXAMPLE_CHANGES, EXAMPLE_REPORT, exampleCostPerAttended } from '@/lib/example-report';
import { FAQS } from '@/lib/faqs';
import { site } from '@/lib/site';
import { leadSchema, type LeadInput } from '@/lib/validators';
import { forwardLead, leadForwardingConfigured, toLeadPayload } from '@/lib/lead-forward';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

export const ROOT = resolve(__dirname, '..');

export interface Io {
  out: (line: string) => void;
  err: (line: string) => void;
  stdin: () => Promise<string>;
}

class UsageError extends Error {}

type Options = NonNullable<ParseArgsConfig['options']>;
type Values = Record<string, string | boolean | (string | boolean)[] | undefined>;

interface Ctx {
  io: Io;
  json: boolean;
  values: Values;
  positionals: string[];
}

interface Command {
  summary: string;
  usage: string;
  options?: Options;
  run: (ctx: Ctx) => Promise<number> | number;
}

// ---------- output helpers ----------

const gbp = (n: number) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

function emit(ctx: Ctx, data: unknown, human: () => string[]) {
  if (ctx.json) ctx.io.out(JSON.stringify(data, null, 2));
  else human().forEach((l) => ctx.io.out(l));
}

function table(rows: [string, string | number][]) {
  const w = Math.max(...rows.map(([k]) => k.length));
  return rows.map(([k, v]) => `  ${k.padEnd(w)}  ${v}`);
}

function num(values: Values, key: string, fallback: number) {
  const raw = values[key];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new UsageError(`--${key} must be a number, got "${raw}"`);
  return n;
}

// ---------- calc ----------

const calc: Command = {
  summary: 'Cost of slow follow-up calculator (same maths as the homepage)',
  usage: 'calc [--enquiries 40] [--slow 40] [--install-rate 10] [--profit 2500]',
  options: {
    enquiries: { type: 'string' },
    slow: { type: 'string' },
    'install-rate': { type: 'string' },
    profit: { type: 'string' },
  },
  run(ctx) {
    // Percentages, like the homepage sliders; defaults are the sliders' start values.
    const input = {
      enquiriesPerMonth: num(ctx.values, 'enquiries', 40),
      slowShare: num(ctx.values, 'slow', 40) / 100,
      installRate: num(ctx.values, 'install-rate', 10) / 100,
      profitPerInstall: num(ctx.values, 'profit', 2500),
    };
    const result = calculateLeakage(input);
    emit(ctx, { input, result }, () => [
      'Inputs',
      ...table([
        ['Enquiries per month', input.enquiriesPerMonth],
        ['Not contacted within an hour', `${input.slowShare * 100}%`],
        ['Enquiries that become installs', `${input.installRate * 100}%`],
        ['Profit per install', gbp(input.profitPerInstall)],
      ]),
      '',
      'At stake each month (your inputs multiplied, not a forecast)',
      ...table([
        ['Cold enquiries', result.coldEnquiries],
        ['Installs at stake', result.installsAtStake],
        ['Value at stake', gbp(result.valueAtStake)],
      ]),
    ]);
    return 0;
  },
};

// ---------- qualify ----------

/** Resolve a typed answer to an option label: 1-based index, exact label, or a unique partial match. */
export function matchOption(q: Question, input: string): string {
  const s = input.trim().toLowerCase();
  const labels = q.opts.map(([label]) => label);
  const byIndex = /^\d+$/.test(s) ? labels[Number(s) - 1] : undefined;
  if (byIndex) return byIndex;
  const exact = labels.find((l) => l.toLowerCase() === s);
  if (exact) return exact;
  const partial = labels.filter((l) => l.toLowerCase().includes(s));
  if (partial.length === 1) return partial[0]!;
  const choices = labels.map((l, i) => `${i + 1}) ${l}`).join(', ');
  throw new UsageError(
    `${partial.length ? 'Ambiguous' : 'Unknown'} answer for --${q.key} "${input}". Choose one of: ${choices}`,
  );
}

const qualifyCmd: Command = {
  summary: 'Score a homeowner with the demo’s fixed points table',
  usage: 'qualify --type <..> --roof <..> --bill <..> --when <..> | --rent | --list',
  options: {
    type: { type: 'string' },
    roof: { type: 'string' },
    bill: { type: 'string' },
    when: { type: 'string' },
    rent: { type: 'boolean' },
    list: { type: 'boolean' },
  },
  run(ctx) {
    const { values } = ctx;
    if (values.list) {
      emit(ctx, { qualifyAt: QUALIFY_AT, questions: QUESTIONS }, () => [
        `Qualifies at ${QUALIFY_AT}/100. Answers can be the option number, the label, or part of it.`,
        ...QUESTIONS.flatMap((q) => [
          '',
          `--${q.key}  ${q.title}`,
          ...q.opts.map(([label, pts], i) => `  ${i + 1}) ${label.padEnd(22)} ${pts} pts`),
        ]),
      ]);
      return 0;
    }
    if (values.rent) {
      emit(ctx, { outcome: 'filtered', reason: 'not_homeowner' }, () => [
        'Filtered out: not the homeowner. No survey booked, no contact details taken, no follow-up.',
      ]);
      return 0;
    }
    const missing = QUESTIONS.filter((q) => values[q.key] === undefined).map((q) => `--${q.key}`);
    if (missing.length) throw new UsageError(`Missing ${missing.join(', ')} (see: qualify --list)`);
    const answers = Object.fromEntries(
      QUESTIONS.map((q) => [q.key, matchOption(q, String(values[q.key]))]),
    ) as Record<QuestionKey, string>;
    const r = qualify(answers);
    emit(
      ctx,
      { ...r, qualifyAt: QUALIFY_AT, outcome: r.qualified ? 'qualified' : 'nurture' },
      () => [
        ...table(r.breakdown.map((b) => [b.key, `${b.answer} (${b.points})`])),
        '',
        r.qualified
          ? `Qualified: score ${r.score}/100. They get the booking link and pick a survey slot.`
          : `Not ready yet: score ${r.score}/100 (below ${QUALIFY_AT}). They get the guide, with no chasing.`,
      ],
    );
    return 0;
  },
};

// ---------- report ----------

const report: Command = {
  summary: 'The example weekly report (example figures, not client results)',
  usage: 'report',
  run(ctx) {
    const r = EXAMPLE_REPORT;
    const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`;
    emit(
      ctx,
      { example: true, ...r, costPerAttended: exampleCostPerAttended, changes: EXAMPLE_CHANGES },
      () => [
        'Example weekly report — example figures, not client results',
        ...table([
          ['Ad spend', gbp(r.spend)],
          ['Enquiries', r.enquiries],
          ['Qualified', `${r.qualified} (${pct(r.qualified, r.enquiries)})`],
          ['Surveys booked', `${r.booked} (${pct(r.booked, r.qualified)} of qualified)`],
          ['Surveys attended', `${r.attended} (${pct(r.attended, r.booked)} of booked)`],
          ['Cost per attended survey', gbp(exampleCostPerAttended)],
        ]),
        '',
        `What we changed: ${EXAMPLE_CHANGES.changed}`,
        `Next week: ${EXAMPLE_CHANGES.next}`,
      ],
    );
    return 0;
  },
};

// ---------- faqs ----------

const faqs: Command = {
  summary: 'List the FAQs, or search them',
  usage: 'faqs [search words]',
  run(ctx) {
    const terms = ctx.positionals.map((t) => t.toLowerCase());
    const hits = FAQS.filter(({ q, a }) =>
      terms.every((t) => `${q} ${a}`.toLowerCase().includes(t)),
    );
    emit(ctx, hits, () =>
      hits.length ? hits.flatMap(({ q, a }) => [`Q: ${q}`, `A: ${a}`, '']) : ['No matching FAQs.'],
    );
    return 0;
  },
};

// ---------- site ----------

/** Variable names declared in .env.example, so this list never drifts from it. */
export function envVarNames(): string[] {
  const text = readFileSync(resolve(ROOT, '.env.example'), 'utf8');
  return [...text.matchAll(/^([A-Z0-9_]+)=/gm)].map((m) => m[1]!);
}

const siteCmd: Command = {
  summary: 'Site config, and which env vars are set (values never shown)',
  usage: 'site',
  run(ctx) {
    const env = Object.fromEntries(envVarNames().map((k) => [k, process.env[k] ? 'set' : 'unset']));
    const status = {
      leadForm: leadForwardingConfigured()
        ? 'shown (LEAD_WEBHOOK_URL set)'
        : 'hidden (LEAD_WEBHOOK_URL unset)',
      booking: site.bookingUrl
        ? `Cal.com link: ${site.bookingUrl}`
        : 'email + phone only (NEXT_PUBLIC_BOOKING_URL unset)',
    };
    emit(ctx, { site, status, env }, () => [
      `${site.name} — ${site.tagline}`,
      ...table([
        ['URL', site.url],
        ['Email', site.email],
        ['Phone', site.phone],
        ['/book enquiry form', status.leadForm],
        ['/book booking', status.booking],
        ['Legal name', site.legal.name || '(blank, left off /legal)'],
        ['Company number', site.legal.companyNumber || '(blank)'],
        ['ICO number', site.legal.icoNumber || '(blank)'],
      ]),
      '',
      'Environment (from .env.example)',
      ...table(Object.entries(env)),
    ]);
    return 0;
  },
};

// ---------- routes ----------

const routes: Command = {
  summary: 'Pages in the sitemap and the robots rules',
  usage: 'routes',
  run(ctx) {
    const pages = sitemap().map(({ url, changeFrequency, priority }) => ({
      url,
      changeFrequency,
      priority,
    }));
    const r = robots();
    emit(ctx, { sitemap: pages, robots: r }, () => [
      'Sitemap',
      ...pages.map(
        (p) => `  ${p.url.padEnd(40)} ${String(p.changeFrequency).padEnd(8)} ${p.priority}`,
      ),
      '',
      'Robots',
      ...table(
        (Array.isArray(r.rules) ? r.rules : [r.rules]).flatMap(
          (rule) =>
            [
              ['User-agent', String(rule.userAgent)],
              ['Allow', [rule.allow ?? []].flat().join(', ')],
              ['Disallow', [rule.disallow ?? []].flat().join(', ')],
            ] as [string, string][],
        ),
      ),
      `  Sitemap     ${r.sitemap}`,
    ]);
    return 0;
  },
};

// ---------- lead ----------

const leadOptions: Options = {
  name: { type: 'string' },
  business: { type: 'string' },
  email: { type: 'string' },
  phone: { type: 'string' },
  jobs: { type: 'string' },
  message: { type: 'string' },
  page: { type: 'string' },
  utm: { type: 'string', multiple: true },
  file: { type: 'string' },
  stdin: { type: 'boolean' },
  yes: { type: 'boolean' },
};

/** Build the raw enquiry from --file / --stdin JSON, with flags layered on top. */
export async function readLead(ctx: Ctx): Promise<Record<string, unknown>> {
  const { values, io } = ctx;
  let base: Record<string, unknown> = {};
  const raw = values.file
    ? readFileSync(String(values.file), 'utf8')
    : values.stdin
      ? await io.stdin()
      : undefined;
  if (raw !== undefined) {
    try {
      base = JSON.parse(raw);
    } catch {
      throw new UsageError(`Enquiry JSON from ${values.file ?? 'stdin'} is not valid JSON`);
    }
  }
  const flags: Record<string, unknown> = {};
  for (const k of ['name', 'business', 'email', 'phone', 'message', 'page'] as const) {
    if (values[k] !== undefined) flags[k] = values[k];
  }
  if (values.jobs !== undefined) flags.jobsPerMonth = values.jobs;
  const utm = values.utm as string[] | undefined;
  if (utm?.length) {
    const pairs = utm.map((pair) => {
      const [k, ...v] = pair.split('=');
      if (!k || !v.length) throw new UsageError(`--utm expects key=value, got "${pair}"`);
      return [k.startsWith('utm_') ? k : `utm_${k}`, v.join('=')];
    });
    flags.utm = { ...(base.utm as object), ...Object.fromEntries(pairs) };
  }
  return { ...base, ...flags };
}

function validate(ctx: Ctx, raw: Record<string, unknown>): LeadInput | undefined {
  const parsed = leadSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const issues = parsed.error.flatten().fieldErrors;
  emit(ctx, { valid: false, issues }, () => [
    'Enquiry is not valid:',
    ...Object.entries(issues).map(([k, v]) => `  ${k}: ${[...new Set(v)].join('; ')}`),
  ]);
  return undefined;
}

const leadValidate: Command = {
  summary: 'Validate an enquiry and show the exact JSON Make would receive',
  usage:
    'lead validate --name <..> --email <..> --phone <..> [--business --jobs --message --page --utm k=v] [--file f.json | --stdin]',
  options: leadOptions,
  async run(ctx) {
    const data = validate(ctx, await readLead(ctx));
    if (!data) return 1;
    const payload = toLeadPayload(data);
    emit(ctx, { valid: true, payload }, () => [
      'Valid. Make would receive:',
      JSON.stringify(payload, null, 2),
    ]);
    return 0;
  },
};

const leadSend: Command = {
  summary: 'Send an enquiry straight to the Make webhook (LEAD_WEBHOOK_URL); needs --yes',
  usage: 'lead send <same fields as lead validate> --yes',
  options: leadOptions,
  async run(ctx) {
    const data = validate(ctx, await readLead(ctx));
    if (!data) return 1;
    const payload = toLeadPayload(data);
    if (!leadForwardingConfigured()) {
      emit(ctx, { ok: false, reason: 'not_configured' }, () => [
        'LEAD_WEBHOOK_URL is not set (in the shell, .env.local or .env).',
      ]);
      return 1;
    }
    const host = new URL(process.env.LEAD_WEBHOOK_URL!).host;
    if (!ctx.values.yes) {
      emit(ctx, { sent: false, dryRun: true, webhookHost: host, payload }, () => [
        `Dry run: this would POST to the Make webhook at ${host}. Add --yes to send.`,
        JSON.stringify(payload, null, 2),
      ]);
      return 0;
    }
    const result = await forwardLead(payload);
    emit(ctx, { ...result, webhookHost: host }, () => [
      result.ok ? `Sent: Make accepted the enquiry (${host}).` : `Not sent: ${result.reason}.`,
    ]);
    return result.ok ? 0 : 1;
  },
};

// ---------- api ----------

interface ApiResult {
  status: number;
  body: unknown;
}

async function callRoute(
  ctx: Ctx,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<ApiResult> {
  const init: RequestInit =
    method === 'POST'
      ? { method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }
      : { method };
  const base = ctx.values.url as string | undefined;
  let res: Response;
  if (base) {
    res = await fetch(new URL(path, base), { ...init, signal: AbortSignal.timeout(15000) });
  } else {
    // In-process: call the real route handler without starting the server.
    const { NextRequest } = await import('next/server');
    const req = new NextRequest(
      new URL(path, 'http://localhost'),
      init as ConstructorParameters<typeof NextRequest>[1],
    );
    if (path === '/api/health') res = await (await import('@/app/api/health/route')).GET();
    else res = await (await import('@/app/api/lead/route')).POST(req);
  }
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* not JSON: keep text */
  }
  return { status: res.status, body: parsed };
}

function emitApi(ctx: Ctx, path: string, r: ApiResult) {
  const where = (ctx.values.url as string | undefined) ?? 'in-process';
  emit(ctx, { target: where, path, ...r }, () => [
    `${path} (${where}) → HTTP ${r.status}`,
    JSON.stringify(r.body, null, 2),
  ]);
  return r.status < 400 ? 0 : 1;
}

const apiHealth: Command = {
  summary: 'GET /api/health, in-process or against --url (e.g. https://solardapt.com)',
  usage: 'api health [--url <site>]',
  options: { url: { type: 'string' } },
  async run(ctx) {
    return emitApi(ctx, '/api/health', await callRoute(ctx, 'GET', '/api/health'));
  },
};

const apiLead: Command = {
  summary: 'POST /api/lead (validation, honeypot, rate limit, Make handoff); needs --yes',
  usage: 'api lead <same fields as lead validate> [--url <site>] --yes',
  options: { ...leadOptions, url: { type: 'string' } },
  async run(ctx) {
    const body = await readLead(ctx);
    // Locally the route only reaches Make when LEAD_WEBHOOK_URL is set; a live site always might.
    const mayForward = Boolean(ctx.values.url) || leadForwardingConfigured();
    if (mayForward && !ctx.values.yes) {
      const where =
        (ctx.values.url as string | undefined) ?? 'in-process (LEAD_WEBHOOK_URL is set)';
      emit(ctx, { sent: false, dryRun: true, target: where, body }, () => [
        `Dry run: this would POST to /api/lead (${where}), which forwards valid enquiries to Make. Add --yes to send.`,
        JSON.stringify(body, null, 2),
      ]);
      return 0;
    }
    return emitApi(ctx, '/api/lead', await callRoute(ctx, 'POST', '/api/lead', body));
  },
};

// ---------- check ----------

const check: Command = {
  summary: 'Run the CI steps: type-check, lint, unit tests (and --build)',
  usage: 'check [--build]',
  options: { build: { type: 'boolean' } },
  run(ctx) {
    const steps = ['type-check', 'lint', 'test', ...(ctx.values.build ? ['build'] : [])];
    const results: { step: string; ok: boolean }[] = [];
    for (const step of steps) {
      if (!ctx.json) ctx.io.out(`\n▶ npm run ${step}`);
      const r = spawnSync('npm', ['run', step], {
        cwd: ROOT,
        stdio: ctx.json ? 'pipe' : 'inherit',
        encoding: 'utf8',
      });
      results.push({ step, ok: r.status === 0 });
      if (r.status !== 0) break;
    }
    const ok = results.length === steps.length && results.every((r) => r.ok);
    emit(ctx, { ok, results }, () => ['', ...results.map((r) => `${r.ok ? '✓' : '✗'} ${r.step}`)]);
    return ok ? 0 : 1;
  },
};

// ---------- dispatch ----------

export const COMMANDS: Record<string, Command> = {
  calc,
  qualify: qualifyCmd,
  report,
  faqs,
  site: siteCmd,
  routes,
  'lead validate': leadValidate,
  'lead send': leadSend,
  'api health': apiHealth,
  'api lead': apiLead,
  check,
};

const GLOBAL: Options = { json: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } };

function help(io: Io) {
  const w = Math.max(...Object.keys(COMMANDS).map((k) => k.length));
  io.out('Usage: npm run cli -- <command> [options] [--json]\n');
  for (const [name, c] of Object.entries(COMMANDS)) io.out(`  ${name.padEnd(w)}  ${c.summary}`);
  io.out(
    '\nRun "npm run cli -- <command> --help" for a command’s options. --json prints machine-readable output.',
  );
}

export async function main(argv: string[], io: Io): Promise<number> {
  const two = argv.slice(0, 2).join(' ');
  const name = COMMANDS[two] ? two : (argv[0] ?? '');
  const cmd = COMMANDS[name];
  if (!cmd) {
    if (name && !name.startsWith('-')) io.err(`Unknown command: ${name}\n`);
    help(io);
    return name && !['-h', '--help', 'help'].includes(name) ? 2 : 0;
  }
  try {
    const { values, positionals } = parseArgs({
      args: argv.slice(name.split(' ').length),
      options: { ...GLOBAL, ...cmd.options },
      allowPositionals: true,
      strict: true,
    });
    if (values.help) {
      io.out(`Usage: npm run cli -- ${cmd.usage} [--json]\n\n${cmd.summary}`);
      return 0;
    }
    return await cmd.run({ io, json: Boolean(values.json), values, positionals });
  } catch (err) {
    const e = err as Error & { code?: string };
    if (err instanceof UsageError || e.code?.startsWith('ERR_PARSE_ARGS')) {
      io.err(`${e.message}\nUsage: npm run cli -- ${cmd.usage}`);
      return 2;
    }
    io.err(`Error: ${e.message}`);
    return 1;
  }
}
