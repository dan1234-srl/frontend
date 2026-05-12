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
    <div className="flex items-center w-full">
      <Select
        onValueChange={handleSortChange}
        defaultValue={searchParams.get("sort") || "newest"}
      >
        <SelectTrigger className="w-full md:w-[200px] h-11 rounded-lg border border-zinc-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-zinc-800 shadow-sm focus:ring-0 focus:ring-offset-0 focus:border-zinc-400 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold hidden sm:inline-block">
              Sortare:
            </span>
            <SelectValue placeholder="Sortează după" />
          </div>
        </SelectTrigger>

        {/* Adăugăm z-index mare și constrângeri de lățime fixă pe Content pentru a preveni flicker-ul */}
        <SelectContent
          className="z-[9999] bg-white border border-zinc-100 shadow-xl rounded-lg w-[200px]"
          position="popper"
          sideOffset={8}
        >
          <SelectItem
            value="newest"
            className="text-[11px] font-bold uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer"
          >
            Cele mai noi
          </SelectItem>
          <SelectItem
            value="price_asc"
            className="text-[11px] font-bold uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer"
          >
            Preț: Mic - Mare
          </SelectItem>
          <SelectItem
            value="price_desc"
            className="text-[11px] font-bold uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer"
          >
            Preț: Mare - Mic
          </SelectItem>
          <SelectItem
            value="popular"
            className="text-[11px] font-bold uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer"
          >
            Cele mai populare
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
