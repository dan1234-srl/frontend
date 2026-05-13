import { useState, useEffect, useMemo } from "react";
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
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const fetchBrands = async () => {
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
  };

  useEffect(() => {
    if (isAdmin) {
      const delayDebounceFn = setTimeout(() => {
        fetchBrands();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [isAdmin, currentPage, searchTerm]);

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
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700 font-sans text-left">
      {/* HEADER LUXURY */}
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
              Brand Management
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-6xl italic tracking-tighter text-[var(--dark-amethyst)]">
            Parteneri{" "}
            <span style={{ color: "var(--royal-violet)" }}>Atelier</span>
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
              placeholder="Caută producător..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={openCreate}
            className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={16} /> Înregistrare Nouă
          </button>
        </div>
      </header>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        {loading ? (
          // SKELETON LOADING GRID
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-zinc-100 p-8 rounded-[2rem] space-y-6"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="w-24 h-4 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
          ))
        ) : brands.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {brands.map((brand) => (
              <motion.div
                layout
                key={brand.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div
                    className="w-16 h-16 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center p-2 group-hover:text-white transition-all duration-500 overflow-hidden"
                    style={{ backgroundColor: "var(--background)" }}
                  >
                    {getValidImageUrl(brand.logo_url) ? (
                      <img
                        src={getValidImageUrl(brand.logo_url)}
                        className="w-full h-full object-contain transition-all"
                        alt={brand.name}
                      />
                    ) : (
                      <Award
                        size={24}
                        className="transition-colors"
                        style={{ color: "var(--dark-amethyst)" }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--background)",
                        color: "var(--royal-violet)",
                      }}
                    >
                      Premium Partner
                    </span>
                    <div className="flex items-center gap-1.5 text-zinc-400 mt-2">
                      <Package size={10} />
                      <span className="text-[10px] font-bold uppercase">
                        {brand.products_count || 0} Articole
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[var(--dark-amethyst)] mb-1 truncate">
                    {brand.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold italic leading-none">
                    Catalog Master
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all relative z-10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(brand)}
                      className="p-3 rounded-xl bg-white shadow-sm border border-zinc-100 transition-colors text-zinc-600"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--royal-violet)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#52525b")
                      }
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="p-3 rounded-xl bg-white shadow-sm border border-zinc-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="text-[8px] font-black uppercase text-zinc-300 tracking-widest font-mono italic">
                    ID: {brand.id.toString().slice(0, 8)}
                  </span>
                </div>

                {/* Background Decorator */}
                <div
                  className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl group-hover:opacity-20 transition-all pointer-events-none opacity-0"
                  style={{ backgroundColor: "var(--royal-violet)" }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-100 rounded-[2rem] bg-zinc-50/50">
            <AlertTriangle
              className="mx-auto text-zinc-200 mb-4"
              size={48}
              strokeWidth={1}
            />
            <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">
              Registru gol
            </p>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {!loading && totalPages > 1 && (
        <footer className="flex items-center justify-between p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100">
          <span className="hidden sm:block text-[10px] font-black text-zinc-300 uppercase tracking-widest">
            Linea Master Catalog • Branduri
          </span>
          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-4 bg-white rounded-2xl border border-zinc-100 disabled:opacity-30 shadow-sm transition-all"
              onMouseEnter={(e) =>
                !e.currentTarget.disabled &&
                (e.currentTarget.style.borderColor = "var(--royal-violet)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#f4f4f5")
              }
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center px-6">
              <p className="text-[9px] font-black uppercase text-zinc-400">
                Pagina
              </p>
              <p className="heading-serif text-2xl italic text-[var(--dark-amethyst)]">
                {currentPage}
              </p>
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-4 bg-white rounded-2xl border border-zinc-100 disabled:opacity-30 shadow-sm transition-all"
              onMouseEnter={(e) =>
                !e.currentTarget.disabled &&
                (e.currentTarget.style.borderColor = "var(--royal-violet)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#f4f4f5")
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}

      {/* MODAL CONFIGURATION */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 bg-[#FBFBFD] border-none rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col font-sans">
          <header className="px-8 py-6 flex justify-between items-center bg-white border-b border-zinc-100 shrink-0">
            <div className="text-left">
              <DialogTitle className="heading-serif text-3xl italic text-[var(--dark-amethyst)]">
                {editingBrand ? "Revizuire Partener" : "Sincronizare Brand"}
              </DialogTitle>
              <p
                className="text-[10px] uppercase tracking-widest font-black mt-1"
                style={{ color: "var(--royal-violet)" }}
              >
                Configurare Entitate Master
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-3 bg-zinc-50 hover:bg-rose-500 hover:text-white rounded-full transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </header>

          <div className="p-8 space-y-8 overflow-y-auto luxury-scrollbar text-left">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-3">
              <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                Denumire Oficială
              </Label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-transparent border-b-2 border-zinc-100 outline-none py-3 text-xl font-black uppercase transition-all"
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--royal-violet)")
                }
                onBlur={(e) => (e.target.style.borderColor = "#f4f4f5")}
                placeholder="EX: Evem EXCLUSIVE..."
              />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  Logo Asset (URL)
                </Label>
                {formData.logo_url && (
                  <a
                    href={getValidImageUrl(formData.logo_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-black flex items-center gap-1 hover:underline uppercase"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    Test Link <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="flex gap-6 items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="w-20 h-20 bg-white border border-zinc-200 rounded-xl flex items-center justify-center p-3 shadow-sm shrink-0">
                  {getValidImageUrl(formData.logo_url) ? (
                    <img
                      src={getValidImageUrl(formData.logo_url)}
                      className="w-full h-full object-contain"
                      alt="Preview"
                    />
                  ) : (
                    <ImageIcon className="text-zinc-200" size={24} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    placeholder="https://image-url.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                    className="w-full border-none py-2 text-[11px] font-mono font-bold outline-none bg-transparent"
                  />
                  <p className="text-[8px] text-zinc-400 font-bold uppercase italic">
                    Format recomandat: PNG transparent (400px).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-white border-t border-zinc-100 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full text-white py-5 rounded-2xl text-[11px] uppercase tracking-[0.4em] font-black shadow-xl hover:brightness-110 active:scale-95 disabled:bg-zinc-200 transition-all flex justify-center items-center gap-3"
              style={{ background: "var(--primary-gradient)" }}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Salvează Brand în Catalog"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBrands;
