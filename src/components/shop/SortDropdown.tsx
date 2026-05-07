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
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase text-gray-400">
        Sortare:
      </span>
      <Select
        onValueChange={handleSortChange}
        defaultValue={searchParams.get("sort") || "newest"}
      >
        <SelectTrigger className="w-[180px] h-8 text-[10px] font-bold uppercase border-none bg-transparent focus:ring-0">
          <SelectValue placeholder="Sortează după" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Cele mai noi</SelectItem>
          <SelectItem value="price_asc">Preț: Mic - Mare</SelectItem>
          <SelectItem value="price_desc">Preț: Mare - Mic</SelectItem>
          <SelectItem value="popular">Cele mai populare</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
