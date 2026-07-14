#!/usr/bin/env tsx
/*
 * CLI entry point. Run via: npm run leads -- <command> [flags]
 * See config.ts HELP for usage, or run `npm run leads -- --help`.
 */
import { buildConfig, HELP } from './config';
import { runPipeline } from './pipeline';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP);
    return;
  }
  const cfg = buildConfig(argv);
  await runPipeline(cfg);
}

main().catch((err) => {
  process.stderr.write(`\n✖ ${(err as Error).message}\n`);
  process.exitCode = 1;
});
