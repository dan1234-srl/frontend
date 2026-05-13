import { useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";

interface Props {
  filtersData: {
    brands: string[];
    attributes: Record<string, { label: string; values: string[] }>;
  };
}

export const FilterSidebar = ({ filtersData }: Props) => {
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
    <div className="w-full flex flex-col h-full">
      <Accordion type="multiple" defaultValue={["brands"]} className="w-full">
        {/* BRANDURI - Afișate ca o listă elegantă cu numărător */}
        <AccordionItem value="brands" className="border-none mb-4">
          <AccordionTrigger className="py-4 px-2 text-[12px] font-black uppercase tracking-[0.2em] hover:no-underline bg-zinc-50 rounded-t-2xl">
            Branduri Selecte
          </AccordionTrigger>
          <AccordionContent className="p-4 bg-zinc-50/50 rounded-b-2xl border border-t-0 border-zinc-50">
            <div className="grid grid-cols-1 gap-2">
              {filtersData.brands.map((brand) => {
                const isSelected = activeBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => handleUpdateFilter("brand", brand)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-white border-black shadow-sm ring-1 ring-black"
                        : "bg-transparent border-zinc-100 hover:border-zinc-300"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-tight ${isSelected ? "text-black" : "text-zinc-500"}`}
                    >
                      {brand}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="check"
                        className="w-1.5 h-1.5 rounded-full bg-black"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ATRIBUTE DINAMICE (Culoare, Material, etc.) */}
        {Object.entries(filtersData.attributes).map(([key, data]) => {
          const activeValues = searchParams.getAll(key);
          const isColor = key.toLowerCase().includes("culoare");

          return (
            <AccordionItem key={key} value={key} className="border-none mb-4">
              <AccordionTrigger className="py-4 px-2 text-[12px] font-black uppercase tracking-[0.2em] hover:no-underline bg-zinc-50 rounded-t-2xl">
                {data.label}
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-zinc-50/50 rounded-b-2xl border border-t-0 border-zinc-50">
                <div className="flex flex-wrap gap-2">
                  {data.values.map((val) => {
                    const isSelected = activeValues.includes(val);
                    return (
                      <button
                        key={val}
                        onClick={() => handleUpdateFilter(key, val)}
                        className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full border ${
                          isSelected
                            ? "bg-black text-white border-black shadow-lg scale-105"
                            : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
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
        })}
      </Accordion>

      {/* FOOTER FIX ÎN DRAWER - Doar dacă există filtre active */}
      {searchParams.toString() !== "" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 sticky bottom-4"
        >
          <button
            onClick={() => setSearchParams({})}
            className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-900 text-white rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-95"
          >
            <RotateCcw size={16} />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
              Resetează Tot
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
