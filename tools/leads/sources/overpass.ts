/*
 * Keyless discovery via OpenStreetMap. We geocode the target area with Nominatim
 * to a bounding box, then ask Overpass for businesses whose name mentions
 * "solar" within that box. This runs with zero API keys, which makes it the
 * out-of-the-box demo path — but OSM's business coverage is patchy and many
 * results lack a website. For serious volume, use the Google Places source.
 *
 * Usage policy: Nominatim asks for a real User-Agent and light request rates;
 * we honour both. Please don't point this at huge regions in tight loops.
 */
import type { DiscoveryHit, RunConfig } from '../types';

interface NominatimResult {
  boundingbox?: [string, string, string, string]; // [south, north, west, east]
  display_name?: string;
}

interface OverpassElement {
  type: string;
  tags?: Record<string, string>;
}

async function geocodeArea(area: string, ua: string): Promise<[number, number, number, number] | undefined> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(area)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'application/json' } });
    if (!res.ok) return undefined;
    const rows = (await res.json()) as NominatimResult[];
    const bb = rows[0]?.boundingbox;
    if (!bb) return undefined;
    const [s, n, w, e] = bb.map(Number);
    if ([s, n, w, e].some(Number.isNaN)) return undefined;
    return [s as number, w as number, n as number, e as number]; // Overpass bbox order: S,W,N,E
  } catch {
    return undefined;
  }
}

function tagWebsite(tags: Record<string, string>): string | undefined {
  return tags.website || tags['contact:website'] || tags.url;
}

function tagPhone(tags: Record<string, string>): string | undefined {
  return tags.phone || tags['contact:phone'] || tags['contact:mobile'];
}

function tagAddress(tags: Record<string, string>): string | undefined {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

export async function discoverOverpass(cfg: RunConfig): Promise<DiscoveryHit[]> {
  if (!cfg.area) throw new Error('overpass source needs --area "<place>"');
  const bbox = await geocodeArea(cfg.area, cfg.userAgent);
  if (!bbox) {
    console.error(`[overpass] could not geocode area "${cfg.area}"`);
    return [];
  }
  const [s, w, n, e] = bbox;
  const cap = Math.min(cfg.limit, 500);
  // Match businesses whose name mentions solar/photovoltaic/PV, plus explicit
  // energy tags. `out center` gives ways a representative point.
  const query = `[out:json][timeout:60];
(
  nwr["name"~"solar|photovoltaic|\\\\bpv\\\\b",i](${s},${w},${n},${e});
  nwr["craft"="solar"](${s},${w},${n},${e});
  nwr["office"="energy_supplier"]["name"~"solar|energy|renewable",i](${s},${w},${n},${e});
);
out center tags ${cap};`;

  let elements: OverpassElement[] = [];
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': cfg.userAgent },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) {
      console.error(`[overpass] query failed: HTTP ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { elements?: OverpassElement[] };
    elements = json.elements ?? [];
  } catch (err) {
    console.error('[overpass] request error:', (err as Error).message);
    return [];
  }

  const hits: DiscoveryHit[] = [];
  const seen = new Set<string>();
  for (const el of elements) {
    const tags = el.tags;
    if (!tags) continue;
    const name = tags.name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({
      name,
      website: tagWebsite(tags),
      phone: tagPhone(tags),
      address: tagAddress(tags),
      city: tags['addr:city'],
      country: tags['addr:country'] || cfg.area,
      source: 'overpass',
      sourceUrl: 'https://www.openstreetmap.org',
    });
  }
  return hits.slice(0, cfg.limit);
}
