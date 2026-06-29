import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { prefetchProduct, prefetchImage } from "@/lib/prefetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface ProductCarouselProps {
  categorySlug?: string;
  title?: React.ReactNode;
  subtitle?: string;
  sort?: string;
  limit?: number;
  collectionType?: string;
  hideExploreLink?: boolean;
}

/**
 * Cache la nivel de modul + dedupe pentru request-uri in-flight.
 * → la a doua afișare (revenire / re-render) produsele apar instant.
 * → pe 2G/3G eliminăm complet flash-ul / staggered fade-in care dădea senzație de lag.
 */
const CAROUSEL_CACHE = new Map<string, any[]>();
const INFLIGHT = new Map<string, Promise<any[]>>();

export const clearCarouselCache = () => {
  CAROUSEL_CACHE.clear();
  INFLIGHT.clear();
};

const buildKey = (p: ProductCarouselProps) =>
  p.collectionType
    ? `col::${p.collectionType}`
    : `cat::${p.categorySlug || ""}::${p.sort || ""}::${p.limit || 20}`;

const fetchProducts = (key: string, url: string): Promise<any[]> => {
  if (CAROUSEL_CACHE.has(key)) return Promise.resolve(CAROUSEL_CACHE.get(key)!);
  if (INFLIGHT.has(key)) return INFLIGHT.get(key)!;
  const p = fetch(url, { credentials: "include" })
    .then((r) => r.json())
    .then((data) => {
      const list = data.items || (Array.isArray(data) ? data : []);
      CAROUSEL_CACHE.set(key, list);
      return list as any[];
    })
    .finally(() => INFLIGHT.delete(key));
  INFLIGHT.set(key, p);
  return p;
};

const ProductCarousel = (props: ProductCarouselProps) => {
  const {
    categorySlug,
    title,
    subtitle,
    sort,
    limit = 20,
    collectionType,
    hideExploreLink = false,
  } = props;

  const key = buildKey(props);
  const cached = CAROUSEL_CACHE.get(key);

  const [products, setProducts] = useState<any[]>(cached || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    const k = buildKey(props);
    const hit = CAROUSEL_CACHE.get(k);
    if (hit) {
      setProducts(hit);
      setLoading(false);
      return;
    }

    let url = "";
    if (collectionType) {
      url = `${API_BASE_URL}/api/v1/collections/${collectionType}/products`;
    } else {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (categorySlug) params.set("category_slug", categorySlug);
      if (sort) params.set("sort", sort);
      url = `${API_BASE_URL}/api/v1/products/?${params.toString()}`;
    }

    let cancel = false;
    setLoading(true);
    fetchProducts(k, url)
      .then((list) => {
        if (cancel) return;
        setProducts(list);
      })
      .catch((err) => console.error("Carousel fetch error:", err))
      .finally(() => {
        if (!cancel) setLoading(false);
      });

    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, sort, limit, collectionType]);

  const getImageUrl = (p: any) => {
    const imgData = p.image_url;
    if (!imgData) return "/placeholder.png";
    if (typeof imgData === "object") {
      const main = imgData.main;
      return main?.medium || main?.large || main?.small || "/placeholder.png";
    }
    return imgData;
  };

  if (loading && products.length === 0) {
    return (
      <section className="w-full py-16 px-6 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full py-0 md:py-8 text-left relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 block">
            {subtitle || "Curated Excellence"}
          </span>
          <h2 className="heading-serif text-3xl md:text-4xl text-zinc-900 leading-tight">
            {title || (
              <>
                Produse{" "}
                <span className="italic font-light text-zinc-500">
                  Recomandate
                </span>
              </>
            )}
          </h2>
        </div>
        {!hideExploreLink && (
          <Link
            to={categorySlug ? `/category/${categorySlug}` : "/shop"}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:text-zinc-500 transition-colors"
          >
            Explorează Tot
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>
      <Carousel
        opts={{ align: "start", loop: true }}
        className="w-full relative group"
      >
        <CarouselContent className="-ml-3">
          {products.map((p, idx) => {
            const imgMedium = getImageUrl(p);
            const imgSmall = p.image_url?.main?.small;

            const hasValidSale = p.sale_price && p.sale_price > 0;
            const finalPrice = hasValidSale ? p.sale_price : p.price;
            const isDiscounted = hasValidSale && p.sale_price < p.price;
            return (
              <CarouselItem
                key={p.id || p.sku}
                className="basis-1/2 md:basis-1/4 lg:basis-1/6 xl:basis-[12.5%] pl-3"
              >
                <Link
                  to={`/product/${p.sku}`}
                  className="block group/card text-left"
                  onMouseEnter={() => {
                    prefetchProduct(p.sku);
                    if (imgMedium) prefetchImage(imgMedium);
                  }}
                  onTouchStart={() => {
                    prefetchProduct(p.sku);
                    if (imgMedium) prefetchImage(imgMedium);
                  }}
                >
                  <div className="relative aspect-[3/4] bg-zinc-50 overflow-hidden mb-4 border border-zinc-100 transition-all duration-500 group-hover/card:shadow-md">
                    <SmartImage
                      src={imgMedium}
                      lqip={imgSmall}
                      alt={p.name}
                      eager={idx < 8}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
                    />

                    {p.stock_quantity <= 0 ? (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="bg-zinc-900 text-white text-[7px] font-black uppercase tracking-widest px-3 py-2">
                          Sold Out
                        </span>
                      </div>
                    ) : p.stock_quantity <= 3 ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-white/95 text-zinc-900 text-[6px] font-black uppercase tracking-tighter px-2 py-1 border border-zinc-100">
                          Stoc: {p.stock_quantity}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3 px-1">
                    <div className="space-y-1">
                      <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest block truncate">
                        {p.brand_name || "Evem"}
                      </span>
                      <h3 className="text-[10px] font-bold uppercase tracking-tight text-zinc-900 leading-tight group-hover/card:text-zinc-500 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-zinc-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-zinc-950">
                          {finalPrice?.toLocaleString()} RON
                        </span>
                        {isDiscounted && (
                          <p className="text-[6px] text-zinc-400 uppercase font-medium">
                            Min. 30z: {p.sale_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        size={10}
                        className="text-zinc-300 group-hover/card:text-zinc-900 transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="hidden xl:block">
          <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 h-10 w-10 border-zinc-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-900 hover:text-white" />
          <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 h-10 w-10 border-zinc-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-900 hover:text-white" />
        </div>
      </Carousel>
    </section>
  );
};

export default ProductCarousel;
