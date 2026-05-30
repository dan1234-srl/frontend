import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Grid2X2, SlidersHorizontal, LayoutGrid } from "lucide-react";
import { ProductCard } from "../shop/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { SortDropdown } from "../shop/SortDropdown";
import { FilterSidebar } from "../shop/FilterSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const CategoryShowcase = () => {
  const [searchParams] = useSearchParams();

  // ─── Stări pentru Produse ───
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ─── Stări pentru Filtre & Categorii ───
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ─── Referințe Infinite Scroll ───
  const pageToLoadRef = useRef(2);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // currentPage din URL (folosit doar la initial load/filter change)
  const currentPage = parseInt(searchParams.get("page") || "1");

  // 1. Fetch Arbore Categorii (pentru Sidebar)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree)
      .catch(() => {});
  }, []);

  // 2. Fetch Date Filtre (Global pentru toate produsele)
  useEffect(() => {
    setFiltersData(null);
    // Presupunem că backend-ul acceptă "all" sau ruta de bază pentru global
    fetch(
      `${API_BASE_URL}/api/v1/products/filters/all?${searchParams.toString()}`,
    )
      .then((res) => {
        // Fallback dacă backend-ul nu are endpoint pentru "all"
        if (!res.ok)
          return fetch(
            `${API_BASE_URL}/api/v1/products/filters?${searchParams.toString()}`,
          ).then((r) => r.json());
        return res.json();
      })
      .then((data) => setFiltersData(data))
      .catch(() => {});
  }, [searchParams.toString()]);

  // 3. Funcția de Fetch Produse
  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());

        // Preluăm toate filtrele din URL
        searchParams.forEach((value, key) => {
          if (!["page", "sort", "sort_by", "sort_order"].includes(key)) {
            params.append(key, value);
          }
        });

        params.set("sort", searchParams.get("sort") || "cele-mai-noi");

        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/filter?${params.toString()}`,
        );
        const data = await res.json();

        setProducts((prev) =>
          append ? [...prev, ...(data.items || [])] : data.items || [],
        );
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || 0);
      } catch (e) {
        console.warn("Eroare la fetch produse showcase:", e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchParams.toString()],
  );

  // Trigger la schimbarea filtrelor
  useEffect(() => {
    pageToLoadRef.current = currentPage + 1;
    fetchProducts(currentPage, false);
  }, [searchParams.toString()]);

  // 4. Infinite Scroll Observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const target = observerTarget.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          !loading &&
          pageToLoadRef.current <= totalPages
        ) {
          const nextPage = pageToLoadRef.current;
          pageToLoadRef.current += 1;
          fetchProducts(nextPage, true);
        }
      },
      { rootMargin: "300px" },
    );

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [totalPages, loadingMore, loading, fetchProducts]);

  // Numărăm filtrele active pentru bulina roșie
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    searchParams.forEach((val, key) => {
      if (!["page", "sort", "sort_by", "sort_order"].includes(key) && val)
        count++;
    });
    return count;
  }, [searchParams]);

  const hasMore = pageToLoadRef.current <= totalPages && !loading;

  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-24 max-w-[1800px] mx-auto">
      {/* ─── Header Secțiune ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-14 gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/50 block mb-3">
            Portofoliu Complet
          </span>
          <h2 className="heading-serif text-3xl md:text-5xl leading-tight text-[var(--dark-amethyst)]">
            Descoperă <span className="italic font-light">toate produsele</span>
          </h2>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-4">
            {loading && products.length === 0 ? "—" : totalProducts} Articole
            Disponibile
          </p>
        </div>
      </div>

      {/* ─── Toolbar: Filtre Mobil + Sortare ─── */}
      <div className="flex items-center justify-between py-4 sm:py-5 mb-8 sm:mb-12 border-y border-zinc-100 sticky top-20 bg-white/95 backdrop-blur-md z-40 gap-3">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 group">
              <div className="relative p-2.5 bg-zinc-50 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 shadow-sm">
                <SlidersHorizontal size={14} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--royal-violet)] text-white text-[8px] font-black border border-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Rafinează Portofoliul</span>
              <span className="sm:hidden">Filtre</span>
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[92%] sm:w-[450px] p-0 border-none bg-white z-[99999] shadow-2xl flex flex-col h-full text-left"
          >
            <SheetHeader className="p-6 sm:p-8 border-b border-zinc-100 shrink-0">
              <SheetTitle className="text-xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)]">
                Filtre Produse
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 luxury-scrollbar">
              {filtersData ? (
                <FilterSidebar filtersData={filtersData} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2
                    className="animate-spin text-[var(--royal-violet)]"
                    size={24}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    Se încarcă filtrele...
                  </span>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="w-36 sm:w-44 md:w-60 shrink-0">
          <SortDropdown />
        </div>
      </div>

      {/* ─── Main Layout: Sidebar Categorii + Grid Produse ─── */}
      <div className="flex gap-8 xl:gap-12 items-start">
        {/* Sidebar Categorii Desktop */}
        <aside className="hidden lg:block w-[220px] xl:w-[250px] shrink-0 sticky top-44">
          <div className="flex items-center gap-2 mb-6 pl-2">
            <LayoutGrid size={13} className="text-[var(--royal-violet)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--royal-violet)]">
              Categorii
            </span>
          </div>
          <nav className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto luxury-scrollbar pr-3">
            {categoriesTree.map((cat) => (
              <div key={cat.id} className="flex flex-col gap-1">
                <Link
                  to={`/category/${cat.slug}`}
                  className="py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all duration-300 text-zinc-400 hover:text-black hover:bg-zinc-50/50"
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </nav>
        </aside>

        {/* ─── Grid Produse ─── */}
        <div className="flex-1 min-w-0">
          {loading && products.length === 0 ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="text-center py-32 border border-zinc-100 rounded-[2rem] bg-zinc-50/30 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <Grid2X2 size={16} className="text-zinc-300" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                Niciun rezultat găsit
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-12 sm:gap-16">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-8 sm:gap-y-12">
                {products.map((p, i) => (
                  <ProductCard key={`${p.id}-${i}`} product={p} eager={i < 8} />
                ))}
              </div>

              {/* Sentinel Infinite Scroll */}
              {hasMore && (
                <div
                  ref={observerTarget}
                  className="flex flex-col items-center justify-center py-10 gap-3"
                >
                  {loadingMore && (
                    <>
                      <Loader2
                        className="animate-spin text-[var(--royal-violet)]"
                        size={24}
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Se încarcă mai multe...
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Mesaj Final */}
              {!hasMore && products.length > 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <span className="h-[1px] w-16 bg-zinc-100 block" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
                    Ai ajuns la final
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
