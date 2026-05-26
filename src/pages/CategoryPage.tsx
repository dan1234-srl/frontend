import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Loader2, LayoutGrid, Grid2X2, SlidersHorizontal } from "lucide-react";
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
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { preloadLcp } from "@/lib/cf-image";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";
const [totalProducts, setTotalProducts] = useState(0);

const extractLcpUrl = (product: any): string | null => {
  if (!product || !product.image_url) return null;
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
    <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] md:aspect-[32/10] rounded-[2.5rem] overflow-hidden mb-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-zinc-100 group bg-zinc-950 select-none">
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

          <div className="absolute inset-y-0 left-0 p-8 sm:p-12 md:p-20 flex flex-col justify-center items-start text-left text-white max-w-md md:max-w-2xl z-20 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-white/60 block" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">
                Campanie Exclusivă
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif italic tracking-tighter leading-tight drop-shadow-sm">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-[10px] md:text-xs font-medium text-zinc-300 uppercase tracking-widest leading-relaxed max-w-xs md:max-w-md drop-shadow-sm">
                {currentBanner.subtitle}
              </p>
            )}
            <div className="pt-2">
              <button className="px-8 py-4 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-[0.25em] rounded-full hover:bg-zinc-900 hover:text-white transition-all shadow-2xl active:scale-95 duration-300">
                {currentBanner.button_text || "DESCOPERĂ COLECȚIA"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-6 right-10 flex gap-2.5 z-30">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                current === i
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [campaignBanners, setCampaignBanners] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const formatFallbackName = (str: string | undefined) => {
    if (!str) return "";
    return str
      .replace(/^cat-/, "")
      .replace(/-[a-f0-9]{6}$/i, "")
      .replace(/-/g, " ");
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree)
      .catch(() => {});
  }, []);

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

        const currentSort = searchParams.get("sort");
        params.set("sort", currentSort || "cele-mai-noi");

        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/filter?${params.toString()}`,
        );
        const data = await res.json();

        setProducts((prev) =>
          append ? [...prev, ...(data.items || [])] : data.items || [],
        );
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || 0);
        // 🚀 FIX: AM ELIMINAT setSearchParams DE AICI CA SĂ NU CREEZE INFINITE RENDER LOOP
      } catch {
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug, searchParams.toString()],
  );

  useEffect(() => {
    // Declansam mereu fetch-ul cu pagina corectă din URL
    fetchProducts(currentPage, false);
  }, [slug, searchParams.toString()]);

  useEffect(() => {
    if (!products.length) return;
    const url = extractLcpUrl(products[0]);
    if (url && typeof url === "string") preloadLcp(url);
  }, [products]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          !loading &&
          currentPage < totalPages
        ) {
          // 🚀 Aici doar adăugăm pagina la request, infinite scroll nu afectează URL-ul
          fetchProducts(currentPage + 1, true);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [currentPage, totalPages, loadingMore, loading, fetchProducts]);

  const activeFiltersCount = (() => {
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
  })();

  const categoryTitle = useMemo(() => {
    if (filtersData?.category_name) return filtersData.category_name;
    if (!slug) return "";
    for (const cat of categoriesTree) {
      if (cat.slug === slug) return cat.name;
      if (cat.subcategories) {
        const subMatch = cat.subcategories.find(
          (sub: any) => sub.slug === slug,
        );
        if (subMatch) return subMatch.name;
      }
    }
    return formatFallbackName(slug);
  }, [slug, filtersData, categoriesTree]);

  return (
    <div className="bg-white min-h-screen flex flex-col overflow-x-hidden selection:bg-[var(--royal-violet)] selection:text-white font-sans antialiased">
      <Navbar />

      <div className="w-full h-[9.25rem] shrink-0" aria-hidden="true" />

      <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 md:px-12 py-8">
        <div className="mb-10 md:mb-14">
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
              {categoryTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              {/* 🚀 AICI: Folosește totalProducts în loc de products.length */}
              {loading && products.length === 0 ? "—" : totalProducts} Articole
              Disponibile
            </p>
          </div>
        </div>

        <CategoryHeroCarousel banners={campaignBanners} />

        <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2">
          <div className="flex gap-2">
            {categoriesTree.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  slug === cat.slug
                    ? "bg-zinc-100 text-black border-zinc-200 shadow-sm"
                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-5 mb-12 border-y border-zinc-100 sticky top-36 bg-white/95 backdrop-blur-md z-40">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 group">
                <div className="relative p-2.5 bg-zinc-50 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 shadow-sm">
                  <SlidersHorizontal size={14} />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--royal-violet)] text-white text-[8px] font-black border border-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <span>Rafinează Portofoliul</span>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[90%] sm:w-[450px] p-0 border-none bg-white z-[99999] shadow-2xl flex flex-col h-full text-left"
            >
              <SheetHeader className="p-8 border-b border-zinc-100 shrink-0">
                <SheetTitle className="text-xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)]">
                  Filtre categorii
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-8 luxury-scrollbar">
                {filtersData ? (
                  <FilterSidebar filtersData={filtersData} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2
                      className="animate-spin text-[var(--royal-violet)]"
                      size={24}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Se încarcă matricea...
                    </span>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-44 md:w-60">
            <SortDropdown />
          </div>
        </div>

        <div className="flex gap-12 items-start">
          <aside className="hidden lg:block w-[250px] shrink-0 sticky top-52">
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
                      className={`py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all duration-300 ${
                        isParentActive
                          ? "bg-zinc-50 text-[var(--royal-violet)] shadow-sm"
                          : "text-zinc-400 hover:text-black hover:bg-zinc-50/50"
                      }`}
                    >
                      {cat.name}
                    </Link>
                    {isParentActive && cat.subcategories?.length > 0 && (
                      <div className="flex flex-col gap-1 ml-5 border-l border-zinc-100 pl-4 py-1.5 space-y-1">
                        {cat.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                              slug === sub.slug
                                ? "text-[var(--royal-violet)] font-black"
                                : "text-zinc-300 hover:text-zinc-700"
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

          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <div className="w-full">
                <ProductGridSkeleton count={10} />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-40 border border-zinc-100 rounded-[2rem] bg-zinc-50/30 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <Grid2X2 size={16} className="text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                    Niciun rezultat găsit
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-16">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12">
                  {products.map((p, i) => (
                    <ProductCard
                      key={`${p.id}-${i}`}
                      product={p}
                      eager={i < 8}
                    />
                  ))}
                </div>

                {currentPage < totalPages && (
                  <div
                    ref={observerTarget}
                    className="flex flex-col items-center justify-center py-12 gap-3"
                  >
                    <Loader2 className="animate-spin text-zinc-400" size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Se încarcă mai multe produse...
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
          html { scrollbar-gutter: stable !important; }
          body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; overflow: hidden !important; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .luxury-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
          
          [data-radix-focus-trap] ~ div[class*="bg-black/"],
          div[class*="fixed inset-0 bg-black"],
          div[data-state="open"][class*="fixed inset-0"] {
            z-index: 99990 !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            background-color: rgba(9, 9, 11, 0.4) !important;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        `,
        }}
      />
    </div>
  );
};

export default CategoryPage;
