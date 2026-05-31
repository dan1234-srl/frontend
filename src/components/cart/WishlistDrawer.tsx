import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  ShoppingBag as BagIcon,
  Heart,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const remove = async (productId: string, name: string) => {
    const ok = await confirm({
      eyebrow: "Favorite",
      title: "Elimini selecția?",
      description: `"${name}" va fi retras din lista ta de dorințe.`,
      tone: "destructive",
      confirmLabel: "Elimină",
    });

    if (!ok) return;

    if (user) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/wishlist/toggle/${productId}`, {
          method: "POST",
          credentials: "include",
        });
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
      } catch (err) {
        toast.error("Eroare la server.");
      }
    } else {
      const updated = items.filter((i) => (i.product_id || i.id) !== productId);
      setItems(updated);
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
    }
    toast.success("Articol eliminat.");
  };

  const moveToCart = (product: any) => {
    const isOutOfStock = product.stock_quantity <= 0 || !product.is_active;
    if (isOutOfStock) {
      toast.error("Acest produs nu mai este disponibil.");
      return;
    }
    addToCart(product);
    remove(user ? product.product_id : product.id, product.name);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[700] flex justify-end font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative z-[701] flex h-full w-full sm:max-w-[440px] flex-col bg-white shadow-2xl"
            >
              {/* --- HEADER --- */}
              <header className="px-8 sm:px-10 py-8 flex items-center justify-between border-b border-zinc-100 shrink-0 bg-white z-10">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Selecția Ta
                  </span>
                  <h2 className="heading-serif text-3xl italic text-[var(--dark-amethyst)] leading-none">
                    Wishlist
                    <sup className="text-sm font-sans font-medium not-italic ml-1.5 opacity-50">
                      {items.length}
                    </sup>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="size-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all duration-300"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </header>

              {/* --- BODY --- */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-10 py-6 bg-[#fcfbfe]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2
                      className="animate-spin text-[var(--dark-amethyst)]"
                      size={24}
                    />
                  </div>
                ) : items.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {items.map((item, idx) => {
                      const isOutOfStock =
                        item.stock_quantity <= 0 || !item.is_active;

                      return (
                        <motion.div
                          key={item.id || item.product_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.4 }}
                          className={`group relative flex gap-5 p-4 rounded-2xl bg-white border border-zinc-100/50 hover:border-zinc-200 hover:shadow-sm transition-all duration-300 ${
                            isOutOfStock ? "opacity-60" : ""
                          }`}
                        >
                          {/* Imagine Mică & Elegantă */}
                          <div className="relative aspect-[4/5] w-[76px] sm:w-[88px] shrink-0 overflow-hidden bg-zinc-50 rounded-xl border border-black/5">
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={item.name}
                              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                                isOutOfStock ? "grayscale-[0.5]" : ""
                              }`}
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[8px] font-black text-black uppercase tracking-widest px-2 py-1 bg-white/90 rounded-sm">
                                  Sold
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Detalii Produs */}
                          <div className="flex flex-col flex-1 py-0.5 justify-between text-left">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start gap-3">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 leading-snug line-clamp-2 pr-2">
                                  {item.name}
                                </h3>
                                <button
                                  onClick={() =>
                                    remove(
                                      user ? item.product_id : item.id,
                                      item.name,
                                    )
                                  }
                                  className="text-zinc-300 hover:text-rose-500 transition-colors p-1 -mr-1 -mt-1"
                                >
                                  <Trash2 size={14} strokeWidth={2} />
                                </button>
                              </div>

                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                  <AlertCircle size={10} strokeWidth={2.5} />{" "}
                                  Indisponibil
                                </span>
                              ) : (
                                <span className="text-[13px] font-bold text-zinc-500">
                                  {item.price?.toLocaleString()} RON
                                </span>
                              )}
                            </div>

                            {/* Acțiuni */}
                            {!isOutOfStock && (
                              <div className="mt-3 flex items-center">
                                <button
                                  onClick={() => moveToCart(item)}
                                  className="flex items-center justify-center gap-2 px-4 py-2 w-full bg-zinc-50 text-[9px] font-black uppercase tracking-widest text-zinc-900 rounded-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300 active:scale-[0.98]"
                                >
                                  Mută în coș
                                  <BagIcon size={12} className="opacity-70" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 5, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="size-20 rounded-full border border-zinc-100 bg-white shadow-sm flex items-center justify-center mb-6"
                    >
                      <Heart
                        size={24}
                        className="text-zinc-300"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <p className="heading-serif text-2xl italic text-zinc-800 mb-2">
                      Nu ai salvat nimic încă
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-[220px] uppercase tracking-wider leading-relaxed mb-8">
                      Găsește piesele care te inspiră și adaugă-le aici pentru
                      mai târziu.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-8 py-3.5 border border-zinc-200 text-zinc-900 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 active:scale-95"
                    >
                      Explorează Colecția
                    </button>
                  </div>
                )}
              </div>

              {/* --- FOOTER --- */}
              {items.length > 0 && (
                <footer className="p-6 sm:p-8 bg-white border-t border-zinc-100 shrink-0">
                  <button
                    onClick={onClose}
                    className="w-full h-14 rounded-xl bg-zinc-950 text-white flex items-center justify-center gap-3 transition-all hover:bg-zinc-800 active:scale-[0.98] shadow-xl shadow-zinc-950/10"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Continuă Cumpărăturile
                    </span>
                  </button>
                </footer>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {ConfirmDialog}
    </>
  );
};

export default WishlistDrawer;
