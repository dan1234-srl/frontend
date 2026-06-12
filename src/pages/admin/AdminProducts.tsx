/**
 * AdminProducts.tsx
 * Pagina de administrare catalog produse - Design Futuristic (Isomorphic UI)
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
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminDialogShell,
  AdminDialogTitle,
} from "@/components/admin/AdminDialogShell";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/product/RichTextEditor";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// ─── Utils ────────────────────────────────────────────────────────────────────

const PremiumInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-1.5 text-left w-full group relative">
    <Label
      className="text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-1.5 transition-colors duration-300"
      style={{ color: "color-mix(in srgb, var(--royal-violet) 60%, #9ca3af)" }}
    >
      {icon} {label}
    </Label>
    <div className="relative">
      <input
        className="w-full bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 text-xs font-bold text-[var(--dark-amethyst)] outline-none transition-all placeholder:text-zinc-300 relative z-10"
        style={{
          boxShadow:
            "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
        value={value}
        onChange={onChange}
        placeholder="..."
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

const getValidImageUrl = (imageSource: any) => {
  if (!imageSource) return PLACEHOLDER_IMG;
  let data = imageSource;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return data;
    }
  }
  if (data && typeof data === "object") {
    const container = data.main || data;
    return (
      container.large ||
      container.medium ||
      container.small ||
      container.url ||
      PLACEHOLDER_IMG
    );
  }
  return PLACEHOLDER_IMG;
};

const getStatusBadge = (status: string, stock: number) => {
  if (stock === 0)
    return {
      bg: "color-mix(in srgb, #ef4444 8%, transparent)",
      text: "#ef4444",
      border: "color-mix(in srgb, #ef4444 20%, transparent)",
    };
  const s = status?.toLowerCase() || "";
  if (s === "active")
    return {
      bg: "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
      text: "var(--royal-violet)",
      border: "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
    };
  if (s === "draft")
    return {
      bg: "color-mix(in srgb, #f59e0b 8%, transparent)",
      text: "#f59e0b",
      border: "color-mix(in srgb, #f59e0b 20%, transparent)",
    };
  return {
    bg: "color-mix(in srgb, #71717a 8%, transparent)",
    text: "#71717a",
    border: "color-mix(in srgb, #71717a 20%, transparent)",
  };
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

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
    image_url: "",
    description: "",
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    additional_image_link: [] as string[],
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
        _t: Date.now().toString(),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
        params.append("q", debouncedSearch);
        params.append("is_admin_view", "true");
      }
      if (categoryIdFilter) params.append("category_id", categoryIdFilter);

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error("Eroare la încărcare");

      const data = await res.json();
      setProducts(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
      writeCache(cacheKey, data);
    } catch (err) {
      console.error("Fetch error:", err);
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
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
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

      let parsedImageUrl = productToEdit.image_url;
      if (typeof parsedImageUrl === "string") {
        try {
          parsedImageUrl = JSON.parse(parsedImageUrl);
        } catch {}
      }
      const mainImg =
        parsedImageUrl?.main?.medium ||
        parsedImageUrl?.url ||
        parsedImageUrl?.medium ||
        productToEdit.image_url ||
        "";

      let galleryImages: string[] = [];
      if (productToEdit.additional_image_link) {
        try {
          const raw =
            typeof productToEdit.additional_image_link === "string"
              ? JSON.parse(productToEdit.additional_image_link)
              : productToEdit.additional_image_link;
          galleryImages = Array.isArray(raw) ? raw : [];
        } catch {}
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
        image_url: mainImg,
        category_id:
          productToEdit.category_id || productToEdit.category?.id || "",
        additional_image_link: galleryImages,
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
      const uploadedUrl = result.url || result.file_url || result.data?.url;
      if (!uploadedUrl) throw new Error("Upload invalid");

      if (index === "main") {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
      } else {
        const nl = [...formData.additional_image_link];
        nl[index as number] = uploadedUrl;
        setFormData((prev) => ({
          ...prev,
          additional_image_link: nl.filter(
            (img) => img && typeof img === "string" && img.trim() !== "",
          ),
        }));
      }
      toast.success("Imagine urcată pe S3.");
    } catch {
      toast.error("Eroare la încărcarea imaginii.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id)
      return toast.error("Numele și Categoria sunt obligatorii.");

    const cleanedImages = formData.additional_image_link.filter(
      (img) => typeof img === "string" && img.trim() !== "",
    );

    const attributesPayload =
      typeof formData.attributes_json === "object"
        ? formData.attributes_json
        : JSON.parse(formData.attributes_json || "{}");

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
      image_url: formData.image_url || null,
      description: formData.description || "",
      weight: parseFloat(formData.weight as any) || 0.0,
      length: parseFloat(formData.length as any) || 0.0,
      width: parseFloat(formData.width as any) || 0.0,
      height: parseFloat(formData.height as any) || 0.0,
      meta_title: formData.meta_title || "",
      meta_description: formData.meta_description || "",
      canonical_url: formData.canonical_url || null,
      additional_image_link: cleanedImages,
      attributes_json: attributesPayload,
    };

    const url = editingProduct
      ? `${API_BASE_URL}/api/v1/products/${editingProduct.sku}`
      : `${API_BASE_URL}/api/v1/products/`;

    try {
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
    }
  };

  const handleImageError = (e: any) => {
    e.target.src = PLACEHOLDER_IMG;
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full space-y-6 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left selection:bg-[var(--royal-violet)] selection:text-white animate-fade-in">
      {/* ── Header Futuristic ──────────────────────────────────────────────── */}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none flex items-center gap-3">
            Catalog Portofoliu
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search Input styled like SearchModal */}
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
              className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-xl border rounded-xl outline-none transition-all text-[13px] font-medium placeholder:font-normal"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 12%, transparent)",
                color: "var(--dark-amethyst)",
                boxShadow:
                  "0 4px 20px -10px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
              placeholder="Caută în baza de date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--royal-violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor =
                  "color-mix(in srgb, var(--royal-violet) 12%, transparent)")
              }
            />
          </div>
          <button
            onClick={() => openEdit()}
            className="text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Adaugă Articol
          </button>
        </div>
      </header>

      {/* ── Controls Bar Glassmorphism ─────────────────────────────────────── */}
      <div
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-4 rounded-2xl backdrop-blur-xl border"
        style={{
          background: "color-mix(in srgb, var(--royal-violet) 3%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        <div
          className="flex gap-4 sm:gap-6 border-b xl:border-none pb-2 xl:pb-0 overflow-x-auto no-scrollbar"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
          }}
        >
          {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setCurrentPage(1);
              }}
              className={`pb-2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.25em] transition-all relative ${
                statusFilter === f
                  ? "scale-105"
                  : "hover:text-[var(--royal-violet)]"
              }`}
              style={{
                color:
                  statusFilter === f
                    ? "var(--royal-violet)"
                    : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
              }}
            >
              {f.replace(/_/g, " ")}
              {statusFilter === f && (
                <motion.div
                  layoutId="statusTabAdmin"
                  className="absolute -bottom-[11px] xl:-bottom-4 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: "var(--royal-violet)" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
          {/* Custom Selects */}
          {[
            {
              icon: Filter,
              val: categoryIdFilter,
              set: setCategoryIdFilter,
              opts: [
                { value: "", label: "Structură Categorii" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ],
            },
            {
              icon: Package,
              val: stockFilter,
              set: setStockFilter,
              opts: [
                { value: "ALL", label: "Parametru Stoc" },
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
              className="relative flex items-center bg-white/60 backdrop-blur-md rounded-xl border px-3 py-2.5 transition-colors focus-within:border-[var(--royal-violet)] hover:bg-white"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <FilterObj.icon
                size={13}
                style={{ color: "var(--royal-violet)", marginRight: "8px" }}
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

      {/* ── Tabel / Listă Futuristică ──────────────────────────────────────── */}
      <div
        className="bg-white rounded-[2rem] border overflow-hidden shadow-2xl shadow-zinc-200/20"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        {/* Mobile View */}
        <div className="block md:hidden p-2 space-y-2">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 border rounded-2xl space-y-3"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                }}
              >
                <div className="flex gap-3">
                  <Skeleton className="h-16 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div
              className="py-12 text-center text-[10px] font-black uppercase tracking-widest"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
              }}
            >
              Fără rezultate
            </div>
          ) : (
            products.map((p, i) => {
              const currentStock = p.stock_quantity ?? p.stock ?? 0;
              const badge = getStatusBadge(p.status, currentStock);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative p-4 border rounded-2xl space-y-4 overflow-hidden focus:outline-none transition-all"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                  }}
                >
                  <div
                    className="absolute inset-x-0 inset-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 4%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 2%, transparent) 100%)",
                    }}
                  />

                  <div className="flex gap-4 items-start relative z-10">
                    <div
                      className="w-14 h-16 bg-white rounded-xl border p-1 shrink-0 shadow-sm"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                      }}
                    >
                      <img
                        src={getValidImageUrl(p.image_url)}
                        crossOrigin="anonymous"
                        onError={handleImageError}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        alt=""
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="font-bold text-[var(--dark-amethyst)] text-sm truncate">
                        {p.name}
                      </h4>
                      <p
                        className="text-[8.5px] font-black uppercase tracking-[0.3em] truncate"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                        }}
                      >
                        {p.sku} • {p.brand_name || "Evem"}
                      </p>
                      <div
                        className="text-[9px] font-bold inline-block px-2 py-0.5 rounded mt-1"
                        style={{
                          color: "var(--royal-violet)",
                          background:
                            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                        }}
                      >
                        {p.category_name || "General"}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex justify-between items-center pt-3 border-t relative z-10"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                    }}
                  >
                    <div>
                      <span
                        className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          borderColor: badge.border,
                        }}
                      >
                        {currentStock === 0 ? "OUT OF STOCK" : p.status}
                      </span>
                      <span
                        className="text-[10px] font-bold ml-2"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                        }}
                      >
                        Stoc: {currentStock}
                      </span>
                    </div>
                    <p className="font-black text-[var(--dark-amethyst)] text-sm">
                      {p.price}{" "}
                      <span className="text-[9px] opacity-40">RON</span>
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1 relative z-10">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 py-2.5 bg-white hover:bg-[var(--royal-violet)] hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm flex items-center justify-center gap-2"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 12%, transparent)",
                      }}
                    >
                      <Edit2 size={12} /> Editează
                    </button>
                    <button
                      onClick={() =>
                        handleToggleStatus(p.sku, p.status || "ACTIVE")
                      }
                      className="px-4 py-2.5 bg-white hover:bg-amber-500 hover:text-white hover:border-amber-500 border rounded-xl transition-all shadow-sm flex items-center justify-center"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 12%, transparent)",
                      }}
                    >
                      {p.status === "DRAFT" ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Desktop Table cu HitRow styling */}
        <div className="hidden md:block overflow-x-auto luxury-scrollbar">
          <Table className="min-w-[900px]">
            <TableHeader
              style={{
                background: "color-mix(in srgb, var(--royal-violet) 2%, white)",
              }}
            >
              <TableRow
                className="hover:bg-transparent border-b"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                }}
              >
                {[
                  "Produs",
                  "Categorie",
                  "Status",
                  "Stoc",
                  "Preț / Acțiuni",
                ].map((h, i) => (
                  <TableHead
                    key={h}
                    className={`py-5 text-[9px] font-black uppercase tracking-[0.25em] ${i === 0 ? "px-8" : i === 4 ? "text-right pr-8" : "text-center"}`}
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                    }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-8 py-5">
                      <Skeleton className="h-16 w-12 rounded-lg inline-block" />
                      <Skeleton className="h-4 w-40 inline-block ml-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </TableCell>
                    <TableCell className="pr-8">
                      <Skeleton className="h-6 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-24 text-center text-[10px] font-black uppercase tracking-widest"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                    }}
                  >
                    Niciun articol mapat.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p, i) => {
                  const currentStock = p.stock_quantity ?? p.stock ?? 0;
                  const badge = getStatusBadge(p.status, currentStock);
                  return (
                    <TableRow
                      key={p.id}
                      className="group relative border-b last:border-none transition-colors overflow-hidden"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 4%, transparent)",
                      }}
                    >
                      {/* Gradient Fill pe rând, exact ca în SearchModal */}
                      <td
                        className="absolute inset-x-2 inset-y-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-0"
                        style={{
                          background:
                            "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 4%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 2%, transparent) 100%)",
                        }}
                      />

                      <TableCell className="py-4 px-8 relative z-10">
                        <div className="flex items-center gap-4 text-left">
                          <div
                            className="w-12 h-16 bg-white rounded-xl border overflow-hidden p-1 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                            }}
                          >
                            <img
                              src={getValidImageUrl(p.image_url)}
                              crossOrigin="anonymous"
                              onError={handleImageError}
                              className="object-contain h-full w-full"
                              alt=""
                            />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p
                              className="font-bold text-[var(--dark-amethyst)] text-[13px] truncate max-w-xs xl:max-w-md transition-colors group-hover:text-[var(--royal-violet)]"
                              title={p.name}
                            >
                              {p.name}
                            </p>
                            <p
                              className="text-[8.5px] font-black uppercase tracking-[0.3em] transition-colors"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                              }}
                            >
                              {p.sku} • {p.brand_name || "Evem"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center relative z-10">
                        <span
                          className="text-[9px] font-black text-[var(--royal-violet)] uppercase tracking-widest border px-3 py-1.5 rounded-lg"
                          style={{
                            background:
                              "color-mix(in srgb, var(--royal-violet) 4%, transparent)",
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                          }}
                        >
                          {p.category_name || p.category?.name || "General"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center relative z-10">
                        <span
                          className="px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border whitespace-nowrap"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            borderColor: badge.border,
                          }}
                        >
                          {currentStock === 0 ? "OUT OF STOCK" : p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-black text-xs text-[var(--dark-amethyst)] relative z-10 tabular-nums">
                        {currentStock}
                      </TableCell>
                      <TableCell className="text-right pr-8 relative z-10">
                        <div className="flex items-center justify-end gap-6">
                          <div className="text-right shrink-0">
                            {p.sale_price && (
                              <p className="text-[9px] line-through font-medium text-zinc-300 leading-none mb-0.5">
                                {p.price} RON
                              </p>
                            )}
                            <p className="font-black text-[var(--dark-amethyst)] text-sm whitespace-nowrap tabular-nums">
                              {p.sale_price || p.price}{" "}
                              <span className="text-[9px] opacity-40">RON</span>
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => openEdit(p)}
                              title="Editează structura"
                              className="p-2.5 bg-white rounded-xl border hover:bg-[var(--royal-violet)] hover:text-white transition-colors shadow-sm"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(p.sku, p.status || "ACTIVE")
                              }
                              title={
                                p.status === "DRAFT" ? "Publică" : "Schiță"
                              }
                              className="p-2.5 bg-white rounded-xl border hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors shadow-sm"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                              }}
                            >
                              {p.status === "DRAFT" ? (
                                <Eye size={13} />
                              ) : (
                                <EyeOff size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Futuristic */}
        {!loading && totalPages > 1 && (
          <div
            className="p-5 border-t flex justify-center items-center gap-4 shrink-0"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
              background: "color-mix(in srgb, var(--royal-violet) 2%, white)",
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
              <ChevronLeft size={15} style={{ color: "var(--royal-violet)" }} />
            </button>
            <span
              className="text-[10px] font-black uppercase tracking-[0.3em] bg-white border px-5 py-2.5 rounded-xl shadow-sm"
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
              <ChevronRight
                size={15}
                style={{ color: "var(--royal-violet)" }}
              />
            </button>
          </div>
        )}
      </div>

      {/* ── Modal Editare Futuristic ───────────────────────────────────────── */}
      <AdminDialogShell
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="full"
        mobileVariant="modal"
        className="h-[100dvh] sm:h-[94vh] sm:max-h-[94vh] rounded-none sm:rounded-[2.5rem] border"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">Editare</AdminDialogTitle>
        {/* Header Modal */}
        <header
          className="px-6 md:px-10 py-6 bg-white/70 backdrop-blur-xl border-b flex justify-between items-center shrink-0 sticky top-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="flex items-center gap-5">
            <div
              className="p-3 rounded-2xl text-white hidden sm:block shadow-lg"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Package size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)] truncate max-w-xs sm:max-w-md">
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
            className="w-10 h-10 bg-white border hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-full flex items-center justify-center transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </header>

        {/* Body Modal */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 luxury-scrollbar text-left relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Coloana Media ──────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6 md:sticky md:top-0">
              <div
                className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border shadow-sm space-y-4"
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
                  className="aspect-[3/4] bg-white rounded-2xl border-2 border-dashed flex items-center justify-center relative group overflow-hidden transition-all hover:bg-zinc-50"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                  }}
                >
                  {formData.image_url ? (
                    <>
                      <img
                        src={getValidImageUrl(formData.image_url)}
                        crossOrigin="anonymous"
                        onError={handleImageError}
                        className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <button
                          onClick={() =>
                            setFormData({ ...formData, image_url: "" })
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

              {/* Galerie */}
              <div
                className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border shadow-sm space-y-4"
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
                      {formData.additional_image_link[i] ? (
                        <>
                          <img
                            src={getValidImageUrl(
                              formData.additional_image_link[i],
                            )}
                            crossOrigin="anonymous"
                            onError={handleImageError}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                          <button
                            onClick={() => {
                              const nl = [...formData.additional_image_link];
                              nl.splice(i, 1);
                              setFormData({
                                ...formData,
                                additional_image_link: nl,
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

            {/* ── Coloana Date ────────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">
              <div
                className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border shadow-sm space-y-8"
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
                    className="w-full bg-transparent border-b-2 pb-3 text-3xl md:text-4xl font-black outline-none transition-all placeholder:text-zinc-200 tracking-tight"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                      Segment
                    </Label>
                    <select
                      className="w-full bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3.5 text-xs font-bold outline-none appearance-none cursor-pointer relative z-10 transition-all"
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

              <div
                className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border shadow-sm space-y-6"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div
                    className="p-5 bg-white rounded-2xl border text-center transition-all focus-within:shadow-md"
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
                      className="w-full bg-transparent text-xl md:text-2xl font-black text-center outline-none"
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
                    className="p-5 rounded-2xl border text-center transition-all focus-within:shadow-md"
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
                      className="w-full bg-transparent text-xl md:text-2xl font-black text-center text-rose-600 outline-none"
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
                    className="p-5 bg-white rounded-2xl border text-center transition-all focus-within:shadow-md"
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
                      className="w-full bg-transparent text-xl md:text-2xl font-black text-center outline-none"
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
                    className="p-5 bg-white rounded-2xl border text-center flex flex-col justify-center transition-all focus-within:shadow-md"
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
                      className="bg-transparent text-[11px] font-black text-center uppercase border-none outline-none cursor-pointer w-full"
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
                  className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-6 border-t"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <PremiumInput
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
                    label="Lungime (cm)"
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
                    label="Lățime (cm)"
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
                    label="Înălțime (cm)"
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

              <div
                className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border shadow-sm space-y-5"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <div className="flex items-center justify-between">
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
                    className="text-[8px] font-black uppercase tracking-[0.3em] py-1 px-2.5 rounded-md"
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

              <div
                className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border shadow-sm space-y-6"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-5">
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

                  <div className="space-y-5">
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
                          const k = prompt("Cheie Atribut:");
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
                    <div className="space-y-3 max-h-[250px] overflow-y-auto luxury-scrollbar pr-2">
                      {Object.entries(formData.attributes_json || {}).map(
                        ([k, v], idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-center bg-white p-2 rounded-xl border group transition-all focus-within:shadow-md"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 12%, transparent)",
                            }}
                          >
                            <span
                              className="text-[9px] font-black uppercase w-1/3 pl-2 truncate"
                              title={k}
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                              }}
                            >
                              {k}
                            </span>
                            <input
                              className="w-2/3 bg-transparent text-xs font-bold outline-none"
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
                              className="text-rose-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pr-2 hover:text-rose-600"
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

        {/* Footer Modal Futuristic */}
        <footer
          className="px-6 md:px-10 py-5 bg-white/80 backdrop-blur-xl border-t shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="flex items-center gap-2.5">
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
              className="flex-1 sm:flex-none text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:shadow-xl"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Save size={15} strokeWidth={2.5} />{" "}
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
