/**
 * Lightweight in-memory prefetch cache for product detail responses.
 */
import { prefetchImage } from "@/components/ui/smart-image"; // Acum va funcționa

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const productCache = new Map<string, Promise<any>>();

export function prefetchProduct(slugOrId?: string) {
  if (!slugOrId) return;
  if (productCache.has(slugOrId)) return;

  const p = fetch(`${API_BASE_URL}/api/v1/products/${slugOrId}`, {
    headers: { Accept: "application/json" },
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  productCache.set(slugOrId, p);
}

export function getPrefetchedProduct(slugOrId?: string) {
  if (!slugOrId) return undefined;
  return productCache.get(slugOrId);
}

export { prefetchImage };
