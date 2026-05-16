import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface FiltersData {
  category_name?: string;
  brands: string[];
  attributes: Record<string, { label: string; values: string[] }>;
}

interface FiltersContextValue {
  filtersOpen: boolean;
  filtersData: FiltersData | null;
  openFilters: () => void;
  closeFilters: () => void;
  setFiltersData: (data: FiltersData | null) => void;
  onReset: (() => void) | null;
  registerResetHandler: (handler: () => void) => void;
  unregisterResetHandler: () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  const [onReset, setOnReset] = useState<(() => void) | null>(null);

  const openFilters = useCallback(() => setFiltersOpen(true), []);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const registerResetHandler = useCallback((handler: () => void) => {
    setOnReset(() => handler);
  }, []);

  const unregisterResetHandler = useCallback(() => {
    setOnReset(null);
  }, []);

  return (
    <FiltersContext.Provider
      value={{
        filtersOpen,
        filtersData,
        openFilters,
        closeFilters,
        setFiltersData,
        onReset,
        registerResetHandler,
        unregisterResetHandler,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = (): FiltersContextValue => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");
  return ctx;
};
