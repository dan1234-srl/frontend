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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

// ─────────────────────────────────────────────────────────────
// HERO (UNCHANGED)
// ─────────────────────────────────────────────────────────────
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
      setCurrent((p) => (p + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  if (!banners?.length) return null;

  const b = banners[current];
  const img = isMobile && b?.image_mobile ? b.image_mobile : b?.image_desktop;

  return (
    <div className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-16 bg-zinc-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          {img ? (
            <img src={img} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CATEGORY PAGE (FIXED)
// ─────────────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [filtersData, setFiltersData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ✅ IMPORTANT: internal page state (FIXES BUGS)
  const [page, setPage] = useState(1);

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const formatFallbackName = (str?: string) =>
    (str || "")
      .replace(/^cat-/, "")
      .replace(/-[a-f0-9]{6}$/i, "")
      .replace(/-/g, " ");

  // ─────────────────────────────
  // LOAD STATIC DATA
  // ─────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((r) => r.json())
      .then(setCategoriesTree)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setFiltersData(null);
    fetch(`${API_BASE_URL}/api/v1/products/filters/${slug}`)
      .then((r) => r.json())
      .then(setFiltersData)
      .catch(() => {});
  }, [slug]);

  // ─────────────────────────────
  // RESET ON CATEGORY / SORT
  // ─────────────────────────────
  useEffect(() => {
    setProducts([]);
    setPage(1);
    fetchProducts(1, false);
  }, [slug, searchParams.get("sort")]);

  // ─────────────────────────────
  // FETCH PRODUCTS (STABLE)
  // ─────────────────────────────
  const fetchProducts = useCallback(
    async (p: number, append = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      append ? setLoadingMore(true) : setLoading(true);

      try {
        const params = new URLSearchParams();

        params.set("page", String(p));
        params.set("category_slug", slug || "");

        searchParams.forEach((v, k) => {
          if (!["page", "category_slug"].includes(k)) {
            params.append(k, v);
          }
        });

        const sort = searchParams.get("sort");
        params.set(
          "sort",
          sort === "price_asc"
            ? "pret-crescator"
            : sort === "price_desc"
              ? "pret-descrescator"
              : "cele-mai-noi",
        );

        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/filter?${params}`,
        );
        const data = await res.json();

        setProducts((prev) =>
          append ? [...prev, ...(data.items || [])] : data.items || [],
        );

        setTotalPages(data.pages || 1);
        setPage(p);

        setSearchParams(
          (prev) => {
            const n = new URLSearchParams(prev);
            n.set("page", String(p));
            return n;
          },
          { replace: true },
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [slug, searchParams, setSearchParams],
  );

  // ─────────────────────────────
  // INFINITE SCROLL (STABLE)
  // ─────────────────────────────
  useEffect(() => {
    const el = observerTarget.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          !loading &&
          page < totalPages
        ) {
          fetchProducts(page + 1, true);
        }
      },
      { rootMargin: "200px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [page, totalPages, loadingMore, loading, fetchProducts]);

  // ─────────────────────────────
  // ACTIVE FILTER COUNT
  // ─────────────────────────────
  const activeFiltersCount = useMemo(() => {
    let c = 0;
    searchParams.forEach((v, k) => {
      if (!["page", "sort", "category_slug"].includes(k) && v) c++;
    });
    return c;
  }, [searchParams]);

  const categoryTitle = useMemo(() => {
    if (!slug) return "";
    for (const c of categoriesTree) {
      if (c.slug === slug) return c.name;
    }
    return formatFallbackName(slug);
  }, [slug, categoriesTree]);

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="h-36" />

      <main className="max-w-[1800px] mx-auto px-4 md:px-10">
        <h1 className="text-5xl font-black">{categoryTitle}</h1>

        <CategoryHeroCarousel banners={[]} />

        <div className="flex gap-12">
          <div className="flex-1">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={10} />
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id + i} product={p} eager={i < 8} />
                ))}
              </div>
            )}

            {page < totalPages && (
              <div ref={observerTarget} className="py-10 text-center">
                <Loader2 className="animate-spin mx-auto" />
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
