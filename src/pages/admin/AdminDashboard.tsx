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

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const [isSyncingFilters, setIsSyncingFilters] = useState(false);
  const [isRecoveringOrders, setIsRecoveringOrders] = useState(false);
  const [isMasterActivating, setIsMasterActivating] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://linea-backend-production.up.railway.app";

  // Determinăm dacă componenta se află în orice stare de loading secundar
  const isGlobalLoading = loading || isRefreshing;

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);

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
        icon: <TrendingUp size={18} />,
        gradient:
          "linear-gradient(135deg, var(--dark-amethyst) 0%, var(--indigo-ink) 100%)",
      },
      {
        label: "Comenzi Noi",
        value: statsData?.new_orders || "0",
        trend: "TODAY",
        icon: <ShoppingBag size={18} />,
        gradient:
          "linear-gradient(135deg, var(--dark-amethyst-2) 0%, var(--royal-violet) 100%)",
      },
      {
        label: "Utilizatori",
        value: statsData?.new_users || "0",
        trend: "GROWTH",
        icon: <UserPlus size={18} />,
        gradient:
          "linear-gradient(135deg, var(--indigo-ink) 0%, var(--royal-violet) 100%)",
      },
      {
        label: "Catalog",
        value: statsData?.active_products || "0",
        trend: "ACTIVE",
        icon: <Activity size={18} />,
        gradient:
          "linear-gradient(135deg, var(--royal-violet) 0%, var(--lavender-purple) 100%)",
      },
      {
        label: "Stoc Critic",
        value: statsData?.low_stock || "0",
        trend: "ALERT",
        icon: <AlertTriangle size={18} />,
        gradient:
          statsData?.low_stock > 0
            ? "linear-gradient(135deg, #7f1d1d 0%, var(--dark-amethyst) 100%)"
            : "linear-gradient(135deg, var(--dark-amethyst) 0%, #3f3f46 100%)",
      },
    ],
    [statsData],
  );

  return (
    <div className="w-full space-y-10 md:space-y-16 pb-20 animate-in fade-in duration-700 font-sans text-left">
      {/* HEADER ACTIONS BAR */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-zinc-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-[1px]"
              style={{ backgroundColor: "var(--royal-violet)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-[0.5em]"
              style={{ color: "var(--royal-violet)" }}
            >
              Atelier Intelligence
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-7xl italic tracking-tighter text-[var(--dark-amethyst)]">
            Overview
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full xl:w-auto">
          <ActionButton
            icon={<Search size={14} />}
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
            icon={<Zap size={14} />}
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
            icon={<Database size={14} />}
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
            icon={<ShieldCheck size={14} />}
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
            color="#10b981"
          />
        </div>
      </section>

      {/* CARDS GRID SYSTEM */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden p-8 rounded-[2rem] shadow-2xl shadow-zinc-200 group hover:-translate-y-1 transition-all duration-500"
            style={{ background: stat.gradient }}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md text-white border border-white/10">
                  {stat.icon}
                </div>
                <span className="text-[8px] font-black tracking-widest text-white/40 bg-black/20 px-3 py-1 rounded-full uppercase">
                  {stat.trend}
                </span>
              </div>
              <div className="mt-12">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
                  {stat.label}
                </p>
                <h4 className="heading-serif text-3xl italic text-white leading-none">
                  {stat.value}
                </h4>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 size-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          </motion.div>
        ))}
      </section>

      {/* RECENT ACTIVITY TABLE */}
      <section className="relative bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        {/* TOP LOADING BAR (Premium alternative to massive layout shifts) */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-zinc-100 overflow-hidden z-20">
          {isGlobalLoading && (
            <motion.div
              className="h-full bg-[var(--royal-violet)]"
              initial={{ left: "-100%", width: "100%", position: "absolute" }}
              animate={{ left: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        <div className="p-8 md:p-12 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-50/30">
          <div className="space-y-1 text-left">
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
              Activitate Recentă
            </h3>
            <p className="text-xs text-zinc-400">
              Fluxul tranzacțional în timp real
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isGlobalLoading}
            className="group flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all hover:border-[var(--royal-violet)] hover:text-[var(--royal-violet)] disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                isGlobalLoading
                  ? "animate-spin text-[var(--royal-violet)]"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
            Reactualizează
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar relative">
          {/* Un container animat fin care scade opacitatea datelor vechi în timpul reîmprospătării */}
          <div
            className={`transition-opacity duration-300 ${isGlobalLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          >
            <table className="w-full text-left border-collapse min-w-[900px] table-layout-fixed">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-50">
                  <th className="px-12 py-6 w-[15%]">ID Comandă</th>
                  <th className="px-12 py-6 w-[25%]">Client</th>
                  <th className="px-12 py-6 w-[15%]">Dată</th>
                  <th className="px-12 py-6 w-[15%] text-center">Status</th>
                  <th className="px-12 py-6 w-[15%] text-right">Valoare</th>
                  <th className="px-12 py-6 w-[15%] text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order?.id}
                      className="group hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-12 py-7">
                        <span className="text-[11px] font-bold text-[var(--dark-amethyst)] bg-zinc-100 px-3 py-1 rounded-lg">
                          #{" "}
                          {order?.order_number?.split("-").pop() ||
                            order?.id?.toString().slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-12 py-7">
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-[var(--dark-amethyst)]">
                            {order?.customer_name || "Client Anonim"}
                          </span>
                          <span className="text-[10px] text-zinc-400 lowercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            {order?.email || "fara@email.com"}
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-7 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
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
                      <td className="px-12 py-7 text-center">
                        <StatusPill status={order?.status} />
                      </td>
                      <td className="px-12 py-7 text-right">
                        <p className="heading-serif text-lg italic font-bold text-[var(--dark-amethyst)]">
                          {order?.total_amount || 0}{" "}
                          <span className="text-[10px] font-sans not-italic font-black text-zinc-300">
                            RON
                          </span>
                        </p>
                      </td>
                      <td className="px-12 py-7 text-right">
                        <div className="flex justify-end gap-3">
                          <button className="p-3 bg-zinc-100 rounded-xl hover:bg-zinc-950 hover:text-white transition-all">
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !isGlobalLoading && recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest"
                    >
                      Nicio activitate înregistrată în flux
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* SKELETON STATE: Afișat DOAR la prima încărcare (când nu avem absolut nicio comandă în array) */}
          {isGlobalLoading && recentOrders.length === 0 && (
            <div className="w-full py-24 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Sincronizare securizată flux date...
            </div>
          )}
        </div>

        <div className="p-8 border-t border-zinc-50 flex items-center justify-between bg-zinc-50/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
            Pagina{" "}
            <span className="text-[var(--royal-violet)]">{currentPage}</span>{" "}
            din {totalPages}
          </p>
          <div className="flex gap-4">
            <button
              disabled={currentPage === 1 || isGlobalLoading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-4 bg-white border border-zinc-200 rounded-2xl disabled:opacity-30 shadow-sm hover:border-[var(--royal-violet)] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages || isGlobalLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-4 bg-white border border-zinc-200 rounded-2xl disabled:opacity-30 shadow-sm hover:border-[var(--royal-violet)] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, isLoading, color }: any) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all rounded-2xl shadow-lg shadow-zinc-200/50 disabled:opacity-50 hover:brightness-110"
      style={{ backgroundColor: color }}
    >
      {isLoading ? <RefreshCw className="animate-spin" size={14} /> : icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  let colors = { bg: "#f4f4f5", text: "#71717a", border: "#e4e4e7" };

  if (["paid", "completed", "delivered"].includes(s))
    colors = { bg: "#ecfdf5", text: "#059669", border: "#d1fae5" };
  else if (s === "pending")
    colors = { bg: "#fffbeb", text: "#d97706", border: "#fef3c7" };
  else if (["processing", "confirmed", "shipped"].includes(s))
    colors = {
      bg: "rgba(var(--brand-raw), 0.1)",
      text: "var(--royal-violet)",
      border: "rgba(var(--brand-raw), 0.2)",
    };

  return (
    <span
      className="text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-tighter"
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
