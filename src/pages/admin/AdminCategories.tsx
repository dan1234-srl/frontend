import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Layers,
  Search,
  Loader2,
  X,
  Image as ImageIcon,
  Eye,
  MoveRight,
  ShieldCheck,
  ChevronLeft,
  UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AdminDialogShell,
  AdminDialogTitle,
} from "@/components/admin/AdminDialogShell";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { readCache, writeCache } from "@/lib/swr-cache";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- HELPER IMAGINI ---
const getValidImageUrl = (imageSource: any) => {
  if (!imageSource) return null;
  if (typeof imageSource === "string" && imageSource.startsWith("http"))
    return imageSource;
  try {
    const parsed =
      typeof imageSource === "string" ? JSON.parse(imageSource) : imageSource;
    return parsed.main?.medium || parsed.url || parsed.medium || null;
  } catch {
    return null;
  }
};

const OptimizedImage = ({
  src,
  className,
}: {
  src: string | null;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const cleanSrc = getValidImageUrl(src);
  // S3 livrează deja imagini optimizate
  const optimizedSrc = cleanSrc || null;

  if (!optimizedSrc || error)
    return (
      <div
        className={`bg-zinc-50 flex items-center justify-center ${className}`}
      >
        <ImageIcon size={20} className="text-zinc-200" />
      </div>
    );

  return (
    <div className={`relative bg-zinc-50 overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-zinc-300" size={16} />
        </div>
      )}
      <img
        src={optimizedSrc}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`${className} w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        alt=""
      />
    </div>
  );
};

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  product_count?: number;
  subcategories: Category[];
}

const AdminCategories = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const cachedCats = readCache<Category[]>("admin:categories", 60_000);
  const [categories, setCategories] = useState<Category[]>(cachedCats.data || []);
  const [loading, setLoading] = useState(!cachedCats.data);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image_url: "",
    parent_id: null as string | null,
    is_active: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const hadCache = !!readCache<Category[]>("admin:categories", 60_000).data;
      if (!hadCache) setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/categories/`, {
        credentials: "include",
      });
      const data = await response.json();
      const arr = Array.isArray(data) ? data : [];
      setCategories(arr);
      writeCache("admin:categories", arr);
    } catch (error) {
      toast.error("Eroare la sincronizare.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchCategories();
  }, [isAdmin, fetchCategories]);

  const filteredRootCats = useMemo(() => {
    const rootCats = categories.filter((c) => !c.parent_id);
    if (!searchTerm) return rootCats;
    const term = searchTerm.toLowerCase();
    return rootCats.filter((cat) => {
      const inMain = cat.name.toLowerCase().includes(term);
      const inSubs = cat.subcategories?.some((s) =>
        s.name.toLowerCase().includes(term),
      );
      return inMain || inSubs;
    });
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredRootCats.length / itemsPerPage);
  const paginatedCats = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRootCats.slice(start, start + itemsPerPage);
  }, [filteredRootCats, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Imaginea este prea mare (maxim 5MB).");
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setIsUploadingImage(true);
    try {
      // APELĂM ENDPOINT-UL NOU DE IMAGINI S3
      const res = await fetch(`${API_BASE_URL}/api/v1/images/image`, {
        method: "POST",
        body: uploadData,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        // Construim un obiect JSON pentru a pastra variantele large/medium/small
        // Acesta va fi parsat la afișare de OptimizedImage
        const imageObj = JSON.stringify({
          main: data.versions,
          url: data.url,
        });
        setFormData({ ...formData, image_url: imageObj });
        toast.success("Imagine procesată S3 și încărcată cu succes!");
      } else {
        const errData = await res.json();
        toast.error(
          errData.detail || "A apărut o eroare la încărcarea imaginii.",
        );
      }
    } catch (error) {
      toast.error("Eroare de conexiune cu serverul.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug)
      return toast.error("Date incomplete.");
    setIsSaving(true);
    const method = editingCategory ? "PUT" : "POST";
    const url = editingCategory
      ? `${API_BASE_URL}/api/v1/categories/${editingCategory.id}`
      : `${API_BASE_URL}/api/v1/categories/`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Salvat cu succes.");
        fetchCategories();
        setIsModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (cat: Category) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      if (res.ok) {
        toast.success("Status actualizat.");
        fetchCategories();
      }
    } catch (err) {
      toast.error("Eroare update.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ștergi definitiv această categorie?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Eliminată.");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Eroare ștergere.");
    }
  };

  const openEdit = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url || "",
        parent_id: cat.parent_id,
        is_active: cat.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        image_url: "",
        parent_id: null,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div className="w-full space-y-10 pb-20 font-sans text-left">
      {/* HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-zinc-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-[1px]"
              style={{ backgroundColor: "var(--royal-violet)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.5em]"
              style={{ color: "var(--royal-violet)" }}
            >
              Arhitectură Catalog
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-6xl italic tracking-tighter text-[var(--dark-amethyst)]">
            Ierarhie{" "}
            <span style={{ color: "var(--royal-violet)" }}>Categorii</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
              size={18}
            />
            <input
              className="w-full sm:w-[350px] pl-12 pr-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--royal-violet)]/10 outline-none transition-all text-sm font-bold shadow-inner"
              placeholder="Filtrează ierarhia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openEdit()}
            className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={16} /> Adaugă Colecție
          </button>
        </div>
      </header>

      {/* TABLE BODY */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden relative min-h-[400px]">
        <div className="hidden md:grid grid-cols-12 bg-zinc-50/50 border-b border-zinc-100 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 px-10 py-6">
          <div className="col-span-6 pl-12">Denumire & Slug</div>
          <div className="col-span-2 text-center">Total Produse</div>
          <div className="col-span-4 text-right pr-6">Acțiuni</div>
        </div>

        <div className="divide-y divide-zinc-50">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="px-10 py-8 flex items-center gap-10">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            ))
          ) : paginatedCats.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-2">
              <Layers
                className="text-zinc-200 mb-2"
                size={48}
                strokeWidth={1}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Nicio colecție găsită
              </span>
            </div>
          ) : (
            paginatedCats.map((cat) => (
              <div key={cat.id} className="group">
                <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-6 md:px-10 py-6 hover:bg-zinc-50/50 transition-colors gap-4 md:gap-0">
                  <div className="col-span-6 flex items-center gap-6 w-full">
                    <button
                      onClick={() =>
                        setExpanded((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((i) => i !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${expanded.includes(cat.id) ? "text-white shadow-md" : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"}`}
                      style={{
                        backgroundColor: expanded.includes(cat.id)
                          ? "var(--dark-amethyst)"
                          : undefined,
                      }}
                    >
                      {expanded.includes(cat.id) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <OptimizedImage
                      src={cat.image_url}
                      className="w-16 h-16 rounded-xl border border-zinc-100 shadow-sm shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[var(--dark-amethyst)] uppercase tracking-tight truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 truncate">
                        /{cat.slug}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center hidden md:block">
                    <span className="text-xl font-serif italic font-bold text-[var(--dark-amethyst)]">
                      {cat.product_count || 0}
                    </span>
                  </div>
                  <div className="col-span-4 flex justify-end gap-2 w-full md:w-auto">
                    <button
                      onClick={() => toggleVisibility(cat)}
                      className={`p-3 rounded-xl border transition-all ${cat.is_active ? "text-emerald-500 bg-emerald-50 border-emerald-100" : "text-zinc-300 bg-zinc-50 border-zinc-100"}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-3 bg-white border border-zinc-100 rounded-xl hover:text-[var(--royal-violet)] transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-3 bg-white border border-zinc-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* SUBCATEGORIES */}
                <AnimatePresence>
                  {expanded.includes(cat.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-zinc-50/50 border-l-4 ml-10 rounded-bl-xl mb-4"
                      style={{ borderLeftColor: "var(--royal-violet)" }}
                    >
                      {cat.subcategories?.length > 0 ? (
                        cat.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex flex-col md:grid md:grid-cols-12 items-center px-12 py-4 border-b border-white last:border-0"
                          >
                            <div className="col-span-6 flex items-center gap-4">
                              <MoveRight size={14} className="text-zinc-300" />
                              <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-[var(--dark-amethyst)] uppercase">
                                  {sub.name}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400">
                                  /{cat.slug}/{sub.slug}
                                </span>
                              </div>
                            </div>
                            <div
                              className="col-span-2 text-center text-[11px] font-black"
                              style={{ color: "var(--royal-violet)" }}
                            >
                              {sub.product_count || 0} ARTICOLE
                            </div>
                            <div className="col-span-4 flex justify-end gap-3">
                              <button
                                onClick={() => toggleVisibility(sub)}
                                className={
                                  sub.is_active
                                    ? "text-emerald-500"
                                    : "text-zinc-300"
                                }
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => openEdit(sub)}
                                className="text-[var(--dark-amethyst)] hover:text-[var(--royal-violet)]"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="text-rose-400 hover:text-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-[10px] font-black uppercase text-zinc-400 flex items-center gap-2">
                          <ShieldCheck size={14} /> Fără subdiviziuni
                          înregistrate
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <footer className="p-6 bg-zinc-50 border-t flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Pagina {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-3 bg-white rounded-xl border hover:border-[var(--royal-violet)] disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-3 bg-white rounded-xl border hover:border-[var(--royal-violet)] disabled:opacity-20 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* MODAL CONFIG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[700px] w-[95vw] p-0 bg-[#FBFBFD] border-none rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <header className="px-10 py-8 flex justify-between items-center bg-white border-b shrink-0">
            <div>
              <DialogTitle className="heading-serif text-3xl italic text-[var(--dark-amethyst)]">
                {editingCategory ? "Editează Parametrii" : "Colecție Nouă"}
              </DialogTitle>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">
                Configurare Ierarhie Master
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="size-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </header>

          <div className="p-10 space-y-10 overflow-y-auto luxury-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Denumire
                </Label>
                <input
                  className="w-full bg-white rounded-2xl p-4 text-sm font-bold border border-zinc-100 outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  URL Slug
                </Label>
                <input
                  className="w-full bg-white rounded-2xl p-4 text-sm font-mono font-bold border border-zinc-100 outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Părinte Ierarhic (Optional)
              </Label>
              <select
                className="w-full bg-white rounded-2xl p-4 text-xs font-black border border-zinc-100 outline-none appearance-none"
                value={formData.parent_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_id: e.target.value || null,
                  })
                }
              >
                <option value="">COLECȚIE PRINCIPALĂ (ROOT)</option>
                {categories
                  .filter((c) => !c.parent_id && c.id !== editingCategory?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Imagine Prezentare
              </Label>
              <div className="flex gap-6 items-center">
                <OptimizedImage
                  src={formData.image_url}
                  className="size-24 rounded-2xl shadow-md border shrink-0"
                />
                <div className="flex-1 flex flex-col gap-3">
                  <input
                    className="w-full bg-zinc-50 rounded-xl p-3 text-xs font-medium border border-zinc-100 outline-none focus:bg-white focus:border-[var(--royal-violet)] transition-colors"
                    placeholder="Paste image link..."
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      className="w-full h-10 bg-white border border-zinc-200 hover:border-[var(--royal-violet)] hover:text-[var(--royal-violet)] text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      {isUploadingImage
                        ? "Procesare S3..."
                        : "Încarcă fișier (S3)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-white border-t shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full text-white py-5 rounded-2xl text-[11px] uppercase tracking-[0.4em] font-black shadow-xl hover:brightness-110 active:scale-95 disabled:bg-zinc-200 transition-all"
              style={{ background: "var(--primary-gradient)" }}
            >
              {isSaving ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Salvează Modificările"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
