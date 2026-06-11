import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Trash2,
  Loader2,
  Layers,
  Tag,
  Plus,
  X,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
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

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";
const API_URL = `${API_BASE}/api/v1/attributes`;

const AdminAttributes = () => {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"DRAFT" | "APPROVED">("APPROVED");

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "Select",
  });
  const [editingLabel, setEditingLabel] = useState<{ [key: string]: string }>(
    {},
  );

  const [usageData, setUsageData] = useState<any>(null);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const fetchAttributes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/?search=${searchTerm}&status=${activeTab}&page=${currentPage}&limit=${itemsPerPage}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setAttributes(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);

        const initialLabels: any = {};
        (data.items || []).forEach((a: any) => {
          initialLabels[a.id] = a.display_label;
        });
        setEditingLabel(initialLabels);
      }
    } catch (err) {
      toast.error("Eroare la preluarea dicționarului.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeTab, currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchAttributes, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchAttributes]);

  // Reset la pagina 1 când schimbăm tab-ul sau căutăm
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const checkUsage = async (originalKey: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/attribute-usage/${originalKey}`,
        { credentials: "include" },
      );
      const data = await res.json();
      setUsageData(data);
      setIsUsageModalOpen(true);
    } catch (err) {
      toast.error("Eroare verificare utilizare.");
    }
  };

  const handleApprove = async (id: string, originalKey: string) => {
    const finalLabel =
      editingLabel[id] || originalKey.replace(/_/g, " ").toUpperCase();
    try {
      const res = await fetch(`${API_URL}/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label: finalLabel }),
      });
      if (res.ok) {
        toast.success("Dicționar actualizat.");
        fetchAttributes();
      }
    } catch (err) {
      toast.error("Eroare server.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Atenție: Eliminarea unui atribut poate afecta filtrele. Confirmi?",
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Atribut eliminat.");
        fetchAttributes();
      }
    } catch (err) {
      toast.error("Eroare ștergere.");
    }
  };

  const handleCreateAttribute = async () => {
    if (!formData.name || !formData.slug)
      return toast.error("Date incomplete.");
    try {
      const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Atribut creat!");
        setIsAttrModalOpen(false);
        setFormData({ name: "", slug: "", type: "Select" });
        setActiveTab("APPROVED");
        fetchAttributes();
      }
    } catch (err) {
      toast.error("Eroare server.");
    }
  };

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700 font-sans text-left">
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
              Data Intelligence
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-6xl italic tracking-tighter text-[var(--dark-amethyst)]">
            Dicționar{" "}
            <span style={{ color: "var(--royal-violet)" }}>Atribute</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <button
            onClick={() => setIsAttrModalOpen(true)}
            className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={16} /> Adaugă Manual
          </button>
        </div>
      </header>

      {/* CONTROALE TAB & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex p-1 bg-zinc-100 rounded-full w-full md:w-auto">
          {["APPROVED", "DRAFT"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className="relative px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full w-full md:w-auto transition-all"
            >
              <span
                className={`relative z-10 ${activeTab === tab ? "text-[var(--dark-amethyst)]" : "text-zinc-400"}`}
              >
                {tab === "APPROVED" ? "Aprobate (Live)" : "Noi (Detectate)"}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="relative group w-full md:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
            size={18}
          />
          <input
            placeholder="Filtrează dicționarul..."
            className="w-full pl-12 pr-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--royal-violet)]/10 outline-none transition-all text-sm font-bold shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DATA LIST */}
      <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
        <div className="divide-y divide-zinc-50">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="p-8 px-10 flex items-center gap-10">
                  <Skeleton className="size-14 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-64 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
              ))
            ) : attributes.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-2 text-zinc-300">
                <Database size={48} strokeWidth={1} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Niciun parametru găsit
                </span>
              </div>
            ) : (
              attributes.map((attr) => (
                <motion.div
                  layout
                  key={attr.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 px-10 gap-6 hover:bg-zinc-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-6 w-full md:w-1/3 text-left">
                    <div
                      className="p-4 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:text-white transition-all shrink-0"
                      style={{ backgroundColor: "var(--background)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--royal-violet)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--background)")
                      }
                    >
                      <Layers size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[var(--dark-amethyst)] truncate uppercase">
                        {attr.original_key}
                      </span>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        Cheie Sursă
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 flex flex-col text-left">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest mb-2 pl-3"
                      style={{ color: "var(--royal-violet)" }}
                    >
                      Etichetă Website
                    </span>
                    <input
                      className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[var(--royal-violet)] transition-all w-full text-[var(--dark-amethyst)] shadow-inner"
                      value={editingLabel[attr.id] || ""}
                      onChange={(e) =>
                        setEditingLabel({
                          ...editingLabel,
                          [attr.id]: e.target.value,
                        })
                      }
                      placeholder="Ex: Material Principal"
                    />
                  </div>

                  <div className="flex items-center justify-end w-full md:w-auto gap-3">
                    <button
                      onClick={() => checkUsage(attr.original_key)}
                      className="p-3 text-zinc-300 hover:text-[var(--royal-violet)] hover:bg-zinc-100 rounded-xl transition-all"
                      title="Analiză utilizare"
                    >
                      <LayoutGrid size={18} />
                    </button>

                    <button
                      onClick={() => handleApprove(attr.id, attr.original_key)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-95"
                      style={{
                        background:
                          activeTab === "DRAFT"
                            ? "var(--primary-gradient)"
                            : "var(--dark-amethyst)",
                      }}
                    >
                      {activeTab === "DRAFT" ? (
                        <>
                          <CheckCircle2 size={14} /> Aprobă
                        </>
                      ) : (
                        "Salvează"
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(attr.id)}
                      className="p-3 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <footer className="p-8 bg-zinc-50/50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
              Afișate {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalItems)} din{" "}
              {totalItems} atribute
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-3 bg-white rounded-xl border border-zinc-200 hover:border-[var(--royal-violet)] disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1">
                {/* Generăm butoane pentru pagini ( maxim 5 butoane vizibile ) */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Afișăm paginile din vecinătatea paginii curente
                  if (pageNum < currentPage - 2 || pageNum > currentPage + 2)
                    return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === pageNum
                          ? "text-white shadow-lg"
                          : "text-zinc-400 bg-white hover:bg-zinc-100 border border-zinc-100"
                      }`}
                      style={{
                        background:
                          currentPage === pageNum
                            ? "var(--primary-gradient)"
                            : undefined,
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-3 bg-white rounded-xl border border-zinc-200 hover:border-[var(--royal-violet)] disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* MODAL UTILIZARE */}
      <AdminDialogShell
        open={isUsageModalOpen}
        onOpenChange={setIsUsageModalOpen}
        size="md"
        className="bg-[#FBFBFD] font-sans"
      >
        <AdminDialogTitle>Utilizare atribut</AdminDialogTitle>
        <header className="px-6 sm:px-10 py-6 sm:py-8 flex justify-between items-center bg-white border-b shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl italic font-serif text-[var(--dark-amethyst)]">
              Utilizare:{" "}
              <span style={{ color: "var(--royal-violet)" }}>
                {usageData?.key}
              </span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
              Harta distribuției în catalog
            </p>
          </div>
          <button
            onClick={() => setIsUsageModalOpen(false)}
            className="size-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto luxury-scrollbar text-left">
          {usageData?.categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usageData.categories.map((cat: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-2 border-b border-zinc-50 pb-3">
                    <Layers
                      size={14}
                      style={{ color: "var(--royal-violet)" }}
                    />
                    <h4 className="text-[11px] font-black uppercase text-[var(--dark-amethyst)]">
                      {cat.name}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.values.map((v: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-zinc-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-500 border border-zinc-100"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-zinc-50 rounded-3xl border-2 border-dashed">
              <AlertTriangle
                size={32}
                className="mx-auto text-zinc-300 mb-3"
              />
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                Atributul nu are instanțe active.
              </p>
            </div>
          )}
        </div>
      </AdminDialogShell>

      {/* MODAL ADAUGARE MANUALA */}
      <AdminDialogShell
        open={isAttrModalOpen}
        onOpenChange={setIsAttrModalOpen}
        size="sm"
      >
        <AdminDialogTitle>Creează atribut</AdminDialogTitle>
        <header className="px-6 sm:px-8 py-6 sm:py-8 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl italic font-serif text-[var(--dark-amethyst)]">
              Creează Atribut
            </h2>
            <p
              className="text-[10px] font-black uppercase tracking-widest mt-2"
              style={{ color: "var(--royal-violet)" }}
            >
              Setare Dicționar Manual
            </p>
          </div>
          <button
            onClick={() => setIsAttrModalOpen(false)}
            className="size-10 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 p-6 sm:p-8 space-y-6 bg-[#FBFBFD] overflow-y-auto luxury-scrollbar">
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
              Nume Website
            </Label>
            <input
              className="w-full bg-transparent border-b-2 border-zinc-100 focus:border-[var(--royal-violet)] py-2 font-bold text-lg text-[var(--dark-amethyst)] outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_"),
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-1">
              <Label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                Slug Intern
              </Label>
              <input
                className="w-full bg-transparent border-b border-zinc-100 py-1 font-mono text-[11px] font-bold text-[var(--royal-violet)] outline-none"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-1">
              <Label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                Control
              </Label>
              <select
                className="w-full bg-transparent border-b border-zinc-100 py-1 text-[11px] font-black uppercase text-[var(--dark-amethyst)] outline-none appearance-none"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="Select">Dropdown</option>
                <option value="Color">Swatch</option>
              </select>
            </div>
          </div>
        </div>
        <footer className="p-6 sm:p-8 bg-white border-t">
          <button
            onClick={handleCreateAttribute}
            className="w-full h-16 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all"
            style={{ background: "var(--primary-gradient)" }}
          >
            Creează și Activează
          </button>
        </footer>
      </AdminDialogShell>
    </div>
  );
};

export default AdminAttributes;
