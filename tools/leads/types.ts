/*
 * Core data model for the solar leads pipeline.
 *
 * The pipeline flows: discover (find businesses) -> enrich (crawl each site for
 * public contact + named people) -> validate -> dedupe/merge -> score -> export.
 * Every enriched field carries a `Provenance` so the exported sheet is auditable
 * (where did this email/phone come from, and when) — this matters for lawful B2B
 * outreach and for your own trust in the data.
 */

/** Normalised seniority buckets used for prioritising who to call first. */
export type Seniority = 'c_suite' | 'director' | 'manager' | 'other';

/** The decision-maker roles this tool targets, with synonyms folded in. */
export type RoleKey =
  | 'ceo' // + founder, owner, managing director
  | 'coo'
  | 'cfo' // + finance director / manager, financial advisor
  | 'finance_manager'
  | 'financial_advisor'
  | 'marketing_director' // + CMO, head of marketing
  | 'marketing_manager'
  | 'marketing_executive'
  | 'unknown';

/** Where a piece of data came from — recorded per field for auditability. */
export interface Provenance {
  /** Machine name of the source, e.g. "overpass", "website:team", "places". */
  source: string;
  /** The exact URL the value was read from, when applicable. */
  url?: string;
  /** ISO timestamp of when it was collected. */
  collectedAt: string;
}

/** A named person at a business with a targeted role. */
export interface Person {
  name: string;
  /** Raw job title as published on the site, e.g. "Chief Operating Officer". */
  title?: string;
  role: RoleKey;
  seniority: Seniority;
  email?: string;
  phone?: string;
  /** Only populated when a licensed provider supplies it — never scraped. */
  linkedin?: string;
  provenance: Provenance[];
}

/** A business (installer / manufacturer / distributor) and its contacts. */
export interface BusinessLead {
  /** Stable id derived from the primary domain (or name when no site). */
  id: string;
  name: string;
  /** Bare registrable domain, e.g. "brightsolar.co.uk". */
  domain?: string;
  website?: string;
  /** Generic business contacts (info@, reception, etc.). */
  businessEmails: string[];
  businessPhones: string[];
  /** Social profiles discovered on the site (business, not personal). */
  socials: Partial<Record<'linkedin' | 'facebook' | 'instagram' | 'x' | 'youtube', string>>;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  /** What kind of solar business this looks like. */
  category?: 'installer' | 'manufacturer' | 'distributor' | 'consultancy' | 'other';
  people: Person[];
  /** 0–100 priority for the call sheet (higher = call first). */
  score: number;
  /** Human-readable reasons that fed the score / any data caveats. */
  notes: string[];
  provenance: Provenance[];
}

/** A raw discovery hit before website enrichment. */
export interface DiscoveryHit {
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  source: string;
  sourceUrl?: string;
}

/** Runtime configuration assembled from CLI flags + env. */
export interface RunConfig {
  command: 'run' | 'discover' | 'enrich' | 'export';
  area?: string;
  source: 'overpass' | 'places' | 'seed';
  seedPath?: string;
  singleDomain?: string;
  limit: number;
  outDir: string;
  batchSize: number;
  concurrency: number;
  /** Politeness delay between requests to the same host, ms. */
  perHostDelayMs: number;
  maxPagesPerSite: number;
  respectRobots: boolean;
  userAgent: string;
  suppressPath?: string;
  /** Optional provider API keys. */
  googlePlacesKey?: string;
  hunterKey?: string;
}
