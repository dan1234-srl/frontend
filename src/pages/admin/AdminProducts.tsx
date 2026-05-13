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
  Trash2,
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

// Fallback robust
const PLACEHOLDER_IMG =
  "https://placehold.co/400x600/f4f4f5/a1a1aa.png?text=Fara+Imagine";

const getValidImageUrl = (imageSource: any) => {
  if (!imageSource) return PLACEHOLDER_IMG;

  let url = "";

  if (typeof imageSource === "string") {
    if (imageSource.startsWith("http") || imageSource.startsWith("/")) {
      url = imageSource;
    } else {
      try {
        const parsed = JSON.parse(imageSource);
        url =
          parsed?.main?.medium ||
          parsed?.main?.small ||
          parsed?.url ||
          parsed?.medium ||
          imageSource;
      } catch {
        url = imageSource;
      }
    }
  } else if (typeof imageSource === "object") {
    url =
      imageSource?.main?.medium ||
      imageSource?.main?.small ||
      imageSource?.url ||
      imageSource?.medium ||
      PLACEHOLDER_IMG;
  }

  if (url.startsWith("/")) {
    url = `${API_BASE_URL}${url}`;
  }

  return url || PLACEHOLDER_IMG;
};

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s === "active")
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (s === "draft") return "bg-amber-50 text-amber-600 border-amber-100";
  if (s === "out_of_stock") return "bg-rose-50 text-rose-600 border-rose-100";
  return "bg-zinc-100 text-zinc-500 border-zinc-200";
};

// --- COMPONENT ---
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
  const [uploading, setUploading] = useState<string | null>(null);

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

  // --- LOGIC ---
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

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      });

      if (debouncedSearch) {
        params.append("q", debouncedSearch);
        params.append("is_admin_view", "true");
      }
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const [prodRes, catRes] = await Promise.all([
        fetch(`${endpoint}?${params}`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/v1/categories/`, { credentials: "include" }),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData.items || []);
      setTotalPages(prodData.pages || 1);
      setTotalItems(prodData.total || 0);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) {
      toast.error("Eroare server la încărcarea datelor.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEdit = (p: any = null) => {
    if (p) {
      setEditingProduct(p);

      // 1. Extragere Galerie din structura hibridă (gallery sau additional_image_link)
      let galleryImages: string[] = [];

      if (
        p.image_url &&
        typeof p.image_url === "object" &&
        Array.isArray(p.image_url.gallery)
      ) {
        galleryImages = p.image_url.gallery.map((img: any) =>
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

      // 2. Extragere Imagine Principală
      let mainImg = "";
      if (p.image_url && typeof p.image_url === "object" && p.image_url.main) {
        mainImg =
          p.image_url.main.medium ||
          p.image_url.main.large ||
          p.image_url.main.url;
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
        category_id: p.category_id || "",
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
      if (!uploadedUrl) throw new Error("Format răspuns invalid de la server");

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
      toast.success("Imagine încărcată cu succes.");
    } catch {
      toast.error("Eroare la încărcarea imaginii.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id)
      return toast.error("Numele și Categoria sunt obligatorii.");

    const payload = {
      ...formData,
      sku:
        formData.sku ||
        `LN-${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      slug: formData.slug || generateSlug(formData.name),
      status: formData.status.toUpperCase(),
      price: Number(formData.price),
      sale_price: formData.sale_price > 0 ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity),
      weight: Number(formData.weight),
      length: Number(formData.length),
      width: Number(formData.width),
      height: Number(formData.height),
      additional_image_link: formData.additional_image_link.filter(Boolean),
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
        toast.success("Catalog actualizat!");
        fetchData();
        setIsModalOpen(false);
      } else {
        toast.error("Eroare la salvare. Verifică datele introduse.");
      }
    } catch {
      toast.error("Eroare severă la conexiune.");
    }
  };

  const handleImageError = (e: any) => {
    e.target.src = PLACEHOLDER_IMG;
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full space-y-8 pb-20 animate-in fade-in duration-700 font-sans text-left">
      {/* HEADER SECTION */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-zinc-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[var(--royal-violet)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
              Inventory Management
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)]">
            Catalog Produse
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)]"
              size={16}
            />
            <input
              className="w-full sm:w-[300px] pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:border-[var(--royal-violet)] outline-none transition-all text-sm font-bold shadow-inner"
              placeholder="Caută SKU sau Nume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openEdit()}
            className="bg-[var(--royal-violet)] text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--dark-amethyst)] transition-all flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
          >
            <Plus size={16} /> Adaugă Produs
          </button>
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-50 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-8">
          {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setCurrentPage(1);
              }}
              className={`pb-4 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                statusFilter === f
                  ? "text-[var(--royal-violet)]"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {f.replace(/_/g, " ")}
              {statusFilter === f && (
                <motion.div
                  layoutId="statusTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--royal-violet)]"
                />
              )}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest whitespace-nowrap">
          {totalItems} Articole în total
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto luxury-scrollbar">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-5 px-6 md:px-8 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Produs
                </TableHead>
                <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Status
                </TableHead>
                <TableHead className="text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Stoc
                </TableHead>
                <TableHead className="text-right px-6 md:px-8 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Preț / Acțiuni
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 md:w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </TableCell>
                    <TableCell className="px-6 md:px-8">
                      <Skeleton className="h-6 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-32 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest"
                  >
                    Nu au fost găsite rezultate.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow
                    key={p.id}
                    className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-50/50 last:border-0"
                  >
                    <TableCell className="py-5 px-6 md:px-8">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-16 bg-white rounded-lg border border-zinc-100 overflow-hidden shrink-0 shadow-sm p-1">
                          <img
                            src={getValidImageUrl(p.image_url)}
                            onError={handleImageError}
                            className="object-contain h-full w-full"
                            alt="Produs"
                          />
                        </div>
                        <div className="space-y-0.5 max-w-[200px] sm:max-w-[300px]">
                          <p
                            className="font-bold text-[var(--dark-amethyst)] text-sm truncate"
                            title={p.name}
                          >
                            {p.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter truncate">
                            {p.sku} • {p.brand_name || "Evem"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusBadge(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-black text-xs text-[var(--dark-amethyst)]">
                      {p.stock_quantity ?? 0}
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-8">
                      <div className="flex items-center justify-end gap-4 md:gap-6">
                        <div className="text-right">
                          <p className="font-black text-[var(--dark-amethyst)] text-sm whitespace-nowrap">
                            {p.price}{" "}
                            <span className="text-[9px] opacity-40">RON</span>
                          </p>
                          {p.sale_price && (
                            <p className="text-[8px] text-rose-500 font-bold uppercase tracking-tighter whitespace-nowrap">
                              Sale: {p.sale_price}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 bg-zinc-50 rounded-md hover:bg-[var(--royal-violet)] hover:text-white transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button className="p-2 bg-zinc-50 rounded-md hover:bg-rose-500 hover:text-white transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && totalPages > 1 && (
          <div className="p-4 md:p-6 bg-zinc-50/50 border-t flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 border rounded-lg hover:bg-white disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 border rounded-lg hover:bg-white disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* FULL PRODUCT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[1300px] w-[95vw] h-[95vh] p-0 rounded-[1.5rem] md:rounded-[2.5rem] border-none bg-[#FBFBFD] shadow-2xl flex flex-col overflow-hidden font-sans">
          <header className="px-6 md:px-10 py-6 md:py-8 flex justify-between items-center bg-white border-b shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[var(--dark-amethyst)] text-white hidden md:block">
                <Package size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] truncate max-w-[200px] sm:max-w-md">
                  {formData.sku
                    ? `Configurare: ${formData.sku}`
                    : "Adăugare Articol Nou"}
                </DialogTitle>
                <p className="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">
                  Catalog Management System
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="size-10 md:size-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 luxury-scrollbar text-left">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
              {/* LEFT: MEDIA & VISUALS */}
              <div className="xl:col-span-4 space-y-8 md:space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)] ml-1 flex items-center gap-2">
                    <ImageIcon size={14} /> Imagine Principală
                  </Label>
                  <div className="aspect-[3/4] bg-white rounded-[2rem] border-2 border-dashed border-zinc-200 flex items-center justify-center relative group overflow-hidden shadow-sm">
                    {formData.image_url ? (
                      <>
                        <img
                          src={getValidImageUrl(formData.image_url)}
                          onError={handleImageError}
                          className="h-full w-full object-contain p-4 md:p-8"
                          alt="Principal"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            onClick={() =>
                              setFormData({ ...formData, image_url: "" })
                            }
                            className="bg-white text-rose-500 p-4 rounded-full hover:scale-110 transition-transform"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer text-zinc-400 flex flex-col items-center gap-4 hover:text-[var(--royal-violet)] transition-colors w-full h-full justify-center">
                        {uploading === "main" ? (
                          <Loader2 className="animate-spin" size={40} />
                        ) : (
                          <Upload size={40} strokeWidth={1.5} />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">
                          Upload Imagine
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

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)] ml-1 flex items-center gap-2">
                    <Layers size={14} /> Galerie (Max 4)
                  </Label>
                  <div className="grid grid-cols-4 gap-2 md:gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-white rounded-xl md:rounded-2xl border border-zinc-200 relative overflow-hidden group"
                      >
                        {formData.additional_image_link[i] ? (
                          <>
                            <img
                              src={getValidImageUrl(
                                formData.additional_image_link[i],
                              )}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                              alt={`Secundar ${i}`}
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
                              className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer text-zinc-300 hover:bg-zinc-50 hover:text-[var(--royal-violet)] transition-colors">
                            {uploading === `extra-${i}` ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Plus size={20} />
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

              {/* RIGHT: CORE DATA */}
              <div className="xl:col-span-8 space-y-8 md:space-y-12">
                {/* Basic Info Box */}
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 md:space-y-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] md:text-[10px] font-black text-[var(--royal-violet)] uppercase tracking-widest ml-2">
                      Nume Articol
                    </Label>
                    <input
                      className="w-full bg-transparent border-b-2 border-zinc-100 pb-3 text-2xl md:text-4xl font-bold outline-none focus:border-[var(--royal-violet)] transition-all placeholder:text-zinc-200"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        })
                      }
                      placeholder="Introdu numele..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <PremiumInput
                      label="Cod SKU"
                      icon={<Hash size={12} />}
                      value={formData.sku}
                      onChange={(e: any) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                    />
                    <PremiumInput
                      label="Cod EAN"
                      icon={<Hash size={12} />}
                      value={formData.ean}
                      onChange={(e: any) =>
                        setFormData({ ...formData, ean: e.target.value })
                      }
                    />
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        Categorie Master
                      </Label>
                      <select
                        className="w-full bg-zinc-50 rounded-xl p-4 text-sm font-bold border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all appearance-none"
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                          })
                        }
                      >
                        <option value="">Selectează...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Logistics & Price Box */}
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 md:space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] flex items-center gap-2">
                    <DollarSign size={14} /> Financiare & Logistică
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                      <Label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                        Status
                      </Label>
                      <select
                        className="w-full bg-transparent text-[10px] font-black text-center uppercase border-none outline-none mt-1"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="ACTIVE">Public</option>
                        <option value="DRAFT">Schiță</option>
                        <option value="OUT_OF_STOCK">Fără Stoc</option>
                      </select>
                    </div>
                  </div>

                  {/* Dimensiuni si Greutate */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-zinc-50">
                    <PremiumInput
                      label="Greutate(g)"
                      icon={<Scale size={12} />}
                      value={formData.weight}
                      onChange={(e: any) =>
                        setFormData({
                          ...formData,
                          weight: Number(e.target.value),
                        })
                      }
                    />
                    <PremiumInput
                      label="Lungime(cm)"
                      icon={<Maximize size={12} />}
                      value={formData.length}
                      onChange={(e: any) =>
                        setFormData({
                          ...formData,
                          length: Number(e.target.value),
                        })
                      }
                    />
                    <PremiumInput
                      label="Lățime(cm)"
                      icon={<Maximize size={12} />}
                      value={formData.width}
                      onChange={(e: any) =>
                        setFormData({
                          ...formData,
                          width: Number(e.target.value),
                        })
                      }
                    />
                    <PremiumInput
                      label="Înălțime(cm)"
                      icon={<Maximize size={12} />}
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

                {/* Content & SEO Box */}
                <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6 md:space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)] flex items-center gap-2">
                      <AlignLeft size={14} /> Descriere Produs
                    </Label>
                    <textarea
                      className="w-full h-32 md:h-44 bg-zinc-50 rounded-2xl p-4 md:p-6 text-sm leading-relaxed border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all resize-none"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrierea produsului..."
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-zinc-50">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] flex items-center gap-2">
                        <Globe size={14} /> Indexare & SEO
                      </h4>
                      <PremiumInput
                        label="URL (Slug)"
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
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                          Meta Description
                        </Label>
                        <textarea
                          className="w-full h-24 bg-zinc-50 rounded-xl p-4 text-xs font-medium border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all resize-none"
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

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)] flex items-center gap-2">
                          <Layers size={14} /> Atribute Tehnice
                        </h4>
                        <button
                          onClick={() => {
                            const k = prompt(
                              "Nume atribut nou (ex: Culoare, Material):",
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
                      <div className="space-y-3">
                        {Object.entries(formData.attributes_json || {}).map(
                          ([k, v], idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 items-center bg-zinc-50 p-2 rounded-xl group border border-transparent hover:border-zinc-200 transition-all"
                            >
                              <span
                                className="text-[9px] font-black uppercase text-zinc-500 w-1/3 pl-3 truncate"
                                title={k}
                              >
                                {k}
                              </span>
                              <input
                                className="w-2/3 bg-transparent text-xs font-bold outline-none text-[var(--dark-amethyst)]"
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
                                className="text-rose-400 opacity-0 md:group-hover:opacity-100 transition-opacity pr-2"
                              >
                                <Trash2 size={14} />
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

          <DialogFooter className="px-6 md:px-10 py-6 md:py-8 bg-white border-t shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-zinc-400">
              <ShieldCheck size={16} className="text-[var(--royal-violet)]" />
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-center md:text-left">
                Propagare securizată în infrastructura EVEM
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 md:flex-none px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all border border-zinc-200"
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                className="flex-1 md:flex-none bg-[var(--dark-amethyst)] text-white px-8 md:px-12 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[var(--royal-violet)] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save size={16} />{" "}
                {editingProduct ? "Salvează Modificările" : "Publică Produsul"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

const PremiumInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-2 text-left w-full">
    <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
      {icon} {label}
    </Label>
    <input
      className="w-full bg-zinc-50 rounded-xl p-3.5 md:p-4 text-xs md:text-sm font-bold text-[var(--dark-amethyst)] border-none outline-none focus:ring-1 focus:ring-[var(--royal-violet)] transition-all shadow-inner placeholder:text-zinc-300"
      value={value}
      onChange={onChange}
      placeholder="..."
    />
  </div>
);

export default AdminProducts;
