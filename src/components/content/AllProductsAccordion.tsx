import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { prefetchProduct, prefetchImage } from "@/lib/prefetch";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://linea-backend-production.up.railway.app";

const PAGE = 24;

const getImg = (p: any) => {
  const d = p.image_url;
  if (!d) return "/placeholder.png";
  if (typeof d === "object")
    return d.main?.medium || d.main?.large || d.main?.small || "/placeholder.png";
  return d;
};

const AllProductsAccordion = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/?page=${page}&limit=${PAGE}`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (cancel) return;
        const list = data.items || (Array.isArray(data) ? data : []);
        setPages(data.pages || 1);
        setItems((prev) => (page === 1 ? list : [...prev, ...list]));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [open, page]);

  // Infinite scroll
  useEffect(() => {
    if (!open || !sentinel.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < pages) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [open, loading, page, pages]);

  return (
    <section className="w-full px-4 md:px-10 max-w-[1920px] mx-auto pb-16">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full group flex items-center justify-between px-6 md:px-10 py-8 border-y border-zinc-200 hover:border-zinc-900 transition-all bg-white"
        aria-expanded={open}
      >
        <div className="text-left">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-2">
            Întregul Catalog
          </span>
          <h2 className="heading-serif text-2xl md:text-4xl text-zinc-900">
            Toate produsele{" "}
            <span className="italic font-light text-zinc-500">EVEM</span>
          </h2>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="size-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="grid"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {items.map((p, idx) => {
                const img = getImg(p);
                const small = p.image_url?.main?.small;
                return (
                  <Link
                    key={p.id || p.sku || idx}
                    to={`/product/${p.sku}`}
                    onMouseEnter={() => {
                      prefetchProduct(p.sku);
                      if (img) prefetchImage(img);
                    }}
                    className="group/card text-left block"
                  >
                    <div className="relative aspect-[3/4] bg-zinc-50 overflow-hidden mb-3 border border-zinc-100">
                      <SmartImage
                        src={img}
                        lqip={small}
                        alt={p.name}
                        eager={idx < 8}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
                      />
                    </div>
                    <div className="space-y-1 px-1">
                      <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest block truncate">
                        {p.brand_name || "Evem"}
                      </span>
                      <h3 className="text-[10px] font-bold uppercase tracking-tight text-zinc-900 line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] font-black text-zinc-950">
                          {p.price?.toLocaleString()} RON
                        </span>
                        <ArrowRight
                          size={10}
                          className="text-zinc-300 group-hover/card:text-zinc-900 transition-colors"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
              {loading &&
                [...Array(8)].map((_, i) => <ProductCardSkeleton key={`s${i}`} />)}
            </div>
            <div ref={sentinel} className="h-10" />
            {page >= pages && items.length > 0 && (
              <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 py-10">
                — Ai văzut tot catalogul —
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AllProductsAccordion;
