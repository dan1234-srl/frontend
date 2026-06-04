import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Heart,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper pentru extragerea imaginii corecte din obiectul complex
  const getImageUrl = (imageSource: any) => {
    if (!imageSource) return "";
    if (typeof imageSource === "string") {
      if (imageSource.startsWith("http")) return imageSource;
      try {
        const parsed = JSON.parse(imageSource);
        return parsed.main?.medium || parsed.medium || parsed.url || "";
      } catch {
        return imageSource;
      }
    }
    return imageSource.main?.medium || imageSource.medium || "";
  };

  const fetchWishlist = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/wishlist/`, {
          credentials: "include",
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem("guest_wishlist");
      setItems(local ? JSON.parse(local) : []);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, fetchWishlist]);

  // Ștergere directă, cu animație fluidă
  const remove = async (productId: string) => {
    if (user) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/wishlist/toggle/${productId}`, {
          method: "POST",
          credentials: "include",
        });
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
      } catch (err) {
        toast.error("Eroare la server.");
        return;
      }
    } else {
      const updated = items.filter((i) => (i.product_id || i.id) !== productId);
      setItems(updated);
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
    }
    toast.success("Articol eliminat din lista de dorințe.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end font-sans">
          {/* Overlay-ul folosește clasa ta custom .glass-overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 glass-overlay"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative z-[701] flex h-full w-full sm:max-w-[400px] flex-col bg-white shadow-2xl overflow-hidden"
          >
            {/* Accente vizuale futuristice (Glows in background) */}
            <div className="absolute top-0 left-0 w-full h-64 bg-[var(--mauve-magic)] opacity-5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--royal-violet)] opacity-[0.03] blur-[100px] pointer-events-none" />

            {/* --- HEADER (aliniat cu ShoppingBag / SearchModal) --- */}
            <header className="relative flex items-center justify-between px-6 py-6 shrink-0 border-b border-zinc-100 bg-white/80 backdrop-blur-md z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--primary-gradient)" }}
                  />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Colecția ta
                  </p>
                </div>
                <h2 className="heading-serif text-2xl tracking-tighter text-[var(--dark-amethyst)]">
                  Lista de dorințe
                  <span className="text-zinc-300 font-sans text-lg ml-1.5">
                    ({items.length})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Închide"
                className="h-9 w-9 flex items-center justify-center rounded-full border border-zinc-100 hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900 group"
              >
                <X
                  size={16}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </header>

            {/* --- BODY --- */}
            <div className="relative flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-6 z-10">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="text-[var(--royal-violet)]" size={32} />
                  </motion.div>
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => {
                      const isOutOfStock =
                        item.stock_quantity <= 0 || !item.is_active;

                      return (
                        <motion.div
                          layout // Aceasta face ca elementele de jos să gliseze lin în sus când unul este șters
                          key={item.id || item.product_id}
                          initial={{ opacity: 0, x: 30, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            x: -50,
                            scale: 0.9,
                            filter: "blur(4px)",
                          }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                            delay: idx * 0.05,
                          }}
                          className={`group relative flex gap-4 p-3.5 bg-white/70 backdrop-blur-xl rounded-[20px] border border-white shadow-sm hover:shadow-[0_8px_30px_rgba(123,44,191,0.08)] hover:bg-white transition-all duration-500 overflow-hidden ${
                            isOutOfStock ? "opacity-60 grayscale-[0.3]" : ""
                          }`}
                        >
                          {/* Accent Gradient pe Hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--royal-violet)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {/* Linie fină de accent în stânga */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[var(--royal-violet)] rounded-r-full opacity-0 group-hover:h-1/2 group-hover:opacity-100 transition-all duration-500" />

                          {/* Container Imagine Mică */}
                          <div className="relative aspect-[4/5] w-[76px] shrink-0 overflow-hidden bg-zinc-50 rounded-xl border border-black/5 z-10">
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="text-[8px] font-black text-zinc-900 uppercase tracking-widest px-2 py-1 bg-white rounded-sm shadow-sm">
                                  Sold
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Detalii */}
                          <div className="flex flex-col justify-center py-1 flex-1 text-left min-w-0 z-10">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">
                                    Evem
                                  </p>
                                  <h3 className="text-[12px] font-bold text-[var(--dark-amethyst)] leading-tight line-clamp-2 pr-2">
                                    {item.name}
                                  </h3>
                                </div>

                                <button
                                  onClick={() =>
                                    remove(user ? item.product_id : item.id)
                                  }
                                  className="text-zinc-300 hover:text-rose-500 transition-colors shrink-0"
                                  aria-label="Elimină din wishlist"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1.5 text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50 px-2 py-1 rounded-md w-fit">
                                  <AlertCircle size={10} strokeWidth={2} />{" "}
                                  Epuizat
                                </span>
                              ) : (
                                <p className="text-[13px] font-black text-[var(--dark-amethyst)]">
                                  {item.price?.toLocaleString()}{" "}
                                  <span className="text-[9px] font-bold text-zinc-400 ml-0.5">
                                    RON
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative size-24 rounded-full bg-white border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center mb-8"
                  >
                    {/* Ring glow */}
                    <div
                      className="absolute inset-0 rounded-full border border-[var(--mauve)] opacity-20 animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                    <Heart
                      size={32}
                      className="text-[var(--mauve-magic)]"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                  <p className="heading-serif text-2xl tracking-tighter text-[var(--dark-amethyst)] mb-2">
                    Selecția ta este goală
                  </p>
                  <p className="text-[10px] font-medium text-zinc-400 max-w-[240px] leading-relaxed mb-8">
                    Piesele pe care le iubești prind viață aici. Explorează colecțiile.
                  </p>
                  <button
                    onClick={onClose}
                    className="relative h-12 px-8 text-white rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group active:scale-[0.98]"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative font-black uppercase text-[10px] tracking-[0.2em]">
                      Descoperă Magia
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* --- FOOTER --- */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.footer
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  className="relative px-6 py-6 bg-white border-t border-zinc-100 shrink-0 z-20"
                >
                  <button
                    onClick={onClose}
                    className="relative h-12 w-full text-white rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group active:scale-[0.98]"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <div className="relative flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em]">
                      Continuă Cumpărăturile
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1.5 transition-transform duration-300"
                      />
                    </div>
                  </button>
                </motion.footer>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
