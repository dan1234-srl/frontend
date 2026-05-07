import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Info, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { prefetchProduct, prefetchImage } from "@/lib/prefetch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface ProductCarouselProps {
  categorySlug?: string;
  title?: string;
  subtitle?: string;
}

const ProductCarousel = ({
  categorySlug,
  title,
  subtitle,
}: ProductCarouselProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarouselProducts = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/api/v1/products/?limit=12${
          categorySlug ? `&category_slug=${categorySlug}` : ""
        }`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        // Conform structurii tale de API (image_be6080.png), datele sunt în data.items
        const productList = data.items || (Array.isArray(data) ? data : []);
        setProducts(productList);
      } catch (err) {
        console.error("Carousel fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselProducts();
  }, [categorySlug]);

  /**
   * Helper pentru extragerea URL-ului din structura complexă (AWS S3)
   * Navighează prin image_url -> main -> medium
   */
  const getImageUrl = (p: any) => {
    const imgData = p.image_url;
    if (!imgData) return "/placeholder.png";

    // Dacă este obiect (JSONB), căutăm în sub-structura .main conform Preview-ului tău
    if (typeof imgData === "object") {
      const main = imgData.main;
      return main?.medium || main?.large || main?.small || "/placeholder.png";
    }

    // Fallback dacă este deja string
    return imgData;
  };

  if (loading) {
    return (
      <section className="w-full py-24 px-6 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="w-full py-24 px-6 max-w-[1800px] mx-auto overflow-hidden text-left">
      {/* HEADER CARUSEL - Design Arhitectural */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 block">
            {subtitle || "Precision Engineering"}
          </span>
          <h2 className="heading-serif text-4xl md:text-5xl text-zinc-900 leading-tight">
            {title || (
              <>
                Sisteme{" "}
                <span className="italic font-light text-zinc-500">Curate</span>
              </>
            )}
          </h2>
        </div>

        <Link
          to="/shop"
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:text-zinc-500 transition-colors"
        >
          Vezi Toată Colecția
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        className="w-full relative group px-0"
      >
        <CarouselContent className="-ml-6">
          {products.map((p, idx) => {
            const imgMedium = getImageUrl(p);
            const imgSmall = p.image_url?.main?.small;
            const lowPrice = p.lowest_price_30d || 0;

            return (
              <CarouselItem
                key={p.id || p.sku}
                className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link
                    to={`/product/${p.sku}`}
                    className="block group/card text-left"
                    onMouseEnter={() => {
                      prefetchProduct(p.sku);
                      if (imgMedium) prefetchImage(imgMedium);
                    }}
                  >
                    {/* Media Container - Shadow & Scale Effect */}
                    <div className="relative aspect-[3/4] bg-zinc-50 overflow-hidden mb-6 border border-zinc-100 transition-all duration-700 ease-luxury group-hover/card:shadow-luxe">
                      <SmartImage
                        src={imgMedium}
                        lqip={imgSmall}
                        alt={p.name}
                        eager={idx < 2}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2000ms] ease-luxury group-hover/card:scale-110"
                      />

                      {/* Stock Badges */}
                      {p.stock_quantity <= 0 ? (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                          <span className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-[0.3em] px-5 py-3">
                            Sold Out
                          </span>
                        </div>
                      ) : p.stock_quantity <= 3 ? (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-[7px] font-black uppercase tracking-widest px-3 py-1.5 border border-zinc-100 shadow-sm">
                            Limitat: {p.stock_quantity} piese
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Content Container */}
                    <div className="space-y-5 px-1 text-left">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                            {p.brand_name || "Linea Atelier"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star
                              size={8}
                              fill="currentColor"
                              className="text-zinc-900"
                            />
                            <span className="text-[8px] font-bold text-zinc-900">
                              {p.rating_avg || "5.0"}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 leading-tight group-hover/card:text-zinc-500 transition-colors line-clamp-2 min-h-[32px]">
                          {p.name}
                        </h3>

                        <p className="text-[8px] font-medium text-zinc-400 uppercase tracking-tighter">
                          Marine Grade Steel & Technical Fabric
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-zinc-950">
                            {p.price.toLocaleString()} RON
                          </span>

                          {/* REPARARE "0": Afișăm prețul minim doar dacă este valid (>0) și diferit de prețul actual */}
                          {lowPrice > 0 && lowPrice !== p.price && (
                            <div className="flex items-center gap-1 text-zinc-400">
                              <Info size={8} />
                              <p className="text-[7px] uppercase font-medium">
                                Min. 30z: {lowPrice.toLocaleString()} RON
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="size-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover/card:bg-zinc-900 group-hover/card:text-white transition-all duration-500">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* SAGETI NAVIGARE - Vizibile permanent pe Desktop (-left-12 pentru a nu acoperi pozele) */}
        <div className="hidden lg:block">
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm opacity-100 hover:bg-zinc-900 hover:text-white transition-all" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm opacity-100 hover:bg-zinc-900 hover:text-white transition-all" />
        </div>
      </Carousel>
    </section>
  );
};

export default ProductCarousel;
