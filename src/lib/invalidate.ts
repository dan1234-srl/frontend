/**
 * Cache busting centralizat.
 * Folosit după mutațiile din admin (create/update/delete pe produse,
 * categorii, colecții, vouchere, brands, attributes, pages, themes).
 *
 * Curăță:
 *  - React Query (toate query-urile de conținut)
 *  - sessionStorage SWR (`swr:*`)
 *  - In-memory `CAROUSEL_CACHE` din ProductCarousel
 */
import { queryClient } from "./query-client";
import { clearCarouselCache } from "@/components/content/ProductCarousel";

const CONTENT_QUERY_KEYS = [
  "categoriesTree",
  "categoryFilters",
  "productList",
  "product",
  "carousel",
  "vouchersTicker",
  "categoryBanner",
];

function clearSwrSessionCache() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("swr:")) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

export function bustContentCaches() {
  // 1) React Query
  CONTENT_QUERY_KEYS.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
  // 2) sessionStorage SWR
  clearSwrSessionCache();
  // 3) Carusel in-memory
  clearCarouselCache();
}

/**
 * Detectează dacă un URL e endpoint de conținut care, dacă a fost modificat,
 * trebuie să invalideze cache-urile publicului.
 */
export function isContentEndpoint(url: string): boolean {
  return /\/api\/v1\/(products|categories|collections|vouchers|brands|attributes|coupons|pages|themes|email-templates)(\/|\?|$)/i.test(
    url,
  );
}
