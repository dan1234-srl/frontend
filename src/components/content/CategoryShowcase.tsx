import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

// Overlay-ul nu mai este folosit automat în SheetContent, dar îl păstrăm disponibil dacă vrei să-l folosești manual altundeva.
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 glass-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    {/* ⚠️ FĂRĂ OVERLAY AICI PENTRU A EVITA BLOCAJUL ÎN PORTAL ⚠️ */}
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};

```

---

### 2. `CategoryShowcase.tsx`

Aici am implementat logica de overlay manual cu `AnimatePresence` folosind clasa ta globală `glass-overlay`. Aceasta forțează blur-ul să fie deasupra tuturor elementelor din pagină (inclusiv Navbar).

```tsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Grid2X2,
  SlidersHorizontal,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // ─── Referințe Infinite Scroll ───
  const pageToLoadRef = useRef(2);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");

  // 1. Fetch Arbore Categorii
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((res) => res.json())
      .then(setCategoriesTree)
      .catch(() => {});
  }, []);

  // 2. Fetch Date Filtre
  useEffect(() => {
    setFiltersData(null);
    fetch(
      `${API_BASE_URL}/api/v1/products/filters/all?${searchParams.toString()}`,
    )
      .then((res) => {
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
    return () => observerRef.current?.disconnect();
  }, [totalPages, loadingMore, loading, fetchProducts]);

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

      {/* ─── Meniu Categorii pe Mobil (Pills) ─── */}
      <div className="lg:hidden flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
        <div className="flex gap-2 shrink-0">
          <Link
            to="/shop"
            className="whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-zinc-100 text-black border-zinc-200 shadow-sm"
          >
            Toate Produsele
          </Link>
          {categoriesTree.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Toolbar: Filtre Mobil + Sortare ─── */}
      <div className="flex items-center justify-between py-4 sm:py-5 mb-8 sm:mb-12 border-y border-zinc-100 sticky top-20 bg-white/95 backdrop-blur-md z-40 gap-3">
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

          {/* ✅ OVERLAY MANUAL CU Z-INDEX IMENS PENTRU A ACOPERI NAVBAR-UL ✅ */}
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

          <SheetContent
            side="right"
            hideClose
            className="w-[92%] sm:w-[450px] p-0 border-none bg-white z-[99999] shadow-2xl flex flex-col h-full text-left"
          >
            <SheetHeader className="p-6 sm:p-8 border-b border-zinc-100 shrink-0">
              <SheetTitle className="text-xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)]">
                Filtre Produse
              </SheetTitle>
              <button
                onClick={() => setFiltersOpen(false)}
                className="absolute right-6 top-6 h-8 w-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <X size={16} />
              </button>
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
        {/* Sidebar Categorii Desktop (Acordeon) */}
        <aside className="hidden lg:block w-[220px] xl:w-[250px] shrink-0 sticky top-44">
          <div className="flex items-center gap-2 mb-6 pl-2">
            <LayoutGrid size={13} className="text-[var(--royal-violet)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--royal-violet)]">
              Structură Categorii
            </span>
          </div>
          <nav className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto luxury-scrollbar pr-3">
            {categoriesTree.map((cat) => {
              const isExpanded = expandedCat === cat.slug;

              return (
                <div key={cat.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between group">
                    <Link
                      to={`/category/${cat.slug}`}
                      className="py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all duration-300 text-zinc-400 hover:text-black hover:bg-zinc-50/50 flex-1"
                    >
                      {cat.name}
                    </Link>
                    {/* Buton de expandare/colapsare pentru subcategorii */}
                    {cat.subcategories?.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedCat(isExpanded ? null : cat.slug)
                        }
                        className="p-2 text-zinc-400 hover:text-black transition-colors rounded-lg hover:bg-zinc-50"
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Randarea animată a subcategoriilor */}
                  <AnimatePresence>
                    {isExpanded && cat.subcategories?.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-col gap-1 ml-5 border-l border-zinc-100 pl-4 py-1.5 space-y-1 overflow-hidden"
                      >
                        {cat.subcategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className="text-[10px] font-bold uppercase tracking-tight transition-colors text-zinc-400 hover:text-black py-1"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
