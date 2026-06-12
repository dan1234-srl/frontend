/**
 * AdminCategories.tsx
 * Pagina de administrare categorii - Design Futuristic (Isomorphic UI)
 */

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
  Sparkles,
  EyeOff,
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

  const optimizedSrc = getValidImageUrl(src) || null;

  if (!optimizedSrc || error)
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
  const [categories, setCategories] = useState<Category[]>(
    cachedCats.data || [],
  );
  const [loading, setLoading] = useState(!cachedCats.data);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalPages = Math.ceil(filteredRootCats.length / itemsPerPage) || 1;
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
      const res = await fetch(`${API_BASE_URL}/api/v1/images/image`, {
        method: "POST",
        body: uploadData,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const imageObj = JSON.stringify({
          main: data.versions,
          url: data.url,
        });
        setFormData({ ...formData, image_url: imageObj });
        toast.success("Imagine procesată și încărcată!");
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Eroare la încărcarea imaginii.");
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
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in">
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
              Arhitectură
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Master{" "}
            <span style={{ color: "var(--royal-violet)" }}>Categorii</span>
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
              placeholder="Filtrează ierarhia..."
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
            <Plus size={14} strokeWidth={2.5} /> Adaugă Colecție
          </button>
        </div>
      </header>

      {/* ── Listă Categorii (Futuristic Data Grid) ──────────────────────────── */}
      <div
        className="bg-white rounded-3xl border shadow-xl shadow-black/[0.02] overflow-hidden relative z-10"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        {/* Header Listă */}
        <div
          className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
            color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
          }}
        >
          <div className="col-span-7 pl-4">Denumire & Ierarhie</div>
          <div className="col-span-2 text-center">Articole Indexate</div>
          <div className="col-span-3 text-right pr-4">Management</div>
        </div>

        <div
          className="divide-y"
          style={{
            divideColor:
              "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
          }}
        >
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="px-8 py-4 flex items-center gap-6">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2 w-24" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))
          ) : paginatedCats.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3">
              <Layers
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
                Nicio colecție găsită
              </span>
            </div>
          ) : (
            paginatedCats.map((cat) => (
              <div key={cat.id} className="group relative transition-all">
                {/* Gradient Fill pe hover (Root Category) */}
                <div
                  className="absolute inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                  style={{
                    background:
                      "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                  }}
                />

                <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-3.5 gap-4 md:gap-0 relative z-10">
                  <div className="col-span-7 flex items-center gap-4 w-full">
                    {/* Expand Button */}
                    <button
                      onClick={() =>
                        setExpanded((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((i) => i !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                      className={`size-8 rounded-lg flex items-center justify-center transition-all shrink-0 border ${expanded.includes(cat.id) ? "text-white shadow-md" : "bg-white"}`}
                      style={{
                        backgroundColor: expanded.includes(cat.id)
                          ? "var(--dark-amethyst)"
                          : "transparent",
                        borderColor: expanded.includes(cat.id)
                          ? "transparent"
                          : "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        color: expanded.includes(cat.id)
                          ? "white"
                          : "var(--royal-violet)",
                      }}
                    >
                      {expanded.includes(cat.id) ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>

                    {/* Image */}
                    <OptimizedImage
                      src={cat.image_url}
                      className="w-12 h-12 rounded-xl border shadow-sm shrink-0 transition-transform duration-500 group-hover:scale-105 bg-white"
                    />

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[var(--dark-amethyst)] tracking-tight truncate group-hover:text-[var(--royal-violet)] transition-colors">
                        {cat.name}
                      </span>
                      <span
                        className="text-[9px] font-semibold uppercase tracking-[0.2em] truncate mt-0.5"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                        }}
                      >
                        /{cat.slug}
                      </span>
                    </div>
                  </div>

                  {/* Produse Count */}
                  <div className="col-span-2 text-center hidden md:block">
                    <span
                      className="text-[11px] font-bold tabular-nums px-3 py-1.5 rounded-lg border bg-white/50"
                      style={{
                        color: "var(--dark-amethyst)",
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                      }}
                    >
                      {cat.product_count || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex justify-between md:justify-end gap-2 w-full md:w-auto pr-2">
                    {/* Status mobile */}
                    <div className="md:hidden flex items-center">
                      <span
                        className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border"
                        style={{
                          backgroundColor: cat.is_active
                            ? "color-mix(in srgb, #10b981 5%, transparent)"
                            : "color-mix(in srgb, gray 5%, transparent)",
                          color: cat.is_active ? "#10b981" : "gray",
                          borderColor: cat.is_active
                            ? "color-mix(in srgb, #10b981 20%, transparent)"
                            : "color-mix(in srgb, gray 20%, transparent)",
                        }}
                      >
                        {cat.is_active ? "Activ" : "Inactiv"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 lg:translate-x-2 lg:group-hover:translate-x-0">
                      <button
                        onClick={() => toggleVisibility(cat)}
                        title={cat.is_active ? "Dezactivează" : "Activează"}
                        className={`p-2 rounded-lg border transition-all ${cat.is_active ? "text-emerald-600 bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100" : "text-zinc-400 bg-white hover:bg-zinc-50"}`}
                        style={
                          !cat.is_active
                            ? {
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                              }
                            : {}
                        }
                      >
                        {cat.is_active ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(cat)}
                        title="Editează"
                        className="p-2 bg-white border rounded-lg hover:bg-[var(--royal-violet)] hover:text-white transition-all shadow-sm"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        title="Șterge"
                        className="p-2 bg-white border rounded-lg hover:bg-rose-500 hover:text-white transition-all text-rose-500 shadow-sm"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBCATEGORII (Animated & Nested) */}
                <AnimatePresence>
                  {expanded.includes(cat.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-zinc-50/30 border-l-2 ml-[2.6rem] mr-4 rounded-br-2xl mb-2 overflow-hidden relative z-10"
                      style={{
                        borderLeftColor: "var(--royal-violet)",
                        borderBottom:
                          "1px solid color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                        borderRight:
                          "1px solid color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                      }}
                    >
                      {cat.subcategories?.length > 0 ? (
                        cat.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex flex-col md:grid md:grid-cols-12 items-center px-4 md:px-8 py-3 border-b last:border-0 hover:bg-white/60 transition-colors group/sub"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 4%, transparent)",
                            }}
                          >
                            <div className="col-span-7 flex items-center gap-3 w-full">
                              <MoveRight
                                size={12}
                                style={{
                                  color:
                                    "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                                }}
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-[var(--dark-amethyst)] tracking-tight">
                                  {sub.name}
                                </span>
                                <span
                                  className="text-[9px] font-medium uppercase tracking-[0.2em] mt-[1px]"
                                  style={{
                                    color:
                                      "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                                  }}
                                >
                                  /{cat.slug}/{sub.slug}
                                </span>
                              </div>
                            </div>
                            <div
                              className="col-span-2 text-center text-[10px] font-black tabular-nums hidden md:block"
                              style={{ color: "var(--royal-violet)" }}
                            >
                              {sub.product_count || 0} ARTICOLE
                            </div>
                            <div className="col-span-3 flex justify-end gap-1.5 w-full md:w-auto mt-2 md:mt-0 opacity-100 lg:opacity-0 group-hover/sub:opacity-100 transition-all pr-2">
                              <button
                                onClick={() => toggleVisibility(sub)}
                                className={`p-1.5 rounded-lg transition-all ${sub.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-zinc-400 hover:bg-zinc-100"}`}
                              >
                                {sub.is_active ? (
                                  <Eye size={13} />
                                ) : (
                                  <EyeOff size={13} />
                                )}
                              </button>
                              <button
                                onClick={() => openEdit(sub)}
                                className="p-1.5 rounded-lg hover:bg-[var(--royal-violet)] hover:text-white text-[var(--dark-amethyst)] transition-colors"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          className="px-8 py-4 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                          }}
                        >
                          <ShieldCheck size={14} /> Nicio sub-colecție
                          înregistrată
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
          <div
            className="p-4 border-t flex justify-center items-center gap-4 shrink-0 bg-zinc-50/50"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 bg-white border rounded-lg hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
            >
              <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
            </button>
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em] bg-white border px-4 py-2 rounded-lg shadow-sm"
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
              className="p-2 bg-white border rounded-lg hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
            >
              <ChevronRight
                size={14}
                style={{ color: "var(--royal-violet)" }}
              />
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL CONFIG (Futuristic) ─────────────────────────────────────── */}
      <AdminDialogShell
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="lg"
        mobileVariant="modal"
        className="h-[100dvh] sm:h-[90vh] sm:max-h-[90vh] rounded-none sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">
          Configurare Colecție
        </AdminDialogTitle>
        <header
          className="px-6 sm:px-8 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 sticky top-0 z-20 flex justify-between items-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              {editingCategory ? "Editează Parametrii" : "Colecție Nouă"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Configurare Ierarhie Master
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto luxury-scrollbar relative z-10">
          {/* Identificatori */}
          <div
            className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-6"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 group relative">
                <Label
                  className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Denumire Colecție
                </Label>
                <input
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-3.5 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)]"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  value={formData.name}
                  placeholder="Ex: Accesorii Premium"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                  }}
                />
              </div>
              <div className="space-y-2 group relative">
                <Label
                  className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  URL Slug
                </Label>
                <input
                  className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-3.5 text-xs font-mono font-bold outline-none transition-all text-zinc-500"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                    e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 group relative">
              <Label
                className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Părinte Ierarhic (Opțional)
              </Label>
              <select
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-3.5 text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                style={{
                  color: "var(--dark-amethyst)",
                  boxShadow:
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                value={formData.parent_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_id: e.target.value || null,
                  })
                }
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                  e.target.style.backgroundColor = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow =
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                }}
              >
                <option value="">-- COLECȚIE PRINCIPALĂ (ROOT) --</option>
                {categories
                  .filter((c) => !c.parent_id && c.id !== editingCategory?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Media */}
          <div
            className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-4"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <Label
              className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              <ImageIcon size={13} /> Imagine Prezentare
            </Label>
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <OptimizedImage
                src={formData.image_url}
                className="size-24 rounded-xl shadow-sm border shrink-0 bg-white"
              />
              <div className="flex-1 flex flex-col gap-3 w-full">
                <input
                  className="w-full bg-white/50 rounded-xl p-3 text-xs font-medium outline-none transition-all"
                  style={{
                    color: "var(--dark-amethyst)",
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  placeholder="Paste image link..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  onFocus={(e) =>
                    (e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow =
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)")
                  }
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    className="w-full h-10 bg-white border hover:border-solid rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 relative z-0"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 30%, transparent)",
                      color: "var(--royal-violet)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--royal-violet)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.color = "var(--royal-violet)";
                    }}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <UploadCloud size={14} />
                    )}
                    {isUploadingImage
                      ? "Se încarcă pe S3..."
                      : "Alege fișier (S3)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer
          className="p-5 sm:p-6 bg-white/90 backdrop-blur-xl border-t shrink-0 flex justify-end gap-3 sticky bottom-0 z-20"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white border hover:bg-zinc-50 transition-all"
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
            className="text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--primary-gradient)" }}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}
            {editingCategory ? "Salvează Modificări" : "Publică Colecție"}
          </button>
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

export default AdminCategories;
