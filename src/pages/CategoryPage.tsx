import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Loader2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import { FilterSidebar } from "../components/shop/FilterSidebar";
import { SortDropdown } from "../components/shop/SortDropdown";
import { ProductCard } from "../components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch Vouchere Ticker
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/vouchers/active-ticker`)
      .then((res) => res.json())
      .then(setVouchers)
      .catch((err) => console.error("Ticker fetch error:", err));
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Cod ${code} copiat!`, {
      style: { background: "#000", color: "#fff" },
      icon: <Sparkles className="text-[#9bdda2]" size={16} />,
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        params.set("category_slug", slug || "");
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/filter?${params.toString()}`,
        );
        const data = await res.json();
        setProducts((prev) =>
          append ? [...prev, ...(data.items || [])] : data.items || [],
        );
        setTotalPages(data.pages || 1);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug, searchParams],
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/products/filters/${slug}`)
      .then((res) => res.json())
      .then(setFiltersData);
    fetchProducts(1, false);
    if (currentPage === 1) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [
    slug,
    searchParams.get("sort"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
  ]);

  return (
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col overflow-x-hidden selection:bg-zinc-900 selection:text-white">
      <Navbar />

      {/* 1. FIX SUPRAPUNERE: Margin top pentru a lăsa loc Navbar-ului fixed */}
      <div className="mt-[5.5rem] lg:mt-[6.5rem]">
        <AnimatePresence>
          {vouchers.length > 0 && (
            <section className="w-full bg-[#050505] py-4 border-b border-zinc-900 relative overflow-hidden z-40">
              <div className="flex whitespace-nowrap">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex gap-24 md:gap-48 items-center px-10"
                >
                  {[...vouchers, ...vouchers].map((v, idx) => (
                    <div
                      key={`${v.id}-${idx}`}
                      className="flex items-center gap-10"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-[#9bdda2] text-2xl font-black tracking-tighter">
                          {v.discount_value}
                        </span>
                        <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest">
                          {v.description}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(v.code)}
                        className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2.5 hover:border-[#9bdda2] transition-all rounded-sm"
                      >
                        <span className="text-sm font-mono font-black text-white">
                          {v.code}
                        </span>
                        {copiedCode === v.code ? (
                          <Check size={14} className="text-[#9bdda2]" />
                        ) : (
                          <Copy size={14} className="text-zinc-500" />
                        )}
                      </button>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-grow w-full max-w-[90%] 2xl:max-w-[1400px] mx-auto py-12">
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-zinc-100 pb-10">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-950 mb-2">
              {filtersData?.category_name || slug?.replace(/-/g, " ")}
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {products.length} Articole disponibile
            </p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="lg:hidden flex-1">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full h-12 flex items-center justify-center gap-3 border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest">
                    <SlidersHorizontal size={14} /> Filtre
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full bg-white border-none p-0 z-[1001]"
                >
                  <SheetHeader className="p-8 border-b">
                    <SheetTitle className="text-2xl font-black uppercase">
                      Filtre
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-8 h-full overflow-y-auto">
                    {filtersData && <FilterSidebar filtersData={filtersData} />}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* SortDropdown fix: Container solid pentru a preveni flick-ul și transparența */}
            <div className="relative min-w-[180px] bg-white rounded-md shadow-sm border border-zinc-100">
              <SortDropdown />
            </div>
          </div>
        </div>

        <div className="flex gap-16 items-start relative">
          {/* 2. FIX STICKY: Sidebar-ul rămâne fix în stânga în timpul scroll-ului */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-32 self-start max-h-[calc(100vh-10rem)] overflow-y-auto pr-6 luxury-scrollbar">
            <div className="h-full">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 block text-left">
                Filtrează Colecția
              </span>
              {filtersData && <FilterSidebar filtersData={filtersData} />}
            </div>
          </aside>

          {/* GRID PRODUSE */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="flex flex-col gap-20">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                {/* LOAD MORE */}
                <div className="flex flex-col items-center py-20 border-t border-zinc-100">
                  {currentPage < totalPages ? (
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all bg-white shadow-sm">
                        {loadingMore ? (
                          <Loader2 className="animate-spin text-zinc-400" />
                        ) : (
                          <ChevronDown
                            size={24}
                            className="group-hover:translate-y-1 transition-transform"
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black">
                        Afișează mai multe
                      </span>
                    </button>
                  ) : (
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
                      Colecție completă
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Global CSS fixes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Asigură că dropdown-ul de sortare (Radix) este deasupra oricărui element și are fundal alb */
        [data-radix-popper-content-wrapper] { 
          z-index: 9999 !important; 
        }
        
        .luxury-scrollbar::-webkit-scrollbar { 
          width: 3px; 
        }
        .luxury-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb { 
          background: #eee; 
          border-radius: 10px;
        }
        .luxury-scrollbar:hover::-webkit-scrollbar-thumb { 
          background: #ddd; 
        }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
