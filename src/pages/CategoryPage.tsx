import { useState, useEffect, useCallback } from "react";
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

  // Fetch Vouchers Ticker
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
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col overflow-x-hidden selection:bg-zinc-900 selection:text-white relative">
      {/* NAVBAR */}
      <Navbar />

      {/* 
        COMPENSARE PENTRU BARA DE SUS (TOP BAR-UL): 
        Navbar-ul are un spacer intern de 5.5rem (care acoperă meniul alb principal),
        dar a omis bara mov de sus care are h-8 (32px). 
        Acest div adaugă fix acei 32px lipsă ca banner-ul să se lipească impecabil.
      */}
      <div className="h-8 w-full shrink-0" aria-hidden="true" />

      {/* VOUCHER TICKER */}
      <AnimatePresence>
        {vouchers.length > 0 && (
          <section className="w-full bg-[#050505] py-3 md:py-4 border-b border-zinc-900 relative overflow-hidden z-10">
            <div className="flex whitespace-nowrap">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex gap-16 md:gap-48 items-center px-4 md:px-10"
              >
                {[...vouchers, ...vouchers].map((v, idx) => (
                  <div
                    key={`${v.id}-${idx}`}
                    className="flex items-center gap-6 md:gap-10"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[#9bdda2] text-xl md:text-2xl font-black tracking-tighter">
                        {v.discount_value}
                      </span>
                      <span className="text-zinc-500 text-[8px] md:text-[9px] uppercase font-bold tracking-widest">
                        {v.description}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(v.code)}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 md:px-6 md:py-2.5 hover:border-[#9bdda2] transition-all rounded-md"
                    >
                      <span className="text-xs md:text-sm font-mono font-black text-white">
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

      {/* MAIN CONTENT - FULLY RESPONSIVE */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* HEADER SECTION (Title + Actions) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-16 border-b border-zinc-100 pb-8 md:pb-10">
          <div className="text-left w-full md:w-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-950 mb-2 leading-none">
              {filtersData?.category_name || slug?.replace(/-/g, " ")}
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 md:mt-3">
              {products.length} Articole disponibile
            </p>
          </div>

          {/* ACTIONS CONTAINER (Mobile: Side-by-side grid, Desktop: Flex) */}
          <div className="grid grid-cols-2 md:flex md:items-center w-full md:w-auto gap-3 z-40">
            {/* Filter Button - Mobile Only */}
            <div className="lg:hidden w-full">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-zinc-50 transition-colors">
                    <SlidersHorizontal size={14} /> Filtre
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:w-[400px] bg-white border-none p-0 z-[1001]"
                >
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-xl font-black uppercase">
                      Filtre
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-6 h-full overflow-y-auto luxury-scrollbar">
                    {filtersData && <FilterSidebar filtersData={filtersData} />}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* SortDropdown */}
            <div className="w-full">
              <SortDropdown />
            </div>
          </div>
        </div>

        {/* CONTENT (Desktop Sidebar + Product Grid) */}
        <div className="flex gap-8 lg:gap-12 items-start relative">
          {/* DESKTOP SIDEBAR - STICKY POSITIONING */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto luxury-scrollbar pr-6">
            <div className="h-full">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 block text-left">
                Filtrează Colecția
              </span>
              {filtersData && <FilterSidebar filtersData={filtersData} />}
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="flex flex-col gap-12 md:gap-20">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                {/* LOAD MORE BUTTON */}
                <div className="flex flex-col items-center py-12 md:py-20 border-t border-zinc-100">
                  {currentPage < totalPages ? (
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-3 md:gap-4"
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all bg-white shadow-sm">
                        {loadingMore ? (
                          <Loader2 className="animate-spin text-zinc-400" />
                        ) : (
                          <ChevronDown
                            size={20}
                            className="group-hover:translate-y-1 transition-transform"
                          />
                        )}
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black">
                        Afișează mai multe
                      </span>
                    </button>
                  ) : (
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
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

      {/* --- RADIX UI BUG FIXES & STYLING --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* 
          1. FIX PENTRU "SHIFT/FLICKER"
          Aceasta forțează browser-ul să ignore padding-ul pe care Radix 
          îl adaugă pe body când blochează scroll-ul (la deschiderea SortDropdown).
        */
        html {
          scrollbar-gutter: stable;
        }
        body[data-scroll-locked] {
          padding-right: 0px !important;
          margin-right: 0px !important;
        }
        /* Asigurăm că nici header-ul fixed nu se mișcă */
        [data-scroll-locked] .fixed {
          padding-right: 0px !important;
          margin-right: 0px !important;
        }

        /* 2. Z-Index corect pentru meniuri */
        [data-radix-popper-content-wrapper] { 
          z-index: 9999 !important; 
        }
        
        /* 3. SCROLLBAR LUXURY PENTRU SIDEBAR */
        .luxury-scrollbar::-webkit-scrollbar { width: 3px; }
        .luxury-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
        .luxury-scrollbar:hover::-webkit-scrollbar-thumb { background: #d4d4d8; }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
