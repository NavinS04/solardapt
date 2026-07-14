# Solar leads scraper

An internal CLI that builds a **call-sheet spreadsheet** of solar businesses and
their decision-makers (CEO/founder, COO, CFO/finance, marketing director/manager
/executive, financial advisor) with the contact details each business publishes
— so you can work a big list: ~100 calls and ~100 emails a day.

It is a pipeline:

```
discover businesses  →  enrich each website  →  suppress  →  dedupe  →  score  →  export
   (source)              (crawl about/team/         (opt-outs)   (merge)  (rank)   (CSV + JSON)
                          contact pages)
```

## Quick start

```bash
# Keyless demo (OpenStreetMap) — works with no API keys:
npm run leads -- run --area "Leeds, UK" --limit 100

# Best coverage (Google Places — needs GOOGLE_PLACES_API_KEY in .env):
npm run leads -- run --area "Austin, TX" --source places --limit 200

# Enrich a list you already have (CSV or one-domain-per-line):
npm run leads -- enrich --seed ./my-solar-list.csv

# Enrich a single company:
npm run leads -- enrich --domain examplesolar.com

# See every flag:
npm run leads -- --help
```

Output lands in `leads-output/<area>-<date>/` (git-ignored):

| File | What it is |
| --- | --- |
| `call-sheet-01.csv`, `-02.csv`… | **Work one per day.** ~100 contacts each, ranked best-first. |
| `leads-master.csv` | Everything in one sheet. |
| `leads.json` | Full structured data incl. per-field provenance. |
| `_SUMMARY.txt` | Counts + a compliance reminder. |

Open any `.csv` in Excel or Google Sheets (File → Import). The sheet has empty
`status`, `last_contacted` and `outcome` columns so it doubles as a tracker.

## The call-sheet columns

`priority` · `status` · `last_contacted` · `outcome` · `business` · `category` ·
`contact_name` · `role` · `job_title` · `contact_email` · `contact_phone` ·
`business_email` · `business_phone` · `website` · `city` · `region` · `country` ·
`linkedin` · `business_linkedin` · `confidence` · `source` · `source_url` ·
`notes` · `collected_at`

`confidence` tells you how the contact was found:
`high` (site's structured data / a licensed provider) →
`medium` (a "team page" card) → `low` / `business-only`.

## Sources

| `--source` | Key needed | Notes |
| --- | --- | --- |
| `overpass` (default) | none | OpenStreetMap. Free, zero setup, but patchy business coverage — good for a demo or a keyless run. |
| `places` | `GOOGLE_PLACES_API_KEY` | Google Places (New) Text Search. **Best coverage** — real websites, phones, addresses. Billed per request; enable billing + the Places API in Google Cloud. |
| `seed` | none | Enrich businesses you bring. `--seed file.csv` (with a `website`/`domain` column, optional `name`,`phone`,`city`,`region`,`country`) or one domain/URL per line. |

Optional enrichment: set `HUNTER_API_KEY` to have [Hunter.io](https://hunter.io)
fill role-based emails per domain. Providers are the **licensed** way to fill
gaps — the tool does not scrape LinkedIn or any site that forbids it.

## How enrichment works

For each business with a website it fetches the homepage, then up to a few
`about` / `team` / `leadership` / `contact` pages, and extracts:

1. **schema.org JSON-LD** (`Organization`, `LocalBusiness`, `Person`) — the most
   reliable, so it's trusted first;
2. **`mailto:` / `tel:` links** and a **team-card heuristic** (a person's name
   next to a targeted job title);
3. de-obfuscated emails in visible text (`name (at) domain (dot) com`).

Only people whose title matches a targeted role are kept (see `roles.ts`).

## Built to be polite & lawful

This is deliberately **not** a "scrape everything" bot — that's how you get
blocked, sued, or your domain blacklisted. The tool:

- **Honours `robots.txt`** (disable with `--no-robots`, not recommended).
- **Throttles per host** (`--delay`, default 1500 ms) and caps pages per site
  (`--max-pages`, default 6).
- Identifies itself with a real **User-Agent** (`LEADS_USER_AGENT`).
- Records **provenance** for every field (source + URL + timestamp).
- Only collects contact data a business **publishes on its own site** (plus any
  licensed provider you configure).
- Supports a **suppression / do-not-contact list** (`--suppress`,
  `LEADS_SUPPRESS_FILE`): emails, domains or phones, one per line — matches are
  stripped and opted-out domains are dropped entirely.

**You are still responsible for lawful outreach.** Before contacting anyone:

- Check the rules for each market — UK GDPR/PECR, EU GDPR, US CAN-SPAM + TCPA and
  state Do-Not-Call, Canada's CASL, etc.
- Screen phone numbers against the relevant DNC / TPS / CTPS registers.
- Give every marketing email a working opt-out and honour it immediately (add it
  to your suppression file).
- Keep your lawful basis documented (usually legitimate interest for B2B).

This tool records provenance to support that process; it does not replace your
own compliance checks or legal advice.

## Layout

```
tools/leads/
  cli.ts            entry point (npm run leads -- …)
  config.ts         flags + .env → RunConfig, plus --help text
  pipeline.ts       discover → enrich → suppress → dedupe → score → export
  types.ts          BusinessLead / Person / Provenance model
  roles.ts          job-title → targeted role dictionary
  http.ts           polite fetch, per-host throttle, concurrency pool
  robots.ts         robots.txt fetch + allow check
  dedupe.ts         merge duplicate businesses
  score.ts          0–100 priority for the call sheet
  suppress.ts       do-not-contact list
  export.ts         call-sheet CSVs + daily batches + JSON + summary
  csvutil.ts        dependency-free CSV read/write
  sources/          overpass · places · seed discovery
  enrich/           website crawl + extraction + licensed providers
```

## Notes & limits

- OpenStreetMap coverage of businesses is thin; use Google Places for volume.
- The team-card heuristic is best-effort — always trust `confidence` and spot-
  check `medium`/`low` rows before a big send.
- Run from the repo root so `.env` and `node_modules` are found.
