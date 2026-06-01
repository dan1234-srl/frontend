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
  // ✅ PRIMIM PROPS PENTRU A GESTIONA STAREA LOCALĂ
  searchParams?: URLSearchParams;
  setSearchParams?: (params: URLSearchParams) => void;
}

export const FilterSidebar = ({
  filtersData,
  searchParams: searchParamsProp,
  setSearchParams: setSearchParamsProp,
}: FilterSidebarProps) => {
  const [internalParams, setInternalParams] = useState<URLSearchParams>(
    () => new URLSearchParams(),
  );
  const searchParams = searchParamsProp ?? internalParams;
  const setSearchParams = setSearchParamsProp ?? setInternalParams;
  const [brandSearch, setBrandSearch] = useState("");
  const [attrSearch, setAttrSearch] = useState<Record<string, string>>({});

  const handleUpdateFilter = (key: string, value: string) => {
    // ✅ CLONĂM PARAMS PENTRU A LUCRA LOCAL, FĂRĂ A MODIFICA URL-UL INSTANT
    const params = new URLSearchParams(searchParams);
    const existing = params.getAll(key);

    if (existing.includes(value)) {
      const updated = existing.filter((v) => v !== value);
      params.delete(key);
      updated.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }

    // ✅ APELĂM FUNCȚIA PRIMITĂ, CARE VA ACTUALIZA DOAR STAREA "PENDING"
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
    <div className="w-full flex flex-col h-full bg-white select-none text-left">
      <Accordion
        type="multiple"
        defaultValue={["price", "brands"]}
        className="w-full"
      >
        {/* INTERVAL DE PREȚ */}
        <AccordionItem value="price" className="border-b border-zinc-100 py-3">
          <AccordionTrigger className="hover:no-underline group py-2">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
              Interval Preț
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 px-1">
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min (RON)"
                value={minPrice}
                onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-[var(--dark-amethyst)] focus:border-[var(--royal-violet)] outline-none transition-all shadow-inner"
              />
              <span className="text-zinc-300 font-bold">—</span>
              <input
                type="number"
                placeholder="Max (RON)"
                value={maxPrice}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-[var(--dark-amethyst)] focus:border-[var(--royal-violet)] outline-none transition-all shadow-inner"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PRODUCĂTORI */}
        {filtersData?.brands && filtersData.brands.length > 0 && (
          <AccordionItem
            value="brands"
            className="border-b border-zinc-100 py-3"
          >
            <AccordionTrigger className="hover:no-underline group py-2">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
                Producător
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-1 space-y-4">
              {filtersData.brands.length > 6 && (
                <input
                  type="text"
                  placeholder="Caută brand..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-[11px] font-bold outline-none focus:border-[var(--royal-violet)]"
                />
              )}
              <div className="max-h-48 overflow-y-auto luxury-scrollbar pr-1 grid gap-3.5">
                {filteredBrands.map((brand: string) => {
                  const isSelected = activeBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => handleUpdateFilter("brand", brand)}
                      className="flex items-center gap-3 w-full"
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? "bg-[var(--royal-violet)] border-[var(--royal-violet)]" : "border-zinc-200"}`}
                      >
                        {isSelected && (
                          <Check
                            size={10}
                            strokeWidth={4}
                            className="text-white"
                          />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase ${isSelected ? "text-black" : "text-zinc-400"}`}
                      >
                        {brand}
                      </span>
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
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
                      {data.label}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-1 space-y-4">
                    <div className="max-h-48 overflow-y-auto luxury-scrollbar flex flex-wrap gap-2">
                      {filteredValues.map((val: string) => {
                        const isSelected = activeValues.includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => handleUpdateFilter(key, val)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${isSelected ? "bg-[var(--royal-violet)] text-white border-[var(--royal-violet)]" : "bg-white text-zinc-400 border-zinc-100"}`}
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
    </div>
  );
};
