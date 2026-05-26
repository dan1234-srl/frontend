import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FilterSortBarProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  itemCount: number;
}

const FilterSortBar = ({
  filtersOpen,
  setFiltersOpen,
  itemCount,
}: FilterSortBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = ["Earrings", "Bracelets", "Rings", "Necklaces"];
  const priceRanges = [
    "Under €1,000",
    "€1,000 - €2,000",
    "€2,000 - €3,000",
    "Over €3,000",
  ];
  const materials = ["Gold", "Silver", "Rose Gold", "Platinum"];

  // Logica de scriere directă în URL-ul magazinului pentru a trezi sortarea din Python
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.set("page", "1");
    setSearchParams(params);
  };

  // Preluăm valoarea curentă din URL cu fallback pe "cele-mai-noi"
  const currentSortValue = searchParams.get("sort") || "cele-mai-noi";

  return (
    <>
      <section className="w-full px-6 mb-8 border-b border-zinc-100 pb-4 text-left select-none">
        <div className="flex justify-between items-center">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
            {itemCount} Articole Găsite
          </p>

          <div className="flex items-center gap-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest hover:bg-transparent"
                >
                  Filtre
                </Button>
              </SheetTrigger>

              {/* 🚀 REPARAT ATOMIC: z-[99999] forțează trecerea ferestrei de filtre PESTE Navbar-ul fixed */}
              <SheetContent
                side="right"
                className="w-80 bg-white border-none shadow-2xl z-[99999] p-6 flex flex-col h-full text-left"
              >
                <SheetHeader className="mb-6 border-b border-zinc-100 pb-4 shrink-0">
                  <SheetTitle className="text-md font-black uppercase tracking-wider text-zinc-800">
                    Filtre
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-1">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-zinc-500">
                      Category
                    </h3>
                    <div className="space-y-3">
                      {(categories || []).map((cat) => (
                        <div
                          key={category}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={category}
                            className="border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                          />
                          <Label
                            htmlFor={category}
                            className="text-xs font-bold text-zinc-600 cursor-pointer uppercase tracking-wider"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-zinc-100" />

                  {/* Price Filter */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-zinc-500">
                      Price
                    </h3>
                    <div className="space-y-3">
                      {priceRanges.map((range) => (
                        <div
                          key={range}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={range}
                            className="border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                          />
                          <Label
                            htmlFor={range}
                            className="text-xs font-bold text-zinc-600 cursor-pointer uppercase tracking-wider"
                          >
                            {range}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-zinc-100" />

                  {/* Material Filter */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 text-zinc-500">
                      Material
                    </h3>
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div
                          key={material}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={material}
                            className="border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                          />
                          <Label
                            htmlFor={material}
                            className="text-xs font-bold text-zinc-600 cursor-pointer uppercase tracking-wider"
                          >
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-zinc-100 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] font-black uppercase tracking-widest justify-start pl-2 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[10px] font-black uppercase tracking-widest justify-start pl-2 py-3 text-zinc-400 hover:bg-zinc-50 rounded-xl"
                  >
                    Clear All
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={currentSortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto border-none bg-transparent text-[10px] font-black uppercase tracking-widest shadow-none rounded-none pr-2 focus:ring-0 focus:ring-offset-0 text-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-2xl border border-zinc-100 rounded-xl bg-white w-48 z-[9999]">
                <SelectItem
                  value="cele-mai-noi"
                  className="text-[10px] font-black uppercase tracking-widest py-3 pl-4 focus:bg-zinc-50 cursor-pointer"
                >
                  Cele mai noi
                </SelectItem>
                <SelectItem
                  value="pret-crescator"
                  className="text-[10px] font-black uppercase tracking-widest py-3 pl-4 focus:bg-zinc-50 cursor-pointer"
                >
                  Preț: Mic - Mare
                </SelectItem>
                <SelectItem
                  value="pret-descrescator"
                  className="text-[10px] font-black uppercase tracking-widest py-3 pl-4 focus:bg-zinc-50 cursor-pointer"
                >
                  Preț: Mare - Mic
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* 🚀 REPARAT ATOMIC: Am extins selectoarele pentru a prinde clasa dinamică de overlay din Radix 
         (bg-black/80, fixed inset-0) și am ridicat z-index-ul fundalului la z-[99990] ca să acopere Navbar-ul fixed
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          [data-radix-focus-trap] ~ div[class*="bg-black/"],
          div[class*="fixed inset-0 bg-black"],
          div[data-state="open"][class*="fixed inset-0"] {
            z-index: 99990 !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            background-color: rgba(9, 9, 11, 0.4) !important;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        `,
        }}
      />
    </>
  );
};

export default FilterSortBar;
