/*
 * CLI flag + environment parsing into a typed RunConfig. Also loads a local
 * .env (without overriding anything already in the environment) so API keys in
 * the repo's .env "just work" for the CLI, the same way they do for Next.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RunConfig } from './types';

/** Minimal .env loader — enough for KEY=value lines; does not override env. */
function loadDotEnv(): void {
  const path = join(process.cwd(), '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1] as string;
    let val = (m[2] ?? '').trim();
    if (/^(['"]).*\1$/.test(val)) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

interface Flags {
  _: string[];
  [key: string]: string | boolean | string[];
}

/** Parse argv into positional args (`_`) and `--flag value` / `--bool` pairs. */
function parseArgs(argv: string[]): Flags {
  const flags: Flags = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      (flags._ as string[]).push(arg);
    }
  }
  return flags;
}

function str(v: string | boolean | string[] | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function int(v: string | boolean | string[] | undefined, fallback: number): number {
  const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

const DEFAULT_UA =
  'SolardaptLeadsBot/1.0 (+https://solardapt.com; polite B2B research crawler)';

export function buildConfig(argv: string[]): RunConfig {
  loadDotEnv();
  const flags = parseArgs(argv);
  const positional = flags._ as string[];

  const commandArg = positional[0];
  const command = (['run', 'discover', 'enrich', 'export'] as const).includes(
    commandArg as RunConfig['command'],
  )
    ? (commandArg as RunConfig['command'])
    : 'run';

  const singleDomain = str(flags.domain);
  const seedPath = str(flags.seed);
  // Infer source: --seed implies seed; otherwise flag or default overpass.
  let source: RunConfig['source'] = 'overpass';
  if (str(flags.source)) source = str(flags.source) as RunConfig['source'];
  else if (seedPath || singleDomain) source = 'seed';

  const area = str(flags.area);
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (area ?? source).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const outDir = str(flags.out) ?? join('leads-output', `${slug}-${stamp}`);

  return {
    command,
    area,
    source,
    seedPath,
    singleDomain,
    limit: int(flags.limit, 100),
    outDir,
    batchSize: int(flags.batch, 100),
    concurrency: Math.max(1, int(flags.concurrency, 5)),
    perHostDelayMs: int(flags.delay, 1500),
    maxPagesPerSite: Math.max(1, int(flags['max-pages'], 6)),
    respectRobots: flags['no-robots'] !== true,
    userAgent: str(flags['user-agent']) ?? process.env.LEADS_USER_AGENT ?? DEFAULT_UA,
    suppressPath: str(flags.suppress) ?? process.env.LEADS_SUPPRESS_FILE,
    googlePlacesKey: process.env.GOOGLE_PLACES_API_KEY,
    hunterKey: process.env.HUNTER_API_KEY,
  };
}

export const HELP = `Solar leads scraper — find solar businesses + decision-makers, export a call sheet.

USAGE
  npm run leads -- <command> [flags]

COMMANDS
  run        discover businesses, enrich each site, export (default)
  discover   discovery only — list businesses found, no crawling
  enrich     enrich a seed list or a single --domain
  export     re-export an existing leads.json (with --seed pointing at it)

FLAGS
  --area "<place>"     target area, e.g. "Manchester, UK" (overpass/places)
  --source <name>      overpass (default, keyless) | places (needs key) | seed
  --seed <file>        CSV/TXT of businesses to enrich (implies --source seed)
  --domain <domain>    enrich a single domain, e.g. brightsolar.co.uk
  --limit <n>          max businesses (default 100)
  --out <dir>          output directory (default leads-output/<area>-<date>)
  --batch <n>          contacts per daily call-sheet file (default 100)
  --concurrency <n>    sites crawled in parallel (default 5)
  --delay <ms>         per-host politeness delay (default 1500)
  --max-pages <n>      pages crawled per site (default 6)
  --no-robots          do NOT honour robots.txt (not recommended)
  --suppress <file>    do-not-contact list (emails/domains/phones)
  --user-agent "<ua>"  override the crawler User-Agent

ENV (optional, via .env)
  GOOGLE_PLACES_API_KEY   enables --source places
  HUNTER_API_KEY          enables Hunter.io email enrichment
  LEADS_SUPPRESS_FILE     default suppression file
  LEADS_USER_AGENT        default crawler User-Agent

EXAMPLES
  npm run leads -- run --area "Austin, TX" --source places --limit 200
  npm run leads -- run --area "Leeds, UK" --limit 100
  npm run leads -- enrich --seed ./my-solar-list.csv
  npm run leads -- enrich --domain examplesolar.com
`;
