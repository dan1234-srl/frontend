/**
 * AdminOrders.tsx
 * Pagina de administrare comenzi - Design Futuristic (Glassmorphism & Culoare Dinamică)
 */

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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

const AdminOrders = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);

  // State pentru Modalul de anulare AWB
  const [cancelOrderContext, setCancelOrderContext] = useState<any>(null);
  const [isCancelingGls, setIsCancelingGls] = useState(false);

  // Stări pentru interogarea și ștergerea manuală GLS
  const [customParcelId, setCustomParcelId] = useState("");
  const [isSearchingParcels, setIsSearchingParcels] = useState(false);
  const [glsParcels, setGlsParcels] = useState<any[] | null>(null);

  // Stări NOI pentru Istoricul Global GLS (60 zile)
  const [showGlsHistory, setShowGlsHistory] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [glsHistoryData, setGlsHistoryData] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Synchronous hydration from cache
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
    } catch (err) {
      if (!cached) toast.error("Eroare de rețea.");
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      const delayDebounce = setTimeout(fetchOrders, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [isAdmin, fetchOrders]);

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
    } catch (error) {
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
      if (res.ok) {
        setGlsHistoryData(data.parcels || []);
      } else {
        toast.error(data.detail || "Nu s-a putut încărca istoricul GLS.");
      }
    } catch (error) {
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
    } catch (error) {
      toast.error("Eroare de rețea la anularea etichetei.");
    } finally {
      setIsCancelingGls(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (["livrat", "completed", "paid", "delivered"].includes(s))
      return {
        bg: "color-mix(in srgb, #10b981 8%, transparent)",
        text: "#10b981",
        border: "color-mix(in srgb, #10b981 20%, transparent)",
      };
    if (["procesare", "pending", "processing"].includes(s))
      return {
        bg: "color-mix(in srgb, #f59e0b 8%, transparent)",
        text: "#f59e0b",
        border: "color-mix(in srgb, #f59e0b 20%, transparent)",
      };
    if (["expediat", "shipping", "confirmed"].includes(s))
      return {
        bg: "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        text: "var(--royal-violet)",
        border: "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
      };
    if (["anulat", "cancelled"].includes(s))
      return {
        bg: "color-mix(in srgb, #ef4444 8%, transparent)",
        text: "#ef4444",
        border: "color-mix(in srgb, #ef4444 20%, transparent)",
      };

    return {
      bg: "color-mix(in srgb, #71717a 8%, transparent)",
      text: "#71717a",
      border: "color-mix(in srgb, #71717a 20%, transparent)",
    };
  };

  const currentRevenue = orders.reduce(
    (acc, o) => acc + (Number(o.total_amount) || 0),
    0,
  );

  const metricCards = [
    {
      label: "Total Unități",
      value: totalItems,
      icon: <FileText size={18} />,
      gradient:
        "linear-gradient(135deg, var(--dark-amethyst) 0%, var(--indigo-ink) 100%)",
    },
    {
      label: "Rulaj Pagina",
      value: `${currentRevenue.toLocaleString()} RON`,
      icon: <DollarSign size={18} />,
      gradient:
        "linear-gradient(135deg, var(--dark-amethyst-2) 0%, var(--royal-violet) 100%)",
    },
    {
      label: "Pagina Curentă",
      value: `${currentPage} / ${totalPages}`,
      icon: <Clock size={18} />,
      gradient:
        "linear-gradient(135deg, var(--indigo-ink) 0%, var(--royal-violet) 100%)",
    },
    {
      label: "Densitate View",
      value: `${orders.length} inreg.`,
      icon: <Truck size={18} />,
      gradient:
        "linear-gradient(135deg, var(--royal-violet) 0%, var(--lavender-purple) 100%)",
    },
  ];

  if (authLoading || !isAdmin) return null;

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
              style={{ color: "var(--royal-violet)" }}
              className="animate-pulse"
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              Tranzacțional Master
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Management{" "}
            <span style={{ color: "var(--royal-violet)" }}>Comenzi</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <button
            onClick={handleFetchGlobalGlsHistory}
            className="w-full sm:w-auto bg-white/60 backdrop-blur-xl border hover:bg-white text-zinc-600 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--royal-violet)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor =
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)")
            }
          >
            <History size={14} style={{ color: "var(--royal-violet)" }} />{" "}
            Istoric GLS (60 Zile)
          </button>

          <button
            className="w-full sm:w-auto text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Download size={14} strokeWidth={2.5} /> Export Date CSV
          </button>
        </div>
      </header>

      {/* ── METRICS GRID ───────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metricCards.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden p-6 rounded-[1.5rem] shadow-lg shadow-black/[0.03] group hover:-translate-y-1 transition-transform duration-500 border border-white/10"
            style={{ background: item.gradient }}
          >
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-white shadow-sm">
                  {item.icon}
                </div>
                {isRevalidating && i === 0 && (
                  <Loader2 size={14} className="animate-spin text-white/50" />
                )}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-1.5">
                  {item.label}
                </p>
                <h4 className="font-serif text-2xl italic font-bold text-white leading-none">
                  {item.value}
                </h4>
              </div>
            </div>
            {/* Ambient glow */}
            <div className="absolute -right-6 -bottom-6 size-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors pointer-events-none" />
          </div>
        ))}
      </section>

      {/* ── SEARCH & FILTERS (Glassmorphism) ──────────────────────────────── */}
      <section
        className="flex flex-col lg:flex-row gap-3 items-center justify-between p-3 rounded-2xl backdrop-blur-xl border"
        style={{
          background: "color-mix(in srgb, var(--royal-violet) 3%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        <div className="relative w-full lg:w-[500px] group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            size={15}
            style={{
              color: "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
            }}
          />
          <input
            placeholder="Căutare comandă, client..."
            className="w-full pl-10 pr-4 py-3.5 bg-white/60 backdrop-blur-md border rounded-xl text-sm font-medium outline-none transition-all placeholder:font-normal"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              color: "var(--dark-amethyst)",
              boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
            }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
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

        <div className="w-full lg:w-auto flex items-center gap-3">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 shrink-0 hidden sm:block"
            style={{
              color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
            }}
          >
            Status:
          </span>
          <div className="relative w-full lg:w-[220px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/60 backdrop-blur-md border rounded-xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none appearance-none transition-colors cursor-pointer"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                color: "var(--dark-amethyst)",
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
            >
              <option value="Toate">Toate Statusurile</option>
              <option value="pending">În Așteptare</option>
              <option value="processing">În Procesare</option>
              <option value="paid">Plătite (Stripe)</option>
              <option value="completed">Livrate</option>
              <option value="cancelled">Anulate</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── DATA LIST (Futuristic Grid) ────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl shadow-xl shadow-black/[0.02] border overflow-hidden relative z-10 min-h-[400px]"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        {/* Header Listă */}
        <div
          className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
            color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
          }}
        >
          <div className="col-span-2 pl-2">Ref. Comandă</div>
          <div className="col-span-3">Date Client</div>
          <div className="col-span-2">Dată</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Total</div>
          <div className="col-span-2 text-right pr-4">Acțiuni</div>
        </div>

        <div
          className="divide-y"
          style={{
            divideColor:
              "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
          }}
        >
          {loading ? (
            // Skeleton Row Modernizat
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col md:grid md:grid-cols-12 px-6 md:px-10 py-5 items-start md:items-center gap-4 md:gap-0"
              >
                <div className="col-span-2">
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <div className="col-span-3 space-y-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-24" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="col-span-2 md:mx-auto">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="col-span-1 md:mx-auto">
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="col-span-2 md:ml-auto flex gap-2 w-full md:w-auto">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))
          ) : orders.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {orders.map((order) => {
                const badge = getStatusColor(order?.status);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={order?.id || Math.random()}
                    className="group relative transition-all"
                  >
                    {/* Hover Fill Gradient */}
                    <div
                      className="absolute inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                      style={{
                        background:
                          "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                      }}
                    />

                    <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-4 relative z-10 gap-3 md:gap-0">
                      {/* ID Comanda */}
                      <div className="col-span-2 pl-2">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-white border"
                          style={{
                            color: "var(--dark-amethyst)",
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          #
                          {order?.order_number?.split("-").pop() ||
                            order?.id?.toString().slice(0, 8)}
                        </span>
                      </div>

                      {/* Client */}
                      <div className="col-span-3 flex flex-col w-full pl-2 md:pl-0 mt-2 md:mt-0">
                        <span className="text-[13px] font-bold tracking-tight uppercase text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
                          {order?.customer_name || "Client Anonim"}
                        </span>
                        <span
                          className="text-[9px] font-semibold lowercase tracking-widest mt-0.5"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                          }}
                        >
                          {order?.email || "fără@email.com"}
                        </span>
                      </div>

                      {/* Data */}
                      <div
                        className="col-span-2 text-[10px] font-bold uppercase tracking-wider pl-2 md:pl-0"
                        style={{
                          color:
                            "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                        }}
                      >
                        {order?.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              "ro-RO",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "---"}
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-start md:justify-center w-full pl-2 md:pl-0 my-1 md:my-0">
                        <span
                          className="px-3 py-1.5 border text-[8px] uppercase tracking-[0.2em] font-black rounded-full whitespace-nowrap shadow-sm"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            borderColor: badge.border,
                          }}
                        >
                          {order?.status || "N/A"}
                        </span>
                      </div>

                      {/* Total */}
                      <div
                        className="col-span-1 text-left md:text-center text-[14px] font-bold tabular-nums pl-2 md:pl-0"
                        style={{ color: "var(--dark-amethyst)" }}
                      >
                        {order?.total_amount?.toLocaleString() || 0}
                        <span className="text-[8px] font-black ml-1 opacity-50 uppercase tracking-widest">
                          Ron
                        </span>
                      </div>

                      {/* Actiuni */}
                      <div className="col-span-2 flex justify-start md:justify-end gap-1.5 w-full md:w-auto pr-2 mt-2 md:mt-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 lg:translate-x-2 group-hover:translate-x-0">
                        <button
                          className="p-2 bg-white border rounded-lg transition-colors text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, #f43f5e 20%, transparent)",
                          }}
                          onClick={() => setCancelOrderContext(order)}
                          title="Anulează eticheta GLS"
                        >
                          <PackageX size={14} />
                        </button>
                        <button
                          className="p-2 bg-white border rounded-lg transition-colors text-[var(--dark-amethyst)] hover:bg-[var(--royal-violet)] hover:text-white shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                          onClick={() =>
                            order?.id && setReviewOrderId(order.id)
                          }
                          title="Vizualizează & aprobă"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="py-32 flex flex-col items-center gap-3">
              <AlertTriangle
                size={40}
                strokeWidth={1}
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                }}
              >
                Nicio comandă găsită
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="hidden sm:flex gap-1.5">
            {[...Array(totalPages)]
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${currentPage === i + 1 ? "text-white border-transparent" : "bg-white hover:bg-zinc-50"}`}
                  style={{
                    background:
                      currentPage === i + 1
                        ? "var(--primary-gradient)"
                        : undefined,
                    borderColor:
                      currentPage !== i + 1
                        ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                        : undefined,
                    color:
                      currentPage !== i + 1
                        ? "var(--dark-amethyst)"
                        : "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  {i + 1}
                </button>
              ))
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2),
              )}
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
            onClick={() => setCurrentPage((p) => p + 1)}
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

      {/* ── MODALE FUTURISTICE ───────────────────────────────────────────── */}
      <OrderReviewModal
        orderId={reviewOrderId}
        onClose={() => setReviewOrderId(null)}
        onActionComplete={fetchOrders}
      />

      <AdminDialogShell
        open={showGlsHistory}
        onOpenChange={(o) => !o && setShowGlsHistory(false)}
        size="lg"
        className="sm:h-[80vh] sm:max-h-[80vh] rounded-none sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">Istoric GLS</AdminDialogTitle>
        <header
          className="px-6 sm:px-8 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 sticky top-0 z-20 flex justify-between items-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              Istoric GLS
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Colete Ultimele 60 de Zile
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGlsHistory(false)}
            className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto luxury-scrollbar relative z-10 bg-white/50">
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <Loader2
                size={32}
                className="animate-spin mb-4"
                style={{ color: "var(--royal-violet)" }}
              />
              <p
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: "var(--dark-amethyst)" }}
              >
                Se interoghează GLS...
              </p>
            </div>
          ) : glsHistoryData.length > 0 ? (
            <div className="w-full">
              <div
                className="grid grid-cols-12 bg-white/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4 sticky top-0 z-10"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                <div className="col-span-3">ID Intern</div>
                <div className="col-span-3">AWB</div>
                <div className="col-span-3 text-center">Ref. Client</div>
                <div className="col-span-3 text-right">Data AWB</div>
              </div>
              <div
                className="divide-y"
                style={{
                  divideColor:
                    "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                }}
              >
                {glsHistoryData.map((parcel, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 px-8 py-4 items-center hover:bg-white transition-colors"
                  >
                    <div
                      className="col-span-3 font-bold text-[var(--dark-amethyst)] text-xs truncate pr-2"
                      title={parcel.ParcelId}
                    >
                      {parcel.ParcelId}
                    </div>
                    <div
                      className="col-span-3 text-[11px] font-mono font-bold truncate pr-2"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 70%, gray)",
                      }}
                      title={parcel.ParcelNumber}
                    >
                      {parcel.ParcelNumber}
                    </div>
                    <div className="col-span-3 text-center">
                      <span
                        className="bg-white border px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase truncate max-w-full inline-block"
                        style={{
                          color: "var(--dark-amethyst)",
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                        }}
                        title={parcel.ClientReference || "N/A"}
                      >
                        {parcel.ClientReference || "N/A"}
                      </span>
                    </div>
                    <div
                      className="col-span-3 text-right text-[10px] font-bold"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                      }}
                    >
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 opacity-30">
              <Database
                size={40}
                className="mb-4"
                style={{ color: "var(--dark-amethyst)" }}
              />
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "var(--dark-amethyst)" }}
              >
                Nu există colete recente.
              </p>
            </div>
          )}
        </div>
      </AdminDialogShell>

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
        className="sm:max-w-xl rounded-none sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: "color-mix(in srgb, var(--surface-bg) 95%, white)",
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        <AdminDialogTitle className="sr-only">Anulare AWB GLS</AdminDialogTitle>
        <header
          className="px-6 sm:px-8 py-5 sm:py-6 bg-white/70 backdrop-blur-xl border-b shrink-0 flex justify-between items-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
              Anulare AWB GLS
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <p className="text-[8px] text-zinc-400 uppercase tracking-[0.3em] font-black">
                Comanda: {cancelOrderContext?.order_number || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCancelOrderContext(null);
              setCustomParcelId("");
              setGlsParcels(null);
            }}
            className="size-9 bg-white border rounded-full flex items-center justify-center hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </header>

        {cancelOrderContext && (
          <div className="p-6 sm:p-8 space-y-6 bg-white/50">
            <div
              className="flex items-center gap-4 p-5 rounded-2xl border shadow-sm"
              style={{
                background: "color-mix(in srgb, #f43f5e 3%, white)",
                borderColor: "color-mix(in srgb, #f43f5e 15%, transparent)",
              }}
            >
              <div className="w-12 h-12 bg-white text-rose-500 rounded-xl flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
                <PackageX size={20} />
              </div>
              <p className="text-[11px] text-rose-600 font-bold leading-relaxed">
                Această acțiune anulează eticheta GLS și nu poate fi reluată
                fără regenerare manuală din sistemul lor.
              </p>
            </div>

            <div
              className="bg-white border p-6 rounded-[1.5rem] shadow-sm space-y-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Nu știi Parcel ID?
                </p>
                <button
                  onClick={handleSearchGlsParcels}
                  disabled={isSearchingParcels}
                  className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white border px-5 py-3 rounded-xl transition-all disabled:opacity-50 shadow-sm w-full sm:w-auto"
                  style={{
                    color: "var(--royal-violet)",
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--royal-violet)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.color = "var(--royal-violet)";
                  }}
                >
                  {isSearchingParcels ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Database size={14} />
                  )}
                  Caută în GLS
                </button>
              </div>

              {glsParcels && glsParcels.length > 0 && (
                <div className="space-y-3 mt-2 max-h-48 overflow-y-auto luxury-scrollbar pr-2">
                  {glsParcels.map((parcel: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-zinc-50/50 p-4 border rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors hover:shadow-sm hover:bg-white"
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                      }}
                    >
                      <div>
                        <p className="font-bold text-xs text-[var(--dark-amethyst)]">
                          ID Intern: {parcel.ParcelId}
                        </p>
                        <p
                          className="text-[10px] font-mono mt-1 font-bold"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                          }}
                        >
                          AWB: {parcel.ParcelNumber}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCustomParcelId(parcel.ParcelId.toString())
                        }
                        className="px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors w-full sm:w-auto text-center"
                        style={{
                          background:
                            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                          color: "var(--royal-violet)",
                        }}
                      >
                        Selectează
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {glsParcels && glsParcels.length === 0 && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center py-4 bg-rose-50 rounded-xl">
                  Niciun colet găsit pentru comandă.
                </p>
              )}
            </div>

            <div
              className="space-y-2 relative group bg-white p-6 rounded-[1.5rem] border shadow-sm"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              }}
            >
              <label
                className="block text-[9px] uppercase tracking-widest font-black ml-1 transition-colors"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                }}
              >
                ID-ul intern GLS de șters
              </label>
              <input
                type="text"
                value={customParcelId}
                onChange={(e) => setCustomParcelId(e.target.value)}
                placeholder={
                  cancelOrderContext.gls_parcel_id?.toString() || "Ex: 12345678"
                }
                className="w-full bg-white/50 backdrop-blur-sm rounded-xl p-4 text-sm font-bold outline-none transition-all text-[var(--dark-amethyst)] mt-1"
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
                  e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
                }}
              />
              <p
                className="text-[9px] font-bold italic pt-2 ml-1"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                }}
              >
                *Lasă gol pentru a folosi ID-ul salvat în baza de date (dacă
                există).
              </p>
            </div>
          </div>
        )}

        <footer
          className="p-5 sm:p-6 bg-white/90 backdrop-blur-xl border-t shrink-0 flex justify-end gap-3 rounded-b-[2rem]"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            onClick={() => {
              setCancelOrderContext(null);
              setCustomParcelId("");
              setGlsParcels(null);
            }}
            disabled={isCancelingGls}
            className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white border hover:bg-zinc-50 transition-all disabled:opacity-50"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
            }}
          >
            Renunță
          </button>
          <button
            onClick={handleCancelGlsLabel}
            disabled={isCancelingGls}
            className="text-white px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600"
          >
            {isCancelingGls ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Confirmă Ștergerea
          </button>
        </footer>
      </AdminDialogShell>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--royal-violet) 40%, transparent); border-radius: 10px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--royal-violet); }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

export default AdminOrders;
