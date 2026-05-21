/**
 * Helper pentru accesarea directă a imaginilor din backend-ul propriu.
 * Nu mai folosim Cloudflare/Weserv, procesarea se face pe backend la upload.
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/$/, "");

export interface ImageOpts {
  w?: number; // Folosit doar dacă backend-ul ar oferi rute dinamice, aici e ignorat
  fit?: "cover" | "contain";
}

function normalizeSource(src: string): string {
  if (
    !src ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/placeholder")
  ) {
    return src;
  }
  if (src.startsWith("http")) return src;
  if (src.startsWith("/") && API_BASE_URL) return `${API_BASE_URL}${src}`;
  return src;
}

/**
 * Returnează URL-ul direct către asset.
 * Dacă backend-ul trimite un JSON (variante), îl parsăm aici.
 */
export function cfImg(
  src: string | null | undefined,
  opts: ImageOpts = {},
): string {
  if (!src) return "/placeholder.svg";

  // Dacă sursa este JSON-ul nostru cu variante {main: {medium: '...', small: '...'}}
  if (typeof src === "string" && src.trim().startsWith("{")) {
    try {
      const data = JSON.parse(src);
      // Selectăm varianta medium/default
      const url = data?.main?.medium || data?.main?.large || data?.url || "";
      return normalizeSource(url);
    } catch {
      return "/placeholder.svg";
    }
  }

  return normalizeSource(src);
}

/**
 * Pentru imagini deja optimizate, srcset-ul va returna aceeași sursă
 * (deoarece fișierul este deja livrat optim de pe assets.evem.ro)
 */
export function cfSrcSet(
  src: string | null | undefined,
  widths: number[] = [320, 480, 640, 800, 1200],
): string {
  if (!src) return "";
  const source = cfImg(src);
  return widths.map((w) => `${source} ${w}w`).join(", ");
}

/**
 * LQIP (Placeholder) - Folosește varianta 'small' dacă există în JSON-ul de backend
 */
export function cfLqip(src: string | null | undefined): string {
  if (!src || typeof src !== "string" || !src.trim().startsWith("{"))
    return "/placeholder.svg";
  try {
    const data = JSON.parse(src);
    return normalizeSource(data?.main?.small || data?.main?.medium || "");
  } catch {
    return "/placeholder.svg";
  }
}

/**
 * Preload pentru LCP (Largest Contentful Paint).
 */
export function preloadLcp(src: string | null | undefined, sizes: string) {
  if (!src || typeof document === "undefined") return;
  const url = cfImg(src);
  const id = `lcp-preload-${btoa(url).slice(0, 16)}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}
