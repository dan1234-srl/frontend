import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SortDropdown = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    setSearchParams(params);
  };

  return (
    // Folosim un div cu lățime fixă pentru a ancora elementul
    <div className="flex items-center justify-end min-w-[160px] md:min-w-[200px]">
      <Select
        onValueChange={handleSortChange}
        defaultValue={searchParams.get("sort") || "newest"}
      >
        <SelectTrigger className="h-11 w-full border border-zinc-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:ring-offset-0 transition-all rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold hidden sm:inline">
              Sortare:
            </span>
            <SelectValue placeholder="Sortează" />
          </div>
        </SelectTrigger>

        <SelectContent
          // 'popper' ajută la evitarea flicker-ului de poziționare
          position="popper"
          sideOffset={5}
          className="z-[10000] min-w-[200px] bg-white border border-zinc-100 shadow-xl rounded-xl"
        >
          <SelectItem
            value="newest"
            className="text-[10px] font-black uppercase py-3 cursor-pointer"
          >
            Cele mai noi
          </SelectItem>
          <SelectItem
            value="price_asc"
            className="text-[10px] font-black uppercase py-3 cursor-pointer"
          >
            Preț: Mic - Mare
          </SelectItem>
          <SelectItem
            value="price_desc"
            className="text-[10px] font-black uppercase py-3 cursor-pointer"
          >
            Preț: Mare - Mic
          </SelectItem>
          <SelectItem
            value="popular"
            className="text-[10px] font-black uppercase py-3 cursor-pointer"
          >
            Cele mai populare
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
