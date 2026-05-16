import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { RotateCcw, Search, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterSidebarProps {
  filtersData: {
    brands: string[];
    attributes: Record<string, { label: string; values: string[] }>;
  };
}

export const FilterSidebar = ({ filtersData }: FilterSidebarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Stări pentru barele de căutare din interiorul filtrelor voluminoase
  const [brandSearch, setBrandSearch] = useState("");
  const [attrSearch, setAttrSearch] = useState<Record<string, string>>({});

  // --- LOGICĂ URCARE PARAMETRI ÎN URL ---
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

  // --- LOGICĂ FILTRARE PREȚ ---
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

  // --- DATE ACTIVE EXTRACTE ---
  const activeBrands = useMemo(
    () => searchParams.getAll("brand"),
    [searchParams],
  );

  // Filtrarea brandurilor în timp real din bara de căutare internă
  const filteredBrands = useMemo(() => {
    if (!filtersData?.brands) return [];
    return filtersData.brands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase()),
    );
  }, [filtersData?.brands, brandSearch]);

  return (
    <div className="w-full flex flex-col h-full bg-white select-none text-left">
      <Accordion
        type="multiple"
        defaultValue={["price", "brands"]}
        className="w-full"
      >
        {/* INTERVAL DE PREȚ */}
        <AccordionItem value="price" className="border-b border-zinc-100 py-3">
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
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Min (RON)"
                  value={minPrice}
                  onChange={(e) =>
                    handlePriceChange("minPrice", e.target.value)
                  }
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-[var(--dark-amethyst)] focus:border-[var(--royal-violet)] focus:bg-white outline-none transition-all shadow-inner placeholder:text-zinc-300"
                />
              </div>
              <span className="text-zinc-300 font-bold text-xs">—</span>
              <div className="relative flex-1">
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
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PRODUCĂTORI / BRANDURI */}
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
              {/* Căutare internă în branduri dacă lista este mare */}
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
                          className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center ${
                            isSelected
                              ? "border-[var(--royal-violet)] bg-[var(--royal-violet)] text-white"
                              : "border-zinc-200 group-hover/item:border-[var(--royal-violet)]"
                          }`}
                        >
                          {isSelected && <Check size={10} strokeWidth={4} />}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            isSelected
                              ? "text-black font-black"
                              : "text-zinc-400 group-hover/item:text-black"
                          }`}
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

        {/* FILTRE DINAMICE DIN MEILISEARCH / DB */}
        {filtersData?.attributes &&
          Object.entries(filtersData.attributes).map(
            ([key, data]: [string, any]) => {
              const activeValues = searchParams.getAll(key);
              const currentSearch = attrSearch[key] || "";

              // Filtrarea valorilor atributului curent pe baza căutării interne
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
                    {/* Căutare internă în atribute voluminoase (ex: dimensiuni sau culori multe) */}
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

                    {/* Afișare optimizată sub formă de tags elastice */}
                    <div className="max-h-48 overflow-y-auto luxury-scrollbar pr-1 flex flex-wrap gap-2">
                      {filteredValues.map((val: string) => {
                        const isSelected = activeValues.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => handleUpdateFilter(key, val)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              isSelected
                                ? "bg-[var(--royal-violet)] text-white border-[var(--royal-violet)] shadow-sm"
                                : "bg-white text-zinc-400 border-zinc-100 hover:border-[var(--royal-violet)] hover:text-black"
                            }`}
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

      {/* BUTON RESET GLOBAL */}
      {searchParams.toString() !== "" && (
        <button
          onClick={() => {
            setSearchParams({});
            setBrandSearch("");
            setAttrSearch({});
          }}
          className="mt-8 flex items-center justify-center gap-2 py-4 border-b border-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 text-[var(--dark-amethyst)] hover:text-black transition-all"
        >
          <RotateCcw size={13} /> Resetează Toate Filtrele
        </button>
      )}
    </div>
  );
};
