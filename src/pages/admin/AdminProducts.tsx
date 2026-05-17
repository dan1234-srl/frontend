import { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- UTILS ---
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

const PLACEHOLDER_IMG =
  "https://placehold.co/400x600/f4f4f5/a1a1aa.png?text=Fara+Imagine";

const getValidImageUrl = (imageSource: any) => {
  if (!imageSource) return PLACEHOLDER_IMG;
  let data = imageSource;

  if (typeof data === "string") {
    if (data.startsWith("http") || data.startsWith("/")) {
      return data.startsWith("/") ? `${API_BASE_URL}${data}` : data;
    }
    try {
      data = JSON.parse(data);
    } catch {
      return data || PLACEHOLDER_IMG;
    }
  }

  if (data && typeof data === "object") {
    const container = data.main || data;
    const url =
      container.medium ||
      container.large ||
      container.small ||
      container.url ||
      (Array.isArray(data) ? data[0] : null);

    if (url && typeof url === "string") {
      return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
    }
  }

  return PLACEHOLDER_IMG;
};

const getStatusBadge = (status: string, stock: number) => {
  if (stock === 0)
    return "bg-rose-50 border-rose-100 text-rose-600 shadow-[0_2px_10px_rgba(244,63,94,0.04)]";
  const s = status?.toLowerCase() || "";
  if (s === "active")
    return "bg-[var(--royal-violet)]/5 border-[var(--royal-violet)]/10 text-[var(--royal-violet)] shadow-[0_2px_10px_rgba(139,92,246,0.04)]";
  if (s === "draft")
    return "bg-amber-50 border-amber-100 text-amber-600 shadow-[0_2px_10px_rgba(245,158,11,0.04)]";
  return "bg-zinc-50 border-zinc-200 text-zinc-500";
};

// --- MAIN COMPONENT ---
const AdminProducts = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Stări Filtre și Sortare
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryIdFilter, setCategoryIdFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [uploading, setUploading] = useState<string | null>(null);

  // Paginație
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
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

      const [prodRes, catRes] = await Promise.all([
        fetch(`${endpoint}?${params.toString()}`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/v1/categories/`, { credentials: "include" }),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData.items || []);
      setTotalPages(prodData.pages || 1);
      setTotalItems(prodData.total || 0);

      const fetchedCategories = Array.isArray(catData)
        ? catData
        : catData.items || [];
      setCategories(fetchedCategories);
    } catch {
      toast.error("Eroare server la încărcarea datelor.");
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    currentPage,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
    categoryIdFilter,
    stockFilter,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        toast.success(`Catalog sincronizat! Status nou: ${newStatus}`);
        fetchData();
      } else {
        toast.error("Eroare la actualizarea statusului.");
      }
    } catch {
      toast.error("Eroare de conexiune la server.");
    }
  };

  const openEdit = (p: any = null) => {
    if (p) {
      setEditingProduct(p);

      let parsedImageUrl = p.image_url;
      if (typeof p.image_url === "string") {
        try {
          parsedImageUrl = JSON.parse(p.image_url);
        } catch {
          parsedImageUrl = p.image_url;
        }
      }

      let galleryImages: string[] = [];
      if (
        parsedImageUrl &&
        typeof parsedImageUrl === "object" &&
        Array.isArray(parsedImageUrl.gallery)
      ) {
        galleryImages = parsedImageUrl.gallery.map((img: any) =>
          typeof img === "string" ? img : img.medium || img.large || img.url,
        );
      } else if (p.additional_image_link) {
        try {
          const parsed =
            typeof p.additional_image_link === "string"
              ? JSON.parse(p.additional_image_link)
              : p.additional_image_link;
          if (Array.isArray(parsed)) galleryImages = parsed;
        } catch {
          galleryImages = [];
        }
      }

      let mainImg = "";
      if (parsedImageUrl && typeof parsedImageUrl === "object") {
        const mainContainer = parsedImageUrl.main || parsedImageUrl;
        mainImg =
          mainContainer.medium ||
          mainContainer.large ||
          mainContainer.url ||
          "";
      } else {
        mainImg = p.image_url || "";
      }

      let parsedAttributes = {};
      if (p.attributes_json) {
        try {
          parsedAttributes =
            typeof p.attributes_json === "string"
              ? JSON.parse(p.attributes_json)
              : p.attributes_json;
        } catch {
          parsedAttributes = {};
        }
      }

      setFormData({
        ...initialFormState,
        ...p,
        image_url: mainImg,
        category_id: p.category_id || p.category?.id || "",
        additional_image_link: galleryImages,
        attributes_json: parsedAttributes,
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
          additional_image_link: nl.filter(Boolean),
        }));
      }
      toast.success("Resursă vizuală procesată pe AWS S3.");
    } catch {
      toast.error("Eroare la încărcarea imaginii securizate.");
    } finally {
      setUploading(null);
    }
  };

  // 🚀 RESTAURAT DE PLIN: Logica handleSave sincronizată cu schemele noi din backend
  const handleSave = async () => {
    if (!formData.name || !formData.category_id)
      return toast.error("Numele și Categoria sunt obligatorii.");

    const payload = {
      sku: formData.sku
        ? formData.sku.trim().toUpperCase()
        : `LN-${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      ean: formData.ean ? formData.ean.trim() : "",
      slug: formData.slug || generateSlug(formData.name),
      name: formData.name.trim(),
      brand_name: formData.brand_name || "Evem",
      status: formData.status.toUpperCase(),
      price: Number(formData.price),
      sale_price: formData.sale_price > 0 ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity),
      category_id: formData.category_id,
      image_url: formData.image_url,
      description: formData.description || "",
      weight: Number(formData.weight || 0),
      length: Number(formData.length || 0),
      width: Number(formData.width || 0),
      height: Number(formData.height || 0),
      meta_title: formData.meta_title || "",
      meta_description: formData.meta_description || "",
      canonical_url: formData.canonical_url || "",
      additional_image_link: formData.additional_image_link.filter(Boolean),
      attributes_json:
        typeof formData.attributes_json === "object"
          ? JSON.stringify(formData.attributes_json)
          : formData.attributes_json,
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
    } catch {
      toast.error("Pierdere conexiune gateway API.");
    }
  };

  const handleImageError = (e: any) => {
    e.target.src = PLACEHOLDER_IMG;
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full space-y-6 px-2 sm:px-4 md:px-8 pb-20 animate-in fade-in duration-500 font-sans text-left selection:bg-[var(--royal-violet)] selection:text-white">
      {/* BRAND CONTROLS HEADER */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 border-b border-zinc-100 pb-8 pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[2px] bg-[var(--royal-violet)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
              System Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[var(--dark-amethyst)] leading-none">
            Catalog Portofoliu
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
              size={15}
            />
            <input
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:bg-white focus:border-[var(--royal-violet)] outline-none transition-all text-sm font-bold shadow-inner placeholder:text-zinc-300"
              placeholder="Filtrare live prin Meilisearch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openEdit()}
            className="bg-[var(--royal-violet)] text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--dark-amethyst)] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl border border-[var(--royal-violet)]"
          >
            <Plus size={14} strokeWidth={2.5} /> Adaugă Articol
          </button>
        </div>
      </header>

      {/* CONTROLS BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
        <div className="flex gap-4 sm:gap-6 border-b xl:border-none pb-2 xl:pb-0 overflow-x-auto no-scrollbar">
          {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setCurrentPage(1);
              }}
              className={`pb-2 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                statusFilter === f
                  ? "text-[var(--royal-violet)] font-black scale-105"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {f.replace(/_/g, " ")}
              {statusFilter === f && (
                <motion.div
                  layoutId="statusTab"
                  className="absolute -bottom-[11px] xl:-bottom-4 left-0 right-0 h-0.5 bg-[var(--royal-violet)]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
          <div className="relative flex items-center bg-white rounded-xl border border-zinc-200/60 px-3 py-2.5 shadow-sm">
            <Filter size={12} className="text-[var(--royal-violet)] mr-2" />
            <select
              value={categoryIdFilter}
              onChange={(e) => {
                setCategoryIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] outline-none cursor-pointer w-full appearance-none pr-4"
            >
              <option value="">Structură Categorii</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center bg-white rounded-xl border border-zinc-200/60 px-3 py-2.5 shadow-sm">
            <Package size={12} className="text-[var(--royal-violet)] mr-2" />
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] outline-none cursor-pointer w-full appearance-none pr-4"
            >
              <option value="ALL">Parametru Stoc</option>
              <option value="LOW_STOCK">Stoc Critic (≤5)</option>
              <option value="OUT_OF_STOCK">Epuizat (0)</option>
            </select>
          </div>

          <div className="relative flex items-center bg-white rounded-xl border border-zinc-200/60 px-3 py-2.5 shadow-sm">
            <ArrowUpDown
              size={12}
              className="text-[var(--royal-violet)] mr-2"
            />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-");
                setSortBy(by);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] outline-none cursor-pointer w-full appearance-none pr-4"
            >
              <option value="updated_at-desc">Cronologic: Recente</option>
              <option value="price-asc">Preț: Crescător</option>
              <option value="price-desc">Preț: Descrescător</option>
              <option value="stock_quantity-asc">Stoc: Deficitar</option>
              <option value="category_name-asc">Aranjare Categorie</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-[9px] font-black uppercase text-zinc-400 tracking-widest text-right px-1">
        {totalItems} articole indexate
      </div>

      {/* COMPONENTĂ RESPONSIVĂ HIBRIDĂ */}
      <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
        {/* MOBILE GRID VIEW */}
        <div className="block md:hidden p-4 space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 border border-zinc-100 rounded-2xl space-y-3"
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
            <div className="py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Fără rezultate
            </div>
          ) : (
            products.map((p) => {
              const currentStock = p.stock_quantity ?? p.stock ?? 0;
              return (
                <div
                  key={p.id}
                  className="p-4 border border-zinc-100 rounded-2xl space-y-4 bg-zinc-50/20 hover:border-[var(--royal-violet)]/30 transition-all"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-16 bg-white rounded-lg border border-zinc-100 p-1 shrink-0">
                      <img
                        src={getValidImageUrl(p.image_url)}
                        crossOrigin="anonymous"
                        onError={handleImageError}
                        className="w-full h-full object-contain"
                        alt="Asset"
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="font-bold text-[var(--dark-amethyst)] text-sm truncate">
                        {p.name}
                      </h4>
                      <p className="text-[9px] font-black text-zinc-400 tracking-wider uppercase truncate">
                        {p.sku} • {p.brand_name || "Evem"}
                      </p>
                      <div className="text-[9px] font-bold text-[var(--royal-violet)] bg-[var(--royal-violet)]/5 inline-block px-2 py-0.5 rounded">
                        {p.category_name || "General"}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100/70">
                    <div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${getStatusBadge(p.status, currentStock)}`}
                      >
                        {currentStock === 0 ? "OUT OF STOCK" : p.status}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 ml-2">
                        Stoc: {currentStock}
                      </span>
                    </div>
                    <p className="font-black text-[var(--dark-amethyst)] text-sm">
                      {p.price}{" "}
                      <span className="text-[9px] opacity-40">RON</span>
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 py-2.5 bg-zinc-50 hover:bg-[var(--royal-violet)] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-100 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={12} /> Editează
                    </button>
                    <button
                      onClick={() =>
                        handleToggleStatus(p.sku, p.status || "ACTIVE")
                      }
                      className="px-4 py-2.5 bg-zinc-50 hover:bg-amber-500 hover:text-white border border-zinc-100 rounded-xl transition-all flex items-center justify-center"
                    >
                      {p.status === "DRAFT" ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* LUXURY DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto luxury-scrollbar">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="hover:bg-transparent border-b border-zinc-100">
                <TableHead className="py-5 px-8 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Produs
                </TableHead>
                <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Categorie
                </TableHead>
                <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Status
                </TableHead>
                <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Stoc
                </TableHead>
                <TableHead className="text-right pr-8 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  Preț / Acțiuni
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
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
                    className="py-24 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest"
                  >
                    Niciun articol mapat pe aceste criterii.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const currentStock = p.stock_quantity ?? p.stock ?? 0;
                  return (
                    <TableRow
                      key={p.id}
                      className="group hover:bg-[var(--royal-violet)]/[0.01] transition-colors border-b border-zinc-50 last:border-none"
                    >
                      <TableCell className="py-4 px-8">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-16 bg-white rounded-xl border border-zinc-100 overflow-hidden p-1 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            <img
                              src={getValidImageUrl(p.image_url)}
                              crossOrigin="anonymous"
                              onError={handleImageError}
                              className="object-contain h-full w-full"
                              alt="Produs"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p
                              className="font-bold text-[var(--dark-amethyst)] text-sm truncate max-w-xs xl:max-w-md"
                              title={p.name}
                            >
                              {p.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                              {p.sku} • {p.brand_name || "Evem"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* 🚀 REPARAT ATOMIC: Numele real al categoriei cu stratificare multi-fallback */}
                      <TableCell className="text-center">
                        <span className="text-[10px] font-black text-[var(--royal-violet)] uppercase tracking-widest bg-[var(--royal-violet)]/[0.03] border border-[var(--royal-violet)]/10 px-3 py-1.5 rounded-lg">
                          {p.category_name || p.category?.name || "General"}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusBadge(p.status, currentStock)}`}
                        >
                          {currentStock === 0 ? "OUT OF STOCK" : p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-black text-xs text-[var(--dark-amethyst)]">
                        {currentStock}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-6">
                          <div className="text-right shrink-0">
                            <p className="font-black text-[var(--dark-amethyst)] text-sm whitespace-nowrap">
                              {p.price}{" "}
                              <span className="text-[9px] opacity-40">RON</span>
                            </p>
                            {p.sale_price && (
                              <p className="text-[8px] text-rose-500 font-black uppercase tracking-tight">
                                Promo: {p.sale_price}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => openEdit(p)}
                              title="Editează structura"
                              className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-zinc-950 hover:text-white transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(p.sku, p.status || "ACTIVE")
                              }
                              title={
                                p.status === "DRAFT"
                                  ? "Publică în catalog"
                                  : "Treci în stadiul de Schiță"
                              }
                              className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 hover:bg-amber-500 hover:text-white transition-colors"
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

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex justify-center items-center gap-4 shrink-0">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 disabled:opacity-20 transition-all shadow-sm"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 disabled:opacity-20 transition-all shadow-sm"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* FULL RESPONSIVE CONFIGURATOR MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[1350px] w-full h-full sm:h-[94vh] sm:w-[96vw] p-0 rounded-none sm:rounded-[2.5rem] border-none bg-[#F8F9FA] shadow-2xl flex flex-col overflow-hidden">
          <header className="px-6 md:px-10 py-6 bg-white border-b border-zinc-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[var(--royal-violet)] text-white hidden sm:block">
                <Package size={22} />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)] truncate max-w-xs sm:max-w-md">
                  {formData.sku
                    ? `Editare Resursă: ${formData.sku}`
                    : "Fișă Articol Nou"}
                </DialogTitle>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black mt-0.5">
                  Core Product Configuration
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-10 h-10 bg-zinc-50 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-full flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 luxury-scrollbar text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* MEDIA WORKSPACE */}
              <div className="lg:col-span-4 space-y-6 md:sticky md:top-0">
                <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                  <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)] flex items-center gap-2">
                    <ImageIcon size={12} /> Thumbnail Principal
                  </Label>
                  <div className="aspect-[3/4] bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center relative group overflow-hidden transition-all hover:bg-zinc-100/50">
                    {formData.image_url ? (
                      <>
                        <img
                          src={getValidImageUrl(formData.image_url)}
                          crossOrigin="anonymous"
                          onError={handleImageError}
                          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-102"
                          alt="Main Workspace"
                        />
                        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-xs">
                          <button
                            onClick={() =>
                              setFormData({ ...formData, image_url: "" })
                            }
                            className="bg-white text-rose-600 p-3.5 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer text-zinc-400 flex flex-col items-center gap-3 w-full h-full justify-center">
                        {uploading === "main" ? (
                          <Loader2
                            className="animate-spin text-[var(--royal-violet)]"
                            size={32}
                          />
                        ) : (
                          <Upload size={32} strokeWidth={1.5} />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">
                          Alege fișier webp
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

                <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                  <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)] flex items-center gap-2">
                    <Layers size={12} /> Sub-Imagini Galerie
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-zinc-50 rounded-xl border border-zinc-200 relative overflow-hidden group shadow-inner"
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
                              alt="Thumb"
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
                              className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer text-zinc-300 hover:bg-zinc-100 hover:text-[var(--royal-violet)] transition-colors">
                            {uploading === `extra-${i}` ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Plus size={16} />
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

              {/* ARHITECTURĂ INFORMAȚIONALĂ */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Identificator Comercial Nativ
                    </Label>
                    <input
                      className="w-full bg-transparent border-b-2 border-zinc-100 pb-2 text-2xl md:text-3xl font-black outline-none focus:border-[var(--royal-violet)] transition-all text-[var(--dark-amethyst)] placeholder:text-zinc-200 tracking-tight"
                      value={formData.name}
                      placeholder="Introduceți titlul complet al produsului..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div className="space-y-1.5 text-left w-full">
                      <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        Structură Segment
                      </Label>
                      <select
                        className="w-full bg-zinc-50 rounded-xl px-3 py-3.5 text-xs font-bold border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] text-[var(--dark-amethyst)] appearance-none shadow-inner cursor-pointer"
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                          })
                        }
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

                {/* LOGISTICĂ & PREȚ */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)] flex items-center gap-2">
                    <DollarSign size={13} /> Financiare & Matrice Logistică
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                        Preț Listă
                      </Label>
                      <input
                        type="number"
                        className="w-full bg-transparent text-lg md:text-xl font-black text-center text-black outline-none"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
                      <Label className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-2">
                        Preț Promo
                      </Label>
                      <input
                        type="number"
                        className="w-full bg-transparent text-lg md:text-xl font-black text-center text-rose-600 outline-none"
                        value={formData.sale_price || ""}
                        placeholder="Fără promo"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sale_price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                        Stoc
                      </Label>
                      <input
                        type="number"
                        className="w-full bg-transparent text-lg md:text-xl font-black text-center text-black outline-none"
                        value={formData.stock_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock_quantity: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center flex flex-col justify-center">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                        Status Catalog
                      </Label>
                      <select
                        className="bg-transparent text-[10px] font-black text-center text-zinc-900 uppercase border-none outline-none cursor-pointer w-full"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="ACTIVE">Public</option>
                        <option value="DRAFT">Schiță / Draft</option>
                        <option value="OUT_OF_STOCK">Fără stoc</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100/70">
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

                {/* EDITORIAL MATRIX & SEO */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)] flex items-center gap-2">
                      <AlignLeft size={13} /> Documentație Editorială
                      (Descriere)
                    </Label>
                    <textarea
                      className="w-full h-32 bg-zinc-50 rounded-2xl p-4 text-xs font-medium leading-relaxed border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all resize-none shadow-inner"
                      value={formData.description}
                      placeholder="Specificații, detalii de fabrică..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100/70">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
                        <Globe size={13} /> Parametri Crawling SEO
                      </h4>
                      <PremiumInput
                        label="Mecanism URL (Slug)"
                        value={formData.slug}
                        onChange={(e: any) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                      />
                      <PremiumInput
                        label="Meta Title"
                        value={formData.meta_title}
                        onChange={(e: any) =>
                          setFormData({
                            ...formData,
                            meta_title: e.target.value,
                          })
                        }
                      />
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                          Meta Description
                        </Label>
                        <textarea
                          className="w-full h-20 bg-zinc-50 rounded-xl p-3 text-[11px] font-medium border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all resize-none shadow-inner"
                          value={formData.meta_description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meta_description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
                          <Layers size={13} /> Atribute Index
                        </h4>
                        <button
                          onClick={() => {
                            const k = prompt(
                              "Cheie Atribut Nou (Ex: Culoare, Compatibilitate):",
                            );
                            if (k)
                              setFormData({
                                ...formData,
                                attributes_json: {
                                  ...formData.attributes_json,
                                  [k]: "",
                                },
                              });
                          }}
                          className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--royal-violet)] hover:underline"
                        >
                          + Adaugă Parametru
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto luxury-scrollbar pr-1">
                        {Object.entries(formData.attributes_json || {}).map(
                          ([k, v], idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 items-center bg-zinc-50/70 p-1.5 rounded-xl border border-zinc-200/50 group"
                            >
                              <span
                                className="text-[9px] font-black uppercase text-zinc-400 w-1/3 pl-2 truncate"
                                title={k}
                              >
                                {k}
                              </span>
                              <input
                                className="w-2/3 bg-transparent text-xs font-bold outline-none text-zinc-900"
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
                                className="text-rose-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pr-1"
                              >
                                <Trash2 size={13} />
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

          <DialogFooter className="px-6 md:px-10 py-6 bg-white border-t border-zinc-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <ShieldCheck size={16} className="text-[var(--royal-violet)]" />
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                Sincronizare infrastructura EVEM API Gate
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 border border-zinc-200 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none bg-[var(--royal-violet)] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-[var(--dark-amethyst)] active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Save size={14} /> {editingProduct ? "Salvează" : "Publică"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

const PremiumInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-1.5 text-left w-full">
    <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
      {icon} {label}
    </Label>
    <input
      className="w-full bg-zinc-50 rounded-xl px-3 py-3 text-xs font-bold text-[var(--dark-amethyst)] border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all shadow-inner placeholder:text-zinc-300"
      value={value}
      onChange={onChange}
      placeholder="..."
    />
  </div>
);

export default AdminProducts;
