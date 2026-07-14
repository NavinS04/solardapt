import { describe, it, expect } from 'vitest';
import { classifyTitle, isTargetTitle } from '@/tools/leads/roles';
import { toCsv, parseCsv } from '@/tools/leads/csvutil';
import { extractFromHtml, pickInternalLinks, normalisePhone } from '@/tools/leads/enrich/extract';
import { scoreLead } from '@/tools/leads/score';
import { dedupeLeads } from '@/tools/leads/dedupe';
import { loadSuppression, applySuppression } from '@/tools/leads/suppress';
import type { BusinessLead } from '@/tools/leads/types';

function blankLead(over: Partial<BusinessLead> = {}): BusinessLead {
  return {
    id: 'x',
    name: 'Test Solar',
    businessEmails: [],
    businessPhones: [],
    socials: {},
    people: [],
    score: 0,
    notes: [],
    provenance: [{ source: 'test', collectedAt: new Date().toISOString() }],
    ...over,
  };
}

describe('role classification', () => {
  it('maps senior titles to roles + seniority', () => {
    expect(classifyTitle('Chief Executive Officer')).toEqual({ role: 'ceo', seniority: 'c_suite' });
    expect(classifyTitle('Managing Director')).toEqual({ role: 'ceo', seniority: 'c_suite' });
    expect(classifyTitle('COO')).toEqual({ role: 'coo', seniority: 'c_suite' });
    expect(classifyTitle('Finance Director')).toEqual({ role: 'cfo', seniority: 'c_suite' });
    expect(classifyTitle('Head of Marketing')).toEqual({
      role: 'marketing_director',
      seniority: 'director',
    });
    expect(classifyTitle('Marketing Manager')).toEqual({
      role: 'marketing_manager',
      seniority: 'manager',
    });
    expect(classifyTitle('Marketing Executive')).toEqual({
      role: 'marketing_executive',
      seniority: 'other',
    });
    expect(classifyTitle('Financial Advisor')).toEqual({
      role: 'financial_advisor',
      seniority: 'other',
    });
  });

  it('ignores non-target titles', () => {
    expect(isTargetTitle('Solar Panel Installer')).toBe(false);
    expect(isTargetTitle('Receptionist')).toBe(false);
    expect(classifyTitle('Roofer').role).toBe('unknown');
  });
});

describe('csv round-trip', () => {
  it('serialises and re-parses with quoting', () => {
    const rows = [{ name: 'A, Inc', note: 'line1\nline2', email: 'a@b.com' }];
    const csv = toCsv(rows, ['name', 'note', 'email']);
    const back = parseCsv(csv);
    expect(back[0]?.name).toBe('A, Inc');
    expect(back[0]?.note).toBe('line1\nline2');
    expect(back[0]?.email).toBe('a@b.com');
  });
});

describe('normalisePhone', () => {
  it('keeps international prefix and strips formatting', () => {
    expect(normalisePhone('+44 (0)20 7946 0123')).toBe('+442079460123');
    expect(normalisePhone('0161 555 0100')).toBe('01615550100');
  });
  it('rejects junk', () => {
    expect(normalisePhone('123')).toBeUndefined();
  });
});

describe('extractFromHtml', () => {
  it('reads people + contacts from JSON-LD', () => {
    const html = `<html><head>
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Bright Solar',
        email: 'info@brightsolar.co.uk',
        telephone: '+44 20 7946 0000',
        sameAs: ['https://www.linkedin.com/company/brightsolar'],
        employee: [
          { '@type': 'Person', name: 'Jane Doe', jobTitle: 'Chief Executive Officer', email: 'jane@brightsolar.co.uk' },
          { '@type': 'Person', name: 'Bob Fix', jobTitle: 'Installer' },
        ],
      })}</script></head><body>Solar</body></html>`;
    const ex = extractFromHtml(html, 'https://brightsolar.co.uk');
    expect(ex.emails).toContain('info@brightsolar.co.uk');
    expect(ex.socials.linkedin).toContain('linkedin.com/company/brightsolar');
    const jane = ex.people.find((p) => p.name === 'Jane Doe');
    expect(jane?.role).toBe('ceo');
    expect(jane?.email).toBe('jane@brightsolar.co.uk');
    // The installer is not a target role and must be excluded.
    expect(ex.people.find((p) => p.name === 'Bob Fix')).toBeUndefined();
  });

  it('reads a heuristic team card + mailto/tel', () => {
    const html = `<html><body>
      <div class="team-member">
        <h3>Sarah Lee</h3>
        <p>Marketing Director</p>
        <a href="mailto:sarah@x-solar.com">email</a>
        <a href="tel:+441615550100">call</a>
      </div>
    </body></html>`;
    const ex = extractFromHtml(html, 'https://x-solar.com');
    const sarah = ex.people.find((p) => p.name === 'Sarah Lee');
    expect(sarah?.role).toBe('marketing_director');
    expect(sarah?.email).toBe('sarah@x-solar.com');
    expect(sarah?.phone).toBe('+441615550100');
  });

  it('de-obfuscates emails in text', () => {
    const html = `<body>Reach us at hello (at) greensun (dot) io today</body>`;
    const ex = extractFromHtml(html, 'https://greensun.io');
    expect(ex.emails).toContain('hello@greensun.io');
  });
});

describe('pickInternalLinks', () => {
  it('prefers team/contact pages on the same host', () => {
    const html = `<body>
      <a href="/about-us/team">Our Team</a>
      <a href="/contact">Contact</a>
      <a href="/blog/post">Blog</a>
      <a href="https://other.com/team">Off-site</a>
    </body>`;
    const links = pickInternalLinks(html, 'https://acme-solar.com', 5);
    expect(links[0]).toContain('/about-us/team');
    expect(links.some((l) => l.includes('/contact'))).toBe(true);
    expect(links.some((l) => l.includes('other.com'))).toBe(false);
    expect(links.some((l) => l.includes('/blog/'))).toBe(false);
  });
});

describe('scoreLead', () => {
  it('ranks a reachable decision-maker above a bare business', () => {
    const rich = blankLead({
      website: 'https://a.com',
      businessEmails: ['info@a.com'],
      businessPhones: ['+44200000000'],
      people: [
        {
          name: 'Jane Doe',
          role: 'ceo',
          seniority: 'c_suite',
          email: 'jane@a.com',
          phone: '+44200000001',
          provenance: [{ source: 'website:jsonld', collectedAt: '' }],
        },
      ],
    });
    const bare = blankLead({ website: 'https://b.com' });
    scoreLead(rich);
    scoreLead(bare);
    expect(rich.score).toBeGreaterThan(bare.score);
    expect(rich.score).toBeGreaterThanOrEqual(50);
  });
});

describe('dedupeLeads', () => {
  it('merges businesses sharing a domain', () => {
    const a = blankLead({ id: 'a', domain: 'sun.com', businessEmails: ['info@sun.com'] });
    const b = blankLead({ id: 'a', domain: 'sun.com', businessPhones: ['+44200000000'] });
    const merged = dedupeLeads([a, b]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.businessEmails).toContain('info@sun.com');
    expect(merged[0]?.businessPhones).toContain('+44200000000');
  });
});

describe('suppression', () => {
  it('strips suppressed emails/phones and drops opted-out domains', () => {
    const sup = loadSuppression();
    sup.emails.add('jane@a.com');
    sup.domains.add('blocked.com');
    sup.phones.add('442000000009');
    const keep = blankLead({
      domain: 'a.com',
      businessEmails: ['jane@a.com', 'ok@a.com'],
      businessPhones: ['+44 2000 000009', '+44 2000 000010'],
    });
    const drop = blankLead({ domain: 'blocked.com' });
    const out = applySuppression([keep, drop], sup);
    expect(out).toHaveLength(1);
    expect(out[0]?.businessEmails).toEqual(['ok@a.com']);
    expect(out[0]?.businessPhones).toEqual(['+44 2000 000010']);
  });
});
