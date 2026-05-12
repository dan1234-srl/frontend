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

      {/* FIX SPACER: Acest div goale impinge conținutul exact cât înălțimea Navbar-ului fixed (5.5rem = 88px) */}
      <div className="pt-[88px]" aria-hidden="true" />

      <AnimatePresence>
        {vouchers.length > 0 && (
          <section className="w-full bg-[#050505] py-3 md:py-4 border-b border-zinc-900 relative overflow-hidden z-30">
            <div className="flex whitespace-nowrap">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex gap-16 md:gap-48 items-center px-6 md:px-10"
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

      <main className="flex-grow w-full max-w-[92%] 2xl:max-w-[1400px] mx-auto py-8 md:py-12">
        {/* HEADER SECTION (Titlu + Acțiuni) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-16 border-b border-zinc-100 pb-8 md:pb-10">
          <div className="text-left w-full md:w-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-950 mb-2 leading-none">
              {filtersData?.category_name || slug?.replace(/-/g, " ")}
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-3">
              {products.length} Articole disponibile
            </p>
          </div>

          {/* BUTOANE FILTRE (MOBIL) SI SORTARE */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4 z-40">
            {/* Buton Filtre - Doar pe mobil */}
            <div className="lg:hidden flex-1">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-zinc-50 transition-colors">
                    <SlidersHorizontal size={14} /> Filtre
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full bg-white border-none p-0 z-[1001]"
                >
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-xl font-black uppercase">
                      Filtre
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-6 h-full overflow-y-auto">
                    {filtersData && <FilterSidebar filtersData={filtersData} />}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* SortDropdown container */}
            <div className="flex-1 md:flex-none">
              <SortDropdown />
            </div>
          </div>
        </div>

        {/* CONTENT (Sidebar Desktop + Grid Produse) */}
        <div className="flex gap-12 items-start relative">
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-6 luxury-scrollbar">
            <div className="h-full">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 block text-left">
                Filtrează Colecția
              </span>
              {filtersData && <FilterSidebar filtersData={filtersData} />}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="flex flex-col gap-16">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                <div className="flex flex-col items-center py-16 border-t border-zinc-100">
                  {currentPage < totalPages ? (
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all bg-white shadow-sm">
                        {loadingMore ? (
                          <Loader2 className="animate-spin text-zinc-400" />
                        ) : (
                          <ChevronDown
                            size={20}
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Forțăm popover-ul să fie deasupra și să nu cauzeze shift la layout */
        [data-radix-popper-content-wrapper] { 
          z-index: 9999 !important; 
          width: 220px !important;
        }
        
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
