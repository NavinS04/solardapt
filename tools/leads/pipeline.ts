/*
 * Pipeline orchestrator: discover -> enrich -> suppress -> dedupe -> score ->
 * export. Kept small and linear so the flow is obvious; each stage lives in its
 * own module.
 */
import { dedupeLeads } from './dedupe';
import { enrichBusiness } from './enrich/website';
import { exportLeads, type ExportResult } from './export';
import { pool } from './http';
import { scoreAndRank } from './score';
import { discover } from './sources';
import { applySuppression, loadSuppression } from './suppress';
import type { BusinessLead, DiscoveryHit, RunConfig } from './types';

function log(msg: string): void {
  process.stdout.write(`${msg}\n`);
}

/** Discovery hits for a run — handles the single --domain shortcut too. */
async function gatherHits(cfg: RunConfig): Promise<DiscoveryHit[]> {
  if (cfg.singleDomain) {
    return [{ name: cfg.singleDomain, website: cfg.singleDomain, source: 'manual' }];
  }
  return discover(cfg);
}

export async function runPipeline(cfg: RunConfig): Promise<ExportResult | undefined> {
  log(`\n▶ Solar leads run — source: ${cfg.source}${cfg.area ? `, area: ${cfg.area}` : ''}`);

  // 1. Discover.
  const hits = await gatherHits(cfg);
  log(`  discovered ${hits.length} business(es)`);
  if (hits.length === 0) {
    log('  nothing to enrich — check your --area / --source / API keys.');
    return undefined;
  }

  if (cfg.command === 'discover') {
    for (const h of hits) log(`   • ${h.name}${h.website ? ` — ${h.website}` : ''}`);
    return undefined;
  }

  // 2. Enrich each site (bounded concurrency; per-host throttle inside).
  log(`  enriching ${hits.length} site(s) (concurrency ${cfg.concurrency})…`);
  let enriched: BusinessLead[] = await pool(
    hits,
    cfg.concurrency,
    (hit) => enrichBusiness(hit, cfg),
    (done, total) => {
      if (done === total || done % 10 === 0) log(`    …${done}/${total}`);
    },
  );

  // 3. Suppression (opt-outs / do-not-contact).
  const sup = loadSuppression(cfg.suppressPath);
  if (sup.emails.size || sup.domains.size || sup.phones.size) {
    const before = enriched.length;
    enriched = applySuppression(enriched, sup);
    log(`  applied suppression list (${before - enriched.length} business(es) removed)`);
  }

  // 4. Dedupe + 5. score/rank.
  const deduped = dedupeLeads(enriched);
  const ranked = scoreAndRank(deduped);
  log(`  ${ranked.length} unique business(es) after de-dupe`);

  // 6. Export.
  const result = exportLeads(ranked, cfg.outDir, cfg.batchSize);
  log(
    `\n✔ Exported ${result.totalRows} contact row(s) from ${result.totalBusinesses} business(es)\n` +
      `  decision-makers: ${result.withDecisionMaker} · rows with email: ${result.withEmail} · rows with phone: ${result.withPhone}\n` +
      `  call-sheets: ${result.batches} · output: ${result.outDir}`,
  );
  return result;
}
