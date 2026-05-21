import { useEffect, useRef, useState, memo } from "react";
import { cn } from "@/lib/utils";

const decodedCache = new Set<string>();

interface SmartImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "loading"
> {
  src: string;
  lqip?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallback?: string;
  sizes?: string; // 🚀 Adăugat pentru performanță
}

export const SmartImage = memo(function SmartImage({
  src,
  lqip,
  alt,
  className,
  eager = false,
  fallback = "/placeholder.svg",
  sizes = "100vw",
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(() => decodedCache.has(src));
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Dacă imaginea e deja în cache, setăm loaded imediat
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
      decodedCache.add(src);
    }
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-zinc-100", className)}>
      {/* Skeleton / LQIP Overlay */}
      {!loaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-zinc-200" />
      )}

      {lqip && !loaded && (
        <img
          src={lqip}
          alt=""
          className="absolute inset-0 h-full w-full object-cover blur-md scale-105"
        />
      )}

      <img
        ref={imgRef}
        src={errored ? fallback : src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "low"}
        sizes={sizes}
        onLoad={() => {
          decodedCache.add(src);
          setLoaded(true);
        }}
        onError={() => setErrored(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
        {...rest}
      />
    </div>
  );
});
