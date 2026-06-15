/**
 * AdminBrands.tsx
 * Pagina de administrare branduri - Design Futuristic (Bento Neo-Mosaic & Glassmorphism)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Save,
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

const AdminBrands = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- DATA STATE ---
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- UI STATE (Pagination & Search) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", logo_url: "" });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Acces refuzat.");
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/brands/?page=${currentPage}&page_size=${itemsPerPage}&search=${searchTerm}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (res.ok) {
        setBrands(data.items || []);
        setTotalPages(data.pages || 1);
      } else {
        throw new Error(data.detail || "Eroare date.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    if (isAdmin) {
      const delayDebounceFn = setTimeout(() => {
        fetchBrands();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [isAdmin, currentPage, searchTerm, fetchBrands]);

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
      const res = await fetch(`${API_BASE_URL}/api/v1/upload/image`, {
        method: "POST",
        body: uploadData,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.url || data.file_url || data.data?.url;
        setFormData({ ...formData, logo_url: uploadedUrl });
        toast.success("Logo procesat și încărcat!");
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Eroare la încărcarea imaginii.");
      }
    } catch (error) {
      toast.error("Eroare de conexiune cu serverul S3.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim())
      return toast.error("Denumirea este obligatorie.");

    setIsSaving(true);
    const method = editingBrand ? "PUT" : "POST";
    const url = editingBrand
      ? `${API_BASE_URL}/api/v1/brands/${editingBrand.id}`
      : `${API_BASE_URL}/api/v1/brands/`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Catalog branduri actualizat.");
        fetchBrands();
        setIsModalOpen(false);
      } else {
        toast.error("A apărut o eroare la salvare.");
      }
    } catch (err) {
      toast.error("Eroare server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (!confirm(`Ștergi definitiv brandul "${name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/brands/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Eliminat.");
        fetchBrands();
      } else {
        toast.error("Nu se poate șterge. Posibil să aibă produse asociate.");
      }
    } catch (error) {
      toast.error("Eroare comunicare.");
    }
  };

  const openCreate = () => {
    setEditingBrand(null);
    setFormData({ name: "", logo_url: "" });
    setIsModalOpen(true);
  };

  const openEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, logo_url: brand.logo_url || "" });
    setIsModalOpen(true);
  };

  if (authLoading || !isAdmin) return null;

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
              Brand Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Parteneri{" "}
            <span style={{ color: "var(--royal-violet)" }}>Atelier</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <button
            onClick={openCreate}
            className="text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Înregistrare Nouă
          </button>
        </div>
      </header>

      {/* ── FILTERS BAR (Glassmorphism) ──────────────────────────── */}
      <section
        className="flex flex-col lg:flex-row gap-3 lg:items-center p-3 rounded-[1.5rem] backdrop-blur-xl border bg-white/40 w-fit"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        <div className="relative w-full lg:w-[420px] group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            size={14}
            style={{
              color: "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
            }}
          />
          <input
            placeholder="Caută producător..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md border rounded-xl text-sm font-medium outline-none transition placeholder:text-zinc-400 placeholder:font-normal text-[var(--dark-amethyst)]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--royal-violet)";
              e.target.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)";
              e.target.style.backgroundColor = "rgba(255,255,255,0.6)";
            }}
          />
        </div>
      </section>

      {/* ── BENTO GRID CARDURI ───────────────────────────────────── */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-[2rem] p-5 flex flex-col items-center gap-4 shadow-sm"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                  <Skeleton className="h-8 w-full mt-2 rounded-xl" />
                </div>
              ))}
            </motion.div>
          ) : brands.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center gap-3 bg-white/50 rounded-[3rem] border border-dashed"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <AlertTriangle
                size={40}
                strokeWidth={1}
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                }}
              >
                Niciun producător găsit
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
            >
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="group relative bg-white rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col shadow-sm"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  {/* Background Gradient pe Hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                    }}
                  />

                  <div className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
                    <div
                      className="w-16 h-16 bg-white rounded-2xl border flex items-center justify-center p-3 shadow-sm mb-4 group-hover:scale-105 transition-transform duration-500"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                    >
                      {getValidImageUrl(brand.logo_url) ? (
                        <img
                          src={getValidImageUrl(brand.logo_url)}
                          className="w-full h-full object-contain"
                          alt={brand.name}
                        />
                      ) : (
                        <Award
                          size={24}
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                          }}
                        />
                      )}
                    </div>

                    <h3 className="text-[14px] font-bold text-[var(--dark-amethyst)] uppercase tracking-tight truncate w-full group-hover:text-[var(--royal-violet)] transition-colors">
                      {brand.name}
                    </h3>

                    <div
                      className="flex items-center gap-1.5 mt-2"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                      }}
                    ></div>
                  </div>

                  {/* Actions Footer */}
                  <div
                    className="px-5 py-3 border-t flex justify-between items-center relative z-10 bg-zinc-50/50 group-hover:bg-white/50 transition-colors mt-auto"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                    }}
                  >
                    <span
                      className="text-[8px] font-mono font-bold tracking-widest uppercase"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                      }}
                    >
                      ID:{brand.id.toString().slice(0, 5)}
                    </span>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(brand)}
                        className="p-1.5 rounded-lg hover:bg-[var(--royal-violet)] hover:text-white transition-colors text-[var(--dark-amethyst)] shadow-sm border border-transparent hover:border-[var(--royal-violet)]"
                        title="Editează"
                      >
                        <Edit2 size={12} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id, brand.name)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-colors shadow-sm border border-transparent hover:border-rose-500"
                        title="Șterge"
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm mt-6"
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
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              if (p < currentPage - 2 || p > currentPage + 2) return null;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${currentPage === p ? "text-white border-transparent" : "bg-white hover:bg-zinc-50"}`}
                  style={{
                    background:
                      currentPage === p ? "var(--primary-gradient)" : undefined,
                    borderColor:
                      currentPage !== p
                        ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                        : undefined,
                    color:
                      currentPage !== p
                        ? "var(--dark-amethyst)"
                        : "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  {p}
                </button>
              );
            })}
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

      {/* ── MODAL CONFIG ─────────────────────────────────────── */}
      <AdminDialogShell
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="md"
        mobileVariant="modal"
        className="sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[2.5rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">
          Configurare Partener
        </AdminDialogTitle>
        <header
          className="px-6 sm:px-10 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 sticky top-0 z-20 flex justify-between items-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              {editingBrand ? "Revizuire Partener" : "Sincronizare Brand"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Configurare Entitate Master
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

        <div className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto luxury-scrollbar relative z-10 bg-white/50">
          <div
            className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-2 group relative"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <Label
              className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              Denumire Oficială
            </Label>
            <input
              className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-xl font-black uppercase outline-none transition-all text-[var(--dark-amethyst)]"
              style={{
                boxShadow:
                  "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
              value={formData.name}
              placeholder="Ex: EVEM EXCLUSIVE"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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

          <div
            className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[1.5rem] border shadow-sm space-y-4"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div className="flex justify-between items-center">
              <Label
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                Logo Asset (URL)
              </Label>
              {formData.logo_url && (
                <a
                  href={getValidImageUrl(formData.logo_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[8px] font-black uppercase flex items-center gap-1 hover:underline"
                  style={{ color: "var(--royal-violet)" }}
                >
                  Test Link <ExternalLink size={10} />
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div
                className="size-20 bg-white rounded-xl shadow-sm border shrink-0 flex items-center justify-center p-2"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
              >
                {getValidImageUrl(formData.logo_url) ? (
                  <img
                    src={getValidImageUrl(formData.logo_url)}
                    className="w-full h-full object-contain"
                    alt=""
                  />
                ) : (
                  <ImageIcon className="text-zinc-200" size={24} />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-3 w-full">
                <input
                  className="w-full bg-white/50 rounded-xl p-3.5 text-xs font-mono font-medium outline-none transition-all text-[var(--dark-amethyst)]"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  placeholder="https://link-logo.com/img.png"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
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
                <p
                  className="text-[8px] font-bold uppercase italic"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                  }}
                >
                  Format recomandat: PNG Transparent / SVG
                </p>
              </div>
            </div>

            <div className="relative pt-2">
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
                className="w-full h-11 bg-white border border-dashed hover:border-solid hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 relative z-0"
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
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <UploadCloud size={16} />
                )}
                {isUploadingImage
                  ? "Se încarcă pe S3..."
                  : "Alege fișier local (S3)"}
              </button>
            </div>
          </div>
        </div>

        <footer
          className="p-5 sm:p-6 bg-white/90 backdrop-blur-xl border-t shrink-0 flex justify-end gap-3 sticky bottom-0 z-20 rounded-b-[2.5rem]"
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
              <Save size={14} strokeWidth={2.5} />
            )}
            Salvare în Catalog
          </button>
        </footer>
      </AdminDialogShell>
    </div>
  );
};

export default AdminBrands;
