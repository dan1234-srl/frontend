/**
 * AdminAttributes.tsx
 * Pagina de administrare Atribute - Design Futuristic (Glassmorphism & Bento Neo-Mosaic)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  Layers,
  Plus,
  X,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
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
              className="animate-pulse"
              style={{ color: "var(--royal-violet)" }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              Data Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Dicționar{" "}
            <span style={{ color: "var(--royal-violet)" }}>Atribute</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <button
            onClick={() => setIsAttrModalOpen(true)}
            className="text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Adaugă Manual
          </button>
        </div>
      </header>

      {/* ── CONTROALE TAB & SEARCH (Glassmorphism) ──────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div
          className="flex items-center gap-2 bg-zinc-50/50 p-1.5 rounded-2xl w-full md:w-auto border"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          {["APPROVED", "DRAFT"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className="relative flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              style={{
                color:
                  activeTab === tab
                    ? "var(--royal-violet)"
                    : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="attributes-tab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab === "APPROVED" ? "Aprobate (Live)" : "Noi (Detectate)"}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            size={14}
            style={{
              color: "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
            }}
          />
          <input
            placeholder="Filtrează dicționarul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      {/* ── DATA LIST (BENTO STYLE) ────────────────────────────────────────── */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-4 w-full md:w-1/3">
                    <Skeleton className="size-12 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 space-y-2">
                    <Skeleton className="h-2 w-20" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="w-full md:w-auto flex gap-2 justify-end ml-auto">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="size-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : attributes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center gap-3 bg-white/50 rounded-3xl border border-dashed"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <Database
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
                Niciun atribut găsit
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="group relative bg-white border rounded-[1.5rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between p-5 sm:p-6 gap-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  {/* Background Hover Gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                    }}
                  />

                  {/* IDENTITATE Sursă */}
                  <div className="flex items-center gap-5 w-full md:w-1/3 relative z-10">
                    <div
                      className="size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-transform duration-500 group-hover:scale-105"
                      style={{
                        background: "var(--surface-bg)",
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        color: "var(--royal-violet)",
                      }}
                    >
                      <Layers size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[var(--dark-amethyst)] truncate uppercase group-hover:text-[var(--royal-violet)] transition-colors">
                        {attr.original_key}
                      </span>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest mt-0.5"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                        }}
                      >
                        Cheie Sursă
                      </span>
                    </div>
                  </div>

                  {/* ETICHETĂ Website */}
                  <div className="w-full md:w-1/3 flex flex-col text-left relative z-10">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest mb-2 pl-1 transition-colors"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                      }}
                    >
                      Etichetă Afișată pe Website
                    </span>
                    <input
                      className="w-full bg-white/50 backdrop-blur-sm border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all text-[var(--dark-amethyst)]"
                      style={{
                        boxShadow:
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                      value={editingLabel[attr.id] || ""}
                      onChange={(e) =>
                        setEditingLabel({
                          ...editingLabel,
                          [attr.id]: e.target.value,
                        })
                      }
                      placeholder="Ex: Material Principal"
                      onFocus={(e) => {
                        e.target.style.boxShadow =
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 2px color-mix(in srgb, var(--royal-violet) 50%, transparent)";
                        e.target.style.backgroundColor = "#ffffff";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow =
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)";
                        e.target.style.backgroundColor =
                          "rgba(255,255,255,0.5)";
                      }}
                    />
                  </div>

                  {/* ACȚIUNI */}
                  <div className="flex items-center justify-end w-full md:w-auto gap-2 relative z-10">
                    <button
                      onClick={() => checkUsage(attr.original_key)}
                      className="p-3 bg-white border rounded-xl hover:bg-[var(--royal-violet)] hover:text-white transition-colors shadow-sm text-[var(--dark-amethyst)]"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
                      title="Analiză utilizare"
                    >
                      <LayoutGrid size={16} />
                    </button>

                    <button
                      onClick={() => handleApprove(attr.id, attr.original_key)}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg active:scale-95"
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
                      className="p-3 bg-white border rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors shadow-sm text-rose-400"
                      style={{
                        borderColor:
                          "color-mix(in srgb, #f43f5e 20%, transparent)",
                      }}
                      title="Șterge Atribut"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PAGINATION FOOTER ────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm mt-8"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="flex gap-1.5">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (pageNum < currentPage - 2 || pageNum > currentPage + 2)
                return null;

              const isSelected = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${
                    isSelected
                      ? "border-transparent !text-white"
                      : "bg-white hover:bg-zinc-50"
                  }`}
                  style={{
                    // Aplicăm gradientul doar dacă este selectat
                    background: isSelected
                      ? "var(--primary-gradient)"
                      : undefined,

                    // Bordura gri/violet pentru paginile neactive
                    borderColor: !isSelected
                      ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                      : "transparent",

                    // FORȚĂM ALBUL AICI:
                    color: isSelected ? "#ffffff" : "var(--dark-amethyst)",
                  }}
                >
                  {pageNum}
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
            onClick={() => handlePageChange(currentPage + 1)}
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

      {/* ── MODAL UTILIZARE (Glassmorphism Shell) ────────────────────── */}
      <AdminDialogShell
        open={isUsageModalOpen}
        onOpenChange={setIsUsageModalOpen}
        size="md"
        className="sm:h-[80vh] sm:max-h-[80vh] rounded-none sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">
          Utilizare Atribut
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
              Utilizare:{" "}
              <span style={{ color: "var(--royal-violet)" }}>
                {usageData?.key}
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Harta distribuției în catalog
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsUsageModalOpen(false)}
            className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto luxury-scrollbar relative z-10">
          {usageData?.categories?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usageData.categories.map((cat: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-[1.5rem] border shadow-sm space-y-4"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 border-b pb-3"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                    }}
                  >
                    <Layers
                      size={14}
                      style={{ color: "var(--royal-violet)" }}
                    />
                    <h4 className="text-[11px] font-black uppercase text-[var(--dark-amethyst)] truncate">
                      {cat.name}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.values.map((v: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-zinc-50/50 px-3 py-1.5 rounded-lg text-[10px] font-bold border"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="py-24 text-center bg-white/50 rounded-[2rem] border border-dashed"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <AlertTriangle
                size={32}
                className="mx-auto mb-3"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                }}
              />
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                }}
              >
                Atributul nu are instanțe active.
              </p>
            </div>
          )}
        </div>
      </AdminDialogShell>

      {/* ── MODAL ADĂUGARE MANUALĂ ────────────────────────────────────── */}
      <AdminDialogShell
        open={isAttrModalOpen}
        onOpenChange={setIsAttrModalOpen}
        size="md"
        mobileVariant="modal"
        className="sm:h-auto sm:max-h-[80vh] rounded-none sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">Creează Atribut</AdminDialogTitle>
        <header
          className="px-6 sm:px-8 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 sticky top-0 z-20 flex justify-between items-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              Creează Atribut
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Setare Dicționar Manual
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAttrModalOpen(false)}
            className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto luxury-scrollbar relative z-10 bg-white/50">
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
              Etichetă Website
            </Label>
            <input
              className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)]"
              style={{
                boxShadow:
                  "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
              value={formData.name}
              placeholder="Ex: Material, Culoare..."
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_"),
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div
              className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-2"
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
                Slug Intern (Generat Auto)
              </Label>
              <input
                className="w-full bg-zinc-50/50 rounded-xl p-3 text-xs font-mono font-bold outline-none text-[var(--royal-violet)] border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                }}
                value={formData.slug}
                readOnly
              />
            </div>

            <div
              className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] border shadow-sm space-y-2 group relative"
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
                Tip Control Interfață
              </Label>
              <select
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-3 text-xs font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all text-[var(--dark-amethyst)]"
                style={{
                  boxShadow:
                    "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                }}
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
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
                <option value="Select">Dropdown Simplu</option>
                <option value="Color">Culoare / Swatch Visual</option>
              </select>
            </div>
          </div>
        </div>

        <footer
          className="p-5 sm:p-6 bg-white/90 backdrop-blur-xl border-t shrink-0 flex justify-end gap-3 rounded-b-[2rem]"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            onClick={() => setIsAttrModalOpen(false)}
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
            onClick={handleCreateAttribute}
            className="text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Plus size={14} strokeWidth={2.5} /> Salvează și Activează
          </button>
        </footer>
      </AdminDialogShell>
    </div>
  );
};

export default AdminAttributes;
