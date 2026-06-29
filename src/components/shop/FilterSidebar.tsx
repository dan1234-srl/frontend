/**
 * FilterSidebar.tsx
 * Design Premium "Atelier Suite" — același limbaj vizual ca CheckoutPopup
 * Futurist, fluid, modern — cu animații Framer Motion și variabile CSS din backend
 */

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  SlidersHorizontal,
  Tag,
  Layers,
  X,
  Sparkles,
  Check,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  filtersData: {
    category_name?: string;
    brands?: string[];
    attributes?: Record<string, { label: string; values: string[] }>;
  } | null;
  searchParams?: URLSearchParams;
  setSearchParams?: (params: URLSearchParams) => void;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const toggleParam = (
  params: URLSearchParams,
  key: string,
  value: string,
): URLSearchParams => {
  const next = new URLSearchParams(params.toString());
  const existing = next.getAll(key);
  if (existing.includes(value)) {
    next.delete(key);
    existing.filter((v) => v !== value).forEach((v) => next.append(key, v));
  } else {
    next.append(key, value);
  }
  return next;
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

/**
 * Secțiune colapsabilă premium cu animație fluidă
 */
const FilterSection = ({
  label,
  icon: Icon,
  count,
  activeCount = 0,
  defaultOpen = true,
  children,
}: {
  label: string;
  icon: React.ElementType;
  count?: number;
  activeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 group hover:bg-zinc-50/70 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg transition-all ${
              activeCount > 0
                ? "bg-[var(--royal-violet)] text-white shadow-[0_4px_12px_rgba(123,44,191,0.3)]"
                : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"
            }`}
          >
            <Icon size={12} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)]">
            {label}
          </span>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[var(--royal-violet)] text-white text-[8px] font-black"
            >
              {activeCount}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-[9px] font-bold text-zinc-400">{count}</span>
          )}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChevronDown size={13} className="text-zinc-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-zinc-100/80">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Checkbox premium cu efect de glow la activare
 */
const PremiumCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <motion.button
    onClick={onChange}
    whileTap={{ scale: 0.97 }}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
      checked
        ? "bg-violet-50/60 border border-violet-200/60"
        : "hover:bg-zinc-50 border border-transparent"
    }`}
  >
    <div
      className={`size-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
        checked
          ? "bg-[var(--royal-violet)] shadow-[0_2px_8px_rgba(123,44,191,0.4)] border-transparent"
          : "border border-zinc-200 bg-white group-hover:border-violet-300"
      }`}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check size={10} className="text-white" strokeWidth={3.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <span
      className={`text-[11px] font-bold transition-colors ${
        checked
          ? "text-[var(--dark-amethyst)]"
          : "text-zinc-600 group-hover:text-zinc-900"
      }`}
    >
      {label}
    </span>
  </motion.button>
);

/**
 * Brand pill premium cu efect de activare glow
 */
const BrandPill = ({
  brand,
  active,
  onToggle,
}: {
  brand: string;
  active: boolean;
  onToggle: () => void;
}) => (
  <motion.button
    onClick={onToggle}
    whileTap={{ scale: 0.95 }}
    className={`relative px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all overflow-hidden ${
      active
        ? "text-white shadow-[0_4px_14px_rgba(123,44,191,0.35)]"
        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
    }`}
    style={
      active
        ? {
            background:
              "var(--primary-gradient, linear-gradient(135deg, #7B2CBF, #9D4EDD))",
          }
        : undefined
    }
  >
    {active && (
      <motion.div
        layoutId={`brand-glow-${brand}`}
        className="absolute inset-0 opacity-20 bg-white rounded-xl"
        initial={false}
      />
    )}
    {brand}
  </motion.button>
);

/**
 * Input premium pentru preț
 */
const PriceInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full border border-zinc-200 rounded-xl bg-zinc-50/50 px-3 pr-10 text-[13px] font-bold text-[var(--dark-amethyst)] placeholder:text-zinc-300 placeholder:font-medium outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 focus:bg-white transition-all"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-300 uppercase tracking-wider pointer-events-none">
        RON
      </span>
    </div>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export const FilterSidebar = ({
  filtersData,
  searchParams: searchParamsProp,
  setSearchParams: setSearchParamsProp,
}: FilterSidebarProps) => {
  const [routerSearchParams, setRouterSearchParams] = useSearchParams();
  const searchParams = searchParamsProp ?? routerSearchParams;
  const setSearchParams = setSearchParamsProp ?? setRouterSearchParams;
  const brands = filtersData?.brands || [];
  const attributes = filtersData?.attributes || {};

  // Stare locală pentru preț (aplicat doar la Enter / blur)
  const [priceMin, setPriceMin] = useState(searchParams.get("minPrice") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("maxPrice") || "");

  const activeBrands = useMemo(
    () => searchParams.getAll("brand"),
    [searchParams],
  );

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    searchParams.forEach((val, key) => {
      if (
        !["page", "sort", "category_slug", "sort_by", "sort_order"].includes(
          key,
        ) &&
        val
      )
        n++;
    });
    return n;
  }, [searchParams]);

  const handleBrandToggle = useCallback(
    (brand: string) => {
      setSearchParams(toggleParam(searchParams, "brand", brand));
    },
    [searchParams, setSearchParams],
  );

  const handleAttributeToggle = useCallback(
    (key: string, value: string) => {
      setSearchParams(toggleParam(searchParams, key, value));
    },
    [searchParams, setSearchParams],
  );

  const applyPrice = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (priceMin) next.set("minPrice", priceMin);
    else next.delete("minPrice");
    if (priceMax) next.set("maxPrice", priceMax);
    else next.delete("maxPrice");
    next.set("page", "1");
    setSearchParams(next);
  }, [priceMin, priceMax, searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    const next = new URLSearchParams();
    if (searchParams.has("sort")) next.set("sort", searchParams.get("sort")!);
    next.set("page", "1");
    setPriceMin("");
    setPriceMax("");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  if (!filtersData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="size-8 rounded-full border-2 border-[var(--royal-violet)] border-t-transparent animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
          Se încarcă filtrele...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header activ filtre ── */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl border"
              style={{
                background:
                  "linear-gradient(135deg, rgba(123,44,191,0.06), rgba(157,78,221,0.04))",
                borderColor: "rgba(123,44,191,0.15)",
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  size={12}
                  className="text-[var(--royal-violet)]"
                  strokeWidth={2}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--royal-violet)]">
                  {activeFiltersCount} filtru{activeFiltersCount > 1 ? "e" : ""}{" "}
                  active
                </span>
              </div>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-500 transition-colors group"
              >
                <X
                  size={10}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                Resetează
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preț ── */}
      <FilterSection
        label="Interval Preț"
        icon={SlidersHorizontal}
        activeCount={
          (searchParams.has("minPrice") ? 1 : 0) +
          (searchParams.has("maxPrice") ? 1 : 0)
        }
      >
        <div className="flex flex-col gap-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <PriceInput
              label="Minim"
              value={priceMin}
              onChange={setPriceMin}
              placeholder="0"
            />
            <PriceInput
              label="Maxim"
              value={priceMax}
              onChange={setPriceMax}
              placeholder="9999"
            />
          </div>
          <motion.button
            onClick={applyPrice}
            whileTap={{ scale: 0.97 }}
            className="w-full h-10 rounded-xl text-white text-[9px] font-black uppercase tracking-[0.25em] shadow-[0_4px_14px_rgba(123,44,191,0.25)] hover:shadow-[0_6px_18px_rgba(123,44,191,0.35)] hover:opacity-90 transition-all"
            style={{
              background:
                "var(--primary-gradient, linear-gradient(135deg,#7B2CBF,#9D4EDD))",
            }}
          >
            Aplică Intervalul
          </motion.button>
        </div>
      </FilterSection>

      {/* ── Branduri ── */}
      {brands.length > 0 && (
        <FilterSection
          label="Branduri"
          icon={Tag}
          count={brands.length}
          activeCount={activeBrands.length}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {brands.map((brand) => (
              <BrandPill
                key={brand}
                brand={brand}
                active={activeBrands.includes(brand)}
                onToggle={() => handleBrandToggle(brand)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* ── Atribute dinamice ── */}
      {Object.entries(attributes).map(([key, { label, values }]) => {
        const activeVals = searchParams.getAll(key);
        return (
          <FilterSection
            key={key}
            label={label}
            icon={Layers}
            count={values.length}
            activeCount={activeVals.length}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-0.5 pt-1 max-h-[240px] overflow-y-auto luxury-scrollbar pr-1">
              {values.map((val) => (
                <PremiumCheckbox
                  key={val}
                  label={val}
                  checked={activeVals.includes(val)}
                  onChange={() => handleAttributeToggle(key, val)}
                />
              ))}
            </div>
          </FilterSection>
        );
      })}

      {/* Empty state ── */}
      {brands.length === 0 && Object.keys(attributes).length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <SlidersHorizontal size={18} className="text-zinc-300" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
            Niciun filtru disponibil
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
