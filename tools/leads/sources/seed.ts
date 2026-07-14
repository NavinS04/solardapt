/*
 * Seed source: enrich a list you already have. Point --seed at a file that is
 * either (a) one domain/URL per line, or (b) a CSV with a `website` (or
 * `domain`) column and optional `name`, `phone`, `city`, `region`, `country`.
 *
 * This is the most practical starting point for an existing lead list: bring the
 * businesses, let the tool crawl each site for decision-makers and contacts.
 */
import { readFileSync } from 'node:fs';
import { parseCsv } from '../csvutil';
import type { DiscoveryHit, RunConfig } from '../types';

function nameFromDomain(url: string): string {
  try {
    const host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
    const bare = host.replace(/^www\./i, '').split('.')[0] ?? host;
    return bare.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return url;
  }
}

export function discoverSeed(cfg: RunConfig): DiscoveryHit[] {
  const path = cfg.seedPath;
  if (!path) throw new Error('seed source needs --seed <file.csv|file.txt>');

  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`could not read seed file "${path}": ${(err as Error).message}`);
  }

  const looksCsv = /(^|,)\s*(website|domain|url|name)\s*(,|$)/im.test(raw.split(/\r?\n/)[0] ?? '');
  const hits: DiscoveryHit[] = [];
  const seen = new Set<string>();

  const push = (website: string | undefined, name: string, extra: Partial<DiscoveryHit> = {}) => {
    const key = (website || name).toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    hits.push({ name, website, source: 'seed', sourceUrl: path, ...extra });
  };

  if (looksCsv) {
    for (const row of parseCsv(raw)) {
      const website = row.website || row.domain || row.url || '';
      const name = row.name || (website ? nameFromDomain(website) : '');
      if (!name && !website) continue;
      push(website || undefined, name, {
        phone: row.phone || undefined,
        city: row.city || undefined,
        region: row.region || undefined,
        country: row.country || undefined,
      });
    }
  } else {
    for (const line of raw.split(/\r?\n/)) {
      const url = line.trim();
      if (!url || url.startsWith('#')) continue;
      push(url, nameFromDomain(url));
    }
  }

  return hits.slice(0, cfg.limit);
}
