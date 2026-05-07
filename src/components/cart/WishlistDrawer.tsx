import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  ShoppingBag as BagIcon,
  Heart,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback, useMemo } from "react";
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
              onClick={onClose}
              className="absolute inset-0 bg-black/20 backdrop-blur-[8px]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative z-[701] flex h-full w-full sm:max-w-[480px] flex-col bg-white shadow-luxe"
            >
              <header className="px-8 sm:px-12 py-10 flex items-end justify-between border-b border-zinc-50">
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Articole Salvate
                  </span>
                  <h2 className="heading-serif text-4xl italic text-[var(--dark-amethyst)]">
                    Wishlist{" "}
                    <span className="text-xl font-normal not-italic ml-2 opacity-40">
                      ({items.length})
                    </span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="size-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar px-8 sm:px-12 py-8">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-zinc-300" size={30} />
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-10">
                    {items.map((item, idx) => {
                      const isOutOfStock =
                        item.stock_quantity <= 0 || !item.is_active;

                      return (
                        <motion.div
                          key={item.id || item.product_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group relative flex gap-6 ${isOutOfStock ? "opacity-70" : ""}`}
                        >
                          <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-zinc-50 rounded-[20px]">
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={item.name}
                              className={`h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? "grayscale-[0.5]" : ""}`}
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <span className="bg-black text-white text-[8px] font-black uppercase px-2 py-1 rotate-[-10deg]">
                                  Epuizat
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-between py-2 flex-1 text-left">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--dark-amethyst)] leading-tight">
                                  {item.name}
                                </h3>
                                <button
                                  onClick={() =>
                                    remove(
                                      user ? item.product_id : item.id,
                                      item.name,
                                    )
                                  }
                                  className="text-zinc-300 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 size={16} strokeWidth={1.5} />
                                </button>
                              </div>
                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                  <AlertCircle size={10} /> Indisponibil
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                  În stoc
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <span className="text-base font-bold text-[var(--french-blue)]">
                                {item.price?.toLocaleString()} RON
                              </span>
                              {!isOutOfStock && (
                                <button
                                  onClick={() => moveToCart(item)}
                                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] group/btn"
                                >
                                  Adaugă în coș
                                  <ArrowRight
                                    size={14}
                                    className="transition-transform group-hover/btn:translate-x-1"
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="size-20 rounded-full bg-zinc-50 flex items-center justify-center">
                      <Heart
                        size={30}
                        className="text-zinc-200"
                        strokeWidth={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="heading-serif text-2xl italic">
                        Selecția ta este goală
                      </p>
                      <p className="text-xs text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                        Explorează noile colecții și salvează piesele preferate
                        aici.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-8 py-4 bg-[var(--dark-amethyst)] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                    >
                      Începe Explorarea
                    </button>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <footer className="p-8 sm:p-12 bg-white border-t border-zinc-50">
                  <button
                    onClick={onClose}
                    className="w-full h-16 rounded-full text-white flex items-center justify-center gap-4 transition-all hover:brightness-110 active:scale-[0.98] shadow-2xl"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                      Continuă Cumpărăturile
                    </span>
                    <ArrowRight size={18} />
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
