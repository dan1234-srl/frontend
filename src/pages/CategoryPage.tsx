import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Loader2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  LayoutGrid,
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
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]); // Pentru meniul din stânga
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");

  const formatFallbackName = (str: string | undefined) => {
    if (!str) return "";
    return str.replace(/^cat-/, "").replace(/-/g, " ");
  };

  // Fetch Categorii Tree pentru Sidebar
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree)
      .catch((err) => console.error("Categories fetch error:", err));

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

      {/* Spacer pentru Navbar fixed */}
      <div className="h-8 w-full shrink-0" />

      {/* VOUCHER TICKER */}
      <AnimatePresence>
        {vouchers.length > 0 && (
          <section className="w-full bg-[#050505] py-3 border-b border-zinc-900 relative overflow-hidden z-10">
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

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 md:px-12 py-10">
        {/* HEADER: Titlu + Filtre Mobile + Sortare */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 mb-12 border-b border-zinc-100 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-950">
              {filtersData?.category_name || formatFallbackName(slug)}
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
              {products.length} Articole disponibile
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Buton Filtre - Acum apare pe ambele (Mobile/Desktop) pentru a păstra sidebar-ul curat */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex-1 md:flex-none h-12 px-6 flex items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm">
                  <SlidersHorizontal size={14} /> Rafinează
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[400px] p-0 border-none"
              >
                <SheetHeader className="p-8 border-b bg-zinc-50/50">
                  <SheetTitle className="text-2xl font-black uppercase tracking-tighter">
                    Filtre avansate
                  </SheetTitle>
                </SheetHeader>
                <div className="p-8 h-full overflow-y-auto luxury-scrollbar">
                  {filtersData && <FilterSidebar filtersData={filtersData} />}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1 md:w-48">
              <SortDropdown />
            </div>
          </div>
        </div>

        <div className="flex gap-16 items-start">
          {/* SIDEBAR STÂNGA: Navigare Categorii */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar">
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <LayoutGrid size={14} className="text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
                    Colecții
                  </span>
                </div>

                <nav className="flex flex-col gap-1">
                  {categoriesTree.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className={`group flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                        slug === cat.slug
                          ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                      }`}
                    >
                      <span className="text-sm font-bold">{cat.name}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${slug === cat.slug ? "" : "-rotate-90 opacity-0 group-hover:opacity-100"}`}
                      />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Quick Filters - Doar branduri în sidebar pentru acces rapid */}
              {filtersData?.brands && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-6 block">
                    Branduri Populare
                  </span>
                  <div className="flex flex-col gap-2">
                    {filtersData.brands.slice(0, 5).map((brand: string) => (
                      <button
                        key={brand}
                        className="text-left text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-wider"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={9} />
            ) : (
              <div className="flex flex-col gap-16">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                  {products.map((p, i) => (
                    <ProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {currentPage < totalPages && (
                  <div className="flex justify-center pt-10 border-t border-zinc-100">
                    <button
                      onClick={() => fetchProducts(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="group flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all bg-white">
                        {loadingMore ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black">
                        Încarcă mai multe
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
