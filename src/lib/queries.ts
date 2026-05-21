/**
 * TanStack Query — sursă unică pentru toate fetch-urile produs/categorie.
 * Toate hook-urile au cache, dedupe, background revalidation.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "https://linea-backend-production.up.railway.app";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Keys centralizate ───
export const qk = {
  categoriesTree: () => ["categoriesTree"] as const,
  categoryFilters: (slug?: string, qs?: string) =>
    ["categoryFilters", slug, qs] as const,
  productList: (slug?: string, qs?: string, page?: number) =>
    ["productList", slug, qs, page] as const,
  product: (idOrSlug?: string) => ["product", idOrSlug] as const,
  carousel: (slug?: string) => ["carousel", slug || "home"] as const,
  vouchersTicker: () => ["vouchersTicker"] as const,
  categoryBanner: (slug?: string) => ["categoryBanner", slug] as const,
};

// ─── Hooks ───
export function useCategoriesTree() {
  return useQuery({
    queryKey: qk.categoriesTree(),
    queryFn: () => fetchJson<any[]>(`${API_BASE_URL}/api/v1/categories/tree`),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useCategoryFilters(slug?: string, queryString?: string) {
  return useQuery({
    queryKey: qk.categoryFilters(slug, queryString),
    queryFn: () =>
      fetchJson<any>(
        `${API_BASE_URL}/api/v1/products/filters/${slug}${
          queryString ? `?${queryString}` : ""
        }`,
      ),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProducts(
  slug: string | undefined,
  searchParams: URLSearchParams,
  page: number,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (slug) params.set("category_slug", slug);
  searchParams.forEach((value, key) => {
    if (!["page", "category_slug"].includes(key)) params.append(key, value);
  });

  return useQuery({
    queryKey: qk.productList(slug, params.toString(), page),
    queryFn: () =>
      fetchJson<{
        items: any[];
        total: number;
        page: number;
        pages: number;
      }>(`${API_BASE_URL}/api/v1/products/filter?${params.toString()}`),
    enabled: !!slug,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev, // keepPreviousData → fără layout shift la schimbarea filtrului
  });
}

export function useProduct(idOrSlug?: string) {
  return useQuery({
    queryKey: qk.product(idOrSlug),
    queryFn: () =>
      fetchJson<any>(`${API_BASE_URL}/api/v1/products/${idOrSlug}`),
    enabled: !!idOrSlug && idOrSlug !== "null",
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCarouselProducts(categorySlug?: string) {
  return useQuery({
    queryKey: qk.carousel(categorySlug),
    queryFn: async () => {
      const url = `${API_BASE_URL}/api/v1/products/?limit=20${
        categorySlug ? `&category_slug=${categorySlug}` : ""
      }`;
      const data = await fetchJson<any>(url);
      return (data.items || (Array.isArray(data) ? data : [])) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVouchersTicker() {
  return useQuery({
    queryKey: qk.vouchersTicker(),
    queryFn: () =>
      fetchJson<any[]>(`${API_BASE_URL}/api/v1/vouchers/active-ticker`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryBanner(slug?: string) {
  return useQuery({
    queryKey: qk.categoryBanner(slug),
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/vouchers/category-banner/${slug}`,
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!data) return [];
      return Array.isArray(data) ? data : [data];
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Prefetch helpers (hover/pointerdown on links) ───
export function usePrefetchers() {
  const qc = useQueryClient();
  return {
    prefetchProduct: (idOrSlug?: string) => {
      if (!idOrSlug) return;
      qc.prefetchQuery({
        queryKey: qk.product(idOrSlug),
        queryFn: () =>
          fetchJson<any>(`${API_BASE_URL}/api/v1/products/${idOrSlug}`),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}
