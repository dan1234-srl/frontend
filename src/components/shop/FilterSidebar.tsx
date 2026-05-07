import { useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

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
    <div className="w-full space-y-2">
      <Accordion type="multiple" className="w-full">
        {/* BRANDURI */}
        <AccordionItem value="brands" className="border-b border-zinc-50">
          <AccordionTrigger className="py-4 text-[11px] font-black uppercase tracking-widest hover:no-underline">
            Branduri
          </AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-3">
            {filtersData.brands.map((brand) => (
              <div
                key={brand}
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={() => handleUpdateFilter("brand", brand)}
              >
                <Checkbox
                  id={`brand-${brand}`}
                  checked={activeBrands.includes(brand)}
                  className="rounded-sm border-zinc-200 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                />
                <label className="text-xs font-medium text-zinc-500 group-hover:text-black uppercase cursor-pointer transition-colors">
                  {brand}
                </label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* ATRIBUTE DINAMICE */}
        {Object.entries(filtersData.attributes).map(([key, data]) => {
          const activeValues = searchParams.getAll(key);
          return (
            <AccordionItem
              key={key}
              value={key}
              className="border-b border-zinc-50"
            >
              <AccordionTrigger className="py-4 text-[11px] font-black uppercase tracking-widest hover:no-underline">
                {data.label}
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-6">
                <div className="flex flex-wrap gap-2">
                  {data.values.map((val) => (
                    <Badge
                      key={val}
                      variant={
                        activeValues.includes(val) ? "default" : "outline"
                      }
                      className={`cursor-pointer rounded-none uppercase text-[9px] px-3 py-1.5 transition-all border-zinc-200 shadow-none font-bold ${
                        activeValues.includes(val)
                          ? "bg-brand-deep text-white border-brand-deep"
                          : "bg-white text-zinc-500 hover:border-black"
                      }`}
                      onClick={() => handleUpdateFilter(key, val)}
                    >
                      {val}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* BUTON RESETARE RAPIDĂ */}
      {searchParams.toString() !== "" && (
        <button
          onClick={() => setSearchParams({})}
          className="w-full mt-6 text-[9px] font-black uppercase tracking-[0.2em] py-4 border border-dashed border-zinc-200 hover:bg-zinc-50 transition-colors"
        >
          Resetează Filtrele
        </button>
      )}
    </div>
  );
};
