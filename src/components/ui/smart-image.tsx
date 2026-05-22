import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const decodedCache = new Set<string>();

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: string;
  sizes?: string;
  /** Ignored — kept for API compat. */
  widths?: number[];
  /** LQIP / thumbnail URL (S3 small variant ~200px). */
  lqip?: string;
  eager?: boolean;
  objectFit?: "cover" | "contain";
  className?: string;
  imgClassName?: string;
  /** Ignored — kept for API compat. */
  cfOpts?: any;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const SmartImage = memo(function SmartImage({
  src,
  alt,
  aspectRatio,
  sizes = "100vw",
  lqip,
  eager = false,
  objectFit = "cover",
  className,
  imgClassName,
  onClick,
}: SmartImageProps) {
  const finalSrc = src || "/placeholder.svg";
  const [loaded, setLoaded] = useState(() => decodedCache.has(finalSrc));
  const imgRef = useRef<HTMLImageElement | null>(null);

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

  const lqipUrl = lqip || finalSrc;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-zinc-100",
        !aspectRatio && "h-full w-full",
        className,
      )}
      style={{
        aspectRatio,
        backgroundImage: loaded ? undefined : `url("${lqipUrl}")`,
        backgroundSize: objectFit === "contain" ? "contain" : "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <img
        ref={imgRef}
        src={finalSrc}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error - non-standard attribute
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
          "absolute inset-0 h-full w-full transition-opacity duration-200",
          objectFit === "contain" ? "object-contain" : "object-cover",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        draggable={false}
      />
    </div>
  );
});

export function prefetchImage(url?: string | null) {
  if (!url || typeof window === "undefined") return;
  if (decodedCache.has(url)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  img.onload = () => decodedCache.add(url);
}
