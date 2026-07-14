/*
 * Website enrichment: given a business + its site, crawl a small, targeted set
 * of pages (homepage, then about/team/contact links) and merge everything found
 * into the BusinessLead. Bounded by `maxPagesPerSite`, robots.txt and per-host
 * throttling so a run stays polite and predictable.
 */
import { politeFetch, type FetchOptions } from '../http';
import { isAllowed } from '../robots';
import { extractFromHtml, pickInternalLinks, type PageExtract } from './extract';
import { mergeProviderContacts } from './providers';
import type { BusinessLead, DiscoveryHit, Person, RunConfig } from '../types';

function registrableDomain(hostname: string): string {
  return hostname.replace(/^www\./i, '').toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Build a stable id from the domain, or a slug of the name as a fallback. */
function makeId(domain: string | undefined, name: string): string {
  if (domain) return domain;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Prefer business-domain emails over free webmail for the "primary" slots. */
function rankEmails(emails: string[], domain?: string): string[] {
  const free = /@(gmail|yahoo|outlook|hotmail|icloud|aol|proton)\./i;
  return [...emails].sort((a, b) => {
    const aOwn = domain && a.endsWith(`@${domain}`) ? 0 : 1;
    const bOwn = domain && b.endsWith(`@${domain}`) ? 0 : 1;
    if (aOwn !== bOwn) return aOwn - bOwn;
    return Number(free.test(a)) - Number(free.test(b));
  });
}

/** Merge a page extract into the accumulating lead. */
function absorb(lead: BusinessLead, ex: PageExtract, url: string): void {
  // Upgrade a weak, domain-derived name to the name the site declares.
  if (ex.orgName && shouldReplaceName(lead)) lead.name = ex.orgName;
  lead.businessEmails.push(...ex.emails);
  lead.businessPhones.push(...ex.phones);
  for (const [k, v] of Object.entries(ex.socials)) {
    const key = k as keyof BusinessLead['socials'];
    if (v && !lead.socials[key]) lead.socials[key] = v;
  }
  if (ex.address && !lead.address) lead.address = ex.address;
  for (const p of ex.people) mergePerson(lead.people, p);
  lead.provenance.push({ source: 'website', url, collectedAt: nowIso() });
}

/**
 * A lead's name is a weak placeholder when it came from a bare seed URL or a
 * single --domain (source seed/manual) and still has no spaces — replace those
 * with the site's declared name. Names from Places/Overpass are real; keep them.
 */
function shouldReplaceName(lead: BusinessLead): boolean {
  const src = lead.provenance[0]?.source;
  return (src === 'seed' || src === 'manual') && !/\s/.test(lead.name);
}

/** De-dupe people by name, merging in any newly found email/phone/title. */
export function mergePerson(people: Person[], incoming: Person): void {
  const existing = people.find((p) => p.name.toLowerCase() === incoming.name.toLowerCase());
  if (!existing) {
    people.push(incoming);
    return;
  }
  existing.email ??= incoming.email;
  existing.phone ??= incoming.phone;
  existing.title ??= incoming.title;
  existing.linkedin ??= incoming.linkedin;
  if (incoming.role !== 'unknown' && existing.role === 'unknown') {
    existing.role = incoming.role;
    existing.seniority = incoming.seniority;
  }
  existing.provenance.push(...incoming.provenance);
}

/** Turn a raw discovery hit into an enriched BusinessLead. */
export async function enrichBusiness(hit: DiscoveryHit, cfg: RunConfig): Promise<BusinessLead> {
  const fetchOpts: FetchOptions = { userAgent: cfg.userAgent, perHostDelayMs: cfg.perHostDelayMs };

  let domain: string | undefined;
  let website = hit.website;
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
  if (website) {
    try {
      domain = registrableDomain(new URL(website).hostname);
    } catch {
      website = undefined;
    }
  }

  const lead: BusinessLead = {
    id: makeId(domain, hit.name),
    name: hit.name,
    domain,
    website,
    businessEmails: [],
    businessPhones: hit.phone ? [hit.phone] : [],
    socials: {},
    address: hit.address,
    city: hit.city,
    region: hit.region,
    country: hit.country,
    people: [],
    score: 0,
    notes: [],
    provenance: [{ source: hit.source, url: hit.sourceUrl, collectedAt: nowIso() }],
  };

  if (website) {
    await crawlSite(lead, website, cfg, fetchOpts);
  } else {
    lead.notes.push('No website found — business-level contact only.');
  }

  // Optional licensed enrichment (e.g. Hunter) fills gaps; never scrapes.
  await mergeProviderContacts(lead, cfg);

  // Finalise contact lists: de-dupe + rank.
  lead.businessEmails = rankEmails([...new Set(lead.businessEmails)], domain);
  lead.businessPhones = [...new Set(lead.businessPhones)];
  return lead;
}

/** Crawl homepage + a bounded set of about/team/contact pages. */
async function crawlSite(
  lead: BusinessLead,
  website: string,
  cfg: RunConfig,
  fetchOpts: FetchOptions,
): Promise<void> {
  const visited = new Set<string>();

  const fetchPage = async (url: string): Promise<string | undefined> => {
    if (visited.has(url) || visited.size >= cfg.maxPagesPerSite) return undefined;
    visited.add(url);
    if (cfg.respectRobots && !(await isAllowed(url, fetchOpts))) {
      lead.notes.push(`Skipped ${url} (robots.txt)`);
      return undefined;
    }
    const res = await politeFetch(url, fetchOpts);
    if (!res.ok || !/html/i.test(res.contentType)) return undefined;
    absorb(lead, extractFromHtml(res.body, res.url), res.url);
    return res.body;
  };

  const homeHtml = await fetchPage(website);
  if (!homeHtml) {
    lead.notes.push('Homepage unreachable.');
    return;
  }
  if (!lead.category) lead.category = guessCategory(homeHtml);

  const links = pickInternalLinks(homeHtml, website, cfg.maxPagesPerSite - 1);
  for (const link of links) {
    if (visited.size >= cfg.maxPagesPerSite) break;
    await fetchPage(link);
  }
}

/** Rough business-type guess from homepage copy — a hint, not a fact. */
function guessCategory(html: string): BusinessLead['category'] {
  const t = html.toLowerCase();
  if (/manufactur|we produce|our factory|oem/.test(t)) return 'manufacturer';
  if (/distribut|wholesal|trade counter|reseller/.test(t)) return 'distributor';
  if (/consult|advisory|feasibility/.test(t)) return 'consultancy';
  if (/install|fit|mount|epc|our engineers/.test(t)) return 'installer';
  return 'other';
}
