/*
 * Google Places (New) Text Search discovery. This is the recommended source for
 * real volume and coverage: it returns solar businesses with websites, phone
 * numbers and addresses. It needs GOOGLE_PLACES_API_KEY (billing enabled) and
 * bills per request — see tools/leads/README.md for setup and cost notes.
 */
import type { DiscoveryHit, RunConfig } from '../types';

interface PlacesResponse {
  places?: {
    displayName?: { text?: string };
    websiteUri?: string;
    internationalPhoneNumber?: string;
    nationalPhoneNumber?: string;
    formattedAddress?: string;
    addressComponents?: { longText?: string; types?: string[] }[];
  }[];
  nextPageToken?: string;
}

function pickComponent(
  components: { longText?: string; types?: string[] }[] | undefined,
  type: string,
): string | undefined {
  return components?.find((c) => c.types?.includes(type))?.longText;
}

export async function discoverPlaces(cfg: RunConfig): Promise<DiscoveryHit[]> {
  if (!cfg.googlePlacesKey) throw new Error('places source needs GOOGLE_PLACES_API_KEY in env');
  if (!cfg.area) throw new Error('places source needs --area "<place>"');

  const hits: DiscoveryHit[] = [];
  const seen = new Set<string>();
  let pageToken: string | undefined;

  const fieldMask = [
    'places.displayName',
    'places.websiteUri',
    'places.internationalPhoneNumber',
    'places.nationalPhoneNumber',
    'places.formattedAddress',
    'places.addressComponents',
    'nextPageToken',
  ].join(',');

  // Places returns up to 20 per page, 3 pages max (~60). Loop pages until we
  // hit the requested limit or run out.
  for (let page = 0; page < 3 && hits.length < cfg.limit; page++) {
    const body: Record<string, unknown> = {
      textQuery: `solar installers and solar panel companies in ${cfg.area}`,
      maxResultCount: 20,
    };
    if (pageToken) body.pageToken = pageToken;

    let json: PlacesResponse;
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': cfg.googlePlacesKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`[places] HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        break;
      }
      json = (await res.json()) as PlacesResponse;
    } catch (err) {
      console.error('[places] request error:', (err as Error).message);
      break;
    }

    for (const p of json.places ?? []) {
      const name = p.displayName?.text?.trim();
      if (!name) continue;
      const key = (p.websiteUri || name).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        name,
        website: p.websiteUri,
        phone: p.internationalPhoneNumber || p.nationalPhoneNumber,
        address: p.formattedAddress,
        city: pickComponent(p.addressComponents, 'locality'),
        region: pickComponent(p.addressComponents, 'administrative_area_level_1'),
        country: pickComponent(p.addressComponents, 'country'),
        source: 'places',
        sourceUrl: 'https://maps.google.com',
      });
      if (hits.length >= cfg.limit) break;
    }

    pageToken = json.nextPageToken;
    if (!pageToken) break;
    // The new Places API needs a brief pause before a page token is valid.
    await new Promise((r) => setTimeout(r, 2000));
  }

  return hits.slice(0, cfg.limit);
}
