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
  Eye,
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

// 🚀 Mapare exclusivă pentru fișierul rapid de stocuri
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
  quick_stock_mapping_config: Record<string, string>; // 🚀 NOU: Stocat separat
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

const surfaceStyle = {
  backgroundColor: "var(--surface-bg)",
};

const surfaceSecondaryStyle = {
  backgroundColor: "var(--surface-secondary)",
};

const borderStyle = {
  borderColor: "var(--border-color)",
};

const inputStyle = {
  backgroundColor: "var(--input-bg)",
  borderColor: "var(--border-color)",
  color: "var(--text-primary)",
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

  // 🚀 Stări separate pentru inspectarea celor două tipuri de feed
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [quickStockColumns, setQuickStockColumns] = useState<string[]>([]);

  const [isInspecting, setIsInspecting] = useState(false);
  const [isInspectingQuick, setIsInspectingQuick] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FeedFormState>(INITIAL_FORM_STATE);

  const wsRef = useRef<WebSocket | null>(null);

  const reconnectAttemptsRef = useRef(0);

  const cleanFid = (id: unknown) => {
    if (!id) return null;

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
      console.error(error);
      toast.error("Eroare la încărcarea feed-urilor.");
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
              setGlobalLock({
                is_locked: true,
                locked_by: fid,
              });
            }
          }

          if (msg.type === "IMPORT_COMPLETED") {
            toast.success("Sincronizare finalizată.");
            refreshData();
          }
        } catch (e) {
          console.error(e);
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
  }, [refreshData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 🚀 Adaptat pentru a inspecta separat
  const handleInspect = async (
    target: "main" | "quick",
    specificUrl?: string,
  ) => {
    const urlToInspect =
      specificUrl || (target === "main" ? formData.url : formData.stock_url);
    const typeToInspect = formData.feed_type;

    if (!urlToInspect) {
      toast.error(
        `Introdu URL pentru ${target === "main" ? "Feed Principal" : "Quick Stock"}.`,
      );
      return;
    }

    target === "main" ? setIsInspecting(true) : setIsInspectingQuick(true);

    try {
      const res = await apiFetch(
        `/feeds/inspect?url=${encodeURIComponent(
          urlToInspect,
        )}&feed_type=${typeToInspect}`,
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
          `${cols.length} coloane detectate pentru ${target === "main" ? "Feed" : "Stoc"}.`,
        );
      } else {
        toast.error("Nu s-au detectat coloane.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Inspect failed.");
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
    // Validare mapare principala
    const missingMain = MAPPING_FIELDS.filter(
      (f) => f.required && !formData.mapping_config[f.key],
    );

    if (missingMain.length > 0) {
      toast.error(
        `Mapează feed principal: ${missingMain.map((m) => m.label).join(", ")}`,
      );
      return;
    }

    // Validare mapare stoc rapid (daca URL-ul exista)
    if (formData.stock_url) {
      const missingQuick = QUICK_MAPPING_FIELDS.filter(
        (f) => f.required && !formData.quick_stock_mapping_config[f.key],
      );
      if (missingQuick.length > 0) {
        toast.error(
          `Mapează Quick Stock: ${missingQuick.map((m) => m.label).join(", ")}`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const isEdit = !!formData.id;
      const endpoint = isEdit ? `/feeds/${formData.id}` : "/feeds/";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        stock_url: formData.stock_url || null,
      };

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? "Feed actualizat." : "Feed creat cu succes.");

        setFormData(INITIAL_FORM_STATE);
        setDetectedColumns([]);
        setQuickStockColumns([]);
        setShowConfig(false);

        refreshData();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Save failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Ștergi feed-ul?")) return;

    try {
      const res = await apiFetch(`/feeds/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Feed șters.");
        refreshData();
      } else {
        toast.error("Delete failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error.");
    }
  };

  const handleForceUnlock = async () => {
    if (!window.confirm("Resetezi lock-urile Redis?")) return;

    try {
      const res = await apiFetch("/feeds/force-unlock", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Lock resetat.");
        setProgress({});
        refreshData();
      } else {
        toast.error("Unlock failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error.");
    }
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={surfaceSecondaryStyle}
      >
        <Loader2
          className="animate-spin"
          size={36}
          style={{
            color: "var(--royal-violet)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-20">
      <header
        className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 pb-12 border-b"
        style={borderStyle}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-[1px]"
              style={{
                backgroundColor: "var(--royal-violet)",
              }}
            />

            <span
              className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2"
              style={{
                color: "var(--royal-violet)",
              }}
            >
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor: globalLock.is_locked
                    ? "var(--warning-color)"
                    : "var(--success-color)",
                }}
              />

              {globalLock.is_locked ? "Sincronizare activă" : "Catalog Feeds"}
            </span>
          </div>

          <h1
            className="heading-serif text-5xl md:text-6xl italic tracking-tighter"
            style={{
              color: "var(--dark-amethyst)",
            }}
          >
            External{" "}
            <span
              style={{
                color: "var(--royal-violet)",
              }}
            >
              Feeds
            </span>
          </h1>
        </div>

        {!showConfig && (
          <button
            onClick={() => {
              setFormData(INITIAL_FORM_STATE);
              setDetectedColumns([]);
              setQuickStockColumns([]);
              setShowConfig(true);
            }}
            disabled={globalLock.is_locked}
            className="text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl disabled:opacity-50"
            style={{
              background: "var(--primary-gradient)",
            }}
          >
            <Plus size={16} />
            Configurare Sursă Nouă
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!showConfig ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[2.5rem] shadow-2xl border overflow-hidden"
            style={{
              ...surfaceStyle,
              ...borderStyle,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead
                  className="border-b"
                  style={{
                    ...surfaceSecondaryStyle,
                    ...borderStyle,
                  }}
                >
                  <tr
                    className="text-[10px] uppercase tracking-widest"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <th className="p-8 px-10 text-left">Feed</th>
                    <th className="p-8 text-left">Quick Stock Mapping</th>
                    <th className="p-8 text-center">Status</th>
                    <th className="p-8 px-10 text-right">Acțiuni</th>
                  </tr>
                </thead>

                <tbody>
                  {feeds.map((feed) => {
                    const isProcessing =
                      globalLock.is_locked && globalLock.locked_by === feed.id;

                    const prog = progress[feed.id];

                    const pct =
                      prog && prog.total > 0
                        ? Math.min(
                            100,
                            Math.round((prog.current / prog.total) * 100),
                          )
                        : 0;

                    // Extragem maparea rapida (fallback la maparea principala daca e vechi)
                    const mapping =
                      feed.quick_stock_mapping_config ||
                      feed.mapping_config ||
                      {};

                    const skuField = mapping.cod_produs || "NESELECTAT";
                    const stockField = mapping.stoc || "IGNORAT";
                    const priceField = mapping.pret || "IGNORAT";

                    return (
                      <tr
                        key={feed.id}
                        className="border-b"
                        style={borderStyle}
                      >
                        <td className="p-8 px-10 align-top">
                          <div className="flex items-start gap-4">
                            <div
                              className="size-12 rounded-2xl border flex items-center justify-center shrink-0"
                              style={{
                                ...surfaceSecondaryStyle,
                                ...borderStyle,
                                color: "var(--royal-violet)",
                              }}
                            >
                              <Database size={20} />
                            </div>

                            <div className="space-y-2">
                              <div
                                className="font-black text-lg"
                                style={{
                                  color: "var(--text-primary)",
                                }}
                              >
                                {feed.name}
                              </div>

                              <div
                                className="text-[10px] uppercase tracking-widest flex gap-3 flex-wrap"
                                style={{
                                  color: "var(--text-secondary)",
                                }}
                              >
                                <span>{feed.feed_type}</span>

                                {feed.stock_url && (
                                  <span
                                    className="flex items-center gap-1"
                                    style={{
                                      color: "var(--success-color)",
                                    }}
                                  >
                                    <Zap size={10} />
                                    QUICK STOCK
                                  </span>
                                )}

                                {feed.auto_sync && (
                                  <span
                                    style={{
                                      color: "var(--royal-violet)",
                                    }}
                                  >
                                    AUTO SYNC
                                  </span>
                                )}
                              </div>

                              {feed.stock_url && (
                                <div
                                  className="mt-4 rounded-2xl border p-4 text-[11px]"
                                  style={{
                                    ...surfaceSecondaryStyle,
                                    ...borderStyle,
                                  }}
                                >
                                  <div
                                    className="font-black uppercase tracking-wider mb-3 flex items-center gap-2"
                                    style={{
                                      color: "var(--royal-violet)",
                                    }}
                                  >
                                    <Eye size={12} />
                                    Quick Feed Detect
                                  </div>

                                  <div
                                    className="grid grid-cols-1 gap-2"
                                    style={{
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    <div className="flex justify-between gap-4">
                                      <span>SKU:</span>
                                      <span
                                        className="font-black"
                                        style={{
                                          color: "var(--success-color)",
                                        }}
                                      >
                                        {skuField}
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span>PREȚ:</span>
                                      <span
                                        className="font-black"
                                        style={{
                                          color:
                                            priceField === "IGNORAT"
                                              ? "var(--warning-color)"
                                              : "var(--success-color)",
                                        }}
                                      >
                                        {priceField}
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span>STOC:</span>
                                      <span
                                        className="font-black"
                                        style={{
                                          color:
                                            stockField === "IGNORAT"
                                              ? "var(--warning-color)"
                                              : "var(--success-color)",
                                        }}
                                      >
                                        {stockField}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-8 align-top">
                          {feed.stock_url ? (
                            <div className="space-y-3">
                              {Object.entries(mapping)
                                .filter(
                                  ([key, value]) =>
                                    value &&
                                    QUICK_MAPPING_FIELDS.map(
                                      (f) => f.key,
                                    ).includes(key),
                                )
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="rounded-xl border px-4 py-3 text-[11px]"
                                    style={{
                                      ...surfaceSecondaryStyle,
                                      ...borderStyle,
                                    }}
                                  >
                                    <div
                                      className="uppercase font-black mb-1"
                                      style={{ color: "var(--royal-violet)" }}
                                    >
                                      {key}
                                    </div>
                                    <div
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {String(value)}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div
                              className="text-xs italic"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Fără Quick Stock URL
                            </div>
                          )}
                        </td>

                        <td className="p-8 align-top">
                          {isProcessing ? (
                            <div className="space-y-3">
                              <div
                                className="flex justify-between text-[10px] uppercase font-black"
                                style={{ color: "var(--royal-violet)" }}
                              >
                                <span>
                                  {prog?.current || 0} / {prog?.total || 0}
                                </span>
                                <span>{pct}%</span>
                              </div>
                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{
                                  backgroundColor: "var(--surface-secondary)",
                                }}
                              >
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
                                className="px-4 py-1 rounded-full text-[10px] uppercase border"
                                style={{
                                  backgroundColor:
                                    feed.status === "SUCCESS"
                                      ? "color-mix(in srgb, var(--success-color) 10%, transparent)"
                                      : "var(--surface-secondary)",
                                  color:
                                    feed.status === "SUCCESS"
                                      ? "var(--success-color)"
                                      : "var(--text-secondary)",
                                  borderColor: "var(--border-color)",
                                }}
                              >
                                {feed.status || "IDLE"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-8 px-10 align-top">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditIntent(feed)}
                              className="p-3 rounded-xl border hover:opacity-80 transition-opacity"
                              style={{
                                ...surfaceStyle,
                                ...borderStyle,
                                color: "var(--royal-violet)",
                              }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={handleForceUnlock}
                              className="p-3 rounded-xl border hover:opacity-80 transition-opacity"
                              style={{
                                ...surfaceStyle,
                                ...borderStyle,
                                color: "var(--warning-color)",
                              }}
                            >
                              <Unlock size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(feed.id)}
                              className="p-3 rounded-xl border hover:opacity-80 transition-opacity"
                              style={{
                                ...surfaceStyle,
                                ...borderStyle,
                                color: "var(--danger-color)",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
              className="flex items-center gap-2 text-[10px] uppercase font-black"
              style={{ color: "var(--text-secondary)" }}
            >
              <ChevronLeft size={14} /> Înapoi
            </button>

            <div
              className="rounded-[2.5rem] shadow-2xl border overflow-hidden pb-12"
              style={{ ...surfaceStyle, ...borderStyle }}
            >
              <div className="p-10 md:p-16 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Nume Furnizor</Label>
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-2xl px-6 py-4 border"
                      style={inputStyle}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Adaos %</Label>
                    <input
                      type="number"
                      value={formData.markup_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          markup_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-2xl px-6 py-4 border"
                      style={inputStyle}
                    />
                  </div>

                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <Label className="flex gap-2 items-center">
                      <Database size={14} /> URL Feed Principal (Catalog
                      Complet)
                    </Label>
                    <div className="flex gap-2">
                      <input
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        className="flex-1 rounded-2xl px-6 py-4 border"
                        style={inputStyle}
                        placeholder="Ex: https://furnizor.ro/feed.csv"
                      />
                      <button
                        type="button"
                        onClick={() => handleInspect("main")}
                        disabled={isInspecting}
                        className="text-white px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-2"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        {isInspecting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Search size={16} />
                        )}
                        Inspectează
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <Label className="flex gap-2 items-center">
                      <Zap
                        size={14}
                        style={{ color: "var(--warning-color)" }}
                      />{" "}
                      Quick Stock URL (Doar Stoc & Preț - Opțional)
                    </Label>
                    <div className="flex gap-2">
                      <input
                        value={formData.stock_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock_url: e.target.value,
                          })
                        }
                        className="flex-1 rounded-2xl px-6 py-4 border"
                        style={inputStyle}
                        placeholder="Ex: https://furnizor.ro/stock.csv"
                      />
                      <button
                        type="button"
                        onClick={() => handleInspect("quick")}
                        disabled={isInspectingQuick || !formData.stock_url}
                        className="text-white px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-2 disabled:opacity-50"
                        style={{ background: "var(--dark-amethyst)" }}
                      >
                        {isInspectingQuick ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Search size={16} />
                        )}
                        Inspectează Stoc
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mapare Feed Principal */}
                {detectedColumns.length > 0 && (
                  <div className="space-y-8 pt-8 border-t" style={borderStyle}>
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-xs uppercase font-black"
                        style={{ color: "var(--dark-amethyst)" }}
                      >
                        Mapare Feed Principal
                      </h3>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {detectedColumns.length} coloane detectate
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {MAPPING_FIELDS.map((field) => {
                        const selectedValue =
                          formData.mapping_config[field.key] ?? "";
                        const isMatched = detectedColumns.some(
                          (c) =>
                            normalizeKey(c) === normalizeKey(selectedValue),
                        );

                        return (
                          <div
                            key={field.key}
                            className="rounded-2xl border p-5"
                            style={{ ...surfaceSecondaryStyle, ...borderStyle }}
                          >
                            <Label
                              className="text-[10px]"
                              style={{ color: "var(--royal-violet)" }}
                            >
                              {field.label}
                            </Label>
                            <select
                              value={selectedValue}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mapping_config: {
                                    ...formData.mapping_config,
                                    [field.key]: e.target.value,
                                  },
                                })
                              }
                              className="w-full mt-3 rounded-xl px-4 py-3 border"
                              style={inputStyle}
                            >
                              <option value="">Ignoră</option>
                              {detectedColumns.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div
                              className="mt-3 text-[10px] uppercase font-black"
                              style={{
                                color: selectedValue
                                  ? isMatched
                                    ? "var(--success-color)"
                                    : "var(--warning-color)"
                                  : "var(--text-secondary)",
                              }}
                            >
                              {!selectedValue
                                ? "IGNORAT"
                                : isMatched
                                  ? "MAPAT"
                                  : "NEDETECTAT"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mapare Feed Secundar (Quick Stock) */}
                {quickStockColumns.length > 0 && formData.stock_url && (
                  <div className="space-y-8 pt-8 border-t" style={borderStyle}>
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-xs uppercase font-black flex items-center gap-2"
                        style={{ color: "var(--warning-color)" }}
                      >
                        <Zap size={14} /> Mapare Quick Stock
                      </h3>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {quickStockColumns.length} coloane detectate în stoc
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {QUICK_MAPPING_FIELDS.map((field) => {
                        const selectedValue =
                          formData.quick_stock_mapping_config[field.key] ?? "";
                        const isMatched = quickStockColumns.some(
                          (c) =>
                            normalizeKey(c) === normalizeKey(selectedValue),
                        );

                        return (
                          <div
                            key={`quick_${field.key}`}
                            className="rounded-2xl border p-5"
                            style={{ ...surfaceStyle, ...borderStyle }}
                          >
                            <Label
                              className="text-[10px]"
                              style={{ color: "var(--warning-color)" }}
                            >
                              {field.label}
                            </Label>
                            <select
                              value={selectedValue}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  quick_stock_mapping_config: {
                                    ...formData.quick_stock_mapping_config,
                                    [field.key]: e.target.value,
                                  },
                                })
                              }
                              className="w-full mt-3 rounded-xl px-4 py-3 border"
                              style={inputStyle}
                            >
                              <option value="">Ignoră</option>
                              {quickStockColumns.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div
                              className="mt-3 text-[10px] uppercase font-black"
                              style={{
                                color: selectedValue
                                  ? isMatched
                                    ? "var(--success-color)"
                                    : "var(--danger-color)"
                                  : "var(--text-secondary)",
                              }}
                            >
                              {!selectedValue
                                ? "IGNORAT"
                                : isMatched
                                  ? "MAPAT"
                                  : "NEDETECTAT"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className="pt-8 border-t flex justify-end"
                  style={borderStyle}
                >
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      isSubmitting ||
                      (detectedColumns.length === 0 && !formData.id)
                    }
                    className="text-white px-16 py-6 rounded-2xl uppercase font-black flex items-center gap-3 disabled:opacity-50"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <DownloadCloud size={18} />
                    )}
                    {formData.id
                      ? "Actualizează Configurația"
                      : "Salvează & Inițiază"}
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
