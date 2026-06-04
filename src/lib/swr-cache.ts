/**
 * Generic SWR-style cache backed by sessionStorage.
 *
 * - Synchronously seeds initial state from a previous session so pages render
 *   instantly on revisit (no skeletons on 2G/3G when data already exists).
 * - Soft TTL: stale data is rendered immediately and silently revalidated.
 * - In-flight de-dupe so concurrent calls share a single network request.
 */

type Entry<T> = { data: T; ts: number };

const DEFAULT_TTL = 60_000;
const inflight = new Map<string, Promise<any>>();

const k = (key: string) => `swr:${key}`;

export function readCache<T = unknown>(
  key: string,
  ttl = DEFAULT_TTL,
): { data: T | null; fresh: boolean } {
  try {
    const raw = sessionStorage.getItem(k(key));
    if (!raw) return { data: null, fresh: false };
    const parsed: Entry<T> = JSON.parse(raw);
    return { data: parsed.data, fresh: Date.now() - parsed.ts < ttl };
  } catch {
    return { data: null, fresh: false };
  }
}

export function writeCache<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(k(key), JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function invalidateCache(key: string) {
  try {
    sessionStorage.removeItem(k(key));
  } catch {}
}

export async function swrFetch<T = unknown>(
  key: string,
  fetcher: (signal?: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (inflight.has(key)) return inflight.get(key)! as Promise<T>;
  const p = (async () => {
    const data = await fetcher(signal);
    writeCache(key, data);
    return data;
  })().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
