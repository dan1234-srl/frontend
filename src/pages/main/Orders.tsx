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
  const ordersPerPage = 10;

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
        setOrders(data);
      } else {
        toast.error("Sincronizarea istoricului a eșuat.");
      }
    } catch (error) {
      toast.error("Eroare de conexiune la server.");
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--dark-amethyst)] flex flex-col font-sans transition-colors duration-700">
      <Header />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => navigate("/account")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--dark-amethyst)] transition-colors group mb-12"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Înapoi
          </button>

          <header className="mb-20 pb-12 border-b border-zinc-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <span
                    className="h-px w-8"
                    style={{ backgroundColor: "var(--royal-violet)" }}
                  />
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.5em]"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    Arhivă Achiziții
                  </p>
                </div>
                <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter italic text-[var(--dark-amethyst)]">
                  Comenzile <em>mele</em>
                </h1>
              </div>
              <div className="relative w-full lg:w-96 group">
                <Search
                  size={16}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Caută după referință..."
                  className="w-full bg-transparent border-b border-zinc-100 py-4 pl-8 pr-4 text-sm font-medium outline-none transition-all"
                  style={{ focus: { borderColor: "var(--royal-violet)" } }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--royal-violet)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "#f4f4f5")}
                />
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-10 border border-zinc-100 rounded-[3rem] space-y-6 bg-white"
                >
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                      {filteredOrders.map((order) => (
                        <OrderItem key={order.id} order={order} />
                      ))}
                    </div>

                    {/* Paginare Dinamică */}
                    {(orders.length === ordersPerPage || currentPage > 1) && (
                      <div className="mt-20 flex justify-center items-center gap-8">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="size-14 rounded-2xl border border-zinc-100 flex items-center justify-center transition-all shadow-sm bg-white"
                          onMouseEnter={(e) =>
                            !e.currentTarget.disabled &&
                            ((e.currentTarget.style.backgroundColor =
                              "var(--dark-amethyst)"),
                            (e.currentTarget.style.color = "white"))
                          }
                          onMouseLeave={(e) => (
                            (e.currentTarget.style.backgroundColor = "white"),
                            (e.currentTarget.style.color = "inherit")
                          )}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">
                            Pagina
                          </p>
                          <p className="heading-serif text-2xl italic text-[var(--dark-amethyst)]">
                            {currentPage}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={orders.length < ordersPerPage}
                          className="size-14 rounded-2xl border border-zinc-100 flex items-center justify-center transition-all shadow-sm bg-white"
                          onMouseEnter={(e) =>
                            !e.currentTarget.disabled &&
                            ((e.currentTarget.style.backgroundColor =
                              "var(--dark-amethyst)"),
                            (e.currentTarget.style.color = "white"))
                          }
                          onMouseLeave={(e) => (
                            (e.currentTarget.style.backgroundColor = "white"),
                            (e.currentTarget.style.color = "inherit")
                          )}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-32 text-center rounded-[3rem] border border-dashed border-zinc-100 bg-zinc-50/50"
                  >
                    <ShoppingBag
                      className="mx-auto text-zinc-200 mb-6"
                      size={48}
                      strokeWidth={1}
                    />
                    <h3 className="heading-serif text-2xl italic text-zinc-400">
                      Nicio comandă găsită
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
