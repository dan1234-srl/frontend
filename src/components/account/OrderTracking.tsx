import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
} from "lucide-react";
import {
  fetchTracking as fetchTrackingCached,
  readTrackingCache,
} from "@/lib/tracking-cache";

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

export type GlsCategory =
  | "created"
  | "transit"
  | "out_delivery"
  | "delivered"
  | "stored"
  | "attention"
  | "failed"
  | "returned"
  | "damaged"
  | "customs"
  | "info";

export interface GlsCodeMeta {
  text: string;
  category: GlsCategory;
}

export const GLS_STATUS_MAP: Record<string, GlsCodeMeta> = {
  "1": { text: "Coletul a fost preluat de GLS", category: "created" },
  "2": { text: "Coletul a părăsit centrul de sortare", category: "transit" },
  "3": { text: "Coletul a ajuns în centrul de sortare", category: "transit" },
  "4": {
    text: "Coletul este programat pentru livrare azi",
    category: "out_delivery",
  },
  "5": { text: "Coletul a fost livrat", category: "delivered" },
  "6": {
    text: "Coletul este depozitat în centrul de sortare",
    category: "stored",
  },
  "7": {
    text: "Coletul este depozitat în centrul de sortare",
    category: "stored",
  },
  "8": {
    text: "Coletul așteaptă ridicare personală (destinatar)",
    category: "stored",
  },
  "9": {
    text: "Coletul este depozitat pentru o nouă dată de livrare",
    category: "stored",
  },
  "10": { text: "Scanare verificată. Totul în regulă", category: "info" },
  "11": {
    text: "Nu s-a livrat — destinatar plecat în concediu",
    category: "failed",
  },
  "12": { text: "Nu s-a livrat — destinatar absent", category: "failed" },
  "13": { text: "Eroare de sortare la depou", category: "attention" },
  "14": { text: "Nu s-a livrat — recepție închisă", category: "failed" },
  "15": { text: "Nu s-a livrat — timp insuficient", category: "failed" },
  "16": {
    text: "Nu s-a livrat — destinatarul nu avea numerar (COD)",
    category: "failed",
  },
  "17": { text: "Coletul a fost refuzat la livrare", category: "returned" },
  "18": {
    text: "Nu s-a livrat — sunt necesare detalii suplimentare",
    category: "attention",
  },
  "19": {
    text: "Nu s-a livrat — condiții meteo nefavorabile",
    category: "failed",
  },
  "20": {
    text: "Nu s-a livrat — adresă greșită sau incompletă",
    category: "failed",
  },
  "21": { text: "Redirecționat — eroare de sortare", category: "attention" },
  "22": {
    text: "Coletul a fost trimis spre centrul de sortare",
    category: "transit",
  },
  "23": { text: "Coletul a fost returnat expeditorului", category: "returned" },
  "24": {
    text: "Modificare livrare salvată în sistemul GLS",
    category: "info",
  },
  "25": { text: "Redirecționat — rută greșită", category: "attention" },
  "26": { text: "Coletul a ajuns în centrul de sortare", category: "transit" },
  "27": { text: "Coletul a ajuns în centrul de sortare", category: "transit" },
  "28": { text: "Coletul a fost casat", category: "damaged" },
  "29": { text: "Coletul este în investigare", category: "attention" },
  "30": { text: "Colet deteriorat la recepție", category: "damaged" },
  "31": { text: "Colet complet distrus", category: "damaged" },
  "32": {
    text: "Coletul va fi livrat în cursul serii",
    category: "out_delivery",
  },
  "33": { text: "Nu s-a livrat — termen depășit", category: "failed" },
  "34": { text: "Refuzat — acceptarea întârziată", category: "returned" },
  "35": { text: "Refuzat — marfă necomandată", category: "returned" },
  "36": { text: "Destinatar absent, fără card de contact", category: "failed" },
  "37": {
    text: "Modificare livrare la cererea expeditorului",
    category: "info",
  },
  "38": {
    text: "Nu s-a livrat — aviz de însoțire lipsă",
    category: "attention",
  },
  "39": { text: "Avizul de însoțire nu a fost semnat", category: "attention" },
  "40": { text: "Coletul a fost returnat expeditorului", category: "returned" },
  "41": { text: "Redirecționat normal", category: "info" },
  "42": {
    text: "Coletul a fost casat la cererea expeditorului",
    category: "damaged",
  },
  "43": { text: "Coletul nu poate fi localizat", category: "attention" },
  "44": {
    text: "Colet exclus din termenii și condițiile generale",
    category: "attention",
  },
  "46": {
    text: "Modificare finalizată pentru adresa de livrare",
    category: "info",
  },
  "47": { text: "Coletul a părăsit centrul de colete", category: "transit" },
  "51": {
    text: "Datele coletului au fost introduse în sistemul GLS",
    category: "created",
  },
  "52": {
    text: "Datele COD au fost introduse în sistemul GLS",
    category: "created",
  },
  "53": { text: "Tranzit între depouri", category: "transit" },
  "54": { text: "Coletul a fost livrat la parcel box", category: "delivered" },
  "55": {
    text: "Coletul a fost livrat la ParcelShop / Locker",
    category: "delivered",
  },
  "56": { text: "Colet depozitat în GLS ParcelShop", category: "stored" },
  "57": {
    text: "Timp maxim de stocare în ParcelShop atins",
    category: "attention",
  },
  "58": {
    text: "Coletul a fost livrat unui vecin (semnătură)",
    category: "delivered",
  },
  "59": {
    text: "Coletul a fost ridicat din ParcelShop",
    category: "delivered",
  },
  "60": { text: "Vămuire întârziată — factură lipsă", category: "customs" },
  "61": { text: "Documentele de vamă sunt în pregătire", category: "customs" },
  "62": {
    text: "Vămuire întârziată — telefon destinatar indisponibil",
    category: "customs",
  },
  "64": { text: "Coletul a fost eliberat din vamă", category: "customs" },
  "65": {
    text: "Eliberat din vamă — vămuire la destinatar",
    category: "customs",
  },
  "66": {
    text: "Vămuire întârziată — așteaptă aprobare destinatar",
    category: "customs",
  },
  "67": { text: "Documentele de vamă sunt în pregătire", category: "customs" },
  "68": {
    text: "Nu s-a livrat — destinatarul refuză taxele vamale",
    category: "customs",
  },
  "69": {
    text: "Depozitat în centrul de colete — expediție incompletă",
    category: "stored",
  },
  "70": {
    text: "Vămuire întârziată — documente incomplete",
    category: "customs",
  },
  "71": {
    text: "Vămuire întârziată — documente lipsă/incorecte",
    category: "customs",
  },
  "72": {
    text: "Datele de vamă urmează să fie înregistrate",
    category: "customs",
  },
};

export interface CategoryStyle {
  label: string;
  dot: string;
  text: string;
  bg: string;
  ring: string;
}

export const CATEGORY_STYLE: Record<GlsCategory, CategoryStyle> = {
  created: {
    label: "Înregistrat",
    dot: "bg-indigo-500",
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    ring: "ring-indigo-200",
  },
  transit: {
    label: "În tranzit",
    dot: "bg-blue-500",
    text: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
  },
  out_delivery: {
    label: "La curier",
    dot: "bg-cyan-500",
    text: "text-cyan-600",
    bg: "bg-cyan-50",
    ring: "ring-cyan-200",
  },
  delivered: {
    label: "Livrat",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  stored: {
    label: "În depozit",
    dot: "bg-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  attention: {
    label: "Atenție",
    dot: "bg-orange-500",
    text: "text-orange-600",
    bg: "bg-orange-50",
    ring: "ring-orange-200",
  },
  failed: {
    label: "Nelivrat",
    dot: "bg-rose-500",
    text: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
  },
  returned: {
    label: "Returnat",
    dot: "bg-rose-600",
    text: "text-rose-700",
    bg: "bg-rose-50",
    ring: "ring-rose-300",
  },
  damaged: {
    label: "Deteriorat",
    dot: "bg-red-600",
    text: "text-red-700",
    bg: "bg-red-50",
    ring: "ring-red-300",
  },
  customs: {
    label: "Vamă",
    dot: "bg-violet-500",
    text: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
  },
  info: {
    label: "Info",
    dot: "bg-zinc-500",
    text: "text-zinc-600",
    bg: "bg-zinc-50",
    ring: "ring-zinc-200",
  },
};

export function resolveGlsStatus(code: string | number | null | undefined): {
  code: string;
  meta: GlsCodeMeta;
  style: CategoryStyle;
} {
  const key = code != null ? String(code) : "";
  const meta = GLS_STATUS_MAP[key] || {
    text: "Status necunoscut",
    category: "info" as GlsCategory,
  };
  return { code: key, meta, style: CATEGORY_STYLE[meta.category] };
}

interface OrderTrackingProps {
  orderId: string;
  awb?: string | null;
  orderStatus?: string;
  placeholderStatus?: string;
}

export function OrderTracking({
  orderId,
  awb,
  orderStatus,
  placeholderStatus,
}: OrderTrackingProps) {
  // Hydrate immediately from sessionStorage → no spinner on 2G/3G
  const initial = useMemo(() => readTrackingCache<TrackingPayload>(orderId), [orderId]);
  const [data, setData] = useState<TrackingPayload | null>(initial.data);
  const [loading, setLoading] = useState<boolean>(!initial.data);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTracking = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(null);
    try {
      const json = await fetchTrackingCached<TrackingPayload>(orderId, ctrl.signal);
      if (json === null) {
        setData(null);
        setError("not_yet");
      } else {
        setData(json);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") setError("fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    return () => abortRef.current?.abort();
  }, [fetchTracking]);

  // Polling în fundal (real-time feel) la fiecare 30 secunde, dacă comanda e activă și tabul e vizibil
  const isActive = useMemo(() => {
    const s = (orderStatus || "").toUpperCase();
    return ["SHIPPED", "PROCESSING", "CONFIRMED", "PAID"].includes(s);
  }, [orderStatus]);

  useEffect(() => {
    if (!isActive) return;
    let interval: number | undefined;
    const start = () => {
      stop();
      interval = window.setInterval(() => fetchTracking(), 30000);
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
    </section>
  );
}

export default OrderTracking;
