import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter === "Toate" ? "" : statusFilter,
      });

      const res = await fetch(`${API_URL}/api/v1/orders/admin/all?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        // Normalizare date backend (extragere din obiectul Order dacă este cazul)
        const normalizedOrders =
          data.items?.map((item: any) => (item.Order ? item.Order : item)) ||
          [];

        setOrders(normalizedOrders);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        const msg = Array.isArray(data.detail)
          ? data.detail[0].msg
          : data.detail;
        toast.error(msg || "Eroare la încărcarea datelor.");
      }
    } catch (err) {
      toast.error("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchOrders, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (["livrat", "completed", "paid"].includes(s))
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (["procesare", "pending", "processing"].includes(s))
      return "bg-amber-50 text-amber-600 border-amber-100";
    if (["expediat", "shipping", "confirmed"].includes(s))
      return "bg-[var(--mauve)]/30 text-[var(--dark-amethyst)] border-[var(--royal-violet)]/20";
    if (["anulat", "cancelled"].includes(s))
      return "bg-rose-50 text-rose-500 border-rose-100";
    return "bg-zinc-50 text-zinc-500 border-zinc-100";
  };

  const currentRevenue = orders.reduce(
    (acc, o) => acc + (Number(o.total_amount) || 0),
    0,
  );

  // CARDURI DINAMICE (Folosesc variabilele CSS de temă)
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

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700 font-sans text-left">
      {/* HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-zinc-100 pb-12">
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
              Tranzacțional Master
            </span>
          </div>
          <h1 className="heading-serif text-5xl md:text-6xl italic tracking-tighter text-[var(--dark-amethyst)]">
            Management{" "}
            <span style={{ color: "var(--royal-violet)" }}>Comenzi</span>
          </h1>
        </div>

        <div className="flex w-full xl:w-auto">
          <button
            className="w-full md:w-auto text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 hover:brightness-110"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Download size={14} /> Export Date CSV
          </button>
        </div>
      </header>

      {/* METRICS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden p-8 rounded-[2rem] shadow-2xl shadow-zinc-200/50 group hover:-translate-y-1 transition-all duration-500"
            style={{ background: item.gradient }}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-white">
                  {item.icon}
                </div>
              </div>
              <div className="mt-8">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">
                  {item.label}
                </p>
                <h4 className="heading-serif text-3xl italic text-white leading-none">
                  {item.value}
                </h4>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 size-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          </motion.div>
        ))}
      </section>

      {/* SEARCH & FILTERS */}
      <section className="bg-white border border-zinc-100 p-3 flex flex-col lg:flex-row gap-3 items-center justify-between rounded-[2rem] shadow-sm">
        <div className="relative w-full lg:w-[500px]">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
            size={18}
          />
          <input
            placeholder="Căutare după referință, client..."
            className="w-full pl-14 pr-6 py-4 bg-zinc-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="w-full lg:w-auto flex items-center gap-2 pr-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 shrink-0 hidden sm:block">
            Filtru Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full lg:w-[220px] bg-zinc-50 border-none rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/10 appearance-none text-[var(--dark-amethyst)]"
          >
            <option value="Toate">Toate Statusurile</option>
            <option value="pending">În Așteptare</option>
            <option value="processing">În Procesare</option>
            <option value="paid">Plătite (Stripe)</option>
            <option value="completed">Livrate</option>
            <option value="cancelled">Anulate</option>
          </select>
        </div>
      </section>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden relative min-h-[400px]">
        <Table className="w-full">
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="py-6 px-10 text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Ref. Comandă
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Date Client
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Dată
              </TableHead>
              <TableHead className="text-center text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Status
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Total
              </TableHead>
              <TableHead className="text-right px-10 text-[10px] uppercase tracking-widest font-black text-zinc-400">
                Acțiuni
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // SKELETON ROWS
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-10 py-6">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <Skeleton className="h-10 w-10 ml-auto rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow
                  key={order?.id || Math.random()}
                  className="hover:bg-zinc-50/50 border-b border-zinc-50 transition-colors group"
                >
                  <TableCell className="px-10 py-6">
                    <span className="text-[11px] font-bold bg-zinc-100 px-3 py-1 rounded-lg text-[var(--dark-amethyst)]">
                      #{" "}
                      {order?.order_number?.split("-").pop() ||
                        order?.id?.toString().slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
                        {order?.customer_name || "Client Anonim"}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium lowercase">
                        {order?.email || "fără@email.com"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    {order?.created_at
                      ? new Date(order.created_at).toLocaleDateString("ro-RO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "---"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-4 py-1.5 border text-[9px] uppercase tracking-widest font-black rounded-full shadow-sm ${getStatusColor(order?.status)}`}
                    >
                      {order?.status || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-lg font-serif italic font-black text-[var(--dark-amethyst)]">
                    {order?.total_amount?.toLocaleString() || 0}{" "}
                    <span className="text-[10px] font-sans not-italic text-zinc-300 font-bold">
                      RON
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button
                        className="p-3 bg-white border border-zinc-100 rounded-xl transition-all shadow-sm flex items-center justify-center text-[var(--dark-amethyst)] hover:bg-[var(--dark-amethyst)] hover:text-white"
                        onClick={() =>
                          order?.id && navigate(`/admin/orders/${order.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <AlertTriangle size={48} />
                    <p className="text-[10px] uppercase tracking-widest font-black">
                      Nicio comandă găsită
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {totalPages > 1 && !loading && (
          <footer className="p-8 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Arhivă Tranzacțională Master
            </span>
            <div className="flex items-center gap-4 mx-auto sm:mx-0">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-4 bg-white rounded-2xl border border-zinc-100 hover:border-[var(--royal-violet)] disabled:opacity-20 shadow-sm transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-2 hidden sm:flex">
                {[...Array(totalPages)]
                  .map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-2xl text-xs font-black transition-all shadow-sm ${
                        currentPage === i + 1
                          ? "text-white"
                          : "bg-white hover:bg-zinc-100 text-zinc-400 border border-zinc-100"
                      }`}
                      style={{
                        background:
                          currentPage === i + 1
                            ? "var(--primary-gradient)"
                            : undefined,
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

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-4 bg-white rounded-2xl border border-zinc-100 hover:border-[var(--royal-violet)] disabled:opacity-20 shadow-sm transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
