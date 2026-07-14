/*
 * Minimal robots.txt gate. We fetch and cache each host's robots.txt and honour
 * Disallow rules for our User-Agent (falling back to the `*` group). This is a
 * deliberately conservative reader: when in doubt, we treat a path as allowed
 * only if no matching Disallow covers it. Respecting robots.txt is the baseline
 * of legitimate crawling.
 */
import { politeFetch, type FetchOptions } from './http';

interface RobotsRules {
  /** Disallowed path prefixes that apply to us. */
  disallow: string[];
  /** Crawl-delay in ms if the site requested one. */
  crawlDelayMs?: number;
}

const cache = new Map<string, RobotsRules>();

function parseRobots(txt: string, ua: string): RobotsRules {
  const lines = txt.split(/\r?\n/);
  // Collect rule groups keyed by the user-agents they apply to.
  const groups: { agents: string[]; disallow: string[]; crawlDelay?: number }[] = [];
  let current: { agents: string[]; disallow: string[]; crawlDelay?: number } | null = null;
  let lastWasAgent = false;

  for (const raw of lines) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === 'user-agent') {
      if (!lastWasAgent || !current) {
        current = { agents: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (current) {
      lastWasAgent = false;
      if (field === 'disallow') {
        if (value) current.disallow.push(value);
      } else if (field === 'crawl-delay') {
        const n = Number(value);
        if (!Number.isNaN(n)) current.crawlDelay = n;
      }
    }
  }

  const uaLower = ua.toLowerCase();
  const matching = groups.filter((g) =>
    g.agents.some((a) => a === '*' || uaLower.includes(a) || a.includes('solardapt')),
  );
  // Prefer a specific match over the wildcard when both exist.
  const specific = matching.filter((g) => !g.agents.includes('*'));
  const chosen = specific.length ? specific : matching;
  const disallow = chosen.flatMap((g) => g.disallow);
  const crawlDelay = chosen.map((g) => g.crawlDelay).find((d) => typeof d === 'number');
  return { disallow, crawlDelayMs: crawlDelay !== undefined ? crawlDelay * 1000 : undefined };
}

/** Load (and cache) the robots rules for the host of `url`. */
export async function loadRobots(url: string, opts: FetchOptions): Promise<RobotsRules> {
  const origin = new URL(url).origin;
  const cached = cache.get(origin);
  if (cached) return cached;

  const res = await politeFetch(`${origin}/robots.txt`, { ...opts, accept: 'text/plain' });
  // No robots.txt (or blocked) => permissive default, standard crawler behaviour.
  const rules = res.ok && res.body ? parseRobots(res.body, opts.userAgent) : { disallow: [] };
  cache.set(origin, rules);
  return rules;
}

/** Is `url` allowed for us under the host's robots.txt? */
export async function isAllowed(url: string, opts: FetchOptions): Promise<boolean> {
  try {
    const rules = await loadRobots(url, opts);
    const path = new URL(url).pathname;
    return !rules.disallow.some((d) => path.startsWith(d));
  } catch {
    return false;
  }
}
