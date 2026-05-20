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
          description: "Date actualizate cu succes.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare reîmprospătare",
        description: "Serverul nu răspunde.",
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
        setTimeout(() => fetchDashboardData(), 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Acțiune respinsă de server.",
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Eroare rețea",
        description: "Conexiune eșuată.",
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
      {/* HEADER ACTION BAR */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-zinc-100 pb-12">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">Overview</h1>
        </div>

        <div className="flex flex-wrap gap-3">
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
                "Reindex pornit",
              )
            }
            isLoading={isReindexing}
            color="var(--dark-amethyst)"
          />

          {/* ✅ FIXED ENDPOINT HERE */}
          <ActionButton
            icon={<Zap size={14} />}
            label="Master Sync"
            onClick={() =>
              handleAction(
                () =>
                  fetch(`${API_BASE_URL}/api/v1/products/admin/master-sync`, {
                    method: "POST",
                    credentials: "include",
                  }),
                setIsMasterActivating,
                "Master sync pornit (auto-reparare + reindex)",
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
                "Filtre sincronizate",
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
                "Stripe reconciliat",
              )
            }
            isLoading={isRecoveringOrders}
            color="#10b981"
          />
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={i}
            className="p-6 rounded-3xl text-white"
            style={{ background: stat.gradient }}
          >
            <div className="flex justify-between">{stat.icon}</div>
            <div className="mt-6">
              <p className="text-xs opacity-60">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </section>

      {/* TABLE (păstrată complet logic, needitată ca să nu strice UI) */}
      <section className="bg-white rounded-3xl border p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Order</th>
              <th>Client</th>
              <th>Status</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.status}</td>
                <td>{o.total_amount} RON</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, isLoading, color }: any) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-5 py-3 rounded-xl text-white text-xs font-bold flex items-center gap-2"
      style={{ backgroundColor: color }}
    >
      {isLoading ? <RefreshCw className="animate-spin" size={14} /> : icon}
      {label}
    </button>
  );
};

export default AdminDashboard;
