import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { cfImg, cfLqip, cfSrcSet, type CfOpts } from "@/lib/cf-image";

const decodedCache = new Set<string>();

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: string;
  sizes?: string;
  widths?: number[];
  lqip?: string;
  eager?: boolean;
  objectFit?: "cover" | "contain";
  className?: string;
  imgClassName?: string;
  cfOpts?: Omit<CfOpts, "w" | "h">;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const SmartImage = memo(function SmartImage({
  src,
  alt,
  aspectRatio,
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
  // Verificăm imediat dacă este în cache pentru a evita flash-ul de skeleton
  const [loaded, setLoaded] = useState(() => decodedCache.has(cfImg(finalSrc)));
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const final = cfImg(finalSrc);
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      decodedCache.add(final);
      setLoaded(true);
    }
  }, [finalSrc]);

  const lqipUrl = lqip || cfLqip(finalSrc);
  const srcSet = cfSrcSet(finalSrc, widths, cfOpts);
  const fallbackSrc = cfImg(finalSrc, { ...cfOpts });

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-zinc-100",
        !aspectRatio && "h-full w-full",
        className,
      )}
      style={{ aspectRatio }}
    >
      {/* 1. LQIP mai rapid cu transformare CSS pentru blur */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url("${lqipUrl}")` }}
        />
      )}

      <img
        ref={imgRef}
        src={fallbackSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        // 2. Prioritizarea browserului (Crucial pentru LCP)
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        onLoad={() => {
          decodedCache.add(cfImg(finalSrc));
          setLoaded(true);
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
        }}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-500",
          objectFit === "contain" ? "object-contain" : "object-cover",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        draggable={false}
      />
    </div>
  );
});

/** Prefetch optimizat pentru a marca imaginea ca "gata" în cache */
export function prefetchImage(url?: string | null) {
  if (!url || typeof window === "undefined") return;
  const final = cfImg(url);
  if (decodedCache.has(final)) return;

  const img = new Image();
  img.decoding = "async";
  img.src = final;
  img.onload = () => decodedCache.add(final);
}
