/**
 * Cloudflare Image Resizing helper.
 *
 * Folosim Cloudflare Image Resizing prin `<base>/cdn-cgi/image/<options>/<source>`.
 * - format=auto livrează AVIF / WebP automat în funcție de Accept header.
 * - quality 75 implicit (sweet spot pe 3G).
 * - Cache HTTP gestionat de Cloudflare edge.
 *
 * Source-ul poate fi:
 *   - URL absolut (https://s3...) → trecut ca atare,
 *   - path relativ (/uploads/...) → prefixat cu API_BASE_URL,
 *   - data: / blob: / placeholder → returnat fără transformare.
 */

const CF_BASE = (import.meta.env.VITE_CF_IMAGE_BASE as string | undefined)
  ?.replace(/\/$/, "");

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

// Fallback public proxy dacă CDN-ul Cloudflare nu este încă configurat.
const WESERV_FALLBACK = "https://images.weserv.nl/";

export interface CfOpts {
  w?: number;
  h?: number;
  q?: number;
  fit?: "cover" | "contain" | "scale-down" | "crop" | "pad";
  blur?: number; // 1-250
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
}

function normalizeSource(src: string): string {
  if (!src) return src;
  if (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/placeholder") ||
    src.startsWith("/cdn-cgi/")
  ) {
    return src;
  }
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/") && API_BASE_URL) return `${API_BASE_URL}${src}`;
  return src;
}

/**
 * Construiește un URL optimizat. Dacă VITE_CF_IMAGE_BASE nu e setat,
 * cade pe images.weserv.nl ca să nu rămânem fără optimizare.
 */
export function cfImg(src: string | null | undefined, opts: CfOpts = {}): string {
  if (!src) return "/placeholder.svg";
  const source = normalizeSource(src);

  if (source.startsWith("data:") || source.startsWith("blob:")) return source;
  if (source.startsWith("/placeholder")) return source;

  const { w, h, q = 78, fit = "cover", blur, format = "auto" } = opts;

  if (CF_BASE) {
    const parts: string[] = [`format=${format}`, `quality=${q}`, `fit=${fit}`];
    if (w) parts.push(`width=${w}`);
    if (h) parts.push(`height=${h}`);
    if (blur) parts.push(`blur=${blur}`);
    // Cloudflare acceptă URL absolut neîncodat după opțiuni.
    return `${CF_BASE}/cdn-cgi/image/${parts.join(",")}/${source}`;
  }

  // Fallback weserv.nl
  const params = new URLSearchParams();
  params.set("url", source.replace(/^https?:\/\//, ""));
  if (w) params.set("w", String(w));
  if (h) params.set("h", String(h));
  params.set("fit", fit === "contain" ? "contain" : "cover");
  params.set("output", format === "auto" ? "webp" : format);
  params.set("q", String(q));
  if (blur) params.set("blur", String(Math.min(blur, 100)));
  return `${WESERV_FALLBACK}?${params.toString()}`;
}

/**
 * Generează un srcset modern pentru o lățime intrinsecă cunoscută.
 * Returnează string-ul `srcset` + width-urile folosite (pentru debug).
 */
export function cfSrcSet(
  src: string | null | undefined,
  widths: number[] = [320, 480, 640, 800, 1200, 1600],
  opts: Omit<CfOpts, "w"> = {},
): string {
  if (!src) return "";
  return widths
    .map((w) => `${cfImg(src, { ...opts, w })} ${w}w`)
    .join(", ");
}

/**
 * URL pentru LQIP (low-quality placeholder).
 * 24px lățime + blur agresiv = ~500 bytes, decodează instant.
 */
export function cfLqip(src: string | null | undefined): string {
  return cfImg(src, { w: 32, q: 30, blur: 60 });
}

/**
 * Preload-uri programatice pentru imaginea LCP.
 * Injectează un `<link rel="preload" as="image" imagesrcset=... imagesizes=...>`.
 */
export function preloadLcp(
  src: string | null | undefined,
  sizes: string,
  widths?: number[],
) {
  if (!src || typeof document === "undefined") return;
  const id = `lcp-preload-${btoa(unescape(encodeURIComponent(src))).slice(0, 24)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "preload";
  link.as = "image";
  link.setAttribute("imagesrcset", cfSrcSet(src, widths));
  link.setAttribute("imagesizes", sizes);
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}
