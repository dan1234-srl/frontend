import { useState, useEffect, useMemo } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { OrderItem } from "@/components/account/OrderItem";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { readCache, swrFetch } from "@/lib/swr-cache";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const ORDERS_TTL_MS = 60_000;
const ordersKey = (page: number, limit: number) =>
  `orders:me:p${page}:l${limit}`;

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const ordersPerPage = 6;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * ordersPerPage;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/orders/me?skip=${skip}&limit=${ordersPerPage}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Sesiune expirată",
          description:
            "Vă rugăm să vă reautentificați pentru a vedea istoricul.",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare sincronizare",
        description: "Nu s-au putut prelua datele din baza de date.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchQuery = searchTerm.toLowerCase();
      const orderNumber = o.order_number?.toLowerCase() || "";
      const status = o.status?.toLowerCase() || "";
      const method = o.payment_method?.toLowerCase() || "";

      return (
        orderNumber.includes(matchQuery) ||
        status.includes(matchQuery) ||
        (method === "card"
          ? "card online credit stripe"
          : "ramburs cod livrare"
        ).includes(matchQuery)
      );
    });
  }, [searchTerm, orders]);

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-100 overflow-hidden">
      <Header />

      {/* TOP LOADING PROGRESS BAR — render only while loading to avoid the static blue line */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-[2px] z-[1100] overflow-hidden pointer-events-none"
          >
            <motion.div
              className="h-full absolute"
              style={{ background: "var(--primary-gradient)" }}
              initial={{ left: "-40%", width: "40%" }}
              animate={{ left: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-36 md:pt-44 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto w-full">
        {/* HEADER CONTROLS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 text-left">
          <div className="space-y-4">
            <button
              onClick={() => navigate("/account")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--royal-violet)] transition-all group"
            >
              <ArrowLeft
                size={12}
                className="group-hover:-translate-x-1 transition-transform duration-300"
              />
              Contul meu
            </button>

            <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter italic text-zinc-900 leading-none">
              Arhiva{" "}
              <span
                className="font-light drop-shadow-sm"
                style={{ color: "var(--royal-violet)" }}
              >
                mea
              </span>
            </h1>
          </div>

          {/* SEARCH BAR COMPACTĂ */}
          <div className="relative w-full lg:w-96 group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors duration-300"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută număr comandă, status sau metodă..."
              className="w-full bg-white/55 backdrop-blur-2xl backdrop-saturate-150 border rounded-2xl py-4 pl-11 pr-14 text-[10px] font-black uppercase tracking-widest outline-none transition-all duration-300 text-zinc-800 shadow-[0_8px_30px_-12px_rgba(16,0,43,0.12)]"
              style={{ borderColor: "rgba(123,44,191,0.18)" }}
              onFocus={(e) => {
                e.target.style.boxShadow =
                  "0 0 0 4px rgba(123,44,191,0.10), 0 8px 30px -12px rgba(16,0,43,0.18)";
                e.target.style.borderColor = "var(--royal-violet)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow =
                  "0 8px 30px -12px rgba(16,0,43,0.12)";
                e.target.style.borderColor = "rgba(123,44,191,0.18)";
              }}
            />
          </div>
        </div>

        {/* CONTAINER GRID */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading && orders.length === 0 ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-80 w-full rounded-[2.5rem] bg-zinc-100/50 backdrop-blur-xl"
                  />
                ))}
              </motion.div>
            ) : filteredOrders.length > 0 ? (
              <motion.div
                key="orders-grid-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300 ${
                  isLoading ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
              >
                {filteredOrders.map((order) => (
                  <OrderItem key={order.id} order={order} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 text-center rounded-[3rem] border border-zinc-200 bg-zinc-50/50 backdrop-blur-2xl flex flex-col items-center justify-center px-4 shadow-[0_20px_60px_-20px_rgba(16,0,43,0.05)]"
              >
                <div className="p-4 bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-zinc-100 mb-6 text-[var(--royal-violet)]">
                  <ShoppingBag size={32} strokeWidth={1.5} />
                </div>
                <h3 className="heading-serif text-3xl italic text-zinc-800 mb-1">
                  Arhiva este goală
                </h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest max-w-xs mt-1">
                  {searchTerm
                    ? `Niciun rezultat potrivit pentru "${searchTerm}"`
                    : "Nu aveți nicio comandă înregistrată în cont."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PAGINARE */}
        {(orders.length >= ordersPerPage || currentPage > 1) && (
          <div className="flex justify-center items-center gap-10 pt-16 mt-12 border-t border-zinc-100">
            <button
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="size-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-950 hover:text-white transition-all bg-white shadow-sm disabled:opacity-25"
            >
              <ChevronLeft size={16} />
            </button>

            <span
              className="text-xl font-black px-5 py-2 rounded-xl border"
              style={{
                backgroundColor: "rgba(255,255,255,1)",
                borderColor: "rgba(123,44,191,0.25)",
                color: "var(--royal-violet)",
              }}
            >
              {currentPage}
            </span>

            <button
              disabled={orders.length < ordersPerPage || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="size-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-950 hover:text-white transition-all bg-white shadow-sm disabled:opacity-25"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
