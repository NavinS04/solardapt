/*
 * Extraction helpers: pull emails, phones, socials and named people (with
 * targeted roles) out of a page's HTML. Two strategies, most reliable first:
 *
 *   1. schema.org JSON-LD (Organization / LocalBusiness / Person). When a site
 *      publishes structured data it is authoritative and cheap to trust.
 *   2. Heuristic DOM scan for mailto:/tel: links and "team card" patterns where
 *      a person's name sits next to a job title.
 *
 * Everything extracted here is content the business chose to publish on its own
 * public website — the defensible core of B2B contact data.
 */
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { classifyTitle, isTargetTitle } from '../roles';
import type { Person } from '../types';

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
// Phones: keep it permissive but require enough digits to be real.
const PHONE_RE = /(?:\+?\d[\d().\s-]{7,}\d)/g;

const JUNK_EMAIL = /(example|sentry|wixpress|\.png|\.jpg|\.gif|\.svg|@sentry|@2x|u003e)/i;

export interface PageExtract {
  emails: string[];
  phones: string[];
  socials: Record<string, string>;
  people: Person[];
  /** Address/locality if a LocalBusiness node exposed one. */
  address?: string;
  /** The business name the site declares (schema.org Organization/LocalBusiness). */
  orgName?: string;
}

/** Normalise a phone to a compact, dial-able string; drop obvious non-numbers. */
export function normalisePhone(raw: string): string | undefined {
  // Drop the optional trunk zero written as "(0)" in "+44 (0)20 …" form.
  const trimmed = raw.trim().replace(/\(0\)/g, '');
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) return undefined;
  // Preserve a leading + for international numbers.
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

/** De-obfuscate common "name (at) domain (dot) com" tricks, then extract. */
function findEmails(text: string): string[] {
  const deobf = text
    .replace(/\s*\(?\s*(at|@)\s*\)?\s*/gi, '@')
    .replace(/\s*\(?\s*(dot|\.)\s*\)?\s*/gi, '.');
  const found = deobf.match(EMAIL_RE) ?? [];
  return dedupeLower(found.filter((e) => !JUNK_EMAIL.test(e)));
}

function dedupeLower(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

const SOCIAL_HOSTS: Record<string, RegExp> = {
  linkedin: /linkedin\.com/i,
  facebook: /facebook\.com/i,
  instagram: /instagram\.com/i,
  x: /(twitter\.com|x\.com)/i,
  youtube: /youtube\.com|youtu\.be/i,
};

function nowIso(): string {
  return new Date().toISOString();
}

/** Parse any JSON-LD blocks into people + org contact info. */
function fromJsonLd($: cheerio.CheerioAPI, url: string): PageExtract {
  const out: PageExtract = { emails: [], phones: [], socials: {}, people: [] };
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    for (const node of flattenLd(data)) walkLdNode(node, url, out);
  });
  out.emails = dedupeLower(out.emails);
  return out;
}

/** JSON-LD can be an array, a @graph, or a single object — flatten to nodes. */
function flattenLd(data: unknown): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  const visit = (d: unknown) => {
    if (Array.isArray(d)) {
      d.forEach(visit);
    } else if (d && typeof d === 'object') {
      const obj = d as Record<string, unknown>;
      nodes.push(obj);
      if (Array.isArray(obj['@graph'])) obj['@graph'].forEach(visit);
    }
  };
  visit(data);
  return nodes;
}

function asStringArray(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  return [];
}

function ldType(node: Record<string, unknown>): string[] {
  return asStringArray(node['@type']).map((t) => t.toLowerCase());
}

function walkLdNode(node: Record<string, unknown>, url: string, out: PageExtract): void {
  const types = ldType(node);
  const isOrg = types.some((t) => /organization|localbusiness|corporation/.test(t));
  const isPerson = types.includes('person');

  if (isOrg) {
    if (!out.orgName && typeof node.name === 'string' && node.name.trim()) {
      out.orgName = node.name.trim();
    }
    for (const e of asStringArray(node.email)) out.emails.push(e.replace(/^mailto:/i, ''));
    for (const p of asStringArray(node.telephone)) {
      const n = normalisePhone(p);
      if (n) out.phones.push(n);
    }
    for (const s of asStringArray(node.sameAs)) tagSocial(s, out.socials);
    const addr = node.address;
    if (addr && typeof addr === 'object') {
      const a = addr as Record<string, unknown>;
      const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode]
        .filter((x): x is string => typeof x === 'string')
        .join(', ');
      if (parts) out.address = parts;
    }
    // Org may embed employees/founders as Person nodes.
    for (const key of ['employee', 'employees', 'founder', 'member']) {
      const v = node[key];
      if (Array.isArray(v)) v.forEach((p) => walkLdNode(p as Record<string, unknown>, url, out));
      else if (v && typeof v === 'object') walkLdNode(v as Record<string, unknown>, url, out);
    }
  }

  if (isPerson) {
    const name = typeof node.name === 'string' ? node.name.trim() : '';
    const title = typeof node.jobTitle === 'string' ? node.jobTitle.trim() : '';
    if (name && title && isTargetTitle(title)) {
      const { role, seniority } = classifyTitle(title);
      const emails = asStringArray(node.email).map((e) => e.replace(/^mailto:/i, '').toLowerCase());
      const phones = asStringArray(node.telephone)
        .map(normalisePhone)
        .filter((x): x is string => Boolean(x));
      out.people.push({
        name,
        title,
        role,
        seniority,
        email: emails[0],
        phone: phones[0],
        provenance: [{ source: 'website:jsonld', url, collectedAt: nowIso() }],
      });
    }
  }
}

function tagSocial(href: string, socials: Record<string, string>): void {
  for (const [key, re] of Object.entries(SOCIAL_HOSTS)) {
    if (re.test(href) && !socials[key]) socials[key] = href;
  }
}

/**
 * Heuristic "team card" scan. We look for elements whose text contains a target
 * job title, then search that element's small container for a nearby name
 * (heading/strong) and any mailto:/tel: link. Imperfect by nature — treat the
 * confidence as lower than JSON-LD results.
 */
function fromTeamCards($: cheerio.CheerioAPI, url: string): Person[] {
  const people: Person[] = [];
  const seen = new Set<string>();

  $('*').each((_, el) => {
    const $el = $(el);
    // Only leaf-ish nodes: elements whose own text is a plausible job title.
    const ownText = $el.clone().children().remove().end().text().trim();
    if (!ownText || ownText.length > 60 || !isTargetTitle(ownText)) return;

    const card = $el.closest('li, article, .team-member, .card, [class*="team"], [class*="member"], div');
    const scope = card.length ? card : $el.parent();

    const name = findNameNear($, scope, ownText);
    if (!name) return;

    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const email = scope
      .find('a[href^="mailto:"]')
      .first()
      .attr('href')
      ?.replace(/^mailto:/i, '')
      .split('?')[0]
      ?.toLowerCase();
    const telHref = scope.find('a[href^="tel:"]').first().attr('href')?.replace(/^tel:/i, '');
    const phone = telHref ? normalisePhone(telHref) : undefined;

    const { role, seniority } = classifyTitle(ownText);
    people.push({
      name,
      title: ownText,
      role,
      seniority,
      email: email && !JUNK_EMAIL.test(email) ? email : undefined,
      phone,
      provenance: [{ source: 'website:team', url, collectedAt: nowIso() }],
    });
  });

  return people;
}

const NAME_RE = /^[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){1,3}$/;

/** Find a person-name string within a team-card scope, near the title text. */
function findNameNear<T extends AnyNode>(
  $: cheerio.CheerioAPI,
  scope: cheerio.Cheerio<T>,
  title: string,
): string | undefined {
  const candidates: string[] = [];
  scope.find('h1,h2,h3,h4,h5,h6,strong,b,.name,[class*="name"]').each((_, n) => {
    const txt = $(n).text().trim();
    if (txt && txt !== title) candidates.push(txt);
  });
  return candidates.find((c) => NAME_RE.test(c));
}

/** Full-page extraction combining structured data and heuristics. */
export function extractFromHtml(html: string, url: string): PageExtract {
  const $ = cheerio.load(html);
  // Parse JSON-LD first — it lives in <script> tags we're about to drop.
  const ld = fromJsonLd($, url);
  // Then drop noisy nodes before the mailto/tel/text scans.
  $('script,style,noscript,template,svg').remove();

  const emails = new Set(ld.emails);
  const phones = new Set(ld.phones);
  const socials: Record<string, string> = { ...ld.socials };

  // mailto:/tel: anchors are high-signal.
  $('a[href^="mailto:"]').each((_, a) => {
    const e = $(a).attr('href')?.replace(/^mailto:/i, '').split('?')[0]?.toLowerCase();
    if (e && !JUNK_EMAIL.test(e)) emails.add(e);
  });
  $('a[href^="tel:"]').each((_, a) => {
    const p = $(a).attr('href')?.replace(/^tel:/i, '');
    const n = p ? normalisePhone(p) : undefined;
    if (n) phones.add(n);
  });
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (href) tagSocial(href, socials);
  });

  // Fall back to scanning visible text for anything the anchors missed.
  const text = $('body').text();
  for (const e of findEmails(text)) emails.add(e);
  for (const raw of text.match(PHONE_RE) ?? []) {
    const n = normalisePhone(raw);
    if (n) phones.add(n);
  }

  // People: JSON-LD first, then de-dupe against heuristic team cards.
  const people = [...ld.people];
  const haveNames = new Set(people.map((p) => p.name.toLowerCase()));
  for (const p of fromTeamCards($, url)) {
    if (!haveNames.has(p.name.toLowerCase())) {
      people.push(p);
      haveNames.add(p.name.toLowerCase());
    }
  }

  // Weaker business-name fallbacks when the site has no schema.org org node.
  const orgName =
    ld.orgName ||
    $('meta[property="og:site_name"]').attr('content')?.trim() ||
    undefined;

  return {
    emails: [...emails],
    phones: [...phones],
    socials,
    people,
    address: ld.address,
    orgName,
  };
}

/** Internal link labels/paths that usually lead to people & contact info. */
const RELEVANT_PATH = /(about|team|our-?people|leadership|management|meet|staff|contact|company)/i;

/** From a homepage, pick internal links worth crawling for contacts. */
export function pickInternalLinks(html: string, baseUrl: string, max: number): string[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const found = new Map<string, number>(); // url -> score

  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    let abs: URL;
    try {
      abs = new URL(href, base);
    } catch {
      return;
    }
    if (abs.host !== base.host) return;
    if (!/^https?:$/.test(abs.protocol)) return;
    abs.hash = '';
    const label = $(a).text().trim();
    const hay = `${abs.pathname} ${label}`;
    if (!RELEVANT_PATH.test(hay)) return;
    // Weight contact/team pages above generic "about".
    const score = /team|people|leadership|management|staff/i.test(hay)
      ? 3
      : /contact/i.test(hay)
        ? 2
        : 1;
    const key = abs.toString();
    found.set(key, Math.max(found.get(key) ?? 0, score));
  });

  return [...found.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([u]) => u);
}
