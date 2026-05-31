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

  // Ștergere directă, fără popup
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
            className="relative z-[701] flex h-full w-full sm:max-w-[420px] flex-col bg-[var(--background)] shadow-luxe"
          >
            {/* --- HEADER --- */}
            <header className="px-6 sm:px-10 py-8 flex items-center justify-between border-b border-zinc-100/80 bg-white">
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Selecția Ta
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif italic text-[var(--dark-amethyst)] leading-none tracking-tight">
                  Wishlist
                  <span className="text-sm font-sans font-medium not-italic ml-2 opacity-40">
                    ({items.length})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="size-10 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-[var(--dark-amethyst)] hover:text-white hover:border-[var(--dark-amethyst)] transition-all duration-300"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </header>

            {/* --- BODY --- */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-8 py-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2
                    className="animate-spin text-[var(--royal-violet)]"
                    size={28}
                  />
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, idx) => {
                    const isOutOfStock =
                      item.stock_quantity <= 0 || !item.is_active;

                    return (
                      <motion.div
                        key={item.id || item.product_id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.4 }}
                        className={`group relative flex gap-4 sm:gap-5 p-3.5 bg-white rounded-2xl border border-zinc-100/60 shadow-soft hover:shadow-elevated transition-all duration-300 ${
                          isOutOfStock ? "opacity-60 grayscale-[0.2]" : ""
                        }`}
                      >
                        {/* Container Imagine Mică */}
                        <div className="relative aspect-[4/5] w-[72px] sm:w-[84px] shrink-0 overflow-hidden bg-zinc-50 rounded-xl border border-black/5">
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="text-[8px] font-black text-zinc-900 uppercase tracking-widest px-2 py-1 bg-white/90 rounded-sm shadow-sm">
                                Sold
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Detalii */}
                        <div className="flex flex-col justify-center py-1 flex-1 text-left min-w-0">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-3">
                              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--dark-amethyst)] leading-snug truncate pr-2">
                                {item.name}
                              </h3>
                              <button
                                onClick={() =>
                                  remove(user ? item.product_id : item.id)
                                }
                                className="text-zinc-300 hover:text-rose-500 transition-colors p-1 -mr-1 -mt-1 shrink-0"
                                aria-label="Elimină din wishlist"
                              >
                                <Trash2 size={15} strokeWidth={1.5} />
                              </button>
                            </div>

                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                <AlertCircle size={10} strokeWidth={2} />{" "}
                                Epuizat
                              </span>
                            ) : (
                              <span className="block text-[13px] font-bold text-zinc-500">
                                {item.price?.toLocaleString()} RON
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="size-20 rounded-full bg-white border border-zinc-100 shadow-soft flex items-center justify-center mb-6"
                  >
                    <Heart
                      size={28}
                      className="text-[var(--royal-violet)] opacity-80"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                  <p className="text-2xl font-serif italic text-[var(--dark-amethyst)] mb-3">
                    Selecția ta este goală
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-[220px] uppercase tracking-wider leading-relaxed mb-8">
                    Explorează colecțiile și salvează piesele care te inspiră.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3.5 bg-[var(--dark-amethyst)] text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[var(--royal-violet)] transition-colors duration-300 shadow-elevated active:scale-95"
                  >
                    Începe Explorarea
                  </button>
                </div>
              )}
            </div>

            {/* --- FOOTER --- */}
            {items.length > 0 && (
              <footer className="p-6 sm:p-8 bg-white border-t border-zinc-100 shrink-0">
                <button
                  onClick={onClose}
                  className="w-full h-14 rounded-xl text-white flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-[0.98] shadow-elevated bg-luxury-gradient"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Continuă Cumpărăturile
                  </span>
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
