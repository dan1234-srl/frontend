import { cn } from "@/lib/utils";

/**
 * Luxury skeleton - folosim culori calde (zinc-50/100)
 * și un shimmer foarte subtil (opacity 0.5)
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-100/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export const ProductCardSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="aspect-[3/4] w-full" />
    <div className="space-y-3 px-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-2 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-2 w-1/4" />
      <div className="pt-3 border-t border-zinc-50">
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * NOU: ProductDetailSkeleton - Repară eroarea din ProductDetail.tsx
 */
export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
    {/* Coloana Stângă - Imagine */}
    <Skeleton className="aspect-[4/5] w-full rounded-sm" />

    {/* Coloana Dreaptă - Detalii */}
    <div className="space-y-8 lg:py-8 text-left">
      <div className="space-y-4">
        <Skeleton className="h-3 w-1/4" /> {/* Badge/Brand */}
        <Skeleton className="h-12 w-3/4" /> {/* Titlu Produs */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-zinc-100">
        <Skeleton className="h-8 w-1/3" /> {/* Preț */}
        <Skeleton className="h-4 w-1/2" /> {/* Tax info */}
      </div>

      <div className="space-y-4 pt-10">
        <Skeleton className="h-14 w-full rounded-full" />{" "}
        {/* Buton Add to Cart */}
        <Skeleton className="h-14 w-full rounded-full" /> {/* Buton Buy Now */}
      </div>

      <div className="space-y-3 pt-10">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  </div>
);
