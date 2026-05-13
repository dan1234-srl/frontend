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
  const [filtersData, setFiltersData] = useState<any>(null);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
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
    <div className="bg-white min-h-screen flex flex-col selection:bg-zinc-900 selection:text-white">
      <Navbar />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 md:py-10">
        {/* TITLU - Minimalist & Elegant */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 mb-2 opacity-30">
            <span className="h-[1px] w-4 bg-black" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">
              Selection
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            {filtersData?.category_name || slug?.replace(/-/g, " ")}
          </h1>
        </div>

        {/* NAVIGARE MOBIL - Drawer Categorii */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center min-w-[50px] h-[50px] rounded-full border border-zinc-100 bg-white shadow-sm">
                <Grid2X2 size={18} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85%] p-0 border-none bg-white"
            >
              <SheetHeader className="p-8 border-b border-zinc-50">
                <SheetTitle className="text-xl font-black uppercase tracking-tighter">
                  Colecții
                </SheetTitle>
              </SheetHeader>
              <div className="p-6 h-full overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-6">
                  {categoriesTree.map((cat) => (
                    <div key={cat.id} className="space-y-4">
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`text-sm font-black uppercase tracking-widest ${slug === cat.slug ? "text-black" : "text-zinc-400"}`}
                      >
                        {cat.name}
                      </Link>
                      <div className="flex flex-col gap-3 pl-4 border-l border-zinc-100">
                        {cat.subcategories?.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className={`text-[11px] font-bold uppercase tracking-tight ${slug === sub.slug ? "text-black" : "text-zinc-400"}`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categoriesTree.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${slug === cat.slug ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-zinc-100"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* FILTRE & SORTARE - Float Bar */}
        <div className="flex items-center justify-between py-6 mb-10 border-y border-zinc-50 sticky top-[4.5rem] bg-white/80 backdrop-blur-md z-30">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 group">
                <SlidersHorizontal
                  size={14}
                  className="transition-transform group-hover:rotate-180"
                />
                Filtrăre
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[450px] p-0 border-none bg-white shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <SheetHeader className="p-10 pb-6">
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter">
                    Rafinează
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-10 pt-0 luxury-scrollbar">
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
          {/* SIDEBAR DESKTOP - Recursive Navigation */}
          <aside className="hidden lg:block w-[240px] shrink-0 sticky top-36">
            <nav className="flex flex-col gap-8">
              {categoriesTree.map((cat) => {
                const isActive =
                  slug === cat.slug ||
                  cat.subcategories?.some((s: any) => s.slug === slug);
                return (
                  <div key={cat.id} className="space-y-4">
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`text-[11px] font-black uppercase tracking-[0.3em] block transition-colors ${isActive ? "text-black" : "text-zinc-300 hover:text-black"}`}
                    >
                      {cat.name}
                    </Link>
                    {isActive && cat.subcategories?.length > 0 && (
                      <div className="flex flex-col gap-3 pl-3 border-l border-zinc-100">
                        {cat.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${slug === sub.slug ? "text-black" : "text-zinc-400 hover:text-black"}`}
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

          {/* GRID PRODUSE */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="flex flex-col gap-16">
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
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
                        Load More
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
    </div>
  );
};

export default CategoryPage;
