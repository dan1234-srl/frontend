/**
 * AdminProducts.tsx
 * Pagina de administrare catalog produse - Design Futuristic (Bento Neo-Mosaic)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { readCache, writeCache } from "@/lib/swr-cache";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Search,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  DollarSign,
  AlignLeft,
  Image as ImageIcon,
  Layers,
  Globe,
  Package,
  Hash,
  Scale,
  Maximize,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowUpDown,
  Filter,
  Trash2,
  Sparkles,
  Inbox,
} from "lucide-react";
import {
  AdminDialogShell,
  AdminDialogTitle,
} from "@/components/admin/AdminDialogShell";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/product/RichTextEditor";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// ─── Utils ────────────────────────────────────────────────────────────────────

const PremiumInput = ({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder = "...",
}: any) => (
  <div className="space-y-1.5 text-left w-full group relative">
    <Label
      className="text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-1.5 transition-colors duration-300"
      style={{ color: "color-mix(in srgb, var(--royal-violet) 60%, gray)" }}
    >
      {icon} {label}
    </Label>
    <div className="relative">
      <input
        type={type}
        className="w-full bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-xs font-bold text-[var(--dark-amethyst)] outline-none transition-all placeholder:text-zinc-300 relative z-10"
        style={{
          boxShadow:
            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={(e) => {
          e.target.style.boxShadow =
            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 40%, transparent)";
          e.target.style.backgroundColor = "#ffffff";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow =
            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)";
          e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
        }}
      />
    </div>
  </div>
);

const generateSlug = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const PLACEHOLDER_IMG =
  "https://placehold.co/400x600/f4f4f5/a1a1aa.png?text=Fara+Imagine";

// Funcție utilitară inteligentă pentru imagini cu variante (large, medium, small)
const getValidImageObject = (imageSource: any) => {
  if (!imageSource) return null;

  let data = imageSource;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      // Dacă e string URL curat, creăm un obiect fals ca să nu crape componenta
      if (data.startsWith("http")) {
        return { large: data, medium: data, small: data };
      }
      return null;
    }
  }

  // Dacă are structura completă din baza de date { main: {...}, gallery: [...] }
  if (data && data.main) return data.main;

  // Dacă este deja obiectul cu variante { large, medium, small }
  if (data && data.large) return data;

  return null;
};

const getStatusBadge = (status: string, stock: number) => {
  if (stock === 0)
    return {
      bg: "color-mix(in srgb, #ef4444 8%, transparent)",
      text: "#ef4444",
      border: "color-mix(in srgb, #ef4444 20%, transparent)",
      label: "FĂRĂ STOC",
    };
  const s = status?.toLowerCase() || "";
  if (s === "active")
    return {
      bg: "color-mix(in srgb, #10b981 8%, transparent)",
      text: "#10b981",
      border: "color-mix(in srgb, #10b981 20%, transparent)",
      label: "ACTIV",
    };
  if (s === "draft")
    return {
      bg: "color-mix(in srgb, #f59e0b 8%, transparent)",
      text: "#f59e0b",
      border: "color-mix(in srgb, #f59e0b 20%, transparent)",
      label: "SCHIȚĂ",
    };
  return {
    bg: "color-mix(in srgb, #71717a 8%, transparent)",
    text: "#71717a",
    border: "color-mix(in srgb, #71717a 20%, transparent)",
    label: status || "N/A",
  };
};

// Componenta de Randare Imagini (Responsivă cu srcSet)
const OptimizedImage = ({
  src,
  className,
}: {
  src: any;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgData = useMemo(() => getValidImageObject(src), [src]);

  if (!imgData || hasError)
    return (
      <div
        className={`bg-zinc-50 flex items-center justify-center ${className}`}
      >
        <ImageIcon size={18} className="text-zinc-300" />
      </div>
    );

  return (
    <div className={`relative bg-zinc-50 overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-zinc-300" size={14} />
        </div>
      )}
      <img
        src={imgData.large || PLACEHOLDER_IMG}
        srcSet={
          imgData.small && imgData.medium && imgData.large
            ? `${imgData.small} 300w, ${imgData.medium} 600w, ${imgData.large} 1200w`
            : undefined
        }
        sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        alt="Product"
        crossOrigin="anonymous"
      />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminProducts = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [uploading, setUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const cacheKey = useMemo(
    () =>
      `admin:products:${currentPage}:${debouncedSearch}:${statusFilter}:${stockFilter}:${sortBy}:${sortOrder}:${categoryIdFilter}`,
    [
      currentPage,
      debouncedSearch,
      statusFilter,
      stockFilter,
      sortBy,
      sortOrder,
      categoryIdFilter,
    ],
  );

  const initialFormState = {
    sku: "",
    ean: "",
    slug: "",
    name: "",
    brand_name: "Evem",
    status: "ACTIVE",
    price: 0,
    sale_price: 0,
    stock_quantity: 0,
    category_id: "",
    image_url: { main: null, gallery: [] } as any, // 🚀 Structura unificată
    description: "",
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    additional_image_link: [] as any[], // Lăsăm aici doar pentru golire în handleSave
    attributes_json: {} as Record<string, any>,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCategories = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.items || []);
      }
    } catch (e) {
      console.error("Eroare la categorii:", e);
    }
  }, [isAdmin]);

  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const cached = readCache<any>(cacheKey, 30_000);
    if (cached.data) {
      setProducts(cached.data.items || []);
      setTotalPages(cached.data.pages || 1);
      setTotalItems(cached.data.total || 0);
      setLoading(false);
    }
    try {
      if (!cached.data) setLoading(true);
      const endpoint = debouncedSearch
        ? `${API_BASE_URL}/api/v1/products/search/live`
        : `${API_BASE_URL}/api/v1/products/admin-inventory`;

      let queryStatus = statusFilter;
      let queryStock = stockFilter;

      if (statusFilter === "OUT_OF_STOCK") {
        queryStatus = "ALL";
        queryStock = "OUT_OF_STOCK";
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        status: queryStatus,
        stock_status: queryStock,
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
        params.append("q", debouncedSearch);
        params.append("is_admin_view", "true");
      }
      if (categoryIdFilter) params.append("category_id", categoryIdFilter);

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Eroare la încărcare");

      const data = await res.json();
      setProducts(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
      writeCache(cacheKey, data);
    } catch (err) {
      if (!cached.data) toast.error("Eroare la încărcarea datelor.");
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    cacheKey,
    currentPage,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
    categoryIdFilter,
    stockFilter,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, [fetchData, fetchCategories]);

  const handleToggleStatus = async (sku: string, currentStatus: string) => {
    const newStatus = currentStatus === "DRAFT" ? "ACTIVE" : "DRAFT";
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/${sku}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`Status actualizat: ${newStatus}`);
        fetchData();
      } else toast.error("Eroare la actualizarea statusului.");
    } catch {
      toast.error("Eroare de conexiune la server.");
    }
  };

  const openEdit = async (p: any = null) => {
    if (p) {
      let productToEdit = p;
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/admin/detail/${p.sku}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) productToEdit = await res.json();
      } catch (err) {
        console.error("Eroare fetch detalii:", err);
      }

      setEditingProduct(productToEdit);

      // 1. Parsare structură principală image_url
      let parsedImageUrl: any = { main: null, gallery: [] };
      if (typeof productToEdit.image_url === "string") {
        try {
          parsedImageUrl = JSON.parse(productToEdit.image_url);
        } catch {
          // Fallback pt string simplu
          if (productToEdit.image_url.startsWith("http")) {
            parsedImageUrl.main = {
              large: productToEdit.image_url,
              medium: productToEdit.image_url,
              small: productToEdit.image_url,
            };
          }
        }
      } else if (
        productToEdit.image_url &&
        typeof productToEdit.image_url === "object"
      ) {
        parsedImageUrl = { ...productToEdit.image_url };
      }

      if (!parsedImageUrl.gallery) parsedImageUrl.gallery = [];

      // 2. MIGRAREA POZELOR VECHI DIN additional_image_link -> gallery
      let legacyGallery: any[] = [];
      if (productToEdit.additional_image_link) {
        try {
          legacyGallery =
            typeof productToEdit.additional_image_link === "string"
              ? JSON.parse(productToEdit.additional_image_link)
              : productToEdit.additional_image_link;
        } catch {}
      }

      // Dacă galeria nouă este goală, le mutăm pe cele vechi în format {large, medium, small}
      if (parsedImageUrl.gallery.length === 0 && legacyGallery.length > 0) {
        parsedImageUrl.gallery = legacyGallery.map((url) =>
          typeof url === "string"
            ? { large: url, medium: url, small: url }
            : url,
        );
      }

      let parsedAttributes = {};
      if (productToEdit.attributes_json) {
        try {
          parsedAttributes =
            typeof productToEdit.attributes_json === "string"
              ? JSON.parse(productToEdit.attributes_json)
              : productToEdit.attributes_json;
        } catch {}
      }

      setFormData({
        ...initialFormState,
        ...productToEdit,
        image_url: parsedImageUrl, // Totul e integrat aici
        additional_image_link: [], // Îl golim pentru curățenie
        category_id:
          productToEdit.category_id || productToEdit.category?.id || "",
        attributes_json: parsedAttributes,
        description: productToEdit.description || "",
      });
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number | "main",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(index === "main" ? "main" : `extra-${index}`);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
        method: "POST",
        body: data,
        credentials: "include",
      });
      const result = await res.json();

      if (!result.versions)
        throw new Error("Upload invalid: Format backend neașteptat");

      setFormData((prev) => {
        // Asigurăm că avem structura bază
        const currentImage =
          typeof prev.image_url === "object" && prev.image_url
            ? { ...prev.image_url }
            : { main: null, gallery: [] };

        if (!currentImage.gallery) currentImage.gallery = [];

        if (index === "main") {
          currentImage.main = result.versions;
        } else {
          currentImage.gallery[index as number] = result.versions;
        }

        return { ...prev, image_url: currentImage };
      });

      toast.success("Imagine procesată și urcată (variante multiple).");
    } catch (err) {
      console.error(err);
      toast.error("Eroare la procesarea imaginii.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id)
      return toast.error("Numele și Categoria sunt obligatorii.");

    const attributesPayload =
      typeof formData.attributes_json === "object"
        ? formData.attributes_json
        : JSON.parse(formData.attributes_json || "{}");

    // 🚀 Stringificăm obiectul curat cu { main: {...}, gallery: [...] }
    const imagePayload = formData.image_url
      ? typeof formData.image_url === "object"
        ? JSON.stringify(formData.image_url)
        : formData.image_url
      : null;

    const payload = {
      sku:
        formData.sku?.trim().toUpperCase() ||
        `LN-${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      ean: formData.ean?.trim() || null,
      slug: formData.slug || generateSlug(formData.name),
      name: formData.name.trim(),
      brand_name: formData.brand_name || "Evem",
      status: formData.status.toUpperCase(),
      price: parseFloat(formData.price as any) || 0.0,
      sale_price:
        parseFloat(formData.sale_price as any) > 0
          ? parseFloat(formData.sale_price as any)
          : null,
      stock_quantity: parseInt(formData.stock_quantity as any) || 0,
      category_id: formData.category_id,
      image_url: imagePayload, // 🚀 Aici merge obiectul unificat (stringified)
      description: formData.description || "",
      weight: parseFloat(formData.weight as any) || 0.0,
      length: parseFloat(formData.length as any) || 0.0,
      width: parseFloat(formData.width as any) || 0.0,
      height: parseFloat(formData.height as any) || 0.0,
      meta_title: formData.meta_title || "",
      meta_description: formData.meta_description || "",
      canonical_url: formData.canonical_url || null,
      additional_image_link: [], // 🚀 Golim intentionat field-ul vechi
      attributes_json: attributesPayload,
    };

    const url = editingProduct
      ? `${API_BASE_URL}/api/v1/products/${editingProduct.sku}`
      : `${API_BASE_URL}/api/v1/products/`;

    try {
      setIsSaving(true);
      const res = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Catalog sincronizat cu succes!");
        fetchData();
        setIsModalOpen(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.detail || "Eroare la scriere în baza de date.");
      }
    } catch (e) {
      toast.error("Pierdere conexiune gateway API.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in relative z-0">
      {/* ── HEADER FUTURISTIC ──────────────────────────────────────────────── */}
      <header
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pb-6 pt-4 border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Sparkles
              size={12}
              style={{ color: "var(--royal-violet)" }}
              className="animate-pulse"
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              System Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Catalog{" "}
            <span style={{ color: "var(--royal-violet)" }}>Portofoliu</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              size={15}
              style={{
                color:
                  "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
              }}
            />
            <input
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-xl border rounded-xl outline-none transition-all text-sm font-medium placeholder:font-normal"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                color: "var(--dark-amethyst)",
                boxShadow:
                  "0 4px 20px -10px color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
              placeholder="Caută în baza de date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--royal-violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor =
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)")
              }
            />
          </div>
          <button
            onClick={() => openEdit()}
            className="text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Adaugă Articol
          </button>
        </div>
      </header>

      {/* ── BARA FILTRE (Glassmorphism) ─────────────────────────────────────── */}
      <div
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3 rounded-[1.5rem] backdrop-blur-xl border bg-white/40"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 xl:pb-0 px-1">
          {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((f) => {
            const active = statusFilter === f;
            return (
              <button
                key={f}
                onClick={() => {
                  setStatusFilter(f);
                  setCurrentPage(1);
                }}
                className={`relative px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm shrink-0 ${
                  active
                    ? "text-white border-transparent"
                    : "text-zinc-500 hover:text-[var(--dark-amethyst)] bg-white border"
                }`}
                style={{
                  borderColor: !active
                    ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                    : undefined,
                }}
              >
                {active && (
                  <motion.span
                    layoutId="products-filter-tab"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--primary-gradient)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{f.replace(/_/g, " ")}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full xl:w-auto">
          {[
            {
              icon: Filter,
              val: categoryIdFilter,
              set: setCategoryIdFilter,
              opts: [
                { value: "", label: "Toate Categoriile" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ],
            },
            {
              icon: Package,
              val: stockFilter,
              set: setStockFilter,
              opts: [
                { value: "ALL", label: "Toate Stocurile" },
                { value: "LOW_STOCK", label: "Stoc Critic (≤5)" },
                { value: "OUT_OF_STOCK", label: "Epuizat (0)" },
              ],
            },
            {
              icon: ArrowUpDown,
              val: `${sortBy}-${sortOrder}`,
              set: (v: string) => {
                const [b, o] = v.split("-");
                setSortBy(b);
                setSortOrder(o);
              },
              opts: [
                { value: "updated_at-desc", label: "Cronologic: Recente" },
                { value: "price-asc", label: "Preț: Crescător" },
                { value: "price-desc", label: "Preț: Descrescător" },
                { value: "stock_quantity-asc", label: "Stoc: Deficitar" },
                { value: "category_name-asc", label: "Aranjare Categorie" },
              ],
            },
          ].map((FilterObj, idx) => (
            <div
              key={idx}
              className="relative flex items-center bg-white border rounded-xl px-4 py-2.5 transition-colors focus-within:border-[var(--royal-violet)] shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <FilterObj.icon
                size={12}
                style={{
                  color: "var(--royal-violet)",
                  marginRight: "8px",
                  flexShrink: 0,
                }}
              />
              <select
                value={FilterObj.val}
                onChange={(e) => {
                  FilterObj.set(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] outline-none cursor-pointer w-full appearance-none pr-4"
              >
                {FilterObj.opts.map((o: any) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div
        className="text-[9px] font-black uppercase tracking-widest text-right px-1"
        style={{ color: "color-mix(in srgb, var(--royal-violet) 40%, gray)" }}
      >
        {totalItems} articole indexate
      </div>

      {/* ── LISTĂ PRODUSE (BENTO DATA GRID) ─────────────────────────────────── */}
      <div
        className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.02] border overflow-hidden relative z-10 min-h-[500px]"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        {/* Desktop Header */}
        <div
          className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
            color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
          }}
        >
          <div className="col-span-5 pl-2">Produs & Cod</div>
          <div className="col-span-2 text-center">Categorie</div>
          <div className="col-span-1 text-center">Stoc</div>
          <div className="col-span-2 text-center">Preț (RON)</div>
          <div className="col-span-2 text-right pr-4">Acțiuni</div>
        </div>

        <div className="divide-y">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:grid md:grid-cols-12 px-6 md:px-10 py-5 items-start md:items-center gap-4 md:gap-0 border-b last:border-0"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                    }}
                  >
                    <div className="col-span-5 flex items-center gap-4 w-full">
                      <Skeleton className="size-14 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 w-24" />
                      </div>
                    </div>
                    <div className="col-span-2 md:mx-auto">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="col-span-1 md:mx-auto">
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                    <div className="col-span-2 md:mx-auto">
                      <Skeleton className="h-6 w-16 rounded-lg" />
                    </div>
                    <div className="col-span-2 md:ml-auto flex gap-2 w-full md:w-auto">
                      <Skeleton className="h-9 w-9 rounded-xl" />
                      <Skeleton className="h-9 w-9 rounded-xl" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center gap-3"
              >
                <Inbox
                  size={40}
                  strokeWidth={1}
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                  }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                  }}
                >
                  Niciun articol găsit
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {products.map((p) => {
                  const currentStock = p.stock_quantity ?? p.stock ?? 0;
                  const badge = getStatusBadge(p.status, currentStock);

                  return (
                    <div
                      key={p.id}
                      className="group relative transition-all border-b last:border-0 hover:bg-zinc-50/50"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                      }}
                    >
                      {/* Hover Fill Gradient */}
                      <div
                        className="absolute inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                        style={{
                          background:
                            "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                        }}
                      />

                      <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-4 relative z-10 gap-4 md:gap-0">
                        {/* Imagine + Nume */}
                        <div className="col-span-5 flex items-center gap-4 w-full pl-2">
                          <OptimizedImage
                            src={p.image_url}
                            className="w-14 h-16 rounded-[1rem] border border-[color-mix(in_srgb,var(--royal-violet)_15%,transparent)] shadow-sm shrink-0 transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-[var(--dark-amethyst)] uppercase tracking-tight truncate group-hover:text-[var(--royal-violet)] transition-colors pr-2">
                              {p.name}
                            </span>
                            <span
                              className="text-[9px] font-black uppercase tracking-widest mt-0.5"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                              }}
                            >
                              SKU: {p.sku}
                            </span>
                            <div className="md:hidden mt-2 flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border"
                                style={{
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                  borderColor: badge.border,
                                }}
                              >
                                {currentStock === 0 ? "FĂRĂ STOC" : p.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Categorie */}
                        <div className="col-span-2 hidden md:flex justify-center w-full">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest text-[var(--royal-violet)] px-3 py-1.5 rounded-md border bg-white"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                            }}
                          >
                            {p.category_name || p.category?.name || "General"}
                          </span>
                        </div>

                        {/* Status / Stoc */}
                        <div className="col-span-1 hidden md:flex justify-center w-full">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-[var(--dark-amethyst)] tabular-nums">
                              {currentStock}
                            </span>
                            <span
                              className="text-[8px] font-bold uppercase tracking-widest mt-0.5"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                              }}
                            >
                              Buc
                            </span>
                          </div>
                        </div>

                        {/* Preț */}
                        <div className="col-span-2 flex flex-col md:items-center w-full pl-2 md:pl-0">
                          {p.sale_price ? (
                            <>
                              <span className="text-[9px] line-through font-bold text-zinc-300 mb-0.5">
                                {p.price} RON
                              </span>
                              <span className="text-sm font-black text-rose-500 tabular-nums leading-none">
                                {p.sale_price} RON
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-black text-[var(--dark-amethyst)] tabular-nums leading-none">
                              {p.price} RON
                            </span>
                          )}
                        </div>

                        {/* Actiuni */}
                        <div className="col-span-2 flex justify-start md:justify-end gap-1.5 w-full md:w-auto pr-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 lg:translate-x-2 group-hover:translate-x-0 mt-2 md:mt-0">
                          <button
                            onClick={() => navigate(`/admin/products/${p.sku}`)}
                            className="p-2.5 bg-white border rounded-xl hover:bg-[var(--royal-violet)] hover:text-white transition-colors text-[var(--dark-amethyst)] shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                            }}
                            title="Editează detaliat"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => openEdit(p)}
                            className="p-2.5 bg-white border rounded-xl hover:bg-[var(--royal-violet)] hover:text-white transition-colors text-[var(--dark-amethyst)] shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                            }}
                            title="Editează structura"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(p.sku, p.status || "ACTIVE")
                            }
                            className="p-2.5 bg-white border rounded-xl hover:bg-amber-500 hover:text-white transition-colors text-amber-500 shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--warning-color) 20%, transparent)",
                            }}
                            title={
                              p.status === "DRAFT"
                                ? "Publică"
                                : "Ascunde (Schiță)"
                            }
                          >
                            {p.status === "DRAFT" ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="hidden sm:flex gap-1.5">
            {[...Array(totalPages)]
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${
                    currentPage === i + 1
                      ? "text-white border-transparent"
                      : "bg-white hover:bg-zinc-50"
                  }`}
                  style={{
                    background:
                      currentPage === i + 1
                        ? "var(--primary-gradient)"
                        : undefined,
                    borderColor:
                      currentPage !== i + 1
                        ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                        : undefined,
                    color:
                      currentPage === i + 1
                        ? "#ffffff"
                        : "var(--dark-amethyst)",
                  }}
                >
                  {i + 1}
                </button>
              ))
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2),
              )}
          </div>

          <span
            className="sm:hidden text-[10px] font-black uppercase tracking-[0.2em] bg-white border px-4 py-2 rounded-xl shadow-sm"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            {currentPage} <span className="opacity-30 mx-1">/</span>{" "}
            {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronRight size={14} style={{ color: "var(--royal-violet)" }} />
          </button>
        </div>
      )}

      {/* ── MODAL CONFIG PRODUS (Futuristic) ─────────────────────────────────────── */}
      <AdminDialogShell
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="full"
        mobileVariant="modal"
        className="sm:h-[94vh] sm:max-h-[94vh] rounded-none sm:rounded-[2.5rem] border shadow-2xl bg-[#FBFBFD]"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">Editare Produs</AdminDialogTitle>

        {/* Header Modal */}
        <header
          className="px-6 md:px-10 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b flex justify-between items-center shrink-0 sticky top-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="size-12 rounded-xl text-white hidden sm:flex items-center justify-center shadow-lg shrink-0"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Package size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)] truncate max-w-[200px] sm:max-w-md">
                {formData.sku ? `Editare: ${formData.sku}` : "Fișă Articol Nou"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--royal-violet)" }}
                />
                <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                  Core Product Configuration
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="size-10 bg-white border hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </header>

        {/* Body Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 luxury-scrollbar text-left relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ── Coloana Media (Stânga - Sticky pe desktop) ──────────────────────────── */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-0">
              <div
                className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border shadow-sm space-y-4"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <Label
                  className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 70%, gray)",
                  }}
                >
                  <ImageIcon size={13} /> Thumbnail Principal
                </Label>
                <div
                  className="aspect-[3/4] bg-zinc-50 rounded-2xl border-2 border-dashed flex items-center justify-center relative group overflow-hidden transition-all hover:bg-white"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                  }}
                >
                  {formData.image_url?.main ? (
                    <>
                      <OptimizedImage
                        src={formData.image_url.main}
                        className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              image_url: { ...formData.image_url, main: null },
                            })
                          }
                          className="bg-white text-rose-600 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform border border-rose-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label
                      className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center group-hover:scale-105 transition-transform"
                      style={{ color: "var(--royal-violet)" }}
                    >
                      {uploading === "main" ? (
                        <Loader2 className="animate-spin" size={32} />
                      ) : (
                        <Upload size={32} strokeWidth={1.5} />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                        Alege fișier
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "main")}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Galerie Adițională */}
              <div
                className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border shadow-sm space-y-4"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <Label
                  className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 70%, gray)",
                  }}
                >
                  <Layers size={13} /> Sub-Imagini
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-white rounded-xl border relative overflow-hidden group shadow-sm transition-transform hover:scale-105"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                    >
                      {formData.image_url?.gallery?.[i] ? (
                        <>
                          <OptimizedImage
                            src={formData.image_url.gallery[i]}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              const currentGallery = [
                                ...(formData.image_url?.gallery || []),
                              ];
                              currentGallery.splice(i, 1);
                              setFormData({
                                ...formData,
                                image_url: {
                                  ...formData.image_url,
                                  gallery: currentGallery,
                                },
                              });
                            }}
                            className="absolute inset-0 bg-rose-600/80 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                        </>
                      ) : (
                        <label
                          className="w-full h-full flex items-center justify-center cursor-pointer transition-colors"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                              "var(--royal-violet)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "color-mix(in srgb, var(--royal-violet) 40%, gray)")
                          }
                        >
                          {uploading === `extra-${i}` ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Plus size={18} strokeWidth={2.5} />
                          )}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, i)}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Coloana Date (Dreapta) ────────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Date Principale */}
              <div
                className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-sm space-y-6 sm:space-y-8"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <div className="space-y-1">
                  <Label
                    className="text-[9px] font-black uppercase tracking-[0.3em]"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                    }}
                  >
                    Identificator Comercial Nativ
                  </Label>
                  <input
                    className="w-full bg-transparent border-b-2 pb-3 text-2xl sm:text-3xl md:text-4xl font-black outline-none transition-all placeholder:text-zinc-200 tracking-tight"
                    style={{
                      color: "var(--dark-amethyst)",
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    }}
                    value={formData.name}
                    placeholder="Denumirea produsului..."
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--royal-violet)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor =
                        "color-mix(in srgb, var(--royal-violet) 15%, transparent)")
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <PremiumInput
                    label="Cod SKU"
                    icon={<Hash size={11} />}
                    value={formData.sku}
                    onChange={(e: any) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                  <PremiumInput
                    label="Cod EAN"
                    icon={<Hash size={11} />}
                    value={formData.ean}
                    onChange={(e: any) =>
                      setFormData({ ...formData, ean: e.target.value })
                    }
                  />
                  <div className="space-y-1.5 text-left w-full relative">
                    <Label
                      className="text-[9px] font-black uppercase tracking-[0.3em] ml-1"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                      }}
                    >
                      Segment (Cat)
                    </Label>
                    <select
                      className="w-full bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3.5 text-[11px] sm:text-xs font-bold outline-none appearance-none cursor-pointer relative z-10 transition-all uppercase tracking-widest truncate pr-8"
                      style={{
                        color: "var(--dark-amethyst)",
                        boxShadow:
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                      }}
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      onFocus={(e) => {
                        e.target.style.boxShadow =
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 40%, transparent)";
                        e.target.style.backgroundColor = "#ffffff";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow =
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)";
                        e.target.style.backgroundColor =
                          "rgba(255,255,255,0.5)";
                      }}
                    >
                      <option value="">Alege segmentul...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financiare */}
              <div
                className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-sm space-y-5"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <h3
                  className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                  style={{ color: "var(--dark-amethyst)" }}
                >
                  <DollarSign
                    size={14}
                    style={{ color: "var(--royal-violet)" }}
                  />{" "}
                  Financiare & Logistică
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                  <div
                    className="p-4 sm:p-5 bg-white rounded-2xl border text-center transition-all focus-within:shadow-md"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <Label
                      className="text-[8px] font-black uppercase tracking-[0.3em] block mb-2"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                      }}
                    >
                      Preț Original
                    </Label>
                    <input
                      type="number"
                      className="w-full bg-transparent text-lg sm:text-xl md:text-2xl font-black text-center outline-none"
                      style={{ color: "var(--dark-amethyst)" }}
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div
                    className="p-4 sm:p-5 rounded-2xl border text-center transition-all focus-within:shadow-md"
                    style={{
                      background: "color-mix(in srgb, #ef4444 3%, white)",
                      borderColor:
                        "color-mix(in srgb, #ef4444 20%, transparent)",
                    }}
                  >
                    <Label className="text-[8px] font-black text-rose-500 uppercase tracking-[0.3em] block mb-2">
                      Preț Vanzare
                    </Label>
                    <input
                      type="number"
                      className="w-full bg-transparent text-lg sm:text-xl md:text-2xl font-black text-center text-rose-600 outline-none"
                      value={formData.sale_price || ""}
                      placeholder="—"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sale_price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div
                    className="p-4 sm:p-5 bg-white rounded-2xl border text-center transition-all focus-within:shadow-md"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <Label
                      className="text-[8px] font-black uppercase tracking-[0.3em] block mb-2"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                      }}
                    >
                      Stoc
                    </Label>
                    <input
                      type="number"
                      className="w-full bg-transparent text-lg sm:text-xl md:text-2xl font-black text-center outline-none"
                      style={{ color: "var(--dark-amethyst)" }}
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div
                    className="p-4 sm:p-5 bg-white rounded-2xl border text-center flex flex-col justify-center transition-all focus-within:shadow-md"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <Label
                      className="text-[8px] font-black uppercase tracking-[0.3em] block mb-2"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                      }}
                    >
                      Status
                    </Label>
                    <select
                      className="bg-transparent text-[10px] sm:text-[11px] font-black text-center uppercase border-none outline-none cursor-pointer w-full"
                      style={{ color: "var(--dark-amethyst)" }}
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="ACTIVE">Public</option>
                      <option value="DRAFT">Schiță</option>
                      <option value="OUT_OF_STOCK">Fără stoc</option>
                    </select>
                  </div>
                </div>
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-4 sm:pt-6 border-t"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <PremiumInput
                    type="number"
                    label="Masă (g)"
                    icon={<Scale size={11} />}
                    value={formData.weight}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        weight: Number(e.target.value),
                      })
                    }
                  />
                  <PremiumInput
                    type="number"
                    label="Lungime"
                    icon={<Maximize size={11} />}
                    value={formData.length}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        length: Number(e.target.value),
                      })
                    }
                  />
                  <PremiumInput
                    type="number"
                    label="Lățime"
                    icon={<Maximize size={11} />}
                    value={formData.width}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        width: Number(e.target.value),
                      })
                    }
                  />
                  <PremiumInput
                    type="number"
                    label="Înălțime"
                    icon={<Maximize size={11} />}
                    value={formData.height}
                    onChange={(e: any) =>
                      setFormData({
                        ...formData,
                        height: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Descriere Rich Text */}
              <div
                className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-sm space-y-5"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3
                    className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    <AlignLeft
                      size={14}
                      style={{ color: "var(--royal-violet)" }}
                    />{" "}
                    Documentație
                  </h3>
                  <span
                    className="text-[8px] font-black uppercase tracking-[0.3em] py-1 px-2.5 rounded-md self-start sm:self-auto"
                    style={{
                      background:
                        "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                      color: "var(--royal-violet)",
                    }}
                  >
                    Wysiwyg Activat
                  </span>
                </div>
                <div
                  className="rounded-2xl overflow-hidden border"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                >
                  <RichTextEditor
                    key={editingProduct?.sku || "new-product"}
                    value={formData.description}
                    onChange={(html) =>
                      setFormData({ ...formData, description: html })
                    }
                    placeholder="Descriere complexă..."
                    minHeight={300}
                  />
                </div>
              </div>

              {/* SEO & Atribute Dinamice */}
              <div
                className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border shadow-sm space-y-6"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* SEO */}
                  <div className="space-y-4 sm:space-y-5">
                    <h4
                      className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                      style={{ color: "var(--dark-amethyst)" }}
                    >
                      <Globe
                        size={14}
                        style={{ color: "var(--royal-violet)" }}
                      />{" "}
                      Parametri SEO
                    </h4>
                    <PremiumInput
                      label="Slug URL"
                      value={formData.slug}
                      onChange={(e: any) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                    />
                    <PremiumInput
                      label="Meta Title"
                      value={formData.meta_title}
                      onChange={(e: any) =>
                        setFormData({ ...formData, meta_title: e.target.value })
                      }
                    />
                    <div className="space-y-1.5 relative">
                      <Label
                        className="text-[9px] font-black uppercase tracking-widest ml-1"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                        }}
                      >
                        Meta Description
                      </Label>
                      <textarea
                        className="w-full h-24 bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xs font-bold outline-none resize-none relative z-10 transition-all"
                        style={{
                          color: "var(--dark-amethyst)",
                          boxShadow:
                            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                        }}
                        value={formData.meta_description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            meta_description: e.target.value,
                          })
                        }
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 40%, transparent)";
                          e.target.style.backgroundColor = "#ffffff";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)";
                          e.target.style.backgroundColor =
                            "rgba(255,255,255,0.5)";
                        }}
                      />
                    </div>
                  </div>

                  {/* Atribute */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between">
                      <h4
                        className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                        style={{ color: "var(--dark-amethyst)" }}
                      >
                        <Layers
                          size={14}
                          style={{ color: "var(--royal-violet)" }}
                        />{" "}
                        Atribute Index
                      </h4>
                      <button
                        onClick={() => {
                          const k = prompt("Cheie Atribut (ex: Culoare):");
                          if (k)
                            setFormData({
                              ...formData,
                              attributes_json: {
                                ...formData.attributes_json,
                                [k]: "",
                              },
                            });
                        }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] hover:underline"
                        style={{ color: "var(--royal-violet)" }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto luxury-scrollbar pr-2">
                      {Object.keys(formData.attributes_json || {}).length ===
                        0 && (
                        <div
                          className="py-8 text-center text-[10px] font-black uppercase tracking-widest border border-dashed rounded-2xl"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                          }}
                        >
                          Niciun atribut mapat
                        </div>
                      )}
                      {Object.entries(formData.attributes_json || {}).map(
                        ([k, v], idx) => (
                          <div
                            key={idx}
                            className="flex gap-2 sm:gap-3 items-center bg-white p-2 rounded-xl border group transition-all focus-within:shadow-md"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 12%, transparent)",
                            }}
                          >
                            <span
                              className="text-[8px] sm:text-[9px] font-black uppercase w-1/3 pl-2 truncate"
                              title={k}
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                              }}
                            >
                              {k}
                            </span>
                            <input
                              className="w-2/3 bg-transparent text-[11px] sm:text-xs font-bold outline-none"
                              style={{ color: "var(--dark-amethyst)" }}
                              placeholder="Valoare..."
                              value={v as string}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  attributes_json: {
                                    ...formData.attributes_json,
                                    [k]: e.target.value,
                                  },
                                })
                              }
                            />
                            <button
                              onClick={() => {
                                const up = { ...formData.attributes_json };
                                delete up[k];
                                setFormData({
                                  ...formData,
                                  attributes_json: up,
                                });
                              }}
                              className="text-rose-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pr-2 hover:text-rose-600 shrink-0"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <footer
          className="px-6 md:px-10 py-5 bg-white/80 backdrop-blur-xl border-t shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="hidden sm:flex items-center gap-2.5">
            <ShieldCheck size={16} style={{ color: "var(--royal-violet)" }} />
            <p
              className="text-[8px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
              }}
            >
              Sincronizare infrastructura EVEM API Gate
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] bg-white border hover:bg-zinc-50 transition-all shadow-sm"
              style={{
                color: "var(--dark-amethyst)",
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              Anulează
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:shadow-xl disabled:opacity-50"
              style={{ background: "var(--primary-gradient)" }}
            >
              {isSaving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} strokeWidth={2.5} />
              )}
              {editingProduct ? "Salvează Modificări" : "Publică Articol"}
            </button>
          </div>
        </footer>
      </AdminDialogShell>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--royal-violet) 40%, transparent); border-radius: 10px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--royal-violet); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

export default AdminProducts;
