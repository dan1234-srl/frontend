/**
 * Image helper — S3 variants direct (small=200, medium=400, large=1000).
 *
 * Imaginile sunt deja optimizate la upload pe S3 (assets.evem.ro). NU mai trecem
 * prin niciun proxy (weserv / cloudflare image resizing) pentru că:
 *   - adaugă 200-2000ms latență pe 3G,
 *   - pierdem caching-ul nativ S3/CloudFront,
 *   - fișierele sunt deja AVIF/WebP-equivalent ca dimensiune.
 *
 * Caller-ul alege varianta corectă: `medium` pentru grid, `large` pentru detail,
 * `small` ca LQIP / thumbnail.
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/$/, "");

export interface CfOpts {
  w?: number;
  h?: number;
  q?: number;
  fit?: "cover" | "contain" | "scale-down" | "crop" | "pad";
  blur?: number;
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
}

function normalizeSource(src: string): string {
  if (!src) return src;
  if (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/placeholder")
  ) {
    return src;
  }
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/") && API_BASE_URL) return `${API_BASE_URL}${src}`;
  return src;
}

/** Întoarce URL-ul S3 direct, fără transformări. */
export function cfImg(
  src: string | null | undefined,
  _opts: CfOpts = {},
): string {
  if (!src) return "/placeholder.svg";
  return normalizeSource(src);
}

/** Fără srcset — S3 livrează varianta corectă aleasă de caller. */
export function cfSrcSet(
  _src: string | null | undefined,
  _widths?: number[],
  _opts?: Omit<CfOpts, "w">,
): string {
  return "";
}

/** LQIP = small variant (când caller-ul nu îl pasează explicit). */
export function cfLqip(src: string | null | undefined): string {
  if (!src) return "/placeholder.svg";
  return normalizeSource(src);
}

/** Preload pentru LCP — un singur href, prioritate maximă. */
export function preloadLcp(src: string | null | undefined) {
  if (!src || typeof document === "undefined") return;
  const href = normalizeSource(src);
  const id = `lcp-preload-${btoa(unescape(encodeURIComponent(href))).slice(0, 24)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  link.setAttribute("fetchpriority", "high");
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}
