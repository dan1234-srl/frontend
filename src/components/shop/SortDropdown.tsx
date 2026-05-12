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
    <Select
      onValueChange={handleSortChange}
      defaultValue={searchParams.get("sort") || "newest"}
    >
      {/* Explicit fixed width prevents layout jumping when text length changes */}
      <SelectTrigger className="w-full md:w-[220px] h-11 rounded-lg border border-zinc-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-zinc-800 shadow-sm focus:ring-0 focus:ring-offset-0 focus:border-zinc-400 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-zinc-400 font-bold shrink-0 hidden sm:inline">
            Sortare:
          </span>
          <span className="truncate">
            <SelectValue placeholder="Sortează" />
          </span>
        </div>
      </SelectTrigger>

      <SelectContent
        position="popper"
        sideOffset={5}
        className="z-[9999] bg-white border border-zinc-100 shadow-xl rounded-lg w-[220px]"
      >
        <SelectItem
          value="newest"
          className="text-[10px] font-black uppercase tracking-widest py-3 pl-8 focus:bg-zinc-50 cursor-pointer text-zinc-700"
        >
          Cele mai noi
        </SelectItem>
        <SelectItem
          value="price_asc"
          className="text-[10px] font-black uppercase tracking-widest py-3 pl-8 focus:bg-zinc-50 cursor-pointer text-zinc-700"
        >
          Preț: Mic - Mare
        </SelectItem>
        <SelectItem
          value="price_desc"
          className="text-[10px] font-black uppercase tracking-widest py-3 pl-8 focus:bg-zinc-50 cursor-pointer text-zinc-700"
        >
          Preț: Mare - Mic
        </SelectItem>
        <SelectItem
          value="popular"
          className="text-[10px] font-black uppercase tracking-widest py-3 pl-8 focus:bg-zinc-50 cursor-pointer text-zinc-700"
        >
          Cele mai populare
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
