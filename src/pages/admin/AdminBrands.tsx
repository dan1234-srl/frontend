/**
 * AdminBrands.tsx
 * Pagina de administrare branduri - Design Futuristic (Isomorphic UI)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
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

// --- HELPER IMAGINI S3/JSON ---
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
              Brand Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Parteneri{" "}
            <span style={{ color: "var(--royal-violet)" }}>Atelier</span>
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
              placeholder="Caută producător..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
            onClick={openCreate}
            className="text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Înregistrare Nouă
          </button>
        </div>
      </header>

      {/* ── Listă Branduri (Futuristic Data Grid) ──────────────────────────── */}
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
          <div className="col-span-6 pl-4">Denumire Oficială</div>
          <div className="col-span-3 text-center">Articole Asociate</div>
          <div className="col-span-3 text-right pr-4">Management</div>
        </div>

        <div
          className="divide-y min-h-[400px]"
          style={{
            divideColor:
              "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
          }}
        >
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="px-8 py-4 flex items-center gap-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-2 w-24" />
                </div>
                <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg ml-auto" />
              </div>
            ))
          ) : brands.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-3">
              <AlertTriangle
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
                Niciun producător găsit
              </span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {brands.map((brand) => (
                <motion.div
                  layout
                  key={brand.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative transition-all"
                >
                  {/* Gradient Fill pe hover */}
                  <div
                    className="absolute inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                    style={{
                      background:
                        "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                    }}
                  />

                  <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-3.5 gap-4 md:gap-0 relative z-10">
                    <div className="col-span-6 flex items-center gap-5 w-full pl-2">
                      <div
                        className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center p-1.5 shadow-sm shrink-0 transition-transform duration-500 group-hover:scale-105"
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
                            size={18}
                            style={{
                              color:
                                "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                            }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-[var(--dark-amethyst)] uppercase tracking-tight truncate group-hover:text-[var(--royal-violet)] transition-colors">
                          {brand.name}
                        </span>
                        <div
                          className="flex items-center gap-1.5 mt-0.5"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                          }}
                        >
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">
                            Catalog Master
                          </span>
                          <span
                            className="w-1 h-1 rounded-full"
                            style={{
                              background:
                                "color-mix(in srgb, var(--royal-violet) 30%, transparent)",
                            }}
                          />
                          <span className="text-[8px] font-mono tracking-widest uppercase">
                            ID:{brand.id.toString().slice(0, 6)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Produse Count */}
                    <div className="col-span-3 text-center hidden md:flex items-center justify-center gap-2">
                      <Package
                        size={14}
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                        }}
                      />
                      <span
                        className="text-[11px] font-bold tabular-nums"
                        style={{ color: "var(--dark-amethyst)" }}
                      >
                        {brand.products_count || 0}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex justify-between md:justify-end gap-2 w-full md:w-auto pr-2">
                      <div className="md:hidden flex items-center gap-1.5">
                        <Package
                          size={12}
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                          }}
                        />
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: "var(--dark-amethyst)" }}
                        >
                          {brand.products_count || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 lg:translate-x-2 lg:group-hover:translate-x-0">
                        <button
                          onClick={() => openEdit(brand)}
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
                          onClick={() => handleDelete(brand.id, brand.name)}
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
                </motion.div>
              ))}
            </AnimatePresence>
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
        size="md"
        mobileVariant="modal"
        className="sm:h-[80vh] sm:max-h-[80vh] rounded-none sm:rounded-[2rem] border shadow-2xl"
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
          className="px-6 sm:px-8 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 sticky top-0 z-20 flex justify-between items-center"
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

        <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto luxury-scrollbar relative z-10">
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
                  className="w-full bg-white/50 rounded-xl p-3.5 text-xs font-mono font-medium outline-none transition-all"
                  style={{
                    color: "var(--dark-amethyst)",
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
            Salvare în Catalog
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

export default AdminBrands;
