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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [
    slug,
    searchParams.get("sort"),
    searchParams.get("brand"),
    searchParams.get("minPrice"),
  ]);

  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* SPAȚIERE CORECTĂ - Redusă conform imaginii tale */}
      <div className="h-4 w-full" />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* HEADER SECTION - Revenire la dimensiuni normale */}
        <div className="flex flex-col gap-2 mb-8 md:mb-12 border-b border-zinc-100 pb-8">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-zinc-300" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Colecția EVEM
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black leading-tight">
            {filtersData?.category_name || slug?.replace(/-/g, " ")}
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {products.length} Articole Disponibile
          </p>
        </div>

        {/* ACTIONS BAR - Mai compactă */}
        <div className="flex items-center justify-between gap-4 mb-8 py-4 border-y border-zinc-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-black transition-colors">
                <SlidersHorizontal size={14} /> Rafinează Selecția
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[400px] p-0 border-none bg-white shadow-2xl z-[10000]"
            >
              <div className="flex flex-col h-full bg-white">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="text-xl font-black uppercase tracking-tighter">
                    Filtre
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-6 bg-white luxury-scrollbar">
                  {filtersData && <FilterSidebar filtersData={filtersData} />}
                </div>
                <div className="p-6 border-t bg-zinc-50">
                  <SheetTrigger asChild>
                    <button className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">
                      Vezi Rezultatele
                    </button>
                  </SheetTrigger>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-44 md:w-56">
            <SortDropdown />
          </div>
        </div>

        <div className="flex gap-10 lg:gap-14 items-start">
          {/* SIDEBAR CU SUBCATEGORII */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-28">
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-6">
                <LayoutGrid size={14} className="text-zinc-300" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Navigare
                </span>
              </div>

              <nav className="flex flex-col gap-1">
                {categoriesTree.map((cat) => {
                  const isActive = slug === cat.slug;
                  // Verificăm dacă slug-ul curent aparține unei subcategorii a acestei categorii
                  const isParentActive = cat.subcategories?.some(
                    (s: any) => s.slug === slug,
                  );

                  return (
                    <div key={cat.id} className="flex flex-col gap-1">
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all ${
                          isActive || isParentActive
                            ? "bg-zinc-50 text-black"
                            : "text-zinc-400 hover:text-black"
                        }`}
                      >
                        <span className="text-[12px] font-bold uppercase tracking-tight">
                          {cat.name}
                        </span>
                        {cat.subcategories?.length > 0 && (
                          <ChevronDown
                            size={12}
                            className={`${isActive || isParentActive ? "" : "-rotate-90 opacity-40"}`}
                          />
                        )}
                      </Link>

                      {/* SUB-LISTA: Apare doar dacă categoria este activă sau un părinte este activ */}
                      {(isActive || isParentActive) &&
                        cat.subcategories?.length > 0 && (
                          <div className="flex flex-col gap-1 ml-4 mt-1 border-l-2 border-zinc-100 pl-2">
                            {cat.subcategories.map((sub: any) => (
                              <Link
                                key={sub.id}
                                to={`/category/${sub.slug}`}
                                className={`py-2 px-3 text-[11px] font-bold uppercase tracking-tight rounded-lg transition-all ${
                                  slug === sub.slug
                                    ? "text-black bg-zinc-50"
                                    : "text-zinc-400 hover:text-black"
                                }`}
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
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="flex flex-col gap-12 md:gap-16">
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
                      className="group flex flex-col items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                        {loadingMore ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <ChevronDown size={18} />
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
        body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; }
        .luxury-scrollbar::-webkit-scrollbar { width: 3px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
      `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
