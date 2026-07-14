/*
 * Target-role dictionary. Maps free-text job titles found on the web to the
 * decision-maker roles this tool cares about, plus a seniority bucket used to
 * rank who you call first. Order matters: the first pattern that matches wins,
 * so more senior / more specific titles are listed before broader ones.
 */
import type { RoleKey, Seniority } from './types';

interface RoleRule {
  role: RoleKey;
  seniority: Seniority;
  /** Case-insensitive patterns tested against the raw job title. */
  patterns: RegExp[];
}

const RULES: RoleRule[] = [
  {
    role: 'ceo',
    seniority: 'c_suite',
    patterns: [
      /\bchief executive( officer)?\b/i,
      /\bc\.?e\.?o\.?\b/i,
      /\b(founder|co-?founder)\b/i,
      /\b(owner|proprietor)\b/i,
      /\bmanaging director\b/i,
      /\bm\.?d\.?\b/i,
    ],
  },
  {
    role: 'coo',
    seniority: 'c_suite',
    patterns: [/\bchief operating( officer)?\b/i, /\bc\.?o\.?o\.?\b/i, /\boperations director\b/i],
  },
  {
    role: 'cfo',
    seniority: 'c_suite',
    patterns: [/\bchief financial( officer)?\b/i, /\bc\.?f\.?o\.?\b/i, /\bfinance director\b/i],
  },
  {
    role: 'finance_manager',
    seniority: 'manager',
    patterns: [/\bfinance manager\b/i, /\bfinancial manager\b/i, /\bhead of finance\b/i],
  },
  {
    role: 'financial_advisor',
    seniority: 'other',
    patterns: [/\bfinancial advis(o|e)r\b/i, /\bfinance advis(o|e)r\b/i],
  },
  {
    role: 'marketing_director',
    seniority: 'director',
    patterns: [
      /\bchief marketing( officer)?\b/i,
      /\bc\.?m\.?o\.?\b/i,
      /\bmarketing director\b/i,
      /\bhead of marketing\b/i,
      /\bdirector of marketing\b/i,
    ],
  },
  {
    role: 'marketing_manager',
    seniority: 'manager',
    patterns: [/\bmarketing manager\b/i, /\bbrand manager\b/i, /\bdigital marketing manager\b/i],
  },
  {
    role: 'marketing_executive',
    seniority: 'other',
    patterns: [/\bmarketing (executive|exec|coordinator|specialist|officer|assistant)\b/i],
  },
];

/** Human-readable label per role for the exported sheet. */
export const ROLE_LABELS: Record<RoleKey, string> = {
  ceo: 'CEO / Founder / MD',
  coo: 'COO / Operations Director',
  cfo: 'CFO / Finance Director',
  finance_manager: 'Finance Manager',
  financial_advisor: 'Financial Advisor',
  marketing_director: 'Marketing Director / CMO',
  marketing_manager: 'Marketing Manager',
  marketing_executive: 'Marketing Executive',
  unknown: 'Unknown',
};

/** True if a title looks like any targeted decision-maker role. */
export function isTargetTitle(title: string): boolean {
  return classifyTitle(title).role !== 'unknown';
}

/** Classify a raw job title into a role + seniority. */
export function classifyTitle(title: string): { role: RoleKey; seniority: Seniority } {
  const t = title.trim();
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(t))) {
      return { role: rule.role, seniority: rule.seniority };
    }
  }
  return { role: 'unknown', seniority: 'other' };
}
