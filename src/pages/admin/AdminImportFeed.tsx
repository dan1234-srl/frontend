/**
 * AdminImportFeed.tsx
 * Pagina de administrare Import / Sincronizare Feed-uri
 * Design Futuristic & Glassmorphism (Bento Neo-Mosaic) - Fully Optimized
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trash2,
  Search,
  Loader2,
  Unlock,
  DownloadCloud,
  Database,
  ChevronLeft,
  Plus,
  Edit3,
  Zap,
  Activity,
  RefreshCw,
  Sparkles,
  Server,
  Network,
  CheckCircle2,
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

const QUICK_MAPPING_FIELDS = [
  { label: "SKU / Cod Unic Intern *", key: "cod_produs", required: true },
  { label: "Preț Achiziție *", key: "pret", required: true },
  { label: "Stoc Disponibil *", key: "stoc", required: true },
];

type ProgressMap = Record<string, { current: number; total: number }>;

interface FeedFormState {
  id?: string;
  name: string;
  feed_type: string;
  url: string;
  stock_url: string;
  markup_percentage: number;
  csv_separator: string;
  text_delimiter: string;
  auto_sync: boolean;
  advanced_config: {
    min_stock: number;
    require_img: boolean;
  };
  mapping_config: Record<string, string>;
  quick_stock_mapping_config: Record<string, string>;
}

const INITIAL_FORM_STATE: FeedFormState = {
  id: undefined,
  name: "",
  feed_type: "CSV",
  url: "",
  stock_url: "",
  markup_percentage: 15.0,
  csv_separator: ";",
  text_delimiter: '"',
  auto_sync: true,
  advanced_config: {
    min_stock: 0,
    require_img: false,
  },
  mapping_config: {},
  quick_stock_mapping_config: {},
};

const normalizeKey = (v: string) =>
  v
    ?.toLowerCase()
    ?.replace(/[\s_\-]/g, "")
    ?.trim();

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
  const [quickStockColumns, setQuickStockColumns] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isInspectingQuick, setIsInspectingQuick] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterSyncLoading, setMasterSyncLoading] = useState(false);
  const [masterSyncStatus, setMasterSyncStatus] = useState<any>(null);
  const [formData, setFormData] = useState<FeedFormState>(INITIAL_FORM_STATE);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Funcție esențială pentru a asigura compatibilitatea ID-urilor (Stringificare sigură)
  const cleanFid = (id: unknown) => {
    if (id === null || id === undefined) return null;
    return String(id)
      .replace(/^b['"]/, "")
      .replace(/['"]$/, "")
      .trim();
  };

  const apiFetch = useCallback(async (path: string, opts?: RequestInit) => {
    return fetch(`${API_BASE_URL}/api/v1${path}`, {
      credentials: "include",
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...opts?.headers,
      },
    });
  }, []);

  const fetchMasterSyncStatus = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/master-sync/status");
      if (res.ok) {
        const data = await res.json();
        setMasterSyncStatus(data);
      }
    } catch (err) {
      console.error("Eroare status master sync:", err);
    }
  }, [apiFetch]);

  const handleRunHeavySync = async () => {
    if (
      !window.confirm(
        "Atenție: Pornești Heavy Sync global. Acest proces blochează temporar baza de date și poate dura zeci de minute. Continuăm?",
      )
    )
      return;
    setMasterSyncLoading(true);
    try {
      const res = await apiFetch("/admin/master-sync/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Heavy sync a fost inițiat cu succes.");
        fetchMasterSyncStatus();
      } else {
        toast.error(data.detail || "Inițierea sync-ului a eșuat.");
      }
    } catch (err) {
      toast.error("Eroare de comunicare cu serverul.");
    } finally {
      setMasterSyncLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    try {
      const [feedsRes, statusRes] = await Promise.all([
        apiFetch("/feeds/"),
        apiFetch("/feeds/status"),
      ]);

      if (feedsRes.ok) {
        const feedsData = await feedsRes.json();
        // Fallback robust pentru a preveni map-uri pe undefined
        const feedsArray = Array.isArray(feedsData)
          ? feedsData
          : feedsData?.items || [];
        setFeeds(feedsArray);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
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
      }
    } catch (error) {
      toast.error("Nu s-au putut încărca datele feed-urilor.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchMasterSyncStatus();
    const interval = setInterval(() => {
      fetchMasterSyncStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMasterSyncStatus]);

  useEffect(() => {
    let heartbeat: ReturnType<typeof setInterval>;

    const connectWS = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      const ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws/import-progress`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
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
            if (fid) {
              setGlobalLock({ is_locked: true, locked_by: fid });
            }
          }

          if (msg.type === "IMPORT_COMPLETED") {
            toast.success("Sincronizare de date finalizată cu succes.");
            refreshData();
            fetchMasterSyncStatus();
          }
        } catch (e) {
          console.error("WS Parse error:", e);
        }
      };

      ws.onclose = () => {
        clearInterval(heartbeat);
        reconnectAttemptsRef.current += 1;
        const timeout = Math.min(30000, reconnectAttemptsRef.current * 3000);
        setTimeout(connectWS, timeout);
      };
    };

    connectWS();

    return () => {
      wsRef.current?.close();
      clearInterval(heartbeat);
    };
  }, [refreshData, fetchMasterSyncStatus]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleInspect = async (
    target: "main" | "quick",
    specificUrl?: string,
  ) => {
    const urlToInspect =
      specificUrl || (target === "main" ? formData.url : formData.stock_url);
    const typeToInspect = formData.feed_type;

    if (!urlToInspect) {
      toast.error(
        `Te rugăm să introduci URL-ul pentru ${target === "main" ? "Feed-ul Principal" : "Quick Stock"}.`,
      );
      return;
    }

    target === "main" ? setIsInspecting(true) : setIsInspectingQuick(true);

    try {
      const res = await apiFetch(
        `/feeds/inspect?url=${encodeURIComponent(urlToInspect)}&feed_type=${typeToInspect}`,
      );
      const data = await res.json();
      const cols = data.columns ?? [];

      if (target === "main") {
        setDetectedColumns(cols);
      } else {
        setQuickStockColumns(cols);
      }

      if (cols.length > 0) {
        toast.success(
          `Succes: ${cols.length} coloane identificate pentru mapare.`,
        );
      } else {
        toast.error(
          "Structura URL-ului nu a putut fi descifrată (0 coloane găsite).",
        );
      }
    } catch (error) {
      toast.error("Inspecția fișierului sursă a eșuat.");
    } finally {
      target === "main" ? setIsInspecting(false) : setIsInspectingQuick(false);
    }
  };

  const handleEditIntent = async (feed: any) => {
    setFormData({
      id: feed.id,
      name: feed.name || "",
      feed_type: feed.feed_type || "CSV",
      url: feed.url || "",
      stock_url: feed.stock_url || "",
      markup_percentage: feed.markup_percentage ?? 15,
      csv_separator: feed.csv_separator || ";",
      text_delimiter: feed.text_delimiter || '"',
      auto_sync: feed.auto_sync ?? true,
      advanced_config: {
        min_stock: feed.advanced_config?.min_stock ?? 0,
        require_img: feed.advanced_config?.require_img ?? false,
      },
      mapping_config: feed.mapping_config || {},
      quick_stock_mapping_config: feed.quick_stock_mapping_config || {},
    });

    setShowConfig(true);

    if (feed.url) await handleInspect("main", feed.url);
    if (feed.stock_url) await handleInspect("quick", feed.stock_url);
  };

  const handleSave = async () => {
    // Validare de siguranță folosind Optional Chaining
    const missingMain = MAPPING_FIELDS.filter(
      (f) => f.required && !formData.mapping_config?.[f.key],
    );
    if (missingMain.length > 0) {
      toast.error(
        `Necesar pentru Feed Principal: Mapează coloanele ${missingMain.map((m) => m.label).join(", ")}`,
      );
      return;
    }

    if (formData.stock_url) {
      const missingQuick = QUICK_MAPPING_FIELDS.filter(
        (f) => f.required && !formData.quick_stock_mapping_config?.[f.key],
      );
      if (missingQuick.length > 0) {
        toast.error(
          `Necesar pentru Quick Stock: Mapează coloanele ${missingQuick.map((m) => m.label).join(", ")}`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!formData.id;
      const endpoint = isEdit ? `/feeds/${formData.id}` : "/feeds/";
      const method = isEdit ? "PUT" : "POST";
      const payload = { ...formData, stock_url: formData.stock_url || null };

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEdit
            ? "Sursa de date a fost actualizată."
            : "Noua sursă de date a fost configurată activ.",
        );
        setFormData(INITIAL_FORM_STATE);
        setDetectedColumns([]);
        setQuickStockColumns([]);
        setShowConfig(false);
        refreshData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Eroare la salvarea setărilor.");
      }
    } catch (error) {
      toast.error("Eroare de comunicare cu serverul de rețea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Ștergerea acestui feed este definitivă. Dorești să continui?",
      )
    )
      return;
    try {
      const res = await apiFetch(`/feeds/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Feed-ul a fost eliminat cu succes.");
        refreshData();
      } else {
        toast.error("Ștergerea a fost respinsă de server.");
      }
    } catch (error) {
      toast.error("Eroare de comunicare cu serverul de rețea.");
    }
  };

  const handleForceUnlock = async () => {
    if (
      !window.confirm(
        "Forțarea deblocării va întrerupe orice sarcină rămasă agățată în fundal. Sigur vrei să continui?",
      )
    )
      return;
    try {
      const res = await apiFetch("/feeds/force-unlock", { method: "POST" });
      if (res.ok) {
        toast.success("Sistemul a fost deblocat manual.");
        setProgress({});
        refreshData();
      } else {
        toast.error("Eșec la deblocarea manuală.");
      }
    } catch (error) {
      toast.error("Eroare de rețea.");
    }
  };

  return (
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in relative z-0">
      {/* ── HEADER FUTURISTIC ─────────────────────────────────────────── */}
      <header
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pt-4 pb-6 border-b"
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
              Data & Import Engine
            </span>
          </div>
          <h1 className="heading-serif text-3xl sm:text-4xl md:text-5xl tracking-tighter text-[var(--dark-amethyst)] font-medium leading-[0.95]">
            Sincronizare{" "}
            <span style={{ color: "var(--royal-violet)" }}>Feed-uri</span>
          </h1>
        </div>

        {!showConfig && (
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
            <div
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/60 backdrop-blur-md border text-[10px] font-black uppercase tracking-[0.2em]"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                color: "var(--royal-violet)",
              }}
            >
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor: globalLock.is_locked
                    ? "var(--warning-color)"
                    : "color-mix(in srgb, #10b981 80%, black)",
                }}
              />
              {globalLock.is_locked ? "Procesare Activă" : "Catalog Liber"}
            </div>
            <button
              onClick={() => {
                setFormData(INITIAL_FORM_STATE);
                setDetectedColumns([]);
                setQuickStockColumns([]);
                setShowConfig(true);
              }}
              disabled={globalLock.is_locked}
              className="text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Plus size={14} strokeWidth={2.5} /> Configurare Sursă
            </button>
          </div>
        )}
      </header>

      {/* ── MASTER HEAVY SYNC BENTO CARD ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!showConfig && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[2.5rem] border bg-white/60 backdrop-blur-xl p-6 sm:p-10 shadow-xl shadow-black/[0.02]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Activity
                    size={16}
                    style={{ color: "var(--royal-violet)" }}
                  />
                  <span
                    className="uppercase text-[10px] font-black tracking-[0.3em]"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 70%, gray)",
                    }}
                  >
                    Infrastructură Core
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)]">
                  Master Heavy Sync
                </h2>
                <p
                  className="max-w-2xl text-[13px] leading-relaxed"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                  }}
                >
                  Rulează sincronizarea completă enterprise: importuri,
                  recalibrare categorii, rebuild filtre avansate și reindexare
                  completă Meilisearch.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={fetchMasterSyncStatus}
                  className="px-6 py-3.5 rounded-xl border flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] bg-white hover:bg-zinc-50 transition-colors shadow-sm"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                    color: "var(--dark-amethyst)",
                  }}
                >
                  <RefreshCw size={14} /> Actualizează Status
                </button>
                <button
                  onClick={handleRunHeavySync}
                  disabled={masterSyncLoading || globalLock.is_locked}
                  className="text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  {masterSyncLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                  Rulează Heavy Sync
                </button>
              </div>
            </div>

            {masterSyncStatus && (
              <div
                className="mt-8 pt-8 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                }}
              >
                {[
                  {
                    label: "Bază Date Core",
                    key: "master_sync_running",
                    active: masterSyncStatus.master_sync_running,
                    version: masterSyncStatus.catalog_version,
                  },
                  {
                    label: "Index Căutare",
                    key: "search_reindex_running",
                    active: masterSyncStatus.search_reindex_running,
                    version: masterSyncStatus.listing_version,
                  },
                  {
                    label: "Arbore Categorii",
                    key: "categories_sync_running",
                    active: masterSyncStatus.search_setup_running,
                    version: masterSyncStatus.categories_version,
                  },
                  {
                    label: "Matrice Filtre",
                    key: "filters_rebuild_running",
                    active: masterSyncStatus.filters_rebuild_running,
                    version: masterSyncStatus.filters_version,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--dark-amethyst)]">
                        {item.label}
                      </span>
                      <div
                        className="flex items-center gap-1.5 bg-zinc-50 border px-2 py-1 rounded-md"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                        }}
                      >
                        <div
                          className={`size-1.5 rounded-full ${item.active ? "animate-pulse" : ""}`}
                          style={{
                            backgroundColor: item.active
                              ? "var(--warning-color)"
                              : "color-mix(in srgb, #10b981 80%, black)",
                          }}
                        />
                        <span
                          className="text-[8px] font-black uppercase tracking-wider"
                          style={{
                            color: item.active
                              ? "var(--warning-color)"
                              : "color-mix(in srgb, #10b981 80%, black)",
                          }}
                        >
                          {item.active ? "Rulare" : "Ready"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                        }}
                      >
                        Versiune
                      </span>
                      <span
                        className="text-xl font-black font-mono"
                        style={{ color: "var(--royal-violet)" }}
                      >
                        v{item.version ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LISTĂ FEED-URI (BENTO STYLE) ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!showConfig ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.02] border overflow-hidden relative z-10 min-h-[300px]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div
              className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              <div className="col-span-4 pl-2">Sursă Feed</div>
              <div className="col-span-3 text-center">Quick Stock</div>
              <div className="col-span-3 text-center">Progres Sincronizare</div>
              <div className="col-span-2 text-right pr-2">Management</div>
            </div>

            <div className="divide-y">

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2
                    className="animate-spin text-[var(--royal-violet)]"
                    size={28}
                  />
                </div>
              ) : feeds.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-3">
                  <Network
                    size={40}
                    strokeWidth={1}
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                    }}
                  />
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                    }}
                  >
                    Niciun feed configurat
                  </span>
                </div>
              ) : (
                feeds.map((feed) => {
                  const feedIdStr = cleanFid(feed.id) || "fallback"; // Safely stringify ID
                  const isProcessing =
                    globalLock.is_locked && globalLock.locked_by === feedIdStr;
                  const prog = progress[feedIdStr] || progress["global"]; // Fallback robust
                  const pct =
                    prog && prog.total > 0
                      ? Math.min(
                          100,
                          Math.round((prog.current / prog.total) * 100),
                        )
                      : 0;

                  return (
                    <div
                      key={feed.id}
                      className="group relative transition-all hover:bg-zinc-50/50"
                    >
                      {/* Subtil Hover Line Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-[var(--royal-violet)] transition-colors duration-300" />

                      <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-5 gap-4 md:gap-0 relative z-10">
                        {/* Denumire & Detalii */}
                        <div className="col-span-4 flex items-center gap-4 w-full pl-2">
                          <div
                            className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center shadow-sm shrink-0 transition-transform duration-500 group-hover:scale-105"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                            }}
                          >
                            <Database
                              size={18}
                              style={{ color: "var(--royal-violet)" }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold text-[var(--dark-amethyst)] tracking-tight truncate group-hover:text-[var(--royal-violet)] transition-colors">
                              {feed.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border bg-white shadow-sm"
                                style={{
                                  color: "var(--dark-amethyst)",
                                  borderColor:
                                    "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                }}
                              >
                                {feed.feed_type}
                              </span>
                              {feed.auto_sync && (
                                <span
                                  className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border shadow-sm"
                                  style={{
                                    background:
                                      "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                                    color: "var(--royal-violet)",
                                    borderColor:
                                      "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                  }}
                                >
                                  Auto Sync
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stock Status */}
                        <div className="col-span-3 flex justify-start md:justify-center w-full pl-2 md:pl-0">
                          {feed.stock_url ? (
                            <span
                              className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm"
                              style={{
                                background:
                                  "color-mix(in srgb, #10b981 5%, transparent)",
                                color: "#10b981",
                                borderColor:
                                  "color-mix(in srgb, #10b981 20%, transparent)",
                              }}
                            >
                              <Zap size={10} /> Configurat
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                              Neconfigurat
                            </span>
                          )}
                        </div>

                        {/* Progres */}
                        <div className="col-span-3 w-full pr-4">
                          {isProcessing ? (
                            <div className="space-y-1.5">
                              <div
                                className="flex justify-between text-[9px] font-black uppercase tracking-widest"
                                style={{ color: "var(--royal-violet)" }}
                              >
                                <span>
                                  {prog?.current || 0} / {prog?.total || 0}
                                </span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden bg-zinc-100">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: "var(--primary-gradient)",
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <span
                                className="px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm"
                                style={{
                                  backgroundColor:
                                    feed.status === "SUCCESS"
                                      ? "color-mix(in srgb, #10b981 5%, transparent)"
                                      : "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                                  color:
                                    feed.status === "SUCCESS"
                                      ? "#10b981"
                                      : "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                                  borderColor:
                                    feed.status === "SUCCESS"
                                      ? "color-mix(in srgb, #10b981 20%, transparent)"
                                      : "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                                }}
                              >
                                {feed.status === "SUCCESS" ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 size={10} /> SUCCES
                                  </span>
                                ) : (
                                  feed.status || "IDLE"
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actiuni */}
                        <div className="col-span-2 flex justify-start md:justify-end gap-1.5 w-full md:w-auto pr-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 lg:translate-x-2 group-hover:translate-x-0 mt-3 md:mt-0">
                          <button
                            onClick={() => handleEditIntent(feed)}
                            className="p-2 bg-white border rounded-lg hover:bg-[var(--royal-violet)] hover:text-white transition-colors text-[var(--dark-amethyst)] shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                            }}
                            title="Editează"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={handleForceUnlock}
                            className="p-2 bg-white border rounded-lg hover:bg-amber-500 hover:text-white transition-colors text-amber-500 shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--warning-color) 20%, transparent)",
                            }}
                            title="Unlock Manual"
                          >
                            <Unlock size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(feed.id)}
                            className="p-2 bg-white border rounded-lg hover:bg-rose-500 hover:text-white transition-colors text-rose-500 shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, #f43f5e 20%, transparent)",
                            }}
                            title="Șterge"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          /* ── FORMULAR CONFIGURARE (Bento Layout) ─────────────────────────── */
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <button
              onClick={() => {
                setShowConfig(false);
                setFormData(INITIAL_FORM_STATE);
                setDetectedColumns([]);
                setQuickStockColumns([]);
              }}
              className="flex items-center gap-2 text-[10px] uppercase font-black px-4 py-2 rounded-lg hover:bg-white transition-colors"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              <ChevronLeft size={14} /> Înapoi la listă
            </button>

            <div
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border overflow-hidden"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <div className="p-8 md:p-12 space-y-10">
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group relative">
                    <Label
                      className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                      }}
                    >
                      Nume Furnizor
                    </Label>
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)]"
                      style={{
                        boxShadow:
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
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
                  <div className="space-y-2 group relative">
                    <Label
                      className="text-[9px] font-black uppercase tracking-widest ml-1 transition-colors"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                      }}
                    >
                      Adaos Comercial (%)
                    </Label>
                    <input
                      type="number"
                      value={formData.markup_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          markup_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)]"
                      style={{
                        boxShadow:
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
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
                </div>

                {/* Main Feed URL */}
                <div className="space-y-3">
                  <Label
                    className="flex gap-2 items-center text-[10px] font-black uppercase tracking-widest ml-1 transition-colors"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                    }}
                  >
                    <Server
                      size={14}
                      style={{ color: "var(--royal-violet)" }}
                    />{" "}
                    URL Feed Principal (Catalog Complet)
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="Ex: https://furnizor.ro/feed.csv"
                      className="flex-1 bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-medium outline-none transition-all text-[var(--dark-amethyst)]"
                      style={{
                        boxShadow:
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
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
                    <button
                      type="button"
                      onClick={() => handleInspect("main")}
                      disabled={isInspecting}
                      className="text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      {isInspecting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} strokeWidth={2.5} />
                      )}
                      Inspectează Structură
                    </button>
                  </div>
                </div>

                {/* Quick Stock URL */}
                <div className="space-y-3">
                  <Label
                    className="flex gap-2 items-center text-[10px] font-black uppercase tracking-widest ml-1 transition-colors"
                    style={{
                      color:
                        "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                    }}
                  >
                    <Zap size={14} style={{ color: "var(--warning-color)" }} />{" "}
                    Quick Stock URL (Stoc/Preț - Opțional)
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={formData.stock_url}
                      onChange={(e) =>
                        setFormData({ ...formData, stock_url: e.target.value })
                      }
                      placeholder="Ex: https://furnizor.ro/stock.csv"
                      className="flex-1 bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-medium outline-none transition-all text-[var(--dark-amethyst)]"
                      style={{
                        boxShadow:
                          "inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 0 0 1px color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                      }}
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
                    <button
                      type="button"
                      onClick={() => handleInspect("quick")}
                      disabled={isInspectingQuick || !formData.stock_url}
                      className="bg-white border text-[var(--dark-amethyst)] px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-zinc-50 shadow-sm active:scale-95 disabled:opacity-50"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                      }}
                    >
                      {isInspectingQuick ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} strokeWidth={2.5} />
                      )}
                      Inspectează Stoc
                    </button>
                  </div>
                </div>

                {/* Mapare Main */}
                {detectedColumns.length > 0 && (
                  <div
                    className="space-y-6 pt-10 border-t"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--dark-amethyst)] flex items-center gap-2">
                        <Database
                          size={14}
                          style={{ color: "var(--royal-violet)" }}
                        />{" "}
                        Mapare Feed Principal
                      </h3>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border bg-white"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          color:
                            "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                        }}
                      >
                        {detectedColumns.length} Coloane Detectate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {MAPPING_FIELDS.map((field, idx) => {
                        const selectedValue =
                          formData.mapping_config?.[field.key] ?? "";
                        const isMatched = detectedColumns.some(
                          (c) =>
                            normalizeKey(c) === normalizeKey(selectedValue),
                        );

                        return (
                          <div
                            key={`${field.key}_${idx}`}
                            className="bg-white rounded-[1.2rem] border p-4 shadow-sm relative overflow-hidden transition-all focus-within:shadow-md"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                            }}
                          >
                            {selectedValue && isMatched && (
                              <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-50 rounded-bl-[1.2rem] flex items-center justify-center">
                                <div className="size-2 rounded-full bg-emerald-500" />
                              </div>
                            )}
                            <Label
                              className="text-[9px] font-black uppercase tracking-widest block mb-3 transition-colors"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 70%, gray)",
                              }}
                            >
                              {field.label}
                            </Label>
                            <select
                              value={selectedValue}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  mapping_config: {
                                    ...prev.mapping_config,
                                    [field.key]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full bg-zinc-50/50 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer border transition-colors"
                              style={{
                                color: "var(--dark-amethyst)",
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor =
                                  "var(--royal-violet)")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor =
                                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)")
                              }
                            >
                              <option value="">Ignoră</option>
                              {detectedColumns.map((c, i) => (
                                <option key={`${c}_${i}`} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mapare Quick Stock */}
                {quickStockColumns.length > 0 && formData.stock_url && (
                  <div
                    className="space-y-6 pt-10 border-t"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3
                        className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                        style={{ color: "var(--warning-color)" }}
                      >
                        <Zap size={14} /> Mapare Quick Stock
                      </h3>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border bg-white"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          color:
                            "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                        }}
                      >
                        {quickStockColumns.length} Coloane Detectate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {QUICK_MAPPING_FIELDS.map((field, idx) => {
                        const selectedValue =
                          formData.quick_stock_mapping_config?.[field.key] ??
                          "";
                        const isMatched = quickStockColumns.some(
                          (c) =>
                            normalizeKey(c) === normalizeKey(selectedValue),
                        );

                        return (
                          <div
                            key={`quick_${field.key}_${idx}`}
                            className="bg-white rounded-[1.2rem] border p-4 shadow-sm relative overflow-hidden transition-all focus-within:shadow-md"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                            }}
                          >
                            {selectedValue && isMatched && (
                              <div className="absolute top-0 right-0 w-8 h-8 bg-amber-50 rounded-bl-[1.2rem] flex items-center justify-center">
                                <div className="size-2 rounded-full bg-amber-500" />
                              </div>
                            )}
                            <Label
                              className="text-[9px] font-black uppercase tracking-widest block mb-3 transition-colors"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 70%, gray)",
                              }}
                            >
                              {field.label}
                            </Label>
                            <select
                              value={selectedValue}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  quick_stock_mapping_config: {
                                    ...prev.quick_stock_mapping_config,
                                    [field.key]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full bg-zinc-50/50 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer border transition-colors"
                              style={{
                                color: "var(--dark-amethyst)",
                                borderColor:
                                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor =
                                  "var(--royal-violet)")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor =
                                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)")
                              }
                            >
                              <option value="">Ignoră</option>
                              {quickStockColumns.map((c, i) => (
                                <option key={`q_${c}_${i}`} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Save Footer */}
                <div className="pt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      isSubmitting ||
                      (detectedColumns.length === 0 && !formData.id)
                    }
                    className="w-full md:w-auto text-white px-10 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 transition-all"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <DownloadCloud size={16} strokeWidth={2.5} />
                    )}
                    {formData.id
                      ? "Actualizează Configurația"
                      : "Salvează & Inițiază Import"}
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
