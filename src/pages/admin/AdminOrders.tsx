/**
 * AdminOrders.tsx — Bento Neo-Mosaic
 *
 * Pagina de comenzi redesenată în grid bento 4-col, cu card-uri compacte
 * (1×1) intercalate cu card-uri wide (2×1) la fiecare 6 poziții (pos 0 și 3).
 * GLS history + cancel modals + logica fetch / cancel rămân neschimbate.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Eye,
  FileText,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  DollarSign,
  AlertTriangle,
  PackageX,
  Database,
  History,
  Sparkles,
  X,
  Trash2,
  Package,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import OrderReviewModal from "@/components/admin/OrderReviewModal";
import {
  AdminDialogShell,
  AdminDialogTitle,
} from "@/components/admin/AdminDialogShell";
import { readCache, writeCache } from "@/lib/swr-cache";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const buildOrdersKey = (page: number, search: string, status: string) =>
  `admin:orders:list:${page}:${search}:${status}`;

// ─────────────────────────────────────────────────────────────
// Status mapping → palette + timeline step
// ─────────────────────────────────────────────────────────────
type StatusKey =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "unknown";

const STATUS_STEPS: { key: StatusKey; label: string }[] = [
  { key: "pending", label: "Plasată" },
  { key: "processing", label: "Procesare" },
  { key: "shipped", label: "Expediată" },
  { key: "delivered", label: "Livrată" },
];

const resolveStatus = (raw: string | undefined | null): StatusKey => {
  const s = (raw || "").toLowerCase().trim();
  if (["livrat", "completed", "delivered"].includes(s)) return "delivered";
  if (["expediat", "shipping", "shipped"].includes(s)) return "shipped";
  if (["procesare", "processing", "confirmed", "paid"].includes(s))
    return "processing";
  if (["pending", "așteptare", "asteptare"].includes(s)) return "pending";
  if (["anulat", "cancelled", "canceled", "returned"].includes(s))
    return "cancelled";
  return "unknown";
};

const STATUS_PALETTE: Record<
  StatusKey,
  { bg: string; text: string; ring: string; bar: string; label: string }
> = {
  pending: {
    bg: "rgba(245,158,11,0.10)",
    text: "#b45309",
    ring: "rgba(245,158,11,0.25)",
    bar: "linear-gradient(180deg,#f59e0b,#fbbf24)",
    label: "Pending",
  },
  processing: {
    bg: "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
    text: "var(--royal-violet)",
    ring: "color-mix(in srgb, var(--royal-violet) 25%, transparent)",
    bar: "linear-gradient(180deg,var(--royal-violet),var(--lavender-purple,#a78bfa))",
    label: "Procesare",
  },
  shipped: {
    bg: "rgba(59,130,246,0.10)",
    text: "#1d4ed8",
    ring: "rgba(59,130,246,0.25)",
    bar: "linear-gradient(180deg,#3b82f6,#60a5fa)",
    label: "Expediată",
  },
  delivered: {
    bg: "rgba(16,185,129,0.10)",
    text: "#047857",
    ring: "rgba(16,185,129,0.25)",
    bar: "linear-gradient(180deg,#10b981,#34d399)",
    label: "Livrată",
  },
  cancelled: {
    bg: "rgba(244,63,94,0.10)",
    text: "#be123c",
    ring: "rgba(244,63,94,0.25)",
    bar: "linear-gradient(180deg,#f43f5e,#fb7185)",
    label: "Anulată",
  },
  unknown: {
    bg: "rgba(113,113,122,0.10)",
    text: "#52525b",
    ring: "rgba(113,113,122,0.25)",
    bar: "linear-gradient(180deg,#71717a,#a1a1aa)",
    label: "N/A",
  },
};

const statusStepIndex = (k: StatusKey): number => {
  if (k === "cancelled" || k === "unknown") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === k);
};

// ─────────────────────────────────────────────────────────────
// Bento layout — wide pattern repeats every 6 cards
// ─────────────────────────────────────────────────────────────
const isWide = (i: number) => i % 6 === 0 || i % 6 === 3;

const AdminOrders = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);

  // GLS cancel modal state
  const [cancelOrderContext, setCancelOrderContext] = useState<any>(null);
  const [isCancelingGls, setIsCancelingGls] = useState(false);
  const [customParcelId, setCustomParcelId] = useState("");
  const [isSearchingParcels, setIsSearchingParcels] = useState(false);
  const [glsParcels, setGlsParcels] = useState<any[] | null>(null);

  // GLS history modal
  const [showGlsHistory, setShowGlsHistory] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [glsHistoryData, setGlsHistoryData] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // hydrate from cache
  const initialKey = buildOrdersKey(1, "", "Toate");
  const initialCached = readCache<any>(initialKey, 60_000).data;
  const [orders, setOrders] = useState<any[]>(initialCached?.items || []);
  const [totalPages, setTotalPages] = useState<number>(
    initialCached?.pages || 1,
  );
  const [totalItems, setTotalItems] = useState<number>(
    initialCached?.total || 0,
  );
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [isRevalidating, setIsRevalidating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Acces refuzat.");
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchOrders = useCallback(async () => {
    const cacheKey = buildOrdersKey(currentPage, searchTerm, statusFilter);
    const cached = readCache<any>(cacheKey, 60_000).data;
    if (cached) {
      const normalized =
        cached.items?.map((it: any) => (it.Order ? it.Order : it)) || [];
      setOrders(normalized);
      setTotalPages(cached.pages || 1);
      setTotalItems(cached.total || 0);
      setLoading(false);
      setIsRevalidating(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter === "Toate" ? "" : statusFilter,
      });
      const res = await fetch(`${API_URL}/api/v1/orders/admin/all?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        const normalizedOrders =
          data.items?.map((item: any) => (item.Order ? item.Order : item)) ||
          [];
        setOrders(normalizedOrders);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
        writeCache(cacheKey, data);
      } else {
        const msg = Array.isArray(data.detail)
          ? data.detail[0].msg
          : data.detail;
        if (!cached) toast.error(msg || "Eroare la încărcarea datelor.");
      }
    } catch {
      if (!cached) toast.error("Eroare de rețea.");
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      const t = setTimeout(fetchOrders, 300);
      return () => clearTimeout(t);
    }
  }, [isAdmin, fetchOrders]);

  // ── GLS handlers (unchanged) ───────────────────────────────
  const handleSearchGlsParcels = async () => {
    if (!cancelOrderContext) return;
    try {
      setIsSearchingParcels(true);
      const res = await fetch(
        `${API_URL}/api/v1/orders/admin/${cancelOrderContext.id}/gls-list`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) {
        setGlsParcels(data.parcels || []);
        toast.success("Date aduse de la GLS.");
      } else {
        toast.error(data.detail || "Nu am putut găsi colete în GLS.");
      }
    } catch {
      toast.error("Eroare la comunicarea cu GLS.");
    } finally {
      setIsSearchingParcels(false);
    }
  };

  const handleFetchGlobalGlsHistory = async () => {
    setShowGlsHistory(true);
    setIsFetchingHistory(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/orders/admin/gls/all-parcels`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) setGlsHistoryData(data.parcels || []);
      else toast.error(data.detail || "Nu s-a putut încărca istoricul GLS.");
    } catch {
      toast.error("Eroare de rețea la interogarea istoricului.");
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleCancelGlsLabel = async () => {
    if (!cancelOrderContext) return;
    try {
      setIsCancelingGls(true);
      const res = await fetch(
        `${API_URL}/api/v1/orders/admin/${cancelOrderContext.id}/cancel-gls-label`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ custom_parcel_id: customParcelId || null }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Eticheta GLS a fost anulată cu succes.");
        setCancelOrderContext(null);
        setCustomParcelId("");
        setGlsParcels(null);
        fetchOrders();
      } else {
        toast.error(data.detail || "Nu s-a putut anula eticheta GLS.");
      }
    } catch {
      toast.error("Eroare de rețea la anularea etichetei.");
    } finally {
      setIsCancelingGls(false);
    }
  };

  // ── KPI strip ──────────────────────────────────────────────
  const pageRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0),
    [orders],
  );
  const pendingCount = useMemo(
    () =>
      orders.filter((o) => {
        const k = resolveStatus(o?.status);
        return k === "pending" || k === "processing";
      }).length,
    [orders],
  );

  const kpis = [
    {
      label: "Total Comenzi",
      value: totalItems.toLocaleString(),
      icon: <FileText size={16} />,
    },
    {
      label: "Rulaj Pagină",
      value: `${pageRevenue.toLocaleString()} RON`,
      icon: <DollarSign size={16} />,
    },
    {
      label: "În Așteptare",
      value: pendingCount.toString(),
      icon: <Clock size={16} />,
    },
    {
      label: `Pagina ${currentPage}/${totalPages}`,
      value: `${orders.length} înreg.`,
      icon: <Truck size={16} />,
    },
  ];

  // ── Status filter chips ────────────────────────────────────
  const filterChips: { key: string; label: string }[] = [
    { key: "Toate", label: "Toate" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Procesare" },
    { key: "paid", label: "Plătite" },
    { key: "completed", label: "Livrate" },
    { key: "cancelled", label: "Anulate" },
  ];

  if (authLoading || !isAdmin) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduce ? 0 : 0.03 },
    },
  };
  const cardVariants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.15 } }
      : { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as any } },
  };

  return (
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left relative z-0">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pt-4 pb-6 border-b border-zinc-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Sparkles
              size={12}
              className="animate-pulse"
              style={{ color: "var(--royal-violet)" }}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
              Tranzacțional Master
            </span>
          </div>
          <h1 className="heading-serif text-3xl sm:text-4xl md:text-5xl tracking-tighter text-[var(--dark-amethyst)] font-medium leading-[0.95]">
            Management{" "}
            <span style={{ color: "var(--royal-violet)" }}>Comenzi</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <button
            onClick={handleFetchGlobalGlsHistory}
            className="w-full sm:w-auto bg-white border border-zinc-100 hover:border-[var(--royal-violet)]/40 text-zinc-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-24px_rgba(16,0,43,0.18)]"
          >
            <History size={13} style={{ color: "var(--royal-violet)" }} />
            Istoric GLS 60 zile
          </button>
          <button
            className="w-full sm:w-auto text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Download size={13} strokeWidth={2.5} /> Export CSV
          </button>
        </div>
      </header>

      {/* ── KPI strip ──────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[20px] border border-zinc-100 bg-white p-4 sm:p-5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_40px_-30px_rgba(16,0,43,0.12)]"
          >
            <div className="flex items-start justify-between">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  color: "var(--royal-violet)",
                }}
              >
                {k.icon}
              </div>
              {isRevalidating && i === 0 && (
                <Loader2
                  size={12}
                  className="animate-spin text-zinc-300"
                />
              )}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 mt-4">
              {k.label}
            </p>
            <p className="heading-serif text-2xl sm:text-[26px] tracking-tight text-[var(--dark-amethyst)] mt-1 font-medium">
              {k.value}
            </p>
            <div
              aria-hidden
              className="absolute -right-8 -bottom-8 size-24 rounded-full opacity-[0.08] pointer-events-none"
              style={{ background: "var(--royal-violet)", filter: "blur(20px)" }}
            />
          </div>
        ))}
      </section>

      {/* ── Search + filter chips ──────────────────────────── */}
      <section className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-[420px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
            size={14}
          />
          <input
            placeholder="Căutare comandă, client, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl text-sm font-medium outline-none transition placeholder:text-zinc-400 placeholder:font-normal focus:border-[var(--royal-violet)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--royal-violet)_10%,transparent)] text-[var(--dark-amethyst)]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 relative">
          {filterChips.map((c) => {
            const active = statusFilter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => {
                  setStatusFilter(c.key);
                  setCurrentPage(1);
                }}
                className={`relative px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition ${
                  active
                    ? "text-white"
                    : "text-zinc-500 hover:text-[var(--dark-amethyst)] bg-white border border-zinc-100"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="orders-filter-chip"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--primary-gradient)" }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── BENTO GRID ─────────────────────────────────────── */}
      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`rounded-[24px] bg-white border border-zinc-100 p-5 overflow-hidden relative ${
                isWide(i) ? "lg:col-span-2" : ""
              }`}
            >
              <div className="h-3 w-16 bg-zinc-100 rounded animate-pulse mb-3" />
              <div className="h-5 w-32 bg-zinc-100 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse mb-6" />
              <div className="h-7 w-20 bg-zinc-100 rounded animate-pulse" />
            </div>
          ))}
        </section>
      ) : orders.length === 0 ? (
        <div className="py-32 flex flex-col items-center gap-3 bg-white rounded-[28px] border border-zinc-100">
          <Sparkles size={40} strokeWidth={1} className="text-zinc-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Nicio comandă găsită
          </span>
        </div>
      ) : (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]"
        >
          {orders.map((order, i) => (
            <OrderBentoCard
              key={order?.id || i}
              order={order}
              wide={isWide(i)}
              variants={cardVariants}
              onReview={() => order?.id && setReviewOrderId(order.id)}
              onCancelGls={() => setCancelOrderContext(order)}
            />
          ))}
        </motion.section>
      )}

      {/* ── PAGINATION ─────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="h-10 w-10 bg-white border border-zinc-100 rounded-full hover:border-[var(--royal-violet)]/40 disabled:opacity-30 transition flex items-center justify-center"
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="hidden sm:flex gap-1.5">
            {[...Array(totalPages)]
              .map((_, i) => i + 1)
              .filter(
                (n) =>
                  n === 1 ||
                  n === totalPages ||
                  Math.abs(n - currentPage) <= 1,
              )
              .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`e${i}`}
                    className="h-10 w-6 flex items-center justify-center text-zinc-300 text-xs"
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`h-10 min-w-10 px-3 rounded-full text-[11px] font-black transition ${
                      currentPage === p
                        ? "text-white shadow-md"
                        : "bg-white border border-zinc-100 text-[var(--dark-amethyst)] hover:border-[var(--royal-violet)]/40"
                    }`}
                    style={
                      currentPage === p
                        ? { background: "var(--primary-gradient)" }
                        : undefined
                    }
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <span className="sm:hidden text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-zinc-100 px-4 py-2 rounded-full text-[var(--dark-amethyst)]">
            {currentPage} <span className="opacity-30 mx-1">/</span>{" "}
            {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="h-10 w-10 bg-white border border-zinc-100 rounded-full hover:border-[var(--royal-violet)]/40 disabled:opacity-30 transition flex items-center justify-center"
          >
            <ChevronRight size={14} style={{ color: "var(--royal-violet)" }} />
          </button>
        </div>
      )}

      {/* ── MODALE ─────────────────────────────────────────── */}
      <OrderReviewModal
        orderId={reviewOrderId}
        onClose={() => setReviewOrderId(null)}
        onActionComplete={fetchOrders}
      />

      {/* GLS history modal (kept) */}
      <AdminDialogShell
        open={showGlsHistory}
        onOpenChange={(o) => !o && setShowGlsHistory(false)}
        size="lg"
      >
        <AdminDialogTitle>Istoric GLS</AdminDialogTitle>
        <header className="px-6 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)] mb-1.5">
            Colete ultimele 60 zile
          </p>
          <h2 className="heading-serif text-2xl sm:text-3xl tracking-tighter text-[var(--dark-amethyst)] font-medium">
            Istoric GLS
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto luxury-scrollbar">
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <Loader2
                size={28}
                className="animate-spin mb-4"
                style={{ color: "var(--royal-violet)" }}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                Se interoghează GLS...
              </p>
            </div>
          ) : glsHistoryData.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {glsHistoryData.map((parcel, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 px-6 sm:px-8 py-4 items-center hover:bg-zinc-50/60 transition gap-2"
                >
                  <div className="col-span-3 font-bold text-[var(--dark-amethyst)] text-xs truncate">
                    {parcel.ParcelId}
                  </div>
                  <div className="col-span-3 text-[11px] font-mono font-bold text-[var(--royal-violet)] truncate">
                    {parcel.ParcelNumber}
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase text-[var(--dark-amethyst)] truncate inline-block max-w-full">
                      {parcel.ClientReference || "N/A"}
                    </span>
                  </div>
                  <div className="col-span-3 text-right text-[10px] font-bold text-zinc-400">
                    {parcel.Parcel?.PickupDate
                      ? new Date(
                          parseInt(
                            parcel.Parcel.PickupDate.replace(/[^0-9]/g, ""),
                          ),
                        ).toLocaleDateString("ro-RO")
                      : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 opacity-30">
              <Database size={36} className="mb-4 text-[var(--dark-amethyst)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                Nu există colete recente.
              </p>
            </div>
          )}
        </div>
      </AdminDialogShell>

      {/* GLS cancel modal (kept logic, polished shell) */}
      <AdminDialogShell
        open={!!cancelOrderContext}
        onOpenChange={(o) => {
          if (!o) {
            setCancelOrderContext(null);
            setCustomParcelId("");
            setGlsParcels(null);
          }
        }}
        size="md"
        accentColor="#f43f5e"
      >
        <AdminDialogTitle>Anulare AWB GLS</AdminDialogTitle>
        <header className="px-6 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 mb-1.5">
            Comanda {cancelOrderContext?.order_number || "N/A"}
          </p>
          <h2 className="heading-serif text-2xl sm:text-3xl tracking-tighter text-[var(--dark-amethyst)] font-medium">
            Anulare AWB GLS
          </h2>
        </header>

        {cancelOrderContext && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
            <div className="flex items-start gap-4 p-4 rounded-2xl border border-rose-100 bg-rose-50/50">
              <div className="size-10 bg-white text-rose-500 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                <PackageX size={18} />
              </div>
              <p className="text-[11px] text-rose-700 font-bold leading-relaxed">
                Această acțiune anulează eticheta GLS și nu poate fi reluată
                fără regenerare manuală din sistemul lor.
              </p>
            </div>

            <div className="bg-white border border-zinc-100 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Nu știi Parcel ID?
                </p>
                <button
                  onClick={handleSearchGlsParcels}
                  disabled={isSearchingParcels}
                  className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white border border-[var(--royal-violet)]/30 text-[var(--royal-violet)] hover:bg-[var(--royal-violet)] hover:text-white px-5 py-2.5 rounded-xl transition disabled:opacity-50 w-full sm:w-auto"
                >
                  {isSearchingParcels ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Database size={13} />
                  )}
                  Caută în GLS
                </button>
              </div>

              {glsParcels && glsParcels.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto luxury-scrollbar pr-1">
                  {glsParcels.map((parcel: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-zinc-50/60 p-3 border border-zinc-100 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-white transition"
                    >
                      <div>
                        <p className="font-bold text-xs text-[var(--dark-amethyst)]">
                          ID Intern: {parcel.ParcelId}
                        </p>
                        <p className="text-[10px] font-mono mt-0.5 font-bold text-[var(--royal-violet)]">
                          AWB: {parcel.ParcelNumber}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCustomParcelId(parcel.ParcelId.toString())
                        }
                        className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[var(--royal-violet)]/10 text-[var(--royal-violet)] hover:bg-[var(--royal-violet)] hover:text-white transition"
                      >
                        Selectează
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {glsParcels && glsParcels.length === 0 && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center py-3 bg-rose-50 rounded-xl">
                  Niciun colet găsit pentru comandă.
                </p>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-2">
              <label className="block text-[9px] uppercase tracking-widest font-black text-zinc-500">
                ID-ul intern GLS de șters
              </label>
              <input
                type="text"
                value={customParcelId}
                onChange={(e) => setCustomParcelId(e.target.value)}
                placeholder={
                  cancelOrderContext.gls_parcel_id?.toString() || "Ex: 12345678"
                }
                className="w-full bg-zinc-50/60 rounded-xl p-3.5 text-sm font-bold outline-none transition text-[var(--dark-amethyst)] border border-zinc-100 focus:border-[var(--royal-violet)] focus:bg-white focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--royal-violet)_10%,transparent)]"
              />
              <p className="text-[10px] font-medium italic text-zinc-400 pt-1">
                *Lasă gol pentru ID-ul salvat în baza de date.
              </p>
            </div>
          </div>
        )}

        <footer className="px-6 sm:px-8 py-4 sm:py-5 border-t border-zinc-100 bg-zinc-50/40 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={() => {
              setCancelOrderContext(null);
              setCustomParcelId("");
              setGlsParcels(null);
            }}
            disabled={isCancelingGls}
            className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white border border-zinc-200 text-[var(--dark-amethyst)] hover:bg-zinc-50 transition disabled:opacity-50"
          >
            Renunță
          </button>
          <button
            onClick={handleCancelGlsLabel}
            disabled={isCancelingGls}
            className="text-white px-7 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 transition flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600"
          >
            {isCancelingGls ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Confirmă ștergerea
          </button>
        </footer>
      </AdminDialogShell>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--royal-violet) 40%, transparent); border-radius: 10px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--royal-violet); }
      `,
        }}
      />
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// OrderBentoCard
// ───────────────────────────────────────────────────────────────
interface CardProps {
  order: any;
  wide: boolean;
  variants: any;
  onReview: () => void;
  onCancelGls: () => void;
}

const OrderBentoCard = ({
  order,
  wide,
  variants,
  onReview,
  onCancelGls,
}: CardProps) => {
  const statusKey = resolveStatus(order?.status);
  const pal = STATUS_PALETTE[statusKey];
  const stepIdx = statusStepIndex(statusKey);

  const initials = (order?.customer_name || "?")
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dateShort = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
      })
    : "—";

  const orderRef =
    order?.order_number?.split("-").pop() ||
    order?.id?.toString().slice(0, 6) ||
    "—";

  const itemsCount = order?.items?.length || order?.items_count || null;

  return (
    <motion.div
      variants={variants}
      onClick={onReview}
      className={`group relative cursor-pointer rounded-[24px] border border-zinc-100 bg-white overflow-hidden transition-shadow hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-30px_rgba(16,0,43,0.22)] shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_40px_-30px_rgba(16,0,43,0.10)] ${
        wide ? "lg:col-span-2" : ""
      }`}
      style={{ transition: "transform .25s ease, box-shadow .25s ease" }}
    >
      {/* Accent bar */}
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: pal.bar }}
      />

      <div className="h-full p-5 flex flex-col justify-between">
        {/* Top row: order ref + date + status pill */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]"
            >
              #ORD-{orderRef}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
              {dateShort}
            </p>
          </div>

          <span
            className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap border"
            style={{
              backgroundColor: pal.bg,
              color: pal.text,
              borderColor: pal.ring,
            }}
          >
            {pal.label}
          </span>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-3 mt-3 min-w-0">
          <div
            className="size-9 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
            style={{
              background:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              color: "var(--royal-violet)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-tight text-[var(--dark-amethyst)] truncate group-hover:text-[var(--royal-violet)] transition-colors">
              {order?.customer_name || "Client Anonim"}
            </p>
            <p className="text-[10px] text-zinc-400 lowercase truncate">
              {order?.email || "fără@email"}
            </p>
          </div>
        </div>

        {/* Wide-only: status timeline */}
        {wide && stepIdx >= 0 && (
          <div className="mt-3 hidden lg:flex items-center gap-1.5">
            {STATUS_STEPS.map((s, i) => {
              const done = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <div key={s.key} className="flex items-center gap-1.5 flex-1">
                  <div
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      background: done
                        ? pal.bar
                        : "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                    }}
                  />
                  {current && (
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        background: pal.text,
                        boxShadow: `0 0 0 4px ${pal.bg}`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom row: total + count + (wide) actions */}
        <div className="flex items-end justify-between mt-3 gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Total
            </p>
            <p className="heading-serif text-2xl tracking-tight text-[var(--dark-amethyst)] font-medium tabular-nums">
              {(Number(order?.total_amount) || 0).toLocaleString("ro-RO")}
              <span className="text-[10px] font-black ml-1 opacity-50 uppercase tracking-widest">
                RON
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {itemsCount != null && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100">
                <Package size={10} /> {itemsCount}
              </span>
            )}

            {wide && (
              <div className="hidden lg:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelGls();
                  }}
                  className="p-2 bg-white border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition"
                  title="Anulează AWB"
                >
                  <PackageX size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReview();
                  }}
                  className="p-2 bg-white border border-zinc-100 rounded-lg text-[var(--dark-amethyst)] hover:bg-[var(--royal-violet)] hover:text-white hover:border-[var(--royal-violet)] transition"
                  title="Vizualizează"
                >
                  <Eye size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact card: subtle hover halo */}
      <div
        aria-hidden
        className="absolute -right-12 -bottom-12 size-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: pal.text,
          filter: "blur(40px)",
          opacity: 0,
        }}
      />
    </motion.div>
  );
};

export default AdminOrders;
