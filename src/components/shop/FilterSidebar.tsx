import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, Plus, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FilterSidebar = ({ filtersData }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const activeBrands = searchParams.getAll("brand");

  return (
    <div className="w-full flex flex-col h-full bg-white">
      <Accordion type="multiple" defaultValue={["brands"]} className="w-full">
        {/* BRANDURI */}
        <AccordionItem value="brands" className="border-b border-zinc-50 py-2">
          <AccordionTrigger className="hover:no-underline group">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900">
              Brand
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <div className="grid grid-cols-1 gap-4">
              {filtersData.brands.map((brand: string) => {
                const isSelected = activeBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => handleUpdateFilter("brand", brand)}
                    className="flex items-center gap-3 group text-left"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${isSelected ? "border-black bg-black" : "border-zinc-200 group-hover:border-black"}`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-black" : "text-zinc-400 group-hover:text-black"}`}
                    >
                      {brand}
                    </span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ATRIBUTE DINAMICE */}
        {Object.entries(filtersData.attributes).map(
          ([key, data]: [string, any]) => {
            const activeValues = searchParams.getAll(key);
            return (
              <AccordionItem
                key={key}
                value={key}
                className="border-b border-zinc-50 py-2"
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900">
                    {data.label}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="flex flex-wrap gap-2">
                    {data.values.map((val: string) => {
                      const isSelected = activeValues.includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => handleUpdateFilter(key, val)}
                          className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all border ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black"
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

      {searchParams.toString() !== "" && (
        <button
          onClick={() => setSearchParams({})}
          className="mt-10 flex items-center justify-center gap-2 py-4 border-b border-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
        >
          <RotateCcw size={14} /> Resetează
        </button>
      )}
    </div>
  );
};
