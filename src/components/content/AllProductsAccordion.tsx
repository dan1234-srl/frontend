import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { useCategoriesTree } from "@/lib/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Fuse from "fuse.js";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://linea-backend-production.up.railway.app";

const PAGE_SIZE = 24;

type PageData = { items: any[]; pages: number; total: number };
// Module-level cache (survives unmount → instant render pe 2G/3G la revenire)
const PAGE_CACHE = new Map<string, PageData>();
const cacheKey = (page: number, sort: string) => `${page}::${sort}`;

const SORT_OPTIONS = [
  { value: "price_desc", label: "Preț: Mare → Mic" },
  { value: "price_asc", label: "Preț: Mic → Mare" },
  { value: "newest", label: "Cele mai noi" },
  { value: "popular", label: "Cele mai populare" },
];

const AllProductsAccordion = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("price_desc");
  const [categoryQuery, setCategoryQuery] = useState("");

  const key = cacheKey(page, sort);
  const cached = PAGE_CACHE.get(key);

  const [items, setItems] = useState<any[]>(cached?.items || []);
  const [pages, setPages] = useState(cached?.pages || 1);
  const [total, setTotal] = useState(cached?.total || 0);
  const [loading, setLoading] = useState(!cached);

  const { data: categoriesTree = [] } = useCategoriesTree();

  const sortedCategories = useMemo(
    () =>
      [...categoriesTree].sort((a: any, b: any) =>
        a.name.localeCompare(b.name),
      ),
    [categoriesTree],
  );

  const filteredCategories = useMemo(() => {
    if (!categoryQuery) return sortedCategories;
    const fuse = new Fuse(sortedCategories, {
      keys: ["name"],
      threshold: 0.3,
    });
    return fuse.search(categoryQuery).map((r) => r.item);
  }, [sortedCategories, categoryQuery]);

  const gridRef = useRef<HTMLDivElement | null>(null);

  // Fetch cu cache + dedupe in-flight
  useEffect(() => {
    if (!open) return;
    const k = cacheKey(page, sort);
    const hit = PAGE_CACHE.get(k);
    if (hit) {
      setItems(hit.items);
      setPages(hit.pages);
      setTotal(hit.total);
      setLoading(false);
      return;
    }
    let cancel = false;
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        if (sort) params.set("sort", sort);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/?${params.toString()}`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (cancel) return;
        const list = data.items || (Array.isArray(data) ? data : []);
        const entry: PageData = {
          items: list,
          pages: data.pages || 1,
          total: data.total || list.length,
        };
        PAGE_CACHE.set(k, entry);
        setItems(entry.items);
        setPages(entry.pages);
        setTotal(entry.total);
      } catch {
        // păstrăm ce avem
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [open, page, sort]);

  // Prefetch următoarea pagină la idle (UX premium)
  useEffect(() => {
    if (!open || page >= pages) return;
    const k = cacheKey(page + 1, sort);
    if (PAGE_CACHE.has(k)) return;
    const idle = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 800));
    const handle = idle(() => {
      const params = new URLSearchParams();
      params.set("page", String(page + 1));
      params.set("limit", String(PAGE_SIZE));
      if (sort) params.set("sort", sort);
      fetch(`${API_BASE_URL}/api/v1/products/?${params.toString()}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => {
          const list = data.items || (Array.isArray(data) ? data : []);
          PAGE_CACHE.set(k, {
            items: list,
            pages: data.pages || 1,
            total: data.total || list.length,
          });
        })
        .catch(() => {});
    });
    return () => {
      if ((window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [open, page, pages, sort]);

  const goToPage = (p: number) => {
    setPage(p);
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Construim lista paginilor afișate (ex: 1 … 4 5 [6] 7 8 … 20)
  const pageNumbers = useMemo(() => {
    const out: (number | "...")[] = [];
    const total = pages;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) out.push(i);
      return out;
    }
    out.push(1);
    if (page > 4) out.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(total - 1, page + 1);
    for (let i = start; i <= end; i++) out.push(i);
    if (page < total - 3) out.push("...");
    out.push(total);
    return out;
  }, [page, pages]);

  return (
    <section className="w-full pb-16">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full group flex items-center justify-between px-6 md:px-10 py-8 border-y border-zinc-200 hover:border-zinc-900 transition-all bg-white"
        aria-expanded={open}
      >
        <div className="text-left">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-2">
            Întregul Catalog
          </span>
          <h2 className="heading-serif text-2xl md:text-4xl text-zinc-900">
            Toate produsele{" "}
            <span className="italic font-light text-zinc-500">EVEM</span>
          </h2>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="size-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="grid"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div ref={gridRef} className="pt-10">
              {/* ── Mobile pills cu categorii ── */}
              <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar -mx-2 px-2">
                {sortedCategories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* ── Toolbar ── */}
              <div className="flex items-center justify-between gap-3 mb-8 pb-4 border-b border-zinc-100">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {loading && items.length === 0 ? "—" : total} Articole
                </p>
                <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                  <SelectTrigger className="w-44 md:w-56 h-10 rounded-lg border border-zinc-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-zinc-800 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-zinc-100 shadow-xl">
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-[10px] font-black uppercase tracking-widest py-2.5 cursor-pointer"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Layout: sidebar + grid ── */}
              <div className="flex gap-8 items-start">
                <aside className="hidden lg:block w-[200px] xl:w-[220px] shrink-0 sticky top-[8rem]">
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
                      value={categoryQuery}
                      onChange={(e) => setCategoryQuery(e.target.value)}
                    />
                  </div>

                  <nav className="flex flex-col gap-1 max-h-[600px] overflow-y-auto luxury-scrollbar pr-2">
                    {filteredCategories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="py-2.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all duration-200"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </nav>
                </aside>

                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-8 sm:gap-y-10">
                    {loading && items.length === 0
                      ? [...Array(12)].map((_, i) => (
                          <ProductCardSkeleton key={`s${i}`} />
                        ))
                      : items.map((p, i) => (
                          <ProductCard
                            key={`${p.id || p.sku}-${i}`}
                            product={p}
                            eager={i < 6}
                          />
                        ))}
                  </div>

                  {/* ── Paginare ── */}
                  {pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-zinc-100">
                      <button
                        onClick={() => goToPage(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                        className="size-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 disabled:hover:border-zinc-200"
                        aria-label="Pagina anterioară"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <div className="flex items-center gap-1">
                        {pageNumbers.map((n, idx) =>
                          n === "..." ? (
                            <span
                              key={`d${idx}`}
                              className="px-2 text-[10px] font-black text-zinc-300"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={n}
                              onClick={() => goToPage(n)}
                              disabled={loading}
                              className={`min-w-9 h-9 px-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                page === n
                                  ? "bg-zinc-900 text-white"
                                  : "text-zinc-500 hover:bg-zinc-100"
                              }`}
                            >
                              {n}
                            </button>
                          ),
                        )}
                      </div>
                      <button
                        onClick={() => goToPage(Math.min(pages, page + 1))}
                        disabled={page === pages || loading}
                        className="size-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 disabled:hover:border-zinc-200"
                        aria-label="Pagina următoare"
                      >
                        {loading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AllProductsAccordion;
