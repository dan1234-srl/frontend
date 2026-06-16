/**
 * AdminDashboard.tsx
 * Panoul de Control Principal - Design Futuristic (Bento Neo-Mosaic & Glassmorphism)
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ShoppingBag,
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  Search,
  Database,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { readCache, writeCache } from "@/lib/swr-cache";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminDashboard = () => {
  // Hydrate synchronously from cache for instant initial render
  const cachedStats = readCache<any>("admin:dashboard:stats", 60_000);
  const [statsData, setStatsData] = useState<any>(cachedStats.data);
  const [recentOrders, setRecentOrders] = useState<any[]>(
    readCache<any>("admin:dashboard:orders:1", 60_000).data?.items || [],
  );

  const [loading, setLoading] = useState(!cachedStats.data);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSyncingFilters, setIsSyncingFilters] = useState(false);
  const [isRecoveringOrders, setIsRecoveringOrders] = useState(false);
  const [isMasterActivating, setIsMasterActivating] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isMasterSyncing, setIsMasterSyncing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    readCache<any>("admin:dashboard:orders:1", 60_000).data?.pages || 1,
  );
  const itemsPerPage = 8; // Am mărit numărul la 8 pentru că noile carduri sunt mai compacte

  const isGlobalLoading = loading || isRefreshing;

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setIsRefreshing(true);
        else if (!statsData) setLoading(true);

        const fetchOptions = {
          method: "GET",
          credentials: "include" as const,
          cache: "no-store" as RequestCache,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        };

        const ordersKey = `admin:dashboard:orders:${currentPage}`;

        const [statsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/admin/stats`, fetchOptions),
          fetch(
            `${API_BASE_URL}/api/v1/orders/admin/all?page=${currentPage}&limit=${itemsPerPage}`,
            fetchOptions,
          ),
        ]);

        if (!statsRes.ok || !ordersRes.ok)
          throw new Error("Eroare server la preluarea datelor de dashboard.");

        const stats = await statsRes.json();
        const ordersData = await ordersRes.json();

        setStatsData(stats);
        setRecentOrders(ordersData.items || []);
        setTotalPages(ordersData.pages || 1);

        writeCache("admin:dashboard:stats", stats);
        writeCache(ordersKey, ordersData);

        if (isManualRefresh) {
          toast({
            title: "Sincronizare completă",
            description:
              "Infrastructura și statisticile au fost actualizate cu succes.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Eroare de procesare",
          description:
            "Baza de date master este ocupată. Reîncearcă în câteva secunde.",
        });
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, itemsPerPage, statsData, toast],
  );

  useEffect(() => {
    const cached = readCache<any>(
      `admin:dashboard:orders:${currentPage}`,
      60_000,
    );
    if (cached.data) {
      setRecentOrders(cached.data.items || []);
      setTotalPages(cached.data.pages || 1);
    } else {
      fetchDashboardData();
    }
  }, [currentPage, fetchDashboardData]);

  // Handle generic background actions (Syncs, Reindex, etc.)
  const handleAction = async (
    actionFn: () => Promise<any>,
    loadingState: (val: boolean) => void,
    successMsg: string,
  ) => {
    loadingState(true);
    try {
      const res = await actionFn();
      if (res.ok) {
        toast({ title: "Acțiune Executată", description: successMsg });
        setTimeout(() => fetchDashboardData(), 1500); // Mic delay pentru a lăsa workerul să termine task-ul
      } else {
        toast({
          variant: "destructive",
          title: "Acțiune Respinsă",
          description: "Sistemul a refuzat cererea.",
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Eroare Conexiune",
        description: "Serverul nu a răspuns.",
      });
    } finally {
      loadingState(false);
    }
  };

  const displayStats = useMemo(
    () => [
      {
        label: "Rulaj Astăzi",
        value: statsData?.sales_today
          ? `${statsData.sales_today.toLocaleString()} RON`
          : "0 RON",
        trend: "LIVE",
        icon: <TrendingUp size={20} />,
        color: "var(--primary-gradient)",
      },
      {
        label: "Comenzi Noi",
        value: statsData?.new_orders || "0",
        trend: "TODAY",
        icon: <ShoppingBag size={20} />,
        color: "var(--primary-gradient)",
      },
      {
        label: "Clienți Noi",
        value: statsData?.new_users || "0",
        trend: "GROWTH",
        icon: <UserPlus size={20} />,
        color: "var(--primary-gradient)",
      },
      {
        label: "Catalog Activ",
        value: statsData?.active_products || "0",
        trend: "INVENTORY",
        icon: <Activity size={20} />,
        color: "var(--primary-gradient)",
      },
      {
        label: "Stoc Critic",
        value: statsData?.low_stock || "0",
        trend: "ALERT",
        icon: <AlertTriangle size={20} />,
        color:
          statsData?.low_stock > 0
            ? "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)"
            : "var(--primary-gradient)",
      },
    ],
    [statsData],
  );

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
              Atelier Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Dashboard{" "}
            <span style={{ color: "var(--royal-violet)" }}>Central</span>
          </h1>
        </div>

        <div
          className="flex items-center gap-4 bg-zinc-50 border px-6 py-3.5 rounded-2xl shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Node: RO_BUH_01
          </span>
        </div>
      </header>

      {/* ── CONTROL WIDGETS (Background Tasks) ─────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <ActionButton
          icon={<RefreshCw size={14} />}
          label="Master Sync"
          isLoading={isMasterSyncing}
          onClick={() =>
            handleAction(
              () =>
                fetch(`${API_BASE_URL}/api/v1/products/admin/master-sync`, {
                  method: "POST",
                  credentials: "include",
                }),
              setIsMasterSyncing,
              "Infrastructura de bază se sincronizează.",
            )
          }
          accentColor="#10b981"
        />
        <ActionButton
          icon={<Search size={14} />}
          label="Reindex Search"
          isLoading={isReindexing}
          onClick={() =>
            handleAction(
              () =>
                fetch(`${API_BASE_URL}/api/v1/admin/search/reindex`, {
                  method: "POST",
                  credentials: "include",
                }),
              setIsReindexing,
              "Motorul de căutare a fost reindexat.",
            )
          }
        />
        <ActionButton
          icon={<Zap size={14} />}
          label="Activate Nodes"
          isLoading={isMasterActivating}
          onClick={() =>
            handleAction(
              () =>
                fetch(`${API_BASE_URL}/api/v1/admin/master-activate`, {
                  method: "POST",
                  credentials: "include",
                }),
              setIsMasterActivating,
              "Produsele au fost forțate ca Live.",
            )
          }
        />
        <ActionButton
          icon={<Database size={14} />}
          label="Sync Filtre"
          isLoading={isSyncingFilters}
          onClick={() =>
            handleAction(
              () =>
                fetch(`${API_BASE_URL}/api/v1/admin/refresh-all-filters`, {
                  method: "POST",
                  credentials: "include",
                }),
              setIsSyncingFilters,
              "Matricea de atribute se recalibrează.",
            )
          }
        />
        <ActionButton
          icon={<ShieldCheck size={14} />}
          label="Stripe Check"
          isLoading={isRecoveringOrders}
          onClick={() =>
            handleAction(
              () =>
                fetch(`${API_BASE_URL}/api/v1/orders/admin/reconcile-all`, {
                  method: "POST",
                  credentials: "include",
                }),
              setIsRecoveringOrders,
              "Plățile au fost reconciliate din Stripe.",
            )
          }
        />
      </section>

      {/* ── KPI METRICS (Bento Cards Animates) ─────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {displayStats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative overflow-hidden rounded-[20px] p-5 sm:p-6 shadow-lg shadow-black/[0.04] group border border-white/10"
            style={{ background: stat.color }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-6 min-h-[120px]">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 text-white shadow-sm transition-transform group-hover:scale-105">
                  {stat.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-md border border-white/10 text-white/80">
                  {stat.trend}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70 mb-1">
                  {stat.label}
                </p>
                <h4 className="heading-serif text-2xl sm:text-[30px] tracking-tight text-white font-medium leading-none drop-shadow-sm truncate">
                  {stat.value}
                </h4>
              </div>
            </div>

            <div
              aria-hidden
              className="absolute -right-6 -bottom-6 size-28 rounded-full pointer-events-none mix-blend-overlay transition-transform duration-700 group-hover:scale-150"
              style={{
                background: "rgba(255,255,255,0.15)",
                filter: "blur(20px)",
              }}
            />
          </motion.div>
        ))}
      </section>

      {/* ── ACTIVITY FEED (Comenzi Recente) ─────────────────────────────────── */}
      <div
        className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.02] border overflow-hidden relative z-10 min-h-[400px]"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <div
          className="flex justify-between items-center px-8 py-5 border-b bg-zinc-50/50 backdrop-blur-md"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
          }}
        >
          <h3
            className="text-[10px] font-black uppercase tracking-[0.3em]"
            style={{ color: "var(--dark-amethyst)" }}
          >
            Activitate Tranzacțională
          </h3>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isGlobalLoading}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-white px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 shadow-sm"
            style={{
              color: "var(--royal-violet)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <RefreshCw
              size={12}
              className={isGlobalLoading ? "animate-spin" : ""}
            />{" "}
            Refresh
          </button>
        </div>

        <div
          className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
            color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
          }}
        >
          <div className="col-span-2 pl-2">Ref. Comandă</div>
          <div className="col-span-4">Date Client</div>
          <div className="col-span-2">Dată Achiziție</div>
          <div className="col-span-2 text-center">Status Global</div>
          <div className="col-span-2 text-right pr-2">Total Ofertă</div>
        </div>

        <div
          className="divide-y"
          style={{
            divideColor:
              "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
          }}
        >
          <AnimatePresence mode="wait">
            {isGlobalLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:grid md:grid-cols-12 px-6 md:px-10 py-5 items-start md:items-center gap-4 border-b last:border-none"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                    }}
                  >
                    <div className="col-span-2">
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </div>
                    <div className="col-span-4 space-y-2 w-full">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2 w-24" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2 md:mx-auto">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="col-span-2 md:ml-auto">
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : recentOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center gap-3"
              >
                <AlertTriangle
                  size={36}
                  strokeWidth={1}
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                  }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                  }}
                >
                  Nicio activitate recentă detectată
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="group relative cursor-pointer border-b last:border-none transition-all duration-300 hover:bg-zinc-50/50"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                    }}
                  >
                    <div
                      className="absolute inset-1 rounded-[1.2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                      style={{
                        background:
                          "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                      }}
                    />

                    <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-8 py-5 relative z-10 gap-3 md:gap-0">
                      <div className="col-span-2 pl-2">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-white border group-hover:border-[var(--royal-violet)] transition-colors"
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
                      <div className="col-span-4 flex flex-col w-full pl-2 md:pl-0 mt-1 md:mt-0">
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
                      <div className="col-span-2 flex justify-start md:justify-center w-full pl-2 md:pl-0 my-1 md:my-0">
                        <StatusPill status={order?.status} />
                      </div>
                      <div className="col-span-2 flex justify-between md:justify-end items-center w-full pl-2 pr-2 md:pl-0">
                        <div
                          className="text-[14px] font-bold tabular-nums"
                          style={{ color: "var(--dark-amethyst)" }}
                        >
                          {order?.total_amount?.toLocaleString() || 0}{" "}
                          <span className="text-[8px] font-black opacity-50 uppercase tracking-widest">
                            Ron
                          </span>
                        </div>
                        <div
                          className="md:hidden size-8 rounded-full border bg-white flex items-center justify-center text-[var(--royal-violet)] shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                          }}
                        >
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────── */}
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
    </div>
  );
};

/* --- HIGH END BUTTON COMPONENT (Glassmorphism) --- */
const ActionButton = ({
  icon,
  label,
  onClick,
  isLoading,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isLoading: boolean;
  accentColor?: string;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="relative overflow-hidden flex flex-col items-center justify-center gap-3 p-4 sm:p-5 bg-white/60 backdrop-blur-md rounded-[1.5rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 group"
      style={{
        borderColor: "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
      }}
    >
      {/* Background Hover Mesh */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: accentColor
            ? `color-mix(in srgb, ${accentColor} 5%, transparent)`
            : "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 5%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 2%, transparent) 100%)",
        }}
      />

      <div
        className="size-10 rounded-xl bg-white border shadow-sm flex items-center justify-center relative z-10 transition-transform group-hover:scale-110"
        style={{
          color: accentColor || "var(--royal-violet)",
          borderColor: accentColor
            ? `color-mix(in srgb, ${accentColor} 20%, transparent)`
            : "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
        }}
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : icon}
      </div>
      <span
        className="text-[9px] font-black uppercase tracking-widest relative z-10 text-center"
        style={{ color: "var(--dark-amethyst)" }}
      >
        {label}
      </span>
    </button>
  );
};

/* --- EDITORIAL STATUS PILLS --- */
const StatusPill = ({ status }: { status: string }) => {
  const s = status?.toLowerCase() || "unknown";

  let styles = {
    bg: "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
    text: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
    border: "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
  };

  if (["livrat", "completed", "delivered", "paid"].includes(s))
    styles = {
      bg: "color-mix(in srgb, #10b981 8%, transparent)",
      text: "#10b981",
      border: "color-mix(in srgb, #10b981 20%, transparent)",
    };
  else if (["procesare", "pending", "processing"].includes(s))
    styles = {
      bg: "color-mix(in srgb, #f59e0b 8%, transparent)",
      text: "#d97706",
      border: "color-mix(in srgb, #f59e0b 20%, transparent)",
    };
  else if (["expediat", "shipping", "shipped"].includes(s))
    styles = {
      bg: "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
      text: "var(--royal-violet)",
      border: "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
    };
  else if (["anulat", "cancelled", "returned"].includes(s))
    styles = {
      bg: "color-mix(in srgb, #f43f5e 8%, transparent)",
      text: "#e11d48",
      border: "color-mix(in srgb, #f43f5e 20%, transparent)",
    };

  return (
    <span
      className="px-3 py-1.5 border text-[8px] uppercase tracking-[0.2em] font-black rounded-full whitespace-nowrap shadow-sm"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
      }}
    >
      {status || "N/A"}
    </span>
  );
};

export default AdminDashboard;
