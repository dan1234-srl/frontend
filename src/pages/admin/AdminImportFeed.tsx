import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Trash2,
  Search,
  Loader2,
  Unlock,
  CheckCircle2,
  AlertCircle,
  DownloadCloud,
  Database,
  Settings2,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";
const WS_BASE_URL = API_BASE_URL.replace("https://", "wss://").replace(
  "http://",
  "ws://",
);

const MAPPING_FIELDS = [
  { label: "SKU / Cod Unic Intern *", key: "cod_produs", required: true },
  { label: "Nume Produs *", key: "titlu", required: true },
  { label: "Preț Achiziție *", key: "pret", required: true },
  { label: "Brand / Producător", key: "producator", required: false },
  { label: "Categorie", key: "categorie", required: false },
  { label: "Stoc Disponibil", key: "stoc", required: false },
  { label: "Imagine (URL)", key: "imagine", required: false },
  { label: "Descriere", key: "descriere", required: false },
];

type ProgressMap = Record<string, { current: number; total: number }>;

const AdminImportFeed = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalLock, setGlobalLock] = useState({
    is_locked: false,
    locked_by: null as string | null,
  });
  const [progress, setProgress] = useState<ProgressMap>({});
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

  const [isInspecting, setIsInspecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    feed_type: "CSV",
    url: "",
    markup_percentage: 15.0,
    auto_sync: true,
    mapping_config: {} as Record<string, string>,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const cleanFid = (id: any) => {
    if (!id) return null;
    return String(id)
      .replace(/^b['"]/, "")
      .replace(/['"]$/, "")
      .trim();
  };

  const apiFetch = useCallback(
    (path: string, opts?: RequestInit) =>
      fetch(`${API_BASE_URL}/api/v1${path}`, {
        credentials: "include",
        ...opts,
      }),
    [],
  );

  const refreshData = useCallback(async () => {
    try {
      const [feedsRes, statusRes] = await Promise.all([
        apiFetch("/feeds/"),
        apiFetch("/feeds/status"),
      ]);
      const feedsData = await feedsRes.json();
      const statusData = await statusRes.json();

      setFeeds(feedsData.items || []);
      const activeFid = cleanFid(statusData.active_feed_id);

      setGlobalLock({
        is_locked: !!statusData.is_locked,
        locked_by: activeFid,
      });

      if (activeFid && statusData.progress) {
        setProgress((prev) => ({
          ...prev,
          [activeFid]: {
            current: statusData.progress.current || 0,
            total: statusData.progress.total || 0,
          },
        }));
      }
    } catch (error) {
      console.error("Eroare la refresh date:", error);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    let heartbeat: ReturnType<typeof setInterval>;
    const connectWS = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      const ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws/import-progress`);
      wsRef.current = ws;

      ws.onopen = () => {
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const msg = JSON.parse(event.data);
          const fid = cleanFid(msg.feed_id);
          if (msg.type === "IMPORT_PROGRESS" || msg.type === "IMPORT_STARTED") {
            setProgress((prev) => ({
              ...prev,
              [fid || "global"]: {
                current: msg.current || 0,
                total: msg.total || 0,
              },
            }));
            if (fid) setGlobalLock({ is_locked: true, locked_by: fid });
          } else if (msg.type === "IMPORT_COMPLETED") {
            toast.success("Sincronizare finalizată cu succes!");
            refreshData();
          }
        } catch (e) {
          console.error("Eroare parsare mesaj WS:", e);
        }
      };

      ws.onclose = () => {
        clearInterval(heartbeat);
        reconnectTimeoutRef.current = setTimeout(connectWS, 3000);
      };
    };

    connectWS();
    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [refreshData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSync = async (id: string) => {
    setGlobalLock({ is_locked: true, locked_by: id });
    try {
      const res = await apiFetch(`/feeds/${id}/sync`, { method: "POST" });
      if (res.ok) {
        toast.info("Procesul de import a fost inițiat...");
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Eroare la pornirea sincronizării.");
        refreshData();
      }
    } catch {
      toast.error("Eroare de rețea.");
      refreshData();
    }
  };

  // Funcție actualizată cu confirmare și tratare completă a erorilor
  const handleForceUnlock = async () => {
    if (
      !window.confirm(
        "Ești sigur? Această acțiune va curăța toate blocajele și va opri vizual progresul curent.",
      )
    )
      return;

    try {
      const res = await apiFetch("/feeds/force-unlock", { method: "POST" });
      if (res.ok) {
        toast.success("Sistem deblocat și resetat cu succes.");
        setProgress({});
        refreshData();
      } else {
        toast.error("Eroare la deblocarea sistemului.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Eroare de conexiune cu serverul.");
    }
  };

  const handleInspect = async () => {
    if (!formData.url) return;
    setIsInspecting(true);
    try {
      const res = await apiFetch(
        `/feeds/inspect?url=${encodeURIComponent(formData.url)}&feed_type=${formData.feed_type}`,
      );
      const data = await res.json();
      setDetectedColumns(data.columns ?? []);
      if (data.columns?.length > 0) {
        toast.success("Structură detectată cu succes!");
      } else {
        toast.error("Nu s-au putut detecta coloanele.");
      }
    } catch (error) {
      toast.error("Eroare la inspectarea URL-ului.");
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/feeds/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Configurare salvată și import inițiat!");
        setShowConfig(false);
        refreshData();
      } else {
        toast.error("Eroare la salvarea configurării.");
      }
    } catch (error) {
      toast.error("Eroare de rețea la salvare.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Ești sigur că dorești să ștergi acest feed? Produsele importate nu vor fi șterse.",
      )
    )
      return;

    try {
      const res = await apiFetch(`/feeds/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Feed eliminat cu succes.");
        refreshData();
      } else {
        toast.error("Eroare la eliminarea feed-ului.");
      }
    } catch (error) {
      toast.error("Eroare de conexiune.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2
          className="animate-spin text-[var(--royal-violet)]"
          size={40}
        />
      </div>
    );

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
              className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2"
              style={{ color: "var(--royal-violet)" }}
            >
              <div
                className={`size-2 rounded-full ${globalLock.is_locked ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`}
              />
              {globalLock.is_locked ? "Proces în desfășurare" : "Flux Date"}
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-6xl italic tracking-tighter text-[var(--dark-amethyst)]">
            External <span style={{ color: "var(--royal-violet)" }}>Feeds</span>
          </h1>
        </div>

        <AnimatePresence mode="popLayout">
          {!showConfig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setShowConfig(true)}
                disabled={globalLock.is_locked}
                className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 whitespace-nowrap"
                style={{ background: "var(--primary-gradient)" }}
              >
                <Settings2 size={16} /> Configurare Nouă
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        {!showConfig ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden"
          >
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <tr>
                    <th className="p-8 px-10">Sursă Date</th>
                    <th className="p-8 text-center">Status Sincronizare</th>
                    <th className="p-8 px-10 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {feeds.length > 0 ? (
                    feeds.map((feed) => {
                      const isProcessing =
                        globalLock.is_locked &&
                        globalLock.locked_by === feed.id;
                      const prog = progress[feed.id];
                      const pct =
                        prog && prog.total > 0
                          ? Math.min(
                              100,
                              Math.round((prog.current / prog.total) * 100),
                            )
                          : 0;

                      return (
                        <tr
                          key={feed.id}
                          className="hover:bg-zinc-50/50 transition-colors group"
                        >
                          <td className="p-8 px-10">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-[var(--royal-violet)] transition-all">
                                <Database size={20} />
                              </div>
                              <div>
                                <div className="font-black text-lg text-[var(--dark-amethyst)] uppercase tracking-tight">
                                  {feed.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                                  {feed.items_synced?.toLocaleString() || 0}{" "}
                                  ARTICOLE • {feed.feed_type}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="w-[400px] p-8 align-middle">
                            {isProcessing ? (
                              <div className="space-y-3">
                                <div
                                  className="flex justify-between text-[10px] font-black uppercase tracking-widest"
                                  style={{ color: "var(--royal-violet)" }}
                                >
                                  <span>
                                    {prog
                                      ? `${prog.current.toLocaleString()} / ${prog.total.toLocaleString()}`
                                      : "Inițializare..."}
                                  </span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden relative shadow-inner">
                                  <motion.div
                                    className="absolute top-0 left-0 h-full rounded-full"
                                    style={{
                                      background: "var(--primary-gradient)",
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{
                                      type: "spring",
                                      bounce: 0,
                                      duration: 0.5,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span
                                  className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${
                                    feed.status === "SUCCESS"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : feed.status === "ERROR"
                                        ? "bg-rose-50 text-rose-500 border-rose-100"
                                        : "bg-zinc-50 text-zinc-500 border-zinc-200"
                                  }`}
                                >
                                  {feed.status || "READY"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-8 px-10 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSync(feed.id)}
                                disabled={globalLock.is_locked}
                                className="px-6 py-3 rounded-xl bg-white border border-zinc-200 text-[var(--dark-amethyst)] hover:text-[var(--royal-violet)] hover:border-[var(--royal-violet)] disabled:opacity-30 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
                                title="Sincronizează Datele"
                              >
                                <RefreshCw
                                  size={14}
                                  className={isProcessing ? "animate-spin" : ""}
                                />{" "}
                                Sync
                              </button>

                              <button
                                onClick={handleForceUnlock}
                                className="p-3 bg-white border border-zinc-200 text-amber-500 hover:bg-amber-50 hover:border-amber-200 rounded-xl transition-all shadow-sm group relative"
                                title="Deblocare de Urgență"
                              >
                                <Unlock size={16} />
                              </button>

                              <button
                                onClick={() => handleDelete(feed.id)}
                                disabled={isProcessing}
                                className="p-3 bg-white border border-zinc-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all disabled:opacity-30 shadow-sm"
                                title="Șterge Sursa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-32 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest"
                      >
                        Niciun flux configurat
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <button
              onClick={() => setShowConfig(false)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--royal-violet)] transition-colors"
            >
              <ChevronLeft size={14} /> Înapoi
            </button>
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden">
              <div className="p-10 md:p-16 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--royal-violet)" }}
                    >
                      Nume Furnizor
                    </Label>
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-lg font-bold text-[var(--dark-amethyst)] outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all shadow-inner"
                      placeholder="Ex: Master Supplier"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--royal-violet)" }}
                    >
                      Format Catalog
                    </Label>
                    <select
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--dark-amethyst)] outline-none appearance-none cursor-pointer"
                      value={formData.feed_type}
                      onChange={(e) =>
                        setFormData({ ...formData, feed_type: e.target.value })
                      }
                    >
                      <option value="CSV">Sistem CSV / Tabular</option>
                      <option value="XML">Flux XML</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    Endpoint URL
                  </Label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-sm font-mono font-bold text-zinc-600 outline-none transition-all shadow-inner"
                      placeholder="https://..."
                    />
                    <button
                      onClick={handleInspect}
                      disabled={isInspecting || !formData.url}
                      className="text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                      style={{ background: "var(--dark-amethyst)" }}
                    >
                      {isInspecting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}{" "}
                      Inspectează
                    </button>
                  </div>
                </div>

                {detectedColumns.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-10 border-t border-zinc-100 space-y-8"
                  >
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                      Harta Atributelor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {MAPPING_FIELDS.map((f) => (
                        <div
                          key={f.key}
                          className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3"
                        >
                          <Label
                            className="text-[9px] font-black uppercase tracking-widest flex justify-between"
                            style={{ color: "var(--royal-violet)" }}
                          >
                            <span>{f.label}</span>
                            {f.required && (
                              <span className="text-rose-500">*</span>
                            )}
                          </Label>
                          <select
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-[var(--dark-amethyst)] outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/20 cursor-pointer"
                            value={formData.mapping_config[f.key] ?? ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mapping_config: {
                                  ...formData.mapping_config,
                                  [f.key]: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="">Ignoră</option>
                            {detectedColumns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="p-10 md:px-16 bg-zinc-50 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8 rounded-b-[2.5rem] -mx-10 md:-mx-16 -mb-10 md:-mb-16">
                  <div className="w-full md:w-auto space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Adaos Comercial (%)
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.markup_percentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            markup_percentage: Number(e.target.value),
                          })
                        }
                        className="w-32 bg-white border border-zinc-200 rounded-xl px-6 py-3 text-2xl font-black text-[var(--dark-amethyst)] outline-none text-center shadow-sm focus:border-[var(--royal-violet)]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting || detectedColumns.length === 0}
                    className="w-full md:w-auto text-white px-16 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <DownloadCloud size={18} />
                    )}{" "}
                    Salvează & Importă
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminImportFeed;
