import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { RotateCcw, Search, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filtersData: {
    brands: string[];
    attributes: Record<string, { label: string; values: string[] }>;
  };
}

export const FilterSidebar = ({
  isOpen,
  onClose,
  filtersData,
}: FilterSidebarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [brandSearch, setBrandSearch] = useState("");
  const [attrSearch, setAttrSearch] = useState<Record<string, string>>({});

  // Efect pentru blocarea scroll-ului pe body când filtrul este activ global
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

  // Modificare parametri în URL
  const handleUpdateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const existing = params.getAll(key);

    if (existing.includes(value)) {
      const updated = existing.filter((v) => v !== value);
      params.delete(key);
      updated.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const handlePriceChange = (type: "minPrice" | "maxPrice", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const activeBrands = useMemo(
    () => searchParams.getAll("brand"),
    [searchParams],
  );

  const filteredBrands = useMemo(() => {
    if (!filtersData?.brands) return [];
    return filtersData.brands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase()),
    );
  }, [filtersData?.brands, brandSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        /* z-[999] garantează poziționarea peste absolut orice alt layout din pagină */
        <div className="fixed inset-0 z-[999] flex justify-end">
          {/* BACKGROUND BLUR OVERLAY (Identic cu ShoppingBag) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
          />

          {/* SIDERBAR-UL PROPRIU-ZIS */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="relative z-[1000] flex h-[100dvh] w-full sm:max-w-[460px] flex-col bg-white shadow-2xl"
          >
            {/* HEADER */}
            <header className="flex items-center justify-between px-8 py-8 border-b border-zinc-100 bg-white shrink-0">
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                  Filtrare
                </p>
                <p className="heading-serif text-3xl tracking-tighter text-[var(--dark-amethyst)]">
                  Filtre Colecție
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-zinc-100 hover:bg-[var(--dark-amethyst)] hover:text-white transition-all text-[var(--dark-amethyst)]"
              >
                <X size={18} />
              </button>
            </header>

            {/* CONȚINUT FILTRE SENSIDILE LA SCROLL */}
            <div className="flex-1 overflow-y-auto px-8 py-6 luxury-scrollbar text-left select-none">
              <Accordion
                type="multiple"
                defaultValue={["price", "brands"]}
                className="w-full"
              >
                {/* INTERVAL PREȚ */}
                <AccordionItem
                  value="price"
                  className="border-b border-zinc-100 py-3"
                >
                  <AccordionTrigger className="hover:no-underline group py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
                        Interval Preț
                      </span>
                      {(minPrice || maxPrice) && (
                        <span className="w-2 h-2 rounded-full bg-[var(--royal-violet)]" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min (RON)"
                        value={minPrice}
                        onChange={(e) =>
                          handlePriceChange("minPrice", e.target.value)
                        }
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-[var(--dark-amethyst)] focus:border-[var(--royal-violet)] focus:bg-white outline-none transition-all shadow-inner placeholder:text-zinc-300"
                      />
                      <span className="text-zinc-300 font-bold text-xs">—</span>
                      <input
                        type="number"
                        placeholder="Max (RON)"
                        value={maxPrice}
                        onChange={(e) =>
                          handlePriceChange("maxPrice", e.target.value)
                        }
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-[var(--dark-amethyst)] focus:border-[var(--royal-violet)] focus:bg-white outline-none transition-all shadow-inner placeholder:text-zinc-300"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* BRANDURI */}
                {filtersData?.brands && filtersData.brands.length > 0 && (
                  <AccordionItem
                    value="brands"
                    className="border-b border-zinc-100 py-3"
                  >
                    <AccordionTrigger className="hover:no-underline group py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
                          Producător
                        </span>
                        {activeBrands.length > 0 && (
                          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[var(--royal-violet)] text-white text-[9px] font-black">
                            {activeBrands.length}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 px-1 space-y-4">
                      {filtersData.brands.length > 6 && (
                        <div className="relative flex items-center group/search">
                          <Search
                            size={12}
                            className="absolute left-3 text-zinc-300 group-focus-within/search:text-[var(--royal-violet)] transition-colors"
                          />
                          <input
                            type="text"
                            placeholder="Caută brand..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-[11px] font-bold text-[var(--dark-amethyst)] outline-none focus:border-[var(--royal-violet)] transition-all"
                          />
                        </div>
                      )}
                      <div className="max-h-48 overflow-y-auto luxury-scrollbar pr-1 grid grid-cols-1 gap-3.5">
                        {filteredBrands.map((brand: string) => {
                          const isSelected = activeBrands.includes(brand);
                          return (
                            <button
                              key={brand}
                              onClick={() => handleUpdateFilter("brand", brand)}
                              className="flex items-center justify-between group/item text-left w-full"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center ${isSelected ? "border-[var(--royal-violet)] bg-[var(--royal-violet)] text-white" : "border-zinc-200 group-hover/item:border-[var(--royal-violet)]"}`}
                                >
                                  {isSelected && (
                                    <Check size={10} strokeWidth={4} />
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? "text-black font-black" : "text-zinc-400 group-hover/item:text-black"}`}
                                >
                                  {brand}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* ATRIBUTE DINAMICE */}
                {filtersData?.attributes &&
                  Object.entries(filtersData.attributes).map(
                    ([key, data]: [string, any]) => {
                      const activeValues = searchParams.getAll(key);
                      const currentSearch = attrSearch[key] || "";
                      const filteredValues = data.values.filter((v: string) =>
                        v.toLowerCase().includes(currentSearch.toLowerCase()),
                      );

                      return (
                        <AccordionItem
                          key={key}
                          value={key}
                          className="border-b border-zinc-100 py-3"
                        >
                          <AccordionTrigger className="hover:no-underline group py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
                                {data.label}
                              </span>
                              {activeValues.length > 0 && (
                                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[var(--royal-violet)] text-white text-[9px] font-black">
                                  {activeValues.length}
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 px-1 space-y-4">
                            {data.values.length > 8 && (
                              <div className="relative flex items-center group/search">
                                <Search
                                  size={12}
                                  className="absolute left-3 text-zinc-300 group-focus-within/search:text-[var(--royal-violet)] transition-colors"
                                />
                                <input
                                  type="text"
                                  placeholder={`Caută ${data.label.toLowerCase()}...`}
                                  value={currentSearch}
                                  onChange={(e) =>
                                    setAttrSearch((prev) => ({
                                      ...prev,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-[11px] font-bold text-[var(--dark-amethyst)] outline-none focus:border-[var(--royal-violet)] transition-all"
                                />
                              </div>
                            )}
                            <div className="max-h-48 overflow-y-auto luxury-scrollbar pr-1 flex flex-wrap gap-2">
                              {filteredValues.map((val: string) => {
                                const isSelected = activeValues.includes(val);
                                return (
                                  <button
                                    key={val}
                                    onClick={() => handleUpdateFilter(key, val)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isSelected ? "bg-[var(--royal-violet)] text-white border-[var(--royal-violet)] shadow-sm" : "bg-white text-zinc-400 border-zinc-100 hover:border-[var(--royal-violet)] hover:text-black"}`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    },
                  )}
              </Accordion>

              {searchParams.toString() !== "" && (
                <button
                  onClick={() => {
                    setSearchParams({});
                    setBrandSearch("");
                    setAttrSearch({});
                  }}
                  className="mt-8 flex items-center justify-center gap-2 py-4 border-b border-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 text-[var(--dark-amethyst)] hover:text-black transition-all w-full"
                >
                  <RotateCcw size={13} /> Resetează Toate Filtrele
                </button>
              )}
            </div>

            {/* FOOTER ACTIONABIL */}
            <div className="p-8 border-t border-zinc-100 bg-white shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <button
                onClick={onClose}
                className="relative h-16 w-full text-white rounded-2xl overflow-hidden transition-all shadow-2xl group active:scale-[0.98] border-none outline-none"
                style={{ background: "var(--primary-gradient)" }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-4 font-black uppercase text-[11px] tracking-[0.5em]">
                  Aplică filtrele
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
