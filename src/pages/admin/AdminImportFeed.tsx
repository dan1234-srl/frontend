import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Trash2,
  Search,
  Loader2,
  Unlock,
  DownloadCloud,
  Database,
  Settings2,
  ChevronLeft,
  FileText,
  Sliders,
  Plus,
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

// 🚀 TOATE CELE 11 CÂMPURI STRUCTURATE EXACT DUPĂ ORDINEA DIN INTERFAȚA TA GRAFICĂ
const MAPPING_FIELDS = [
  { label: "SKU / Cod Unic Intern *", key: "cod_produs", required: true },
  { label: "Nume Produs *", key: "titlu", required: true },
  { label: "Preț Achiziție *", key: "pret", required: true },
  { label: "Categorie Magazin *", key: "categorie", required: true },
  { label: "Stoc Disponibil", key: "stoc", required: false },
  { label: "Imagine Principală (URL)", key: "imagine", required: false },
  {
    label: "Imagini Galerie / Adiționale",
    key: "imagini_galerie",
    required: false,
  },
  { label: "Descriere Produs HTML", key: "descriere", required: false },
  { label: "Cod de Bare EAN", key: "ean", required: false },
  { label: "Brand / Producător", key: "brand", required: false },
  { label: "Atribute / Specificații", key: "atributeprodus", required: false },
];

type ProgressMap = Record<string, { current: number; total: number }>;

const AdminImportFeed = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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
    csv_separator: ";",
    text_delimiter: '"',
    auto_sync: true,
    advanced_config: {
      min_stock: 0,
      require_img: false,
    },
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
            toast.success("Sincronizare completă finalizată!");
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
      clearInterval(heartbeat);
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

  const handleForceUnlock = async () => {
    if (
      !window.confirm(
        "Ești sigur? Această acțiune va curăța toate blocajele distribuite în Redis.",
      )
    )
      return;
    try {
      const res = await apiFetch("/feeds/force-unlock", { method: "POST" });
      if (res.ok) {
        toast.success("Distributed locking resetat cu succes.");
        setProgress({});
        refreshData();
      } else {
        toast.error("Eroare la deblocarea sistemului.");
      }
    } catch (error) {
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
        toast.success("Structură tabelară mapată cu succes!");
      } else {
        toast.error("Nu s-au putut detecta coloanele. Verifică URL-ul.");
      }
    } catch (error) {
      toast.error("Eroare la inspectarea URL-ului.");
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSave = async () => {
    const missing = MAPPING_FIELDS.filter(
      (f) => f.required && !formData.mapping_config[f.key],
    );
    if (missing.length > 0) {
      toast.error(
        `Te rog mapiază câmpurile obligatorii: ${missing.map((m) => m.label).join(", ")}`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/feeds/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Configurare salvată în sistem.");
        setShowConfig(false);
        refreshData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Eroare la salvare.");
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
        "Ștergi această sursă? Produsele deja importate vor fi păstrate.",
      )
    )
      return;
    try {
      const res = await apiFetch(`/feeds/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sursă eliminată.");
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
      <div className="h-screen flex items-center justify-center bg-zinc-50/30">
        <Loader2
          className="animate-spin text-[var(--royal-violet)]"
          size={36}
        />
      </div>
    );

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700 font-sans text-left">
      {/* HEADER CONTROLS */}
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
              {globalLock.is_locked
                ? "Sincronizare activă Celery"
                : "Catalog Feeds Hub"}
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
                <Plus size={16} /> Configurare Sursă Nouă
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
                    <th className="p-8 px-10">Sursă Date / Structură</th>
                    <th className="p-8 text-center">Status Sincronizare</th>
                    <th className="p-8 px-10 text-right">Acțiuni Management</th>
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
                      const isLogOpen = expandedLogId === feed.id;

                      return (
                        <tr
                          key={feed.id}
                          className="hover:bg-zinc-50/20 transition-colors group"
                        >
                          <td className="p-8 px-10 vertical-align-middle">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-[var(--royal-violet)] transition-all shadow-sm">
                                <Database size={20} />
                              </div>
                              <div>
                                <div className="font-black text-lg text-[var(--dark-amethyst)] uppercase tracking-tight">
                                  {feed.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-3">
                                  <span>{feed.feed_type} Format</span>
                                  {feed.error_log && (
                                    <button
                                      onClick={() =>
                                        setExpandedLogId(
                                          isLogOpen ? null : feed.id,
                                        )
                                      }
                                      className="text-[var(--royal-violet)] hover:underline flex items-center gap-1 lower-case font-mono font-black"
                                    >
                                      <FileText size={12} />{" "}
                                      {isLogOpen
                                        ? "[Ascunde Raport]"
                                        : "[Vezi Raport Audit]"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isLogOpen && feed.error_log && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 overflow-hidden"
                                >
                                  <pre className="p-5 bg-zinc-950 text-emerald-400 font-mono text-[11px] leading-relaxed rounded-2xl border border-zinc-900 shadow-inner max-w-xl whitespace-pre-line text-left">
                                    {feed.error_log}
                                  </pre>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                          <td className="w-[350px] p-8 align-middle">
                            {isProcessing ? (
                              <div className="space-y-3">
                                <div
                                  className="flex justify-between text-[10px] font-black uppercase tracking-widest"
                                  style={{ color: "var(--royal-violet)" }}
                                >
                                  <span>
                                    {prog
                                      ? `${prog.current.toLocaleString()} / ${prog.total.toLocaleString()}`
                                      : "Evaluare fișier..."}
                                  </span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden relative shadow-inner">
                                  <motion.div
                                    className="absolute top-0 left-0 h-full rounded-full"
                                    style={{
                                      background: "var(--primary-gradient)",
                                    }}
                                    animate={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span
                                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-tight ${
                                    feed.status === "SUCCESS"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : "bg-zinc-50 text-zinc-400 border-zinc-200"
                                  }`}
                                >
                                  {feed.status || "IDLE"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-8 px-10 text-right align-middle">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSync(feed.id)}
                                disabled={globalLock.is_locked}
                                className="px-6 py-3 rounded-xl bg-white border border-zinc-200 text-[var(--dark-amethyst)] font-black text-[9px] uppercase shadow-sm"
                              >
                                Sync
                              </button>
                              <button
                                onClick={handleForceUnlock}
                                className="p-3 bg-white border border-zinc-200 text-amber-500 rounded-xl shadow-sm"
                              >
                                <Unlock size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(feed.id)}
                                disabled={isProcessing}
                                className="p-3 bg-white border border-zinc-200 text-rose-500 rounded-xl shadow-sm"
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
                        Niciun flux comercial configurat în baza de date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div key="config" className="space-y-6">
            <button
              onClick={() => setShowConfig(false)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400"
            >
              <ChevronLeft size={14} /> Înapoi la listă
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden">
              <div className="p-10 md:p-16 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Nume Furnizor
                    </Label>
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-bold text-[var(--dark-amethyst)] shadow-inner outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Format
                    </Label>
                    <select
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-bold text-[var(--dark-amethyst)] outline-none"
                      value={formData.feed_type}
                      onChange={(e) =>
                        setFormData({ ...formData, feed_type: e.target.value })
                      }
                    >
                      <option value="CSV">Fișier CSV Tabular (Excel)</option>
                      <option value="XML">Structură XML Flux</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Cron 2 ore
                    </Label>
                    <select
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-bold text-[var(--dark-amethyst)] outline-none"
                      value={formData.auto_sync ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          auto_sync: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">Activat (Cron Automat)</option>
                      <option value="false">Dezactivat (Doar Manual)</option>
                    </select>
                  </div>
                </div>

                {formData.feed_type === "CSV" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Separator
                      </Label>
                      <input
                        value={formData.csv_separator}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            csv_separator: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Delimitator Text
                      </Label>
                      <input
                        value={formData.text_delimiter}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            text_delimiter: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-6 border-t border-zinc-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[var(--royal-violet)]">
                    URL Sursă Date
                  </Label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-mono font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleInspect}
                      disabled={isInspecting || !formData.url}
                      className="text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase bg-[var(--dark-amethyst)] shadow-xl flex items-center gap-2"
                    >
                      {isInspecting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}{" "}
                      Inspectează Coloane
                    </button>
                  </div>
                </div>

                {/* 🚀 TOATE CELE 11 DROP-DOWN-URI DE SCHEMA SE RANDEAZĂ ACUM CORECT ÎN GRID */}
                {detectedColumns.length > 0 && (
                  <div className="pt-10 border-t border-zinc-100 space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                      Mapping Schema
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {MAPPING_FIELDS.map((f) => (
                        <div
                          key={f.key}
                          className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3"
                        >
                          <Label className="text-[9px] font-black uppercase tracking-widest text-[var(--royal-violet)] flex justify-between">
                            <span>{f.label}</span>
                            {f.required && (
                              <span className="text-rose-500">*</span>
                            )}
                          </Label>
                          <select
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold"
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
                            <option value="">Ignoră Coloana</option>
                            {detectedColumns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-10 border-t border-zinc-100 space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                    Filtre de Siguranță & Protecție Catalog
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50/50 p-8 rounded-3xl border border-zinc-100 shadow-inner">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Excludere Stoc Sub Limita
                      </Label>
                      <input
                        type="number"
                        min="0"
                        value={formData.advanced_config.min_stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            advanced_config: {
                              ...formData.advanced_config,
                              min_stock: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-3 flex flex-col justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Poze Obligatorii Furnizor
                      </Label>
                      <div className="flex items-center gap-4 py-2">
                        <input
                          type="checkbox"
                          id="require_img_toggle"
                          checked={formData.advanced_config.require_img}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              advanced_config: {
                                ...formData.advanced_config,
                                require_img: e.target.checked,
                              },
                            })
                          }
                          className="size-5 rounded cursor-pointer"
                        />
                        <label
                          htmlFor="require_img_toggle"
                          className="text-xs font-bold text-zinc-500 cursor-pointer select-none"
                        >
                          Respinge produsele fără imagini
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center rounded-b-[2.5rem] -mx-10 md:-mx-16 -mb-10 md:-mb-16">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Adaos Fix Global Fallback (%)
                    </Label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.markup_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          markup_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32 bg-white border rounded-xl px-6 py-3 text-2xl font-black text-center shadow-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSubmitting || detectedColumns.length === 0}
                    className="text-white px-16 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl flex items-center gap-3"
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
