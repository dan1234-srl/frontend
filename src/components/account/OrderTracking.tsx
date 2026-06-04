import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Truck,
  PackageCheck,
  PackageX,
  PackageSearch,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Copy,
  Check,
  Bug,
} from "lucide-react";
import {
  resolveGlsStatus,
  type GlsCategory,
  CATEGORY_STYLE,
} from "@/lib/gls-status-codes";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

interface GlsHistoryEvent {
  code: string | number | null;
  description?: string | null;
  timestamp?: string | null;
  depot?: string | null;
  location?: string | null;
}

interface TrackingPayload {
  awb?: string | null;
  courier?: string | null;
  parcel_number?: string | number | null;
  current_code?: string | number | null;
  delivered_at?: string | null;
  history?: GlsHistoryEvent[];
  // tolerate raw GLS response shape too
  ParcelStatusList?: any[];
  ParcelNumber?: string | number | null;
}

function normalizeHistory(payload: TrackingPayload | null): GlsHistoryEvent[] {
  if (!payload) return [];
  if (Array.isArray(payload.history) && payload.history.length)
    return payload.history;
  if (Array.isArray(payload.ParcelStatusList)) {
    return payload.ParcelStatusList.map((s: any) => ({
      code: s.StatusCode ?? s.code,
      description: s.StatusDescription ?? s.description,
      timestamp: s.StatusDate ?? s.Date ?? s.timestamp,
      depot: s.DepotName ?? s.depot,
      location: s.Location ?? s.location,
    }));
  }
  return [];
}

const CATEGORY_ICON: Record<GlsCategory, typeof Truck> = {
  created: Sparkles,
  transit: Truck,
  out_delivery: Truck,
  delivered: PackageCheck,
  stored: PackageSearch,
  attention: AlertTriangle,
  failed: PackageX,
  returned: PackageX,
  damaged: AlertTriangle,
  customs: ShieldCheck,
  info: Clock,
};

interface OrderTrackingProps {
  orderId: string;
  awb?: string | null;
  orderStatus?: string;
  /** Fallback shown when no tracking history is available yet. */
  placeholderStatus?: string;
}

export function OrderTracking({
  orderId,
  awb,
  orderStatus,
  placeholderStatus,
}: OrderTrackingProps) {
  const [data, setData] = useState<TrackingPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTracking = useCallback(
    async (forceLive: boolean = false) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
      try {
        const endpoint = forceLive
          ? `/api/v1/post_sale/orders/${orderId}/tracking/live`
          : `/api/v1/post_sale/orders/${orderId}/tracking`;

        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          credentials: "include",
          signal: ctrl.signal,
        });

        if (!res.ok) {
          if (res.status === 404) {
            setData(null);
            setError("not_yet");
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        } else {
          const json = await res.json();
          setData(json);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setError("fetch_failed");
      } finally {
        setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    fetchTracking(false);
    return () => abortRef.current?.abort();
  }, [fetchTracking]);

  // Live polling: doar dacă comanda e activă și tab-ul e vizibil.
  const isActive = useMemo(() => {
    const s = (orderStatus || "").toUpperCase();
    return ["SHIPPED", "PROCESSING", "CONFIRMED", "PAID"].includes(s);
  }, [orderStatus]);

  useEffect(() => {
    if (!isActive) return;
    let interval: number | undefined;
    const start = () => {
      stop();
      interval = window.setInterval(() => fetchTracking(false), 30000);
    };
    const stop = () => {
      if (interval) window.clearInterval(interval);
      interval = undefined;
    };
    const onVis = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isActive, fetchTracking]);

  const history = useMemo(() => normalizeHistory(data), [data]);

  const awbValue =
    data?.awb || data?.parcel_number || data?.ParcelNumber || awb || null;
  const currentCode = data?.current_code ?? history[0]?.code ?? null;
  const current = resolveGlsStatus(currentCode);

  const handleCopy = async () => {
    if (!awbValue) return;
    try {
      await navigator.clipboard.writeText(String(awbValue));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  // =====================================================================
  // DEV TOOLS: Funcții pentru simularea stărilor
  // =====================================================================
  const simulateStatus = (
    scenario: "transit" | "delivered" | "refused" | "reset",
  ) => {
    if (scenario === "reset") {
      fetchTracking(false); // Reapelează API-ul real
      return;
    }

    const now = new Date();
    const past1 = new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString();
    const past2 = new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString();

    let mockHistory: GlsHistoryEvent[] = [];

    if (scenario === "transit") {
      mockHistory = [
        {
          code: "2",
          description: "Colet în tranzit către depozitul destinație",
          timestamp: now.toISOString(),
          depot: "Hub Sibiu",
        },
        {
          code: "1",
          description: "Colet preluat de la expeditor",
          timestamp: past1,
          depot: "Suceava",
        },
      ];
    } else if (scenario === "delivered") {
      mockHistory = [
        {
          code: "5",
          description: "Livrat cu succes la destinatar",
          timestamp: now.toISOString(),
          depot: "București",
        },
        {
          code: "3",
          description: "Colet încărcat pentru livrare",
          timestamp: past2,
          depot: "București",
        },
        {
          code: "2",
          description: "Colet în tranzit",
          timestamp: past1,
          depot: "Hub Sibiu",
        },
        {
          code: "1",
          description: "Colet preluat",
          timestamp: past1,
          depot: "Suceava",
        },
      ];
    } else if (scenario === "refused") {
      mockHistory = [
        {
          code: "17",
          description: "Destinatarul a refuzat acceptarea coletului",
          timestamp: now.toISOString(),
          depot: "București",
        },
        {
          code: "3",
          description: "Colet încărcat pentru livrare",
          timestamp: past2,
          depot: "București",
        },
        {
          code: "1",
          description: "Colet preluat",
          timestamp: past1,
          depot: "Suceava",
        },
      ];
    }

    setData({
      awb: "SIM-TEST-GLS-99",
      history: mockHistory,
    });
  };
  // =====================================================================

  const hasNothing = !awbValue && history.length === 0;

  return (
    <section
      className="rounded-[2rem] border border-zinc-100 bg-white p-6 md:p-7 flex flex-col gap-6"
      aria-label="Tracking colet"
    >
      <div>
        <header className="flex items-start justify-between gap-4 mb-5">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-1.5">
              <Truck size={11} className="text-[var(--royal-violet)]" />
              Tracking în timp real
            </p>
            <h4 className="heading-serif text-2xl italic text-zinc-900 leading-tight">
              {hasNothing
                ? "În pregătire"
                : history.length > 0
                  ? current.meta.text
                  : "AWB Generat"}
            </h4>
            {awbValue && (
              <button
                onClick={handleCopy}
                className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--royal-violet)] transition-colors"
                title="Copiază AWB"
              >
                <span>AWB · {awbValue}</span>
                {copied ? (
                  <Check size={11} className="text-emerald-500" />
                ) : (
                  <Copy size={11} />
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {!hasNothing && history.length > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ring-1 ${current.style.bg} ${current.style.text} ${current.style.ring}`}
              >
                <span
                  className={`size-1.5 rounded-full ${current.style.dot}`}
                />
                {current.style.label}
              </span>
            )}
            <button
              onClick={() => fetchTracking(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--royal-violet)] transition-colors disabled:opacity-40"
              title="Forțează actualizarea de la curier"
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              {loading ? "Se actualizează..." : "Sincronizare GLS"}
            </button>
          </div>
        </header>

        {isActive && (
          <div className="relative h-[2px] bg-zinc-100 rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute top-0 left-0 h-full w-1/3"
              style={{ background: "var(--primary-gradient)" }}
              animate={{ left: ["-33%", "100%"] }}
              transition={{
                repeat: Infinity,
                duration: 2.4,
                ease: "easeInOut",
              }}
            />
          </div>
        )}

        {hasNothing ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {placeholderStatus ||
                "Coletul nu a fost încă predat curierului. Vei primi AWB de îndată ce este expediat."}
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              AWB înregistrat. Așteptăm primele scanări de la curier.
            </p>
          </div>
        ) : (
          <ol className="relative pl-7 space-y-5 before:absolute before:left-[10px] before:top-1 before:bottom-1 before:w-px before:bg-gradient-to-b before:from-zinc-200 before:via-zinc-200 before:to-transparent">
            <AnimatePresence initial={false}>
              {history.map((ev, idx) => {
                const { meta, style } = resolveGlsStatus(ev.code);
                const Icon = CATEGORY_ICON[meta.category] || Truck;
                const isFirst = idx === 0;
                return (
                  <motion.li
                    key={`${ev.code}-${ev.timestamp}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.02 }}
                    className="relative"
                  >
                    <span
                      className={`absolute -left-7 top-0.5 flex items-center justify-center size-5 rounded-full ring-2 ring-white shadow-sm ${style.dot}`}
                    >
                      <Icon size={10} className="text-white" />
                      {isFirst && (
                        <span
                          className={`absolute inset-0 rounded-full ${style.dot} opacity-60 animate-ping`}
                        />
                      )}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
                          cod {ev.code ?? "—"}
                        </span>
                      </div>
                      <p className="text-[13px] font-bold text-zinc-800 leading-snug">
                        {ev.description || meta.text}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {ev.timestamp
                          ? new Date(ev.timestamp).toLocaleString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                        {ev.depot || ev.location
                          ? ` · ${ev.depot || ev.location}`
                          : ""}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>

      {/* DEV TOOLS - Poți șterge sau ascunde acest div înainte de lansarea finală */}
      <div className="mt-4 border-t border-dashed border-zinc-200 pt-4 flex flex-col gap-2 items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
          <Bug size={10} /> Testare UI Tracking (Dev Only)
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => simulateStatus("transit")}
            className="text-[9px] px-2 py-1 rounded bg-blue-50 text-blue-600 font-bold uppercase"
          >
            Tranzit
          </button>
          <button
            onClick={() => simulateStatus("delivered")}
            className="text-[9px] px-2 py-1 rounded bg-green-50 text-green-600 font-bold uppercase"
          >
            Livrat
          </button>
          <button
            onClick={() => simulateStatus("refused")}
            className="text-[9px] px-2 py-1 rounded bg-red-50 text-red-600 font-bold uppercase"
          >
            Refuzat
          </button>
          <button
            onClick={() => simulateStatus("reset")}
            className="text-[9px] px-2 py-1 rounded bg-zinc-100 text-zinc-600 font-bold uppercase ring-1 ring-zinc-300"
          >
            Reset API Real
          </button>
        </div>
      </div>
    </section>
  );
}

export default OrderTracking;
