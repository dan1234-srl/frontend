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

      <div className="h-8 md:h-12 w-full shrink-0" />

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
                    <span className="text-[#9bdda2] text-lg font-black">
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

      <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 md:px-10 py-6 md:py-10">
        {/* HEADER SECTION */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black leading-tight mb-2">
            {filtersData?.category_name || slug?.replace(/-/g, " ")}
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {products.length} Articole Disponibile
          </p>
        </div>

        {/* NAVIGARE MOBIL */}
        <div className="lg:hidden flex items-center gap-2 mb-8 sticky top-20 z-30 bg-white/95 py-2 backdrop-blur-sm">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center min-w-[50px] h-[50px] rounded-2xl bg-black text-white shadow-lg shrink-0">
                <Grid2X2 size={18} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85%] p-0 border-none bg-white"
            >
              <SheetHeader className="p-8 border-b">
                <SheetTitle className="text-xl font-black uppercase tracking-tighter text-left">
                  Colecții
                </SheetTitle>
              </SheetHeader>
              <div className="p-6 h-full overflow-y-auto no-scrollbar">
                <nav className="flex flex-col gap-4">
                  {categoriesTree.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`text-xs font-black uppercase tracking-widest ${slug === cat.slug ? "text-black" : "text-zinc-400"}`}
                      >
                        {cat.name}
                      </Link>
                      {cat.subcategories?.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          className={`block pl-4 text-[10px] font-bold uppercase ${slug === sub.slug ? "text-black" : "text-zinc-300"}`}
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
                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${slug === cat.slug ? "bg-zinc-100 text-black border-zinc-200" : "bg-white text-zinc-400 border-zinc-100"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ACTIONS BAR */}
        <div className="flex items-center justify-between py-5 mb-10 border-y border-zinc-50 sticky top-[4.5rem] bg-white/95 backdrop-blur-md z-40">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                <SlidersHorizontal size={14} /> Filtrează
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[450px] p-0 border-none bg-white shadow-2xl z-[10000]"
            >
              <div className="flex flex-col h-full bg-white">
                <SheetHeader className="p-8 border-b">
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

        <div className="flex gap-8 items-start">
          {/* SIDEBAR DESKTOP */}
          <aside className="hidden lg:block w-[240px] shrink-0 sticky top-40">
            <div className="flex items-center gap-2 mb-6">
              <LayoutGrid size={14} className="text-zinc-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Navigare
              </span>
            </div>
            <nav className="flex flex-col gap-1 max-h-[450px] overflow-y-auto luxury-scrollbar pr-2">
              {categoriesTree.map((cat) => {
                const isParentActive =
                  slug === cat.slug ||
                  cat.subcategories?.some((s: any) => s.slug === slug);
                return (
                  <div key={cat.id} className="flex flex-col gap-1">
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`py-2 px-4 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all ${isParentActive ? "bg-zinc-50 text-black" : "text-zinc-400 hover:text-black"}`}
                    >
                      {cat.name}
                    </Link>
                    {isParentActive && cat.subcategories?.length > 0 && (
                      <div className="flex flex-col gap-1 ml-4 border-l border-zinc-100 pl-3 py-1">
                        {cat.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className={`py-1.5 text-[10px] font-bold uppercase tracking-tight ${slug === sub.slug ? "text-black" : "text-zinc-300 hover:text-black"}`}
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

          {/* PRODUCT GRID - ACTUALIZAT LA 5 COLOANE PE XL */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={10} />
            ) : (
              <div className="flex flex-col gap-16">
                {/* 
                  xl:grid-cols-5 asigură 5 produse pe rând pe ecrane mari.
                  gap-x-4 a fost redus puțin pentru a compensa lățimea mai mică a cardurilor.
                */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
        html { scrollbar-gutter: stable !important; }
        body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; overflow: hidden !important; }
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
