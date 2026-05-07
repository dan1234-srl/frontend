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
}

export const SmartImage = memo(function SmartImage({
  src,
  lqip,
  alt,
  className,
  eager = false,
  fallback = "/placeholder.svg",
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(() => decodedCache.has(src));
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (decodedCache.has(src)) {
      setLoaded(true);
      setErrored(false);
      return;
    }
    setLoaded(false);
    setErrored(false);

    const node = imgRef.current;
    if (node && node.complete && node.naturalWidth > 0) {
      decodedCache.add(src);
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    decodedCache.add(src);
    setLoaded(true);
  };

  const handleError = () => {
    setErrored(true);
    setLoaded(true);
  };

  return (
    <>
      {!loaded && (
        <div aria-hidden className="absolute inset-0 skeleton-shimmer" />
      )}

      {lqip && !loaded && (
        <img
          src={lqip}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover scale-105 blur-xl opacity-60"
        />
      )}

      <img
        ref={imgRef}
        src={errored ? fallback : src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        // Corecție: React cere lowercase pentru atributele DOM experimentale
        fetchpriority={eager ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-500 ease-luxury",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </>
  );
});

export function prefetchImage(url?: string) {
  if (!url || decodedCache.has(url)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  img.onload = () => decodedCache.add(url);
}
