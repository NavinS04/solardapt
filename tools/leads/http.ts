/*
 * Polite HTTP layer for the crawler. Three jobs:
 *   1. Identify the bot honestly (real User-Agent with a contact URL).
 *   2. Throttle per host so we never hammer a small installer's website.
 *   3. Fail safe: timeouts, size caps, and never throw to the caller.
 *
 * Nothing here bypasses bot protections or spoofs a browser — if a site blocks
 * a well-identified crawler, we skip it rather than evade it.
 */

const lastHostHit = new Map<string, number>();

export interface FetchResult {
  ok: boolean;
  status: number;
  /** Final URL after redirects. */
  url: string;
  contentType: string;
  body: string;
  error?: string;
}

const MAX_BYTES = 3_000_000; // 3 MB cap — team/about pages are small.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wait out the per-host politeness window before touching a host again. */
async function throttle(host: string, perHostDelayMs: number): Promise<void> {
  const now = Date.now();
  const last = lastHostHit.get(host) ?? 0;
  const wait = last + perHostDelayMs - now;
  if (wait > 0) await sleep(wait);
  lastHostHit.set(host, Date.now());
}

export interface FetchOptions {
  userAgent: string;
  perHostDelayMs: number;
  timeoutMs?: number;
  accept?: string;
}

/** Fetch a URL as text, politely. Never throws — returns ok:false instead. */
export async function politeFetch(url: string, opts: FetchOptions): Promise<FetchResult> {
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    return { ok: false, status: 0, url, contentType: '', body: '', error: 'invalid url' };
  }

  await throttle(host, opts.perHostDelayMs);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': opts.userAgent,
        Accept: opts.accept ?? 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en',
      },
    });
    const contentType = res.headers.get('content-type') ?? '';
    // Only read text-like bodies; skip PDFs/images/binaries.
    if (!/text\/|json|xml|html/i.test(contentType) && contentType !== '') {
      return { ok: false, status: res.status, url: res.url, contentType, body: '', error: 'non-text' };
    }
    const body = await readCapped(res, MAX_BYTES);
    return { ok: res.ok, status: res.status, url: res.url, contentType, body };
  } catch (err) {
    const msg = (err as Error).name === 'AbortError' ? 'timeout' : (err as Error).message;
    return { ok: false, status: 0, url, contentType: '', body: '', error: msg };
  } finally {
    clearTimeout(timer);
  }
}

/** Read a response body but stop after `max` bytes to bound memory. */
async function readCapped(res: Response, max: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
      if (total >= max) {
        await reader.cancel();
        break;
      }
    }
  }
  return new TextDecoder('utf-8').decode(concat(chunks));
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/**
 * Run async tasks with a fixed concurrency cap. A tiny dependency-free pool so
 * we can enrich many sites in parallel without overwhelming the network or any
 * single host (per-host throttling still applies inside each task).
 */
export async function pool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  let done = 0;
  const total = items.length;

  async function runner(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= total) return;
      const item = items[i] as T;
      results[i] = await worker(item, i);
      done++;
      onProgress?.(done, total);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, total || 1) }, runner);
  await Promise.all(runners);
  return results;
}
