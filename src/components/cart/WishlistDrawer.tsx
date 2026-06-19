/**
 * WishlistDrawer.tsx
 * Design Premium, Enterprise - Aliniat cu noul limbaj vizual
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Heart,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
    return () => {
      document.body.style.overflow = "unset";
    };
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
          {/* ── BACKDROP CU BLUR ȘI GLOW-URI ── */}
          <motion.div
            key="wishlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 overflow-hidden cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.2 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-[var(--royal-violet)] rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
              className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-[var(--mauve-magic)] rounded-full blur-[100px] pointer-events-none"
            />
          </motion.div>

          {/* ── PANOU PRINCIPAL ── */}
          <motion.div
            key="wishlist-panel"
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[420px] flex-col bg-white/95 backdrop-blur-3xl shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.15)] sm:rounded-l-[2.5rem] border-l border-white overflow-hidden"
          >
            {/* ── HEADER ── */}
            <header className="relative flex items-center justify-between px-8 py-8 border-b border-zinc-100/50 shrink-0 bg-white/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-[var(--royal-violet)]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                    Colecția Ta
                  </p>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)] flex items-baseline gap-2">
                  Wishlist
                  <span className="text-sm font-bold text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-lg">
                    {items.length}
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200/50 hover:bg-white hover:border-[var(--royal-violet)]/30 hover:text-[var(--royal-violet)] transition-all text-zinc-500 shadow-sm active:scale-95 group shrink-0"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </header>

            {/* ── CONȚINUT ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative px-6 py-6 pb-32">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center z-10">
                      <Loader2
                        size={20}
                        className="animate-spin text-[var(--royal-violet)]"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-[var(--royal-violet)]/10 animate-ping" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Se încarcă articolele...
                  </span>
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
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            x: -50,
                            scale: 0.95,
                            filter: "blur(4px)",
                          }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            delay: Math.min(idx * 0.05, 0.3),
                          }}
                          className={`group relative flex gap-4 p-3 bg-white rounded-[1.25rem] border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-300 overflow-hidden ${
                            isOutOfStock ? "opacity-60 grayscale-[0.5]" : ""
                          }`}
                        >
                          {/* Linie fină de accent în stânga */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[var(--royal-violet)] rounded-r-full opacity-0 group-hover:h-1/2 group-hover:opacity-100 transition-all duration-500" />

                          {/* Container Imagine Mică */}
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={onClose}
                            className="relative aspect-[4/5] w-[80px] shrink-0 overflow-hidden bg-zinc-50 rounded-xl border border-black/5 z-10 block"
                          >
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="text-[8px] font-black text-zinc-900 uppercase tracking-widest px-2 py-1 bg-white rounded-sm shadow-sm">
                                  Sold
                                </span>
                              </div>
                            )}
                          </Link>

                          {/* Detalii */}
                          <div className="flex flex-col justify-center py-1 flex-1 text-left min-w-0 z-10 pr-2">
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1 truncate">
                                  {item.brand_name || "Evem"}
                                </p>
                                <Link
                                  to={`/product/${item.slug}`}
                                  onClick={onClose}
                                  className="text-[12px] font-bold text-[var(--dark-amethyst)] leading-tight line-clamp-2 hover:text-[var(--royal-violet)] transition-colors"
                                >
                                  {item.name}
                                </Link>
                              </div>

                              <button
                                onClick={() =>
                                  remove(user ? item.product_id : item.id)
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-50 border border-transparent text-zinc-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-colors shrink-0"
                                aria-label="Elimină din wishlist"
                              >
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            </div>

                            <div className="mt-auto">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1.5 text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50 px-2 py-1 rounded-md w-fit">
                                  <AlertCircle size={10} strokeWidth={2} />{" "}
                                  Epuizat
                                </span>
                              ) : (
                                <p className="text-[13px] font-black tabular-nums text-[var(--dark-amethyst)]">
                                  {item.price?.toLocaleString()}{" "}
                                  <span className="text-[9px] font-bold text-zinc-400 ml-0.5 uppercase tracking-widest">
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
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative size-24 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-8"
                  >
                    <Heart
                      size={32}
                      className="text-zinc-300"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                  <p className="text-xl font-black tracking-tight text-[var(--dark-amethyst)] mb-2">
                    Nu ai nicio dorință.
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400 max-w-[240px] leading-relaxed mb-8">
                    Salvează articolele preferate apăsând pe inimioară.
                  </p>
                </div>
              )}
            </div>

            {/* ── FOOTER PLUTITOR ── */}
            <div className="absolute bottom-6 left-6 right-6 shrink-0 p-2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] z-50">
              <button
                onClick={onClose}
                className="relative h-12 w-full text-white rounded-xl overflow-hidden transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group active:scale-[0.98]"
                style={{ background: "var(--primary-gradient)" }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <div className="relative flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-[0.25em]">
                  Continuă Cumpărăturile{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
