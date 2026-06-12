import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";
const STORAGE_KEY = "linea_theme_prod_v2";

export interface ThemeColors {
  id?: string;
  name?: string;
  slug?: string;
  is_active?: boolean;
  dark_amethyst?: string;
  dark_amethyst_2?: string;
  indigo_ink?: string;
  indigo_velvet?: string;
  royal_violet?: string;
  lavender_purple?: string;
  mauve_magic?: string;
  mauve?: string;
  text_primary?: string;
  surface_bg?: string;
  primary_gradient?: string;
}

interface ThemeContextType {
  theme: ThemeColors | null;
  themes: ThemeColors[];
  refreshTheme: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  applyTheme: (themeId: string) => Promise<boolean>;
  saveTheme: (
    data: Partial<ThemeColors>,
    targetId: string | null,
  ) => Promise<any>;
  deleteTheme: (themeId: string) => Promise<boolean>;
  previewTheme: (data: Partial<ThemeColors>) => void;
  resetPreview: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Funcția PURĂ de aplicare a temei globale ---
const applyToDOM = (t: ThemeColors) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Fallback-uri pentru siguranță
  const brand = t.royal_violet || "#7b2cbf";
  const deep = t.dark_amethyst || "#10002b";
  const bg = t.surface_bg || "#FBFBFD";
  const text = t.text_primary || "#10002b";

  const vars: Record<string, string> = {
    "--dark-amethyst": deep,
    "--dark-amethyst-2": t.dark_amethyst_2 || deep,
    "--indigo-ink": t.indigo_ink || brand,
    "--indigo-velvet": t.indigo_velvet || brand,
    "--royal-violet": brand,
    "--lavender-purple": t.lavender_purple || brand,
    "--mauve-magic": t.mauve_magic || brand,
    "--mauve": t.mauve || "#e0aaff",
    "--text-primary": text,
    "--surface-bg": bg,
    "--primary": brand,
    "--background": bg,
    "--foreground": text,
  };

  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  const safeGradient =
    t.primary_gradient && t.primary_gradient !== "NULL"
      ? t.primary_gradient
      : `linear-gradient(135deg, ${deep} 0%, ${t.indigo_ink || brand} 100%)`;

  root.style.setProperty("--primary-gradient", safeGradient);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeColors | null>(null);
  const [themes, setThemes] = useState<ThemeColors[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTheme = useCallback(async () => {
    try {
      const r = await fetch(
        `${API_BASE}/api/v1/themes/active?_t=${Date.now()}`,
      );
      if (r.ok) {
        const data = await r.json();
        setTheme(data);
        applyToDOM(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) applyToDOM(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLibrary = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/themes/all`, {
        credentials: "include",
      });
      if (r.ok) setThemes(await r.json());
    } catch (e) {
      console.warn("Theme library load failed.");
    }
  }, []);

  const saveTheme = async (
    data: Partial<ThemeColors>,
    targetId: string | null,
  ) => {
    try {
      const url = targetId
        ? `${API_BASE}/api/v1/themes/${targetId}`
        : `${API_BASE}/api/v1/themes/`;
      const r = await fetch(url, {
        method: targetId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Failed to save");
      const saved = await r.json();
      toast.success("Temă salvată cu succes!");
      await refreshLibrary();
      return saved;
    } catch (e) {
      toast.error("Eroare la salvarea temei");
      return null;
    }
  };

  const applyTheme = async (themeId: string) => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/themes/${themeId}/activate`, {
        method: "PATCH",
        credentials: "include",
      });
      if (r.ok) {
        await refreshTheme();
        toast.success("Temă activată!");
        return true;
      }
      throw new Error();
    } catch {
      toast.error("Nu s-a putut activa tema");
      return false;
    }
  };

  const deleteTheme = useCallback(async (themeId: string) => {
    try {
      const r = await fetch(`${API_BASE}/api/v1/themes/${themeId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok) {
        setThemes((prev) => prev.filter((t) => t.id !== themeId));
        toast.success("Temă ștearsă");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const previewTheme = useCallback(
    (data: Partial<ThemeColors>) => {
      if (theme) applyToDOM({ ...theme, ...data });
    },
    [theme],
  );

  const resetPreview = useCallback(() => {
    if (theme) applyToDOM(theme);
  }, [theme]);

  useEffect(() => {
    refreshTheme();
    refreshLibrary();
  }, [refreshTheme, refreshLibrary]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes,
        refreshTheme,
        refreshLibrary,
        applyTheme,
        saveTheme,
        deleteTheme,
        previewTheme,
        resetPreview,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
