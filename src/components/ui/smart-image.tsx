import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { cfImg, cfLqip, cfSrcSet, type CfOpts } from "@/lib/cf-image";

const decodedCache = new Set<string>();

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  /** ex: "3/4", "1/1", "16/9". Mereu setează → zero CLS. */
  aspectRatio?: string;
  /** `sizes` HTML pentru srcset. Default: 100vw. */
  sizes?: string;
  /** width-urile pentru srcset. */
  widths?: number[];
  /** Imagine inline LQIP (background blur). Generată automat din src dacă nu e dată. */
  lqip?: string;
  /** Imagine LCP → eager + fetchpriority high. */
  eager?: boolean;
  /** "cover" implicit. Pentru galerii produs poți folosi "contain". */
  objectFit?: "cover" | "contain";
  /** Stiluri aplicate WRAPPER-ului (rounding, background, etc). */
  className?: string;
  /** Stiluri suplimentare pentru tag-ul <img> intern. */
  imgClassName?: string;
  /** Opțiuni Cloudflare suplimentare (quality, format). */
  cfOpts?: Omit<CfOpts, "w" | "h">;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * Imagine performantă cu zero layout shift.
 *
 * - Wrapper-ul are întotdeauna un `aspect-ratio` fix → fără reflow.
 * - LQIP afișat ca `background-image` blur peste wrapper → imagine vizibilă
 *   în <50ms chiar și pe 3G.
 * - `<img>` real cu `srcset` Cloudflare + decoding async.
 * - Fără tranziție de opacitate (LQIP de sub face apariția instant).
 */
export const SmartImage = memo(function SmartImage({
  src,
  alt,
  aspectRatio = "1/1",
  sizes = "100vw",
  widths,
  lqip,
  eager = false,
  objectFit = "cover",
  className,
  imgClassName,
  cfOpts,
  onClick,
}: SmartImageProps) {
  const finalSrc = src || "/placeholder.svg";
  const [loaded, setLoaded] = useState(() => decodedCache.has(finalSrc));
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Detectează cache hit la mount (când imaginea era deja decodată în alt component).
  useEffect(() => {
    if (decodedCache.has(finalSrc)) {
      setLoaded(true);
      return;
    }
    const node = imgRef.current;
    if (node && node.complete && node.naturalWidth > 0) {
      decodedCache.add(finalSrc);
      setLoaded(true);
    }
  }, [finalSrc]);

  const lqipUrl = lqip || cfLqip(finalSrc);
  const srcSet = cfSrcSet(finalSrc, widths, cfOpts);
  const fallbackSrc = cfImg(finalSrc, { w: widths?.[Math.floor((widths.length - 1) / 2)] ?? 640, ...cfOpts });

  return (
    <div
      onClick={onClick}
      className={cn("relative overflow-hidden bg-zinc-100", className)}
      style={{
        aspectRatio,
        backgroundImage: loaded ? undefined : `url("${lqipUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        ref={imgRef}
        src={fallbackSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error - non-standard attribute, supported by modern browsers
        fetchpriority={eager ? "high" : "auto"}
        onLoad={() => {
          decodedCache.add(finalSrc);
          setLoaded(true);
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
          setLoaded(true);
        }}
        className={cn(
          "absolute inset-0 h-full w-full",
          objectFit === "contain" ? "object-contain" : "object-cover",
          imgClassName,
        )}
        draggable={false}
      />
    </div>
  );
});

/** Prefetch o imagine în background și o marchează în cache. */
export function prefetchImage(url?: string | null) {
  if (!url || typeof window === "undefined") return;
  const final = cfImg(url, { w: 640 });
  if (decodedCache.has(final)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = final;
  img.onload = () => decodedCache.add(final);
}
