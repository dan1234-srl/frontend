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
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { readCache, writeCache } from "@/lib/swr-cache";

const AdminDashboard = () => {
  // Hydrate synchronously from sessionStorage cache — instant render on revisit
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
  const itemsPerPage = 6;

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://linea-backend-production.up.railway.app";

  const isGlobalLoading = loading || isRefreshing;

  const fetchDashboardData = async (isManualRefresh = false) => {
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

      if (!statsRes.ok || !ordersRes.ok) throw new Error("Eroare server");

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
          description: "Toate statisticile și comenzile au fost actualizate.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare reîmprospătare",
        description: "Baza de date este momentan ocupată în fundal.",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Hydrate cached page data when navigating between order pages
  useEffect(() => {
    const cached = readCache<any>(
      `admin:dashboard:orders:${currentPage}`,
      60_000,
    );
    if (cached.data) {
      setRecentOrders(cached.data.items || []);
      setTotalPages(cached.data.pages || 1);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchDashboardData();
  }, [currentPage]);

  const handleAction = async (
    actionFn: () => Promise<any>,
    loadingState: (val: boolean) => void,
    successMsg: string,
  ) => {
    loadingState(true);
    try {
      const res = await actionFn();
      if (res.ok) {
        toast({
          title: "Succes",
          description: successMsg,
        });
        setTimeout(() => fetchDashboardData(), 1200);
      } else {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Acțiunea administrativă a fost respinsă.",
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Eroare rețea",
        description: "Nu s-a putut stabili conexiunea cu worker-ul.",
      });
    } finally {
      loadingState(false);
    }
  };

  const displayStats = useMemo(
    () => [
      {
        label: "Venituri Astăzi",
        value: statsData?.sales_today
          ? `${statsData.sales_today.toLocaleString()} RON`
          : "0 RON",
        trend: "LIVE",
        icon: <TrendingUp size={20} />,
        gradient:
          "linear-gradient(135deg, var(--dark-amethyst) 0%, var(--indigo-ink) 100%)",
        accent: "rgba(199, 125, 255, 0.2)",
      },
      {
        label: "Comenzi Noi",
        value: statsData?.new_orders || "0",
        trend: "TODAY",
        icon: <ShoppingBag size={20} />,
        gradient:
          "linear-gradient(135deg, var(--dark-amethyst-2) 0%, var(--royal-violet) 100%)",
        accent: "rgba(157, 78, 221, 0.25)",
      },
      {
        label: "Utilizatori",
        value: statsData?.new_users || "0",
        trend: "GROWTH",
        icon: <UserPlus size={20} />,
        gradient:
          "linear-gradient(135deg, var(--indigo-ink) 0%, var(--royal-violet) 100%)",
        accent: "rgba(255, 255, 255, 0.15)",
      },
      {
        label: "Catalog",
        value: statsData?.active_products || "0",
        trend: "ACTIVE",
        icon: <Activity size={20} />,
        gradient:
          "linear-gradient(135deg, var(--royal-violet) 0%, var(--lavender-purple) 100%)",
        accent: "rgba(255, 255, 255, 0.2)",
      },
      {
        label: "Stoc Critic",
        value: statsData?.low_stock || "0",
        trend: "ALERT",
        icon: <AlertTriangle size={20} />,
        gradient:
          statsData?.low_stock > 0
            ? "linear-gradient(135deg, #7f1d1d 0%, var(--dark-amethyst) 100%)"
            : "linear-gradient(135deg, #1e1e24 0%, var(--dark-amethyst) 100%)",
        accent:
          statsData?.low_stock > 0
            ? "rgba(239, 68, 68, 0.2)"
            : "rgba(255, 255, 255, 0.05)",
      },
    ],
    [statsData],
  );

  return (
    <div className="w-full space-y-12 md:space-y-20 pb-20 font-sans text-left bg-[#fcfbfe]">
      {/* HEADER ACTIONS BAR */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-zinc-100/80 pb-12 relative">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-[2px] rounded-full"
              style={{ background: "var(--primary-gradient)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.5em] bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--primary-gradient)" }}
            >
              Atelier Intelligence
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-8xl font-medium tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Overview
          </h1>
        </div>

        {/* Action Controls styled with dynamic glass borders */}
        <div className="flex flex-wrap gap-3 w-full xl:w-auto bg-white/40 p-2 rounded-3xl border border-zinc-100 backdrop-blur-sm shadow-sm">
          <ActionButton
            icon={<RefreshCw size={14} strokeWidth={2.5} />}
            label="Master Sync"
            onClick={() =>
              handleAction(
                () =>
                  fetch(`${API_BASE_URL}/api/v1/products/admin/master-sync`, {
                    method: "POST",
                    credentials: "include",
                  }),
                setIsMasterSyncing,
                "Sistemul a pornit procesul de auto-reparare și reindexare.",
              )
            }
            isLoading={isMasterSyncing}
            color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
          <ActionButton
            icon={<Search size={14} strokeWidth={2.5} />}
            label="Reindex Search"
            onClick={() =>
              handleAction(
                () =>
                  fetch(`${API_BASE_URL}/api/v1/admin/search/reindex`, {
                    method: "POST",
                    credentials: "include",
                  }),
                setIsReindexing,
                "Catalogul se reindexează securizat în fundal.",
              )
            }
            isLoading={isReindexing}
            color="var(--dark-amethyst)"
          />
          <ActionButton
            icon={<Zap size={14} strokeWidth={2.5} />}
            label="Master Activate"
            onClick={() =>
              handleAction(
                () =>
                  fetch(`${API_BASE_URL}/api/v1/admin/master-activate`, {
                    method: "POST",
                    credentials: "include",
                  }),
                setIsMasterActivating,
                "Sistemul a fost activat la nivel global.",
              )
            }
            isLoading={isMasterActivating}
            color="var(--royal-violet)"
          />
          <ActionButton
            icon={<Database size={14} strokeWidth={2.5} />}
            label="Sync Filtre"
            onClick={() =>
              handleAction(
                () =>
                  fetch(`${API_BASE_URL}/api/v1/admin/refresh-all-filters`, {
                    method: "POST",
                    credentials: "include",
                  }),
                setIsSyncingFilters,
                "Sincronizarea structurii de filtre a fost pornită.",
              )
            }
            isLoading={isSyncingFilters}
            color="var(--indigo-ink)"
          />
          <ActionButton
            icon={<ShieldCheck size={14} strokeWidth={2.5} />}
            label="Stripe Sync"
            onClick={() =>
              handleAction(
                () =>
                  fetch(`${API_BASE_URL}/api/v1/orders/admin/reconcile-all`, {
                    method: "POST",
                    credentials: "include",
                  }),
                setIsRecoveringOrders,
                "Reconcilierea cu Stripe rulează asincron.",
              )
            }
            isLoading={isRecoveringOrders}
            color="#1e1e24"
          />
        </div>
      </section>

      {/* EYE-CATCHING CARDS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {displayStats.map((stat, i) => (
          <div
            key={i}
            className="relative overflow-hidden p-8 rounded-[2.8rem] group cursor-pointer transition-all duration-500"
            style={{
              background: stat.gradient,
              boxShadow: "0 25px 50px -12px rgba(16, 0, 43, 0.08)",
            }}
          >
            {/* Dynamic Mesh Overlays for high-end aesthetic */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-40"
              style={{ backgroundColor: stat.accent }}
            />

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <div className="p-3.5 bg-white/10 rounded-[1.2rem] backdrop-blur-xl text-white border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {stat.icon}
                </div>
                <span className="text-[9px] font-black tracking-widest text-white/50 bg-white/10 px-3 py-1 rounded-full uppercase border border-white/5 backdrop-blur-md">
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {stat.label}
                </p>
                <h4 className="heading-serif text-3xl font-medium text-white tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-300">
                  {stat.value}
                </h4>
              </div>
            </div>

            {/* Ambient light ring */}
            <div className="absolute -right-6 -bottom-6 size-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        ))}
      </section>

      {/* LUXURY RECENT ACTIVITY TABLE CONTAINER */}
      <section className="bg-white border border-zinc-100/80 rounded-[3.5rem] shadow-[0_30px_70px_-20px_rgba(16,0,43,0.03)] overflow-hidden relative">
        {/* Dynamic Premium Global Loading Bar */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-zinc-50 overflow-hidden z-20">
          {isGlobalLoading && (
            <motion.div
              className="h-full"
              style={{ background: "var(--primary-gradient)" }}
              initial={{ left: "-100%", width: "100%", position: "absolute" }}
              animate={{ left: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        {/* Table Top Styling */}
        <div className="p-8 md:p-12 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-zinc-50/20">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
              Activitate Recentă
            </h3>
            <p className="text-xs font-medium text-zinc-400">
              Fluxul de comenzi și decontări asincrone securizate
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isGlobalLoading}
            className="group flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-700 transition-all hover:border-[var(--royal-violet)] hover:text-[var(--royal-violet)] active:scale-98 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                isGlobalLoading
                  ? "animate-spin text-[var(--royal-violet)]"
                  : "group-hover:rotate-180 transition-transform duration-700 ease-out"
              }
            />
            Reîmprospătează
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar relative">
          <div
            className={`transition-all duration-300 ${isGlobalLoading ? "opacity-50 pointer-events-none scale-[0.995]" : "opacity-100"}`}
          >
            <table className="w-full text-left border-collapse min-w-[1000px] table-layout-fixed">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50/40 border-b border-zinc-100/70">
                  <th className="px-12 py-5 w-[15%]">ID Ofertă</th>
                  <th className="px-12 py-5 w-[28%]">Profil Client</th>
                  <th className="px-12 py-5 w-[15%]">Data Înregistrării</th>
                  <th className="px-12 py-5 w-[14%] text-center">
                    Stadiu Platba
                  </th>
                  <th className="px-12 py-5 w-[14%] text-right">
                    Valoare Brută
                  </th>
                  <th className="px-12 py-5 w-[14%] text-right">Detaliu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50/80">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order?.id}
                      className="group hover:bg-zinc-50/30 transition-colors"
                    >
                      {/* ID Row with architectural framing */}
                      <td className="px-12 py-6">
                        <span className="text-[11px] font-mono font-bold text-[var(--dark-amethyst)] bg-zinc-100/70 group-hover:bg-[var(--royal-violet)] group-hover:text-white px-3 py-1.5 rounded-xl transition-all duration-300">
                          #
                          {order?.order_number?.split("-").pop() ||
                            order?.id?.toString().slice(0, 8)}
                        </span>
                      </td>

                      {/* Client Profiles */}
                      <td className="px-12 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors duration-200">
                            {order?.customer_name || "Client Anonim"}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[220px]">
                            {order?.email || "fara@email.com"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-12 py-6 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
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
                      </td>

                      {/* Status */}
                      <td className="px-12 py-6 text-center">
                        <StatusPill status={order?.status} />
                      </td>

                      {/* Financial values with editorial serif style */}
                      <td className="px-12 py-6 text-right">
                        <p className="heading-serif text-xl italic font-bold text-[var(--dark-amethyst)]">
                          {order?.total_amount || 0}{" "}
                          <span className="text-[10px] font-sans not-italic font-black text-zinc-300 tracking-wider">
                            RON
                          </span>
                        </p>
                      </td>

                      {/* Elegant Action Circle Button */}
                      <td className="px-12 py-6 text-right">
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            } // 🚀 AICI ESTE MAGIA
                            className="size-10 bg-zinc-50 border border-zinc-100 text-zinc-500 rounded-full flex items-center justify-center group-hover:bg-[var(--dark-amethyst)] group-hover:text-white group-hover:border-transparent group-hover:rotate-45 transition-all duration-300 ease-out shadow-sm"
                          >
                            <ArrowUpRight size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !isGlobalLoading && recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-24 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest"
                    >
                      Nicio activitate înregistrată în flux
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* SKELETON REFRESH STATE */}
          {isGlobalLoading && recentOrders.length === 0 && (
            <div className="w-full py-28 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Sincronizare securizată flux date...
            </div>
          )}
        </div>

        {/* MODERN INTERACTIVE PAGINATION PANEL */}
        <div className="p-8 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Pagina{" "}
            <span className="font-mono text-xs font-bold text-[var(--royal-violet)] bg-[var(--royal-violet)]/5 px-2.5 py-1 rounded-lg border border-[var(--royal-violet)]/10">
              {currentPage}
            </span>{" "}
            din <span className="text-zinc-500">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1 || isGlobalLoading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-3.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl disabled:opacity-20 shadow-sm hover:border-[var(--royal-violet)] hover:text-[var(--royal-violet)] transition-all active:scale-95"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              disabled={currentPage === totalPages || isGlobalLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-3.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl disabled:opacity-20 shadow-sm hover:border-[var(--royal-violet)] hover:text-[var(--royal-violet)] transition-all active:scale-95"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* --- HIGH END BUTTON COMPONENT --- */
const ActionButton = ({ icon, label, onClick, isLoading, color }: any) => {
  const isGradient = color.includes("gradient");

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-all rounded-2xl disabled:opacity-40 hover:brightness-110 shadow-md active:scale-[0.98]"
      style={{
        background: isGradient ? color : undefined,
        backgroundColor: !isGradient ? color : undefined,
      }}
    >
      {isLoading ? <RefreshCw className="animate-spin" size={13} /> : icon}
      <span>{label}</span>
    </button>
  );
};

/* --- EDITORIAL STATUS PILLS --- */
const StatusPill = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  let colors = { bg: "#f4f4f5", text: "#71717a", border: "#e4e4e7" };

  if (["paid", "completed", "delivered"].includes(s))
    colors = { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" };
  else if (s === "pending")
    colors = { bg: "#fffbeb", text: "#b45309", border: "#fde68a" };
  else if (["processing", "confirmed", "shipped"].includes(s))
    colors = {
      bg: "rgba(123, 44, 191, 0.05)",
      text: "var(--royal-violet)",
      border: "rgba(123, 44, 191, 0.15)",
    };

  return (
    <span
      className="text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-wide"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {status || "Inactiv"}
    </span>
  );
};

export default AdminDashboard;
