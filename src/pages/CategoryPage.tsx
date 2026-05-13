import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Loader2,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  ChevronRight,
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
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col overflow-x-hidden selection:bg-zinc-900 selection:text-white">
      <Navbar />

      {/* Compensare Top Bar */}
      <div className="h-8 w-full shrink-0" />

      {/* VOUCHER TICKER */}
      <AnimatePresence>
        {vouchers.length > 0 && (
          <section className="w-full bg-[#050505] py-3 border-b border-zinc-900 relative overflow-hidden z-20">
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
                    <span className="text-[#9bdda2] text-xl font-black">
                      {v.discount_value}
                    </span>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                      {v.code}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      </AnimatePresence>

      <main className="flex-grow w-full max-w-[1650px] mx-auto px-4 md:px-12 py-8 md:py-14">
        {/* TITLU SI INFO */}
        <div className="flex flex-col gap-2 mb-8 md:mb-12">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-zinc-950 leading-none">
            {filtersData?.category_name || formatFallbackName(slug)}
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
            {products.length} Articole disponibile în această colecție
          </p>
        </div>

        {/* CATEGORII PE MOBIL - Navigare orizontală cursivă */}
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar flex gap-2 mb-8 pb-2">
          {categoriesTree.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
                slug === cat.slug
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                  : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* ACTIONS BAR: Rafinează + Sortare */}
        <div className="flex items-center justify-between gap-4 mb-12 py-4 border-y border-zinc-100">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-zinc-500 transition-colors">
                  <SlidersHorizontal size={14} /> Rafinează Căutarea
                </button>
              </SheetTrigger>
              {/* FIX: Bg white forțat și Z-index mare */}
              <SheetContent
                side="right"
                className="w-full sm:w-[450px] p-0 border-none bg-white shadow-2xl z-[10000]"
              >
                <SheetHeader className="p-8 border-b bg-zinc-50/50">
                  <SheetTitle className="text-2xl font-black uppercase tracking-tighter">
                    Parametri Filtrare
                  </SheetTitle>
                </SheetHeader>
                <div className="p-8 h-[calc(100vh-120px)] overflow-y-auto luxury-scrollbar bg-white">
                  {filtersData && <FilterSidebar filtersData={filtersData} />}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Ordonează după:
            </span>
            <div className="w-44 md:w-56">
              <SortDropdown />
            </div>
          </div>
        </div>

        <div className="flex gap-16 items-start">
          {/* SIDEBAR STÂNGA: Desktop Only */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-36">
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <LayoutGrid size={14} className="text-zinc-950" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-950">
                    Toate Colecțiile
                  </span>
                </div>
                <nav className="flex flex-col gap-1.5">
                  {categoriesTree.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className={`group flex items-center justify-between py-2.5 px-4 rounded-xl transition-all duration-300 ${
                        slug === cat.slug
                          ? "bg-zinc-100 text-zinc-950"
                          : "text-zinc-400 hover:text-zinc-950 hover:translate-x-1"
                      }`}
                    >
                      <span className="text-[13px] font-bold uppercase tracking-tight">
                        {cat.name}
                      </span>
                      <ChevronRight
                        size={12}
                        className={`transition-opacity ${slug === cat.slug ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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
              <ProductGridSkeleton count={9} />
            ) : (
              <div className="flex flex-col gap-20">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                {currentPage < totalPages && (
                  <div className="flex justify-center pt-16 border-t border-zinc-100">
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950 transition-all duration-500 bg-white">
                        {loadingMore ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 transition-colors">
                        Explorează mai multe articole
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

      {/* --- FIXES FOR SHIFT, TRANSPARENCY & SCROLLBAR --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Prevenire layout shift la deschiderea modalelor */
        html {
          scrollbar-gutter: stable !important;
        }
        
        body[data-scroll-locked] {
          padding-right: 0px !important;
          margin-right: 0px !important;
          overflow: hidden !important;
        }

        /* Fundal forțat alb pentru Radix Sheet */
        [data-radix-collection-item] { background-color: white !important; }
        
        /* Scrollbar subtil */
        .luxury-scrollbar::-webkit-scrollbar { width: 3px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
