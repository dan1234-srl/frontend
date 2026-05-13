import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Loader2,
  ChevronDown,
  LayoutGrid,
  ChevronRight,
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

  const currentPage = parseInt(searchParams.get("page") || "1");

  const formatFallbackName = (str: string | undefined) => {
    if (!str) return "";
    return str.replace(/^cat-/, "").replace(/-/g, " ");
  };

  useEffect(() => {
    // Restaurăm fetch-ul pentru vouchere
    fetch(`${API_BASE_URL}/api/v1/vouchers/active-ticker`)
      .then((res) => res.json())
      .then(setVouchers)
      .catch((err) => console.error("Ticker error:", err));

    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree);
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

      {/* RESTAURARE BARA DE REDUCERI (VOUCHER TICKER) */}
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

      <main className="flex-grow w-full max-w-[1700px] mx-auto px-4 md:px-12 py-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-2 mb-10 border-b border-zinc-100 pb-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black leading-tight">
            {filtersData?.category_name || formatFallbackName(slug)}
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {products.length} Articole Disponibile
          </p>
        </div>

        {/* MOBIL: BUTON TOATE + CAROUSEL */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center min-w-[50px] h-[50px] rounded-2xl bg-black text-white shadow-lg">
                <Grid2X2 size={18} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85%] p-0 border-none bg-white"
            >
              <SheetHeader className="p-8 border-b">
                <SheetTitle className="text-xl font-black uppercase tracking-tighter">
                  Colecții
                </SheetTitle>
              </SheetHeader>
              <div className="p-6 h-full overflow-y-auto no-scrollbar">
                <nav className="flex flex-col gap-4">
                  {categoriesTree.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className={`text-xs font-black uppercase tracking-widest ${slug === cat.slug ? "text-black" : "text-zinc-400"}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categoriesTree.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${slug === cat.slug ? "bg-zinc-100 text-black border-zinc-200" : "bg-white text-zinc-400 border-zinc-100"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* FILTRE & SORTARE STICKY */}
        <div className="flex items-center justify-between py-5 mb-10 border-y border-zinc-50 sticky top-[4.5rem] bg-white/95 backdrop-blur-md z-40">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 group">
                <SlidersHorizontal size={14} />
                Filtrează
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[450px] p-0 border-none bg-white shadow-2xl z-[10000]"
            >
              <div className="flex flex-col h-full bg-white">
                <SheetHeader className="p-10 pb-6 border-b border-zinc-50">
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-left">
                    Rafinează
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-10 bg-white luxury-scrollbar">
                  {filtersData && <FilterSidebar filtersData={filtersData} />}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-40 md:w-56">
            <SortDropdown />
          </div>
        </div>

        <div className="flex gap-14 items-start">
          {/* SIDEBAR DESKTOP - LISTARE CLASICA */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-36">
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-6">
                <LayoutGrid size={14} className="text-zinc-300" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Colecții
                </span>
              </div>
              <nav className="flex flex-col gap-2">
                {categoriesTree.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className={`py-2 px-4 rounded-xl text-[12px] font-bold uppercase tracking-tight transition-all ${
                      slug === cat.slug
                        ? "bg-zinc-50 text-black shadow-sm"
                        : "text-zinc-400 hover:text-black hover:bg-zinc-50/50"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* GRID PRODUSE */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="flex flex-col gap-16">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                {currentPage < totalPages && (
                  <div className="flex justify-center pt-10 border-t border-zinc-50">
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                        {loadingMore ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Încarcă Mai Multe
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* FIX PENTRU SHIFT SI FUNDALURI */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        html { scrollbar-gutter: stable !important; }
        body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; overflow: hidden !important; }
        [data-radix-popper-content-wrapper] { z-index: 9999 !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .luxury-scrollbar::-webkit-scrollbar { width: 3px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
