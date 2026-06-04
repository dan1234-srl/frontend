/**
 * Tiny SWR-style cache for GLS tracking payloads.
 * - sessionStorage so cards open instantly on slow networks (2G/3G).
 * - In-flight dedupe to avoid duplicate fetches when prefetching + opening.
 * - Soft TTL: cache is shown immediately; a background revalidate runs if stale.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const TTL_MS = 30_000;
const KEY = (orderId: string) => `tracking:${orderId}`;

type CacheEntry<T> = { data: T; ts: number };

const inflight = new Map<string, Promise<any>>();

export function readTrackingCache<T = any>(orderId: string): {
  data: T | null;
  fresh: boolean;
} {
  try {
    const raw = sessionStorage.getItem(KEY(orderId));
    if (!raw) return { data: null, fresh: false };
    const parsed: CacheEntry<T> = JSON.parse(raw);
    return { data: parsed.data, fresh: Date.now() - parsed.ts < TTL_MS };
  } catch {
    return { data: null, fresh: false };
  }
}

function writeTrackingCache<T>(orderId: string, data: T) {
  try {
    sessionStorage.setItem(
      KEY(orderId),
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {}
}

export async function fetchTracking<T = any>(
  orderId: string,
  signal?: AbortSignal,
): Promise<T | null> {
  if (inflight.has(orderId)) return inflight.get(orderId)!;
  const p = (async () => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/post_sale/orders/${orderId}/tracking`,
      { credentials: "include", signal },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    writeTrackingCache(orderId, json);
    return json as T;
  })().finally(() => inflight.delete(orderId));
  inflight.set(orderId, p);
  return p;
}

/**
 * Fire-and-forget prefetch — call on hover/pointerdown of "Detalii comandă"
 * so that opening the modal feels instant even on slow connections.
 */
export function prefetchTracking(orderId?: string) {
  if (!orderId) return;
  const { fresh } = readTrackingCache(orderId);
  if (fresh) return;
  fetchTracking(orderId).catch(() => {});
}
