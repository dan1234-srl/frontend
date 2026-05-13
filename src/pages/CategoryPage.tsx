import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Loader2,
  ChevronDown,
  LayoutGrid,
  ChevronRight,
  X,
  Grid2X2,
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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree);

    fetch(`${API_BASE_URL}/api/v1/vouchers/active-ticker`)
      .then((res) => res.json())
      .then(setVouchers);
  }, []);

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
    searchParams.get("brand"),
    searchParams.get("minPrice"),
  ]);

  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden selection:bg-black selection:text-white">
      <Navbar />
      <div className="h-8 w-full shrink-0" />

      {/* VOUCHER TICKER */}
      <AnimatePresence>
        {vouchers.length > 0 && (
          <section className="w-full bg-black py-3 border-b border-zinc-900 relative overflow-hidden z-20">
            <div className="flex whitespace-nowrap">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex gap-24 items-center px-10"
              >
                {[...vouchers, ...vouchers].map((v, idx) => (
                  <div
                    key={`${v.id}-${idx}`}
                    className="flex items-center gap-6"
                  >
                    <span className="text-[#9bdda2] text-lg font-black tracking-tighter">
                      {v.discount_value}
                    </span>
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">
                      {v.code}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      </AnimatePresence>

      <main className="flex-grow w-full max-w-[1700px] mx-auto px-4 md:px-12 py-8 md:py-16">
        {/* HERO TITLE SECTION */}
        <div className="flex flex-col gap-4 mb-10 md:mb-16 border-b border-zinc-100 pb-10">
          <div className="flex items-center gap-3 opacity-40">
            <span className="h-px w-8 bg-black" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Colecția EVEM
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-black leading-[0.85]">
            {filtersData?.category_name || slug?.replace(/-/g, " ")}
          </h1>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">
            {products.length} Articole Premium Disponibile
          </p>
        </div>

        {/* MOBILE CATEGORIES NAVIGATOR */}
        <div className="lg:hidden flex items-center gap-2 mb-10 overflow-hidden">
          {/* Butonul "Toate" care deschide Grid-ul */}
          <button
            onClick={() => setMobileCatsOpen(true)}
            className="flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-2xl bg-zinc-50 border border-zinc-100 text-black"
          >
            <Grid2X2 size={20} />
            <span className="text-[8px] font-black uppercase mt-1">Toate</span>
          </button>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categoriesTree.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`flex flex-col items-center justify-center min-w-[120px] h-[70px] rounded-2xl border transition-all ${
                  slug === cat.slug
                    ? "bg-black text-white border-black shadow-lg"
                    : "bg-white text-zinc-500 border-zinc-100"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-tight text-center px-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ACTIONS BAR - Rafinează + Sortare */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 py-6 border-y border-zinc-100 bg-white sticky top-[4.5rem] z-40">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <button className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-black">
                  <div className="p-3 bg-zinc-50 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                    <SlidersHorizontal size={16} />
                  </div>
                  Rafinează Selecția
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[480px] p-0 border-none bg-white/95 backdrop-blur-xl shadow-[-20px_0_80px_rgba(0,0,0,0.1)] z-[10000]"
              >
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-10 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-3xl font-black uppercase tracking-tighter">
                        Filtre
                      </SheetTitle>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                      Ajustează parametrii de căutare
                    </p>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-10 luxury-scrollbar bg-white">
                    {filtersData && <FilterSidebar filtersData={filtersData} />}
                  </div>

                  <div className="p-8 border-t border-zinc-100 bg-white grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSearchParams({})}
                      className="py-5 text-[10px] font-black uppercase tracking-widest border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all"
                    >
                      Resetează
                    </button>
                    <SheetTrigger asChild>
                      <button className="py-5 text-[10px] font-black uppercase tracking-widest bg-black text-white rounded-full hover:bg-zinc-800 transition-all shadow-xl">
                        Aplică Filtre
                      </button>
                    </SheetTrigger>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full md:w-64">
            <SortDropdown />
          </div>
        </div>

        <div className="flex gap-16 items-start">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-[300px] shrink-0 sticky top-48">
            <div className="space-y-12">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 flex items-center gap-3">
                  <LayoutGrid size={14} /> Colecții EVEM
                </h4>
                <nav className="flex flex-col gap-2">
                  {categoriesTree.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className={`group flex items-center justify-between py-3 px-5 rounded-2xl transition-all duration-500 ${
                        slug === cat.slug
                          ? "bg-zinc-50 text-black shadow-sm"
                          : "text-zinc-400 hover:text-black hover:bg-zinc-50/50"
                      }`}
                    >
                      <span className="text-[13px] font-bold uppercase tracking-tight">
                        {cat.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className={`${slug === cat.slug ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"} transition-all`}
                      />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="flex flex-col gap-20">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                {currentPage < totalPages && (
                  <div className="flex flex-col items-center py-20 border-t border-zinc-100">
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-6"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-zinc-100 flex items-center justify-center group-hover:border-black transition-all duration-700 bg-white">
                        {loadingMore ? (
                          <Loader2 className="animate-spin" size={24} />
                        ) : (
                          <ChevronDown size={24} />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-black transition-colors">
                        Descoperă mai multe
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE ALL CATEGORIES MODAL */}
      <AnimatePresence>
        {mobileCatsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Toate Colecțiile
              </h2>
              <button
                onClick={() => setMobileCatsOpen(false)}
                className="p-3 bg-zinc-50 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto luxury-scrollbar">
              {categoriesTree.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileCatsOpen(false)}
                  className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 text-center flex flex-col items-center gap-3 active:scale-95 transition-all"
                >
                  <span className="text-xs font-black uppercase tracking-tight leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        html { scrollbar-gutter: stable !important; }
        body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; }
        .luxury-scrollbar::-webkit-scrollbar { width: 2px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #000; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
