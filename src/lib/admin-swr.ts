/**
 * Admin SWR helper — built on top of swr-cache.ts.
 *
 * Synchronously hydrates from sessionStorage so admin pages render instantly
 * on revisit (no skeleton / "așezare în pagină" jitter on 2G/3G).
 * Then revalidates in the background.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { readCache, writeCache, swrFetch } from "./swr-cache";

export function useAdminSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  opts: { ttl?: number; refreshInterval?: number } = {},
) {
  const { ttl = 60_000, refreshInterval } = opts;

  const initial = key ? readCache<T>(key, ttl) : { data: null, fresh: false };
  const [data, setData] = useState<T | null>(initial.data);
  const [loading, setLoading] = useState(!initial.data);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const revalidate = useCallback(
    async (manual = false) => {
      if (!key) return;
      try {
        if (manual || !data) setLoading(!data);
        setIsValidating(true);
        const fresh = await swrFetch<T>(key, () => fetcherRef.current());
        setData(fresh);
        writeCache(key, fresh);
        setError(null);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    },
    [key, data],
  );

  useEffect(() => {
    if (!key) return;
    // always revalidate in background; if no data, this is the primary load
    revalidate(false);
    if (refreshInterval) {
      const id = setInterval(() => revalidate(false), refreshInterval);
      return () => clearInterval(id);
    }
  }, [key, revalidate, refreshInterval]);

  return { data, loading, isValidating, error, mutate: revalidate, setData };
}
