import { useState, useEffect, useCallback, useMemo } from "react";
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
  PackageX,
  Database,
  History,
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
import { Skeleton } from "@/components/ui/skeleton";
import OrderReviewModal from "@/components/admin/OrderReviewModal";
import AdminDialog from "@/components/admin/AdminDialog";
import { readCache, writeCache } from "@/lib/swr-cache";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const buildOrdersKey = (page: number, search: string, status: string) =>
  `admin:orders:list:${page}:${search}:${status}`;

const AdminOrders = () => {
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

  // Synchronous hydration from cache — no skeleton flash on revisit
  const initialKey = buildOrdersKey(1, "", "Toate");
  const initialCached = readCache<any>(initialKey, 60_000).data;
  const [orders, setOrders] = useState<any[]>(initialCached?.items || []);
  const [totalPages, setTotalPages] = useState<number>(initialCached?.pages || 1);
  const [totalItems, setTotalItems] = useState<number>(initialCached?.total || 0);
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const fetchOrders = useCallback(async () => {
    const cacheKey = buildOrdersKey(currentPage, searchTerm, statusFilter);
    const cached = readCache<any>(cacheKey, 60_000).data;
    if (cached) {
      const normalized = cached.items?.map((it: any) => (it.Order ? it.Order : it)) || [];
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
        limit: "10",
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
    const delayDebounce = setTimeout(fetchOrders, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchOrders]);

  // Funcție pentru căutarea AWB-ului specific unei comenzi
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

  // Funcție NOUĂ: Aduce toate coletele din ultimele 60 de zile
  const handleFetchGlobalGlsHistory = async () => {
    setShowGlsHistory(true);
    setIsFetchingHistory(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/orders/admin/gls/all-parcels`,
        {
          credentials: "include",
        },
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
    <div className="w-full space-y-10 pb-20 font-sans text-left relative">
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

        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <button
            onClick={handleFetchGlobalGlsHistory}
            className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-700 hover:text-[var(--royal-violet)] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 hover:border-[var(--royal-violet)]"
          >
            <History size={14} /> Istoric GLS (60 Zile)
          </button>

          <button
            className="w-full sm:w-auto text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 hover:brightness-110"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Download size={14} /> Export Date CSV
          </button>
        </div>
      </header>

      {/* METRICS GRID — instant render, no per-card stagger */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden p-8 rounded-[2rem] shadow-2xl shadow-zinc-200/50 group hover:-translate-y-1 transition-all duration-500"
            style={{ background: item.gradient }}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-white">
                  {item.icon}
                </div>
                {isRevalidating && i === 0 && (
                  <Loader2 size={14} className="animate-spin text-white/60" />
                )}
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
          </div>
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
                      className={`px-4 py-1.5 border text-[9px] uppercase tracking-widest font-black rounded-full shadow-sm ${getStatusColor(
                        order?.status,
                      )}`}
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
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all translate-x-0 lg:translate-x-4 lg:group-hover:translate-x-0">
                      <button
                        className="p-3 bg-white border border-rose-100 rounded-xl transition-all shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white"
                        onClick={() => setCancelOrderContext(order)}
                        title="Anulează eticheta GLS"
                      >
                        <PackageX size={16} />
                      </button>
                      <button
                        className="p-3 bg-white border border-zinc-100 rounded-xl transition-all shadow-sm flex items-center justify-center text-[var(--dark-amethyst)] hover:bg-[var(--dark-amethyst)] hover:text-white"
                        onClick={() => order?.id && setReviewOrderId(order.id)}
                        title="Vizualizează & aprobă"
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

      <OrderReviewModal
        orderId={reviewOrderId}
        onClose={() => setReviewOrderId(null)}
        onActionComplete={fetchOrders}
      />

      {/* MODAL ISTORIC GLOBAL GLS (NOU) */}
      <AnimatePresence>
        {showGlsHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h3 className="text-2xl font-serif italic font-black text-[var(--dark-amethyst)]">
                    Istoric GLS
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    Toate coletele din ultimele 60 de zile
                  </p>
                </div>
                <button
                  onClick={() => setShowGlsHistory(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-zinc-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-0 overflow-y-auto flex-1 bg-white">
                {isFetchingHistory ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                    <Loader2
                      size={32}
                      className="animate-spin mb-4 text-[var(--royal-violet)]"
                    />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Se interoghează GLS...
                    </p>
                  </div>
                ) : glsHistoryData.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-zinc-50 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">
                          ID Intern
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">
                          AWB
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">
                          Referință Client
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">
                          Data AWB
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {glsHistoryData.map((parcel, idx) => (
                        <TableRow key={idx} className="hover:bg-zinc-50">
                          <TableCell className="font-bold text-[var(--dark-amethyst)]">
                            {parcel.ParcelId}
                          </TableCell>
                          <TableCell className="text-zinc-600">
                            {parcel.ParcelNumber}
                          </TableCell>
                          <TableCell>
                            <span className="bg-zinc-100 px-2 py-1 rounded text-xs font-bold text-zinc-700">
                              {parcel.ClientReference || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500">
                            {parcel.Parcel?.PickupDate
                              ? new Date(
                                  parseInt(
                                    parcel.Parcel.PickupDate.replace(
                                      /[^0-9]/g,
                                      "",
                                    ),
                                  ),
                                ).toLocaleString("ro-RO")
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 opacity-30">
                    <Database size={48} className="mb-4" />
                    <p className="text-sm font-bold">
                      Nu există colete înregistrate în ultimele 60 de zile.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ANULARE AWB GLS */}
      <AnimatePresence>
        {cancelOrderContext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              <div className="p-8 overflow-y-auto">
                <button
                  onClick={() => {
                    setCancelOrderContext(null);
                    setCustomParcelId("");
                    setGlsParcels(null);
                  }}
                  className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                    <PackageX size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif italic font-black text-[var(--dark-amethyst)]">
                      Anulare AWB GLS
                    </h3>
                    <p className="text-sm font-bold text-zinc-500">
                      Comanda: {cancelOrderContext.order_number}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-zinc-600 font-medium">
                      Nu ești sigur care este ParcelId-ul?
                    </p>
                    <button
                      onClick={handleSearchGlsParcels}
                      disabled={isSearchingParcels}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white border border-zinc-200 px-4 py-2 rounded-lg hover:border-[var(--royal-violet)] transition-colors disabled:opacity-50"
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
                    <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2">
                      {glsParcels.map((parcel: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white p-3 border border-zinc-200 rounded-xl flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-[var(--dark-amethyst)]">
                              ID Intern: {parcel.ParcelId}
                            </p>
                            <p className="text-zinc-500">
                              AWB: {parcel.ParcelNumber}
                            </p>
                            <p className="text-zinc-400">
                              Ref: {parcel.ClientReference}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setCustomParcelId(parcel.ParcelId.toString())
                            }
                            className="bg-[var(--royal-violet)]/10 text-[var(--royal-violet)] px-3 py-1.5 rounded-lg font-bold hover:bg-[var(--royal-violet)] hover:text-white transition-colors"
                          >
                            Folosește
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {glsParcels && glsParcels.length === 0 && (
                    <p className="text-xs text-rose-500 font-bold">
                      Nu s-a găsit niciun colet pentru această comandă în GLS.
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-2">
                    Parcel ID (ID-ul intern GLS de șters)
                  </label>
                  <input
                    type="text"
                    value={customParcelId}
                    onChange={(e) => setCustomParcelId(e.target.value)}
                    placeholder={
                      cancelOrderContext.gls_parcel_id?.toString() ||
                      "Ex: 12345678"
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--royal-violet)]/20 transition-all"
                  />
                  <p className="text-xs text-zinc-400 mt-2">
                    *Lasă gol pentru a folosi ID-ul salvat în baza de date (dacă
                    există).
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCancelOrderContext(null);
                      setCustomParcelId("");
                      setGlsParcels(null);
                    }}
                    disabled={isCancelingGls}
                    className="flex-1 py-4 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
                  >
                    Renunță
                  </button>
                  <button
                    onClick={handleCancelGlsLabel}
                    disabled={isCancelingGls}
                    className="flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCancelingGls ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Confirmă Ștergerea"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
