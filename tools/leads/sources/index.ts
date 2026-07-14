/*
 * Source registry. Given a RunConfig, dispatch to the chosen discovery source
 * and return a normalised list of DiscoveryHit before enrichment.
 */
import { discoverOverpass } from './overpass';
import { discoverPlaces } from './places';
import { discoverSeed } from './seed';
import type { DiscoveryHit, RunConfig } from '../types';

export async function discover(cfg: RunConfig): Promise<DiscoveryHit[]> {
  switch (cfg.source) {
    case 'places':
      return discoverPlaces(cfg);
    case 'seed':
      return discoverSeed(cfg);
    case 'overpass':
    default:
      return discoverOverpass(cfg);
  }
}
