import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Loader2,
  LayoutGrid,
  Grid2X2,
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import { SortDropdown } from "../components/shop/SortDropdown";
import { ProductCard } from "../components/shop/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { FilterSidebar } from "../components/shop/FilterSidebar";

import { motion, AnimatePresence } from "framer-motion";
import { preloadLcp } from "@/lib/cf-image";
import {
  useCategoriesTree,
  useCategoryFilters,
  useCategoryBanner,
  useProducts,
} from "@/lib/queries";
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
    <div className="relative w-full h-[220px] sm:h-[260px] md:h-[340px] lg:h-[380px] rounded-3xl overflow-hidden mb-10 shadow-sm border border-zinc-100 group bg-zinc-950 select-none">
      {" "}
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
// Filter Drawer — identic cu WishlistDrawer
// ─────────────────────────────────────────────
interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filtersData: any;
  searchParams: URLSearchParams;
  setSearchParams: (p: URLSearchParams) => void;
  activeFiltersCount: number;
}

const FilterDrawer = ({
  isOpen,
  onClose,
  filtersData,
  searchParams,
  setSearchParams,
  activeFiltersCount,
}: FilterDrawerProps) => {
  // Blochează scroll-ul body când e deschis
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end font-sans">
          {/* Backdrop cu blur */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Panou principal */}
          <motion.div
            key="filter-panel"
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[420px] flex-col bg-white/95 backdrop-blur-3xl shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.15)] sm:rounded-l-[2.5rem] border-l border-white overflow-hidden"
          >
            {/* Glow-uri fundal */}
            <div className="absolute top-0 left-0 w-full h-64 bg-[var(--mauve-magic,#c084fc)] opacity-5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--royal-violet,#7B2CBF)] opacity-[0.03] blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="relative flex items-center justify-between px-8 py-8 border-b border-zinc-100/50 shrink-0 bg-white/50 z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--royal-violet,#7B2CBF)]"
                  />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet,#7B2CBF)]">
                    Rafinează Selecția
                  </p>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[var(--dark-amethyst,#3b0764)] flex items-baseline gap-2">
                  Filtre
                  {activeFiltersCount > 0 && (
                    <span className="text-sm font-bold text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-lg">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200/50 hover:bg-white hover:border-[var(--royal-violet,#7B2CBF)]/30 hover:text-[var(--royal-violet,#7B2CBF)] transition-all text-zinc-500 shadow-sm active:scale-95 group shrink-0"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </header>

            {/* Conținut scrollabil */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden relative px-6 py-6 z-10"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <FilterSidebar
                filtersData={filtersData}
                searchParams={searchParams}
                setSearchParams={(next) => {
                  setSearchParams(next);
                  // Nu închidem drawer-ul la aplicarea filtrelor
                }}
              />
            </div>

            {/* Footer */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="shrink-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100/60 z-10"
            >
              <button
                onClick={onClose}
                className="relative h-12 w-full text-white rounded-xl overflow-hidden transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group active:scale-[0.98]"
                style={{
                  background:
                    "var(--primary-gradient, linear-gradient(135deg,#7B2CBF,#9D4EDD))",
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative font-black uppercase text-[10px] tracking-[0.25em]">
                  Aplică & Închide
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
type PageCacheEntry = {
  items: any[];
  total: number;
  pages: number;
  ts: number;
};
const PAGE_CACHE = new Map<string, PageCacheEntry>();
const PAGE_TTL = 5 * 60 * 1000;
const cacheKey = (slug: string, qs: string, page: number) =>
  `${slug}::${qs}::${page}`;

const buildParams = (
  slug: string,
  searchParams: URLSearchParams,
  page: number,
) => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("category_slug", slug);
  searchParams.forEach((value, key) => {
    if (
      !["page", "category_slug", "sort", "sort_by", "sort_order"].includes(key)
    ) {
      params.append(key, value);
    }
  });
  params.set("sort", searchParams.get("sort") || "pret-descrescator");
  return params;
};

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const qs = searchParams.toString();

  const seedFromCache = (): { items: any[]; total: number; pages: number } => {
    if (!slug) return { items: [], total: 0, pages: 1 };
    const merged: any[] = [];
    let total = 0;
    let pages = 1;
    for (let p = 1; p <= currentPage; p++) {
      const e = PAGE_CACHE.get(cacheKey(slug, qs, p));
      if (!e) break;
      merged.push(...e.items);
      total = e.total;
      pages = e.pages;
    }
    return { items: merged, total, pages };
  };

  const initial = seedFromCache();
  const [products, setProducts] = useState<any[]>(initial.items);
  const [totalPages, setTotalPages] = useState(initial.pages);
  const [totalProducts, setTotalProducts] = useState(initial.total);
  const [loading, setLoading] = useState(initial.items.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageToLoadRef = useRef(currentPage + 1);
  const [, setPageToLoadState] = useState(currentPage + 1);

  const { data: categoriesTree = [] } = useCategoriesTree();
  const { data: filtersData = null } = useCategoryFilters(slug, qs);
  const { data: campaignBannersData = [] } = useCategoryBanner(slug);
  const campaignBanners = campaignBannersData as any[];

  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sortedCategories = useMemo(() => {
    return [...categoriesTree].sort((a: any, b: any) =>
      a.name.localeCompare(b.name),
    );
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

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      if (!slug) return;
      const key = cacheKey(slug, qs, page);
      const cached = PAGE_CACHE.get(key);
      if (cached && Date.now() - cached.ts < PAGE_TTL) {
        if (!append) {
          setTotalPages(cached.pages);
          setTotalProducts(cached.total);
          setLoading(false);
        } else {
          setProducts((prev) => [...prev, ...cached.items]);
          setTotalPages(cached.pages);
          setTotalProducts(cached.total);
        }
      } else {
        if (append) setLoadingMore(true);
        else if (products.length === 0) setLoading(true);
      }

      try {
        const params = buildParams(slug, searchParams, page);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/filter?${params.toString()}`,
        );
        const data = await res.json();
        const items = data.items || [];
        PAGE_CACHE.set(key, {
          items,
          total: data.total || 0,
          pages: data.pages || 1,
          ts: Date.now(),
        });
        if (append) {
          setProducts((prev) => {
            const seen = new Set(prev.map((p: any) => p.id));
            const additions = items.filter((p: any) => !seen.has(p.id));
            return [...prev, ...additions];
          });
        } else {
          setProducts(items);
        }
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug, qs, searchParams, products.length],
  );

  useEffect(() => {
    if (!slug) return;
    const seeded = seedFromCache();
    if (seeded.items.length > 0) {
      setProducts(seeded.items);
      setTotalPages(seeded.pages);
      setTotalProducts(seeded.total);
      setLoading(false);
    } else {
      setProducts([]);
      setLoading(true);
    }
    pageToLoadRef.current = currentPage + 1;
    setPageToLoadState(currentPage + 1);
    fetchProducts(currentPage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, qs]);

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
      { rootMargin: "600px" },
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
      <Seo
        title={
          categoryTitle
            ? `${categoryTitle} | Evem`
            : "Categorie produse | Evem"
        }
        description={
          categoryTitle
            ? `Descoperă colecția ${categoryTitle} de la Evem. ${totalProducts || ""} produse disponibile cu livrare rapidă în toată România.`
            : undefined
        }
        canonical={`/category/${slug}`}
        jsonLd={
          products.length > 0
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: categoryTitle,
                numberOfItems: totalProducts,
                itemListElement: products.slice(0, 20).map((p: any, i: number) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `https://evem.ro/product/${p.slug}`,
                  name: p.name,
                })),
              }
            : undefined
        }
      />
      <Navbar />


      {/* Filter Drawer — montat la rădăcina paginii, deasupra oricărui context */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filtersData={filtersData}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        activeFiltersCount={activeFiltersCount}
      />

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
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-2 group"
          >
            <SlidersHorizontal
              size={14}
              className="group-hover:text-[var(--royal-violet)] transition-colors"
            />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-[var(--royal-violet)] transition-colors">
              Filtre
            </span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--royal-violet)] text-white text-[8px] font-black px-1">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="w-36 sm:w-48 shrink-0">
            <SortDropdown />
          </div>
        </div>

        {/* ── Main layout: Sidebar categorii + Grid ── */}
        <div className="flex gap-8 items-start">
          {/* Desktop category sidebar */}
          <aside className="hidden lg:block w-[200px] xl:w-[220px] shrink-0 sticky top-[12rem]">
            <div className="flex items-center gap-2 mb-4 pl-2">
              <LayoutGrid size={12} className="text-[var(--royal-violet)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--royal-violet)]">
                Categorii
              </span>
            </div>

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
    </div>
  );
};

export default CategoryPage;
