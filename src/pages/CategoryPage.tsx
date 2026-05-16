import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Loader2,
  ChevronDown,
  LayoutGrid,
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
    fetch(`${API_BASE_URL}/api/v1/vouchers/active-ticker`)
      .then((res) => res.json())
      .then(setVouchers);
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
    if (!slug) return;
    fetch(`${API_BASE_URL}/api/v1/products/filters/${slug}`)
      .then((res) => res.json())
      .then(setFiltersData);
  }, [slug]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [
    slug,
    searchParams.get("sort"),
    searchParams.get("brand"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.toString(),
  ]);

  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden selection:bg-[var(--royal-violet)] selection:text-white font-sans antialiased">
      <Navbar />

      <div className="h-8 md:h-12 w-full shrink-0" />

      <AnimatePresence>
        {vouchers.length > 0 && (
          <section className="w-full bg-zinc-950 py-3 border-b border-zinc-900 relative overflow-hidden z-20">
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
                    <span className="text-[#9bdda2] text-sm font-black tracking-wide">
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

      <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 md:px-12 py-8 md:py-14">
        <div className="mb-10 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none mb-3">
            {filtersData?.category_name || formatFallbackName(slug)}
          </h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            {products.length} Articole Disponibile
          </p>
        </div>

        {/* NAVIGARE MOBIL */}
        <div className="lg:hidden flex items-center gap-2 mb-8 sticky top-20 z-30 bg-white/95 py-2 backdrop-blur-sm">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center min-w-[50px] h-[50px] rounded-2xl bg-zinc-950 text-white shadow-lg shrink-0 active:scale-95 transition-transform">
                <Grid2X2 size={18} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85%] max-w-[360px] p-0 border-none bg-white z-[10001] shadow-2xl flex flex-col h-full"
            >
              <SheetHeader className="p-8 border-b border-zinc-100 shrink-0">
                <SheetTitle className="text-xl font-black uppercase tracking-tighter text-left text-[var(--dark-amethyst)]">
                  Colecții
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-8 luxury-scrollbar">
                <nav className="flex flex-col gap-5">
                  {categoriesTree.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`text-xs font-black uppercase tracking-widest block transition-colors ${slug === cat.slug ? "text-[var(--royal-violet)]" : "text-zinc-400 hover:text-black"}`}
                      >
                        {cat.name}
                      </Link>
                      {cat.subcategories?.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          className={`block pl-4 text-[10px] font-bold uppercase transition-colors ${slug === sub.slug ? "text-[var(--royal-violet)] font-black" : "text-zinc-300 hover:text-zinc-600"}`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
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
                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${slug === cat.slug ? "bg-zinc-100 text-black border-zinc-200 shadow-sm" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ACTIONS BAR - FILTRARE MODERNA */}
        <div className="flex items-center justify-between py-5 mb-12 border-y border-zinc-100 sticky top-[4.5rem] bg-white/95 backdrop-blur-md z-40">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 group">
                <div className="p-2.5 bg-zinc-50 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 shadow-sm">
                  <SlidersHorizontal size={14} />
                </div>
                Rafinează Portofoliul
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full sm:w-[460px] p-0 border-none bg-white z-[10001] flex flex-col h-full"
            >
              <div className="flex flex-col h-full bg-white relative z-50">
                <SheetHeader className="p-8 border-b border-zinc-100 bg-white shrink-0">
                  <div className="flex items-center gap-2 opacity-40 mb-1">
                    <span className="h-[1px] w-4 bg-[var(--royal-violet)]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                      Selection
                    </span>
                  </div>
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-left text-[var(--dark-amethyst)]">
                    Parametri Filtrare
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8 bg-white luxury-scrollbar">
                  {filtersData &&
                  filtersData.brands &&
                  filtersData.attributes ? (
                    <FilterSidebar filtersData={filtersData} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                      <Loader2
                        className="animate-spin text-[var(--royal-violet)]"
                        size={28}
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Se încarcă parametrii...
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t border-zinc-100 bg-white grid grid-cols-2 gap-4 shrink-0">
                  <button
                    onClick={() => setSearchParams({})}
                    className="py-4 text-[10px] font-black uppercase border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-300"
                  >
                    Resetare
                  </button>
                  <SheetTrigger asChild>
                    <button className="py-4 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-[var(--royal-violet)] transition-all duration-300 active:scale-98">
                      Aplică Filtrele
                    </button>
                  </SheetTrigger>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-44 md:w-60">
            <SortDropdown />
          </div>
        </div>

        {/* CONTAINER CONȚINUT */}
        <div className="flex gap-12 items-start">
          <aside className="hidden lg:block w-[250px] shrink-0 sticky top-44">
            <div className="flex items-center gap-2 mb-6 pl-2">
              <LayoutGrid size={13} className="text-[var(--royal-violet)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--royal-violet)]">
                Navigare Structură
              </span>
            </div>
            <nav className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto luxury-scrollbar pr-3">
              {categoriesTree.map((cat) => {
                const isParentActive =
                  slug === cat.slug ||
                  cat.subcategories?.some((s: any) => s.slug === slug);
                return (
                  <div key={cat.id} className="flex flex-col gap-1">
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all duration-300 ${isParentActive ? "bg-zinc-50 text-[var(--royal-violet)] font-black shadow-sm" : "text-zinc-400 hover:text-black hover:bg-zinc-50/50"}`}
                    >
                      {cat.name}
                    </Link>
                    {isParentActive && cat.subcategories?.length > 0 && (
                      <div className="flex flex-col gap-1 ml-5 border-l border-zinc-100 pl-4 py-1.5 space-y-1">
                        {cat.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${slug === sub.slug ? "text-[var(--royal-violet)] font-black" : "text-zinc-300 hover:text-zinc-700"}`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <div className="w-full">
                <ProductGridSkeleton count={10} />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-40 border border-zinc-100 rounded-[2rem] bg-zinc-50/30 flex flex-col items-center justify-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                  Niciun rezultat găsit
                </span>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  Încearcă să resetezi parametrii selectați din panou.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-16">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>
                {currentPage < totalPages && (
                  <div className="flex justify-center pt-12 border-t border-zinc-100">
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="flex flex-col items-center gap-3 group transition-transform active:scale-95"
                    >
                      <div className="w-14 h-14 rounded-full border border-zinc-100 bg-white flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 shadow-sm">
                        {loadingMore ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="group-hover:translate-y-0.5 transition-transform"
                          />
                        )}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">
                        Încarcă Mai Multe Articole
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

      {/* 🚀 ARHITECTURĂ BLUR COMPLETĂ - STILIZARE HIGH-END CONFORM TRIPLEBYTE HIRE */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Suprascrierea containerului Radix pentru a asigura prioritatea overlay-ului */
        [data-radix-focus-guard] + [role="dialog"] { z-index: 10001 !important; }
        
        /* Efect Milky Blur curat peste TOT ecranul din spatele sidebarului (Fără nuanțe închise de negru) */
        div[data-state="open"] > .fixed.inset-0 { 
          z-index: 10000 !important; 
          backdrop-filter: blur(14px) cubic-bezier(0.16, 1, 0.3, 1) !important;
          background-color: rgba(255, 255, 255, 0.45) !important;
          animation: milkyFadeIn 0.5s ease forward;
        }

        @keyframes milkyFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        html { scrollbar-gutter: stable !important; }
        body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; overflow: hidden !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
