/**
 * Backward-compat shim — vechiul prefetch a fost migrat pe TanStack Query.
 * Aceste exporturi rămân ca să nu rupem importurile existente.
 */
import { prefetchImage } from "@/components/ui/smart-image";

export { prefetchImage };

// No-op-uri (cache real e gestionat de queryClient + SmartImage decodedCache).
export function prefetchProduct(_slugOrId?: string) {}
export function getPrefetchedProduct(_slugOrId?: string) {
  return undefined;
}
