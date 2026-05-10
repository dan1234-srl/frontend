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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const ordersPerPage = 8;

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
        // Ne asigurăm că setăm array-ul
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error("Sincronizarea istoricului a eșuat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.status?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, orders]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-44 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
          <div className="space-y-6">
            <button
              onClick={() => navigate("/account")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--dark-amethyst)] transition-all group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              Înapoi la Cont
            </button>
            <div className="space-y-2">
              <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter italic text-[var(--dark-amethyst)]">
                Arhiva <span className="text-[var(--french-blue)]">Evem</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 ml-1">
                Istoric Comenzi & Documente Fiscale
              </p>
            </div>
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după referință..."
              className="w-full bg-white border border-zinc-100 rounded-2xl py-5 pl-12 pr-6 text-xs font-bold uppercase tracking-widest outline-none shadow-sm focus:border-[var(--royal-violet)] transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-[2.5rem] bg-zinc-50" />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                <motion.div
                  key="orders-grid" // <--- REZOLVĂ CRASH-UL FRAMER MOTION
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                >
                  {filteredOrders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="orders-empty" // <--- REZOLVĂ CRASH-UL FRAMER MOTION
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-40 text-center rounded-[3rem] border border-dashed border-zinc-100 bg-zinc-50/30"
                >
                  <ShoppingBag
                    className="mx-auto text-zinc-200 mb-6"
                    size={64}
                    strokeWidth={1}
                  />
                  <h3 className="heading-serif text-3xl italic text-zinc-400">
                    Momentan nu există comenzi
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>

            {(orders.length >= ordersPerPage || currentPage > 1) && (
              <div className="flex justify-center items-center gap-10 border-t border-zinc-100 pt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="size-14 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-20 bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center min-w-20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                    Pagina
                  </p>
                  <p className="text-2xl font-black text-[var(--dark-amethyst)]">
                    {currentPage}
                  </p>
                </div>
                <button
                  disabled={orders.length < ordersPerPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="size-14 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all disabled:opacity-20 bg-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
