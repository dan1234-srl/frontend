import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Loader2,
  LayoutGrid,
  Grid2X2,
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import { SortDropdown } from "../components/shop/SortDropdown";
import { ProductCard } from "../components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { FilterSidebar } from "../components/shop/FilterSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { preloadLcp } from "@/lib/cf-image";
import Fuse from "fuse.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────
const extractLcpUrl = (product: any): string | null => {
  if (!product?.image_url) return null;
  let data = product.image_url;
  if (typeof data === "string" && data.trim().startsWith("{")) {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  const container = data?.main || data;
  const url = container?.medium || container?.large || container?.small;
  return typeof url === "string" ? url : null;
};

const formatFallbackName = (str: string | undefined) => {
  if (!str) return "";
  return str
    .replace(/^cat-/, "")
    .replace(/-[a-f0-9]{6}$/i, "")
    .replace(/-/g, " ");
};

// ─────────────────────────────────────────────
// Hero Carousel
// ─────────────────────────────────────────────
const CategoryHeroCarousel = ({ banners }: { banners: any[] }) => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  if (!banners || banners.length === 0) return null;
  const currentBanner = banners[current];
  if (!currentBanner) return null;

  const resolvedImageUrl =
    isMobile && currentBanner.image_mobile
      ? currentBanner.image_mobile
      : currentBanner.image_desktop;

  return (
    <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[300px] rounded-3xl overflow-hidden mb-10 shadow-sm border border-zinc-100 group bg-zinc-950 select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full flex items-center"
        >
          {resolvedImageUrl ? (
            <img
              src={resolvedImageUrl}
              alt={currentBanner.title || "Campanie"}
              crossOrigin="anonymous"
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.015] transition-transform duration-[4s] ease-out"
              loading="eager"
              fetchPriority="high"
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

          <div className="absolute inset-y-0 left-0 p-6 sm:p-10 md:p-14 flex flex-col justify-center items-start text-left text-white max-w-[90%] sm:max-w-md md:max-w-2xl z-20 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-white/60 block" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">
                Campanie Exclusivă
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-serif italic tracking-tighter leading-tight drop-shadow-sm">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="hidden sm:block text-[9px] md:text-[10px] font-medium text-zinc-300 uppercase tracking-widest leading-relaxed max-w-xs md:max-w-md drop-shadow-sm">
                {currentBanner.subtitle}
              </p>
            )}
            <div className="pt-2">
              <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-zinc-950 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] rounded-full hover:bg-zinc-900 hover:text-white transition-all shadow-xl active:scale-95 duration-300">
                {currentBanner.button_text || "DESCOPERĂ COLECȚIA"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2 z-30">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-500 ${
                current === i
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub-component: Meniu Filtrare Experiențial
// ─────────────────────────────────────────────
const FilterSheetExperience = ({
  filtersData,
  activeSearchParams,
  onApply,
}: {
  filtersData: any;
  activeSearchParams: URLSearchParams;
  onApply: (pendingParams: URLSearchParams) => void;
}) => {
  const [pendingSearchParams, setPendingSearchParams] = useState(
    () => new URLSearchParams(activeSearchParams),
  );

  useEffect(() => {
    setPendingSearchParams(new URLSearchParams(activeSearchParams));
  }, [activeSearchParams]);

  const handlePendingFilterChange = useCallback(
    (newParams: URLSearchParams) => {
      newParams.set("page", "1");
      setPendingSearchParams(newParams);
    },
    [],
  );

  const handleApply = () => {
    onApply(pendingSearchParams);
  };

  const clearPending = () => {
    const cleared = new URLSearchParams();
    if (activeSearchParams.has("sort"))
      cleared.set("sort", activeSearchParams.get("sort")!);
    cleared.set("page", "1");
    setPendingSearchParams(cleared);
  };

  const hasPendingChanges =
    pendingSearchParams.toString() !== activeSearchParams.toString();

  const pendingFiltersCount = useMemo(() => {
    let count = 0;
    pendingSearchParams.forEach((val, key) => {
      if (
        !["page", "sort", "category_slug", "sort_by", "sort_order"].includes(
          key,
        ) &&
        val
      )
        count++;
    });
    return count;
  }, [pendingSearchParams]);

  return (
    <div className="flex flex-col h-full text-left">
      <SheetHeader className="px-6 py-5 border-b border-zinc-100 shrink-0 flex flex-row items-center justify-between gap-4 space-y-0">
        <SheetTitle className="text-xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)]">
          Rafinează Selecția
        </SheetTitle>
        <div className="flex items-center gap-2">
          {pendingFiltersCount > 0 && (
            <button
              onClick={clearPending}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-500 transition-colors"
            >
              Resetează ({pendingFiltersCount})
            </button>
          )}
          <SheetClose className="rounded-full h-8 w-8 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X size={16} />
          </SheetClose>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 luxury-scrollbar pb-32">
        {filtersData ? (
          <FilterSidebar
            filtersData={filtersData}
            searchParams={pendingSearchParams}
            setSearchParams={handlePendingFilterChange}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2
              className="animate-spin text-[var(--royal-violet)]"
              size={20}
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Se încarcă matricea...
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
        <button
          onClick={handleApply}
          disabled={!hasPendingChanges}
          className="w-full h-14 bg-zinc-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-lg hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 disabled:bg-zinc-200 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          Aplica Filtrele
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageToLoadRef = useRef(2);
  const [pageToLoadState, setPageToLoadState] = useState(2);

  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [campaignBanners, setCampaignBanners] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Stare pentru căutarea categoriilor (stil HomeHero)
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree)
      .catch(() => {});
  }, []);

  const sortedCategories = useMemo(() => {
    return [...categoriesTree].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoriesTree]);

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery) return sortedCategories;

    const fuse = new Fuse(sortedCategories, {
      keys: ["name"],
      threshold: 0.3,
      shouldSort: true,
    });

    return fuse.search(categorySearchQuery).map((result) => result.item);
  }, [sortedCategories, categorySearchQuery]);

  useEffect(() => {
    if (!slug) return;
    setFiltersData(null);
    fetch(
      `${API_BASE_URL}/api/v1/products/filters/${slug}?${searchParams.toString()}`,
    )
      .then((res) => res.json())
      .then((data) => setFiltersData(data))
      .catch(() => {});
  }, [slug, searchParams.toString()]);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE_URL}/api/v1/vouchers/category-banner/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCampaignBanners(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch(() => setCampaignBanners([]));
  }, [slug]);

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("category_slug", slug || "");

        searchParams.forEach((value, key) => {
          if (
            ![
              "page",
              "category_slug",
              "sort",
              "sort_by",
              "sort_order",
            ].includes(key)
          ) {
            params.append(key, value);
          }
        });

        // FIX: Folosim "pret-descrescator" pentru a se alinia cu backend-ul
        params.set("sort", searchParams.get("sort") || "pret-descrescator");

        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/filter?${params.toString()}`,
        );
        const data = await res.json();

        setProducts((prev) =>
          append ? [...prev, ...(data.items || [])] : data.items || [],
        );
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || 0);
      } catch {
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug, searchParams.toString()],
  );

  useEffect(() => {
    pageToLoadRef.current = currentPage + 1;
    setPageToLoadState(currentPage + 1);
    fetchProducts(currentPage, false);
  }, [slug, searchParams.toString()]);

  useEffect(() => {
    if (!products.length) return;
    const url = extractLcpUrl(products[0]);
    if (url) preloadLcp(url);
  }, [products]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

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
          setPageToLoadState(pageToLoadRef.current);
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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    searchParams.forEach((val, key) => {
      if (
        !["page", "sort", "category_slug", "sort_by", "sort_order"].includes(
          key,
        ) &&
        val
      )
        count++;
    });
    return count;
  }, [searchParams]);

  const handleApplyFilters = useCallback(
    (pendingParams: URLSearchParams) => {
      setSearchParams(pendingParams);
      setFiltersOpen(false);
    },
    [setSearchParams],
  );

  const categoryTitle = useMemo(() => {
    if (filtersData?.category_name) return filtersData.category_name;
    if (!slug) return "";
    for (const cat of categoriesTree) {
      if (cat.slug === slug) return cat.name;
      if (cat.subcategories) {
        const sub = cat.subcategories.find((s: any) => s.slug === slug);
        if (sub) return sub.name;
      }
    }
    return formatFallbackName(slug);
  }, [slug, filtersData, categoriesTree]);

  const hasMore = pageToLoadRef.current <= totalPages && !loading;

  return (
    <div className="bg-[#fcfbfe] min-h-screen flex flex-col overflow-x-hidden selection:bg-[var(--royal-violet)] selection:text-white font-sans antialiased relative">
      {/* ✅ OVERLAY MANUAL LA RĂDĂCINĂ (ROOT) PENTRU A IGNORA TOATE CONTEXTELE Z-INDEX ✅ */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setFiltersOpen(false)}
            className="fixed inset-0 z-[99990] glass-overlay"
          />
        )}
      </AnimatePresence>

      <Navbar />

      <div
        className="w-full h-[7rem] md:h-[8.5rem] shrink-0"
        aria-hidden="true"
      />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 py-6">
        {/* ── Page Header ── */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
              {categoryTitle || (
                <span className="inline-block w-48 h-10 bg-zinc-100 rounded-xl animate-pulse" />
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              {loading && products.length === 0 ? "—" : totalProducts} Articole
              Disponibile
            </p>
          </div>
        </div>

        {/* ── Hero Carousel ── */}
        <CategoryHeroCarousel banners={campaignBanners} />

        {/* ── Mobile category pills ── */}
        <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
          <div className="flex gap-2 shrink-0">
            {sortedCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                  slug === cat.slug
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Toolbar: Filters + Sort ── */}
        <div className="flex items-center justify-between py-3 mb-6 border-y border-zinc-100 sticky top-[7rem] md:top-[8.5rem] bg-[#fcfbfe]/95 backdrop-blur-md z-40 gap-3">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <button
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 group"
                aria-label="Deschide filtre"
              >
                <div className="relative p-2 bg-zinc-100/80 rounded-full group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 shadow-sm border border-zinc-200 group-hover:border-transparent">
                  <SlidersHorizontal size={13} />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--royal-violet)] text-white text-[7px] font-black border border-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Filtrează Produsele</span>
                <span className="sm:hidden">Filtre</span>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              hideClose
              className="w-[94%] sm:w-[420px] p-0 border-none bg-white z-[99999] shadow-2xl flex flex-col h-full"
            >
              <FilterSheetExperience
                filtersData={filtersData}
                activeSearchParams={searchParams}
                onApply={handleApplyFilters}
              />
            </SheetContent>
          </Sheet>

          <div className="w-36 sm:w-48 shrink-0">
            <SortDropdown />
          </div>
        </div>

        {/* ── Main layout: Sidebar + Grid ── */}
        <div className="flex gap-8 items-start">
          {/* Desktop category sidebar */}
          <aside className="hidden lg:block w-[200px] xl:w-[220px] shrink-0 sticky top-[12rem]">
            <div className="flex items-center gap-2 mb-4 pl-2">
              <LayoutGrid size={12} className="text-[var(--royal-violet)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--royal-violet)]">
                Categorii
              </span>
            </div>

            {/* Bara de cautare elastica */}
            <div className="relative mb-4">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Caută categorie..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100/50 rounded-xl outline-none focus:ring-2 focus:ring-zinc-200 transition-all border border-transparent focus:border-zinc-200"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
              />
            </div>

            <nav className="flex flex-col gap-1 max-h-[600px] overflow-y-auto luxury-scrollbar pr-2">
              {filteredCategories.map((cat) => {
                const isParentActive =
                  slug === cat.slug ||
                  cat.subcategories?.some((s: any) => s.slug === slug);
                return (
                  <div key={cat.id} className="flex flex-col gap-0.5">
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`py-2.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all duration-200 ${
                        isParentActive
                          ? "bg-zinc-100/80 text-[var(--dark-amethyst)]"
                          : "text-zinc-500 hover:text-black hover:bg-zinc-50"
                      }`}
                    >
                      {cat.name}
                    </Link>
                    {isParentActive && cat.subcategories?.length > 0 && (
                      <div className="flex flex-col gap-0.5 ml-4 border-l border-zinc-200 pl-3 py-1 mb-2">
                        {cat.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className={`py-1 text-[9px] font-bold uppercase tracking-tight transition-colors ${
                              slug === sub.slug
                                ? "text-[var(--royal-violet)]"
                                : "text-zinc-400 hover:text-zinc-800"
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
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-zinc-100 rounded-3xl bg-white flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Grid2X2 size={14} className="text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                    Niciun rezultat găsit
                  </p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider">
                    Încearcă să ajustezi filtrele
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-8 sm:gap-y-10">
                  {products.map((p, i) => (
                    <ProductCard
                      key={`${p.id}-${i}`}
                      product={p}
                      eager={i < 8}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div
                    ref={observerTarget}
                    className="flex flex-col items-center justify-center py-8 gap-2"
                    aria-live="polite"
                  >
                    {loadingMore && (
                      <>
                        <Loader2
                          className="animate-spin text-zinc-300"
                          size={20}
                        />
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                          Se încarcă produse...
                        </span>
                      </>
                    )}
                  </div>
                )}

                {!hasMore && products.length > 0 && !loading && (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <span className="h-[1px] w-12 bg-zinc-200 block" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Ai ajuns la final
                    </span>
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
            /* Asigură-te că Sheet-ul în sine este deasupra blur-ului */
            [data-radix-portal] [role="dialog"] {
              z-index: 99999 !important;
            }
            
            /* Prevenim scroll-ul dublu */
            body[data-scroll-locked] {
              padding-right: 0px !important;
            }
          `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
