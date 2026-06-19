/**
 * ShoppingBag.tsx
 * Design Premium, Enterprise - Aliniat cu limbajul vizual "Atelier Suite"
 */

import { useState, useEffect, useMemo, memo } from "react";
import {
  X,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag as BagIcon,
  Truck,
  Trash2,
  Tag,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import CheckoutPopup from "./CheckoutPopup";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const ShoppingBag = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    voucher_id: string;
  } | null>(null);

  const { cart, totalPrice, updateQuantity, removeFromCart, syncCart }: any =
    useCart();

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(250);

  useEffect(() => {
    const fetchShippingConfig = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders/shipping/config`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.free_threshold) {
            setFreeShippingThreshold(Number(data.free_threshold));
          }
        }
      } catch (error) {
        console.error("Eroare la preluarea config-ului de transport:", error);
      }
    };
    fetchShippingConfig();
  }, []);

  useEffect(() => {
    const synchronizeCartPrices = async () => {
      if (!isOpen || cart.length === 0) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders/validate-stock`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cart.map((item: any) => ({ sku: item.sku }))),
          },
        );

        if (response.ok) {
          const freshData = await response.json();
          if (typeof syncCart === "function") {
            syncCart(freshData);
          }
        }
      } catch (error) {
        console.error("Eroare la sincronizarea live a coșului:", error);
      }
    };

    synchronizeCartPrices();
  }, [isOpen]);

  const remainingForFreeShipping = Math.max(
    freeShippingThreshold - totalPrice,
    0,
  );
  const shippingProgress = Math.min(
    (totalPrice / freeShippingThreshold) * 100,
    100,
  );

  const handleApplyVoucher = async () => {
    if (!promoCode.trim() || cart.length === 0) return;

    setIsValidating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          items: cart.map((item: any) => ({
            product_id: item.id,
            category_id: item.category_id,
            brand_name: item.brand_name || "",
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedDiscount({
          code: data.code,
          amount: data.discount_amount,
          voucher_id: data.voucher_id,
        });
        toast.success(`Reducere aplicată: -${data.discount_amount} RON`);
        setPromoCode("");
      } else {
        const errorMsg =
          typeof data.detail === "string"
            ? data.detail
            : "Voucherul nu poate fi aplicat acestui coș";
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("Eroare de conexiune la server");
    } finally {
      setIsValidating(false);
    }
  };

  const finalTotal = useMemo(() => {
    return Math.max(totalPrice - (appliedDiscount?.amount || 0), 0);
  }, [totalPrice, appliedDiscount]);

  const removeVoucher = () => {
    setAppliedDiscount(null);
    toast.info("Voucher eliminat");
  };

  const getImageUrl = (imageInput: any) => {
    if (!imageInput) return "";
    let data = imageInput;
    if (typeof data === "string") {
      if (data.startsWith("http")) return data;
      try {
        data = JSON.parse(data);
        if (typeof data === "string") data = JSON.parse(data);
      } catch (e) {
        return "";
      }
    }
    const source = data?.main || (Array.isArray(data) ? data[0] : data);
    return (
      source?.medium ||
      source?.small ||
      source?.large ||
      (typeof source === "string" ? source : "")
    );
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatCurrency = (val: number) =>
    val.toLocaleString("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[700] flex justify-end font-sans">
            {/* ── BACKDROP ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              className="absolute inset-0 glass-overlay cursor-pointer"
            />

            {/* ── PANOU PRINCIPAL ── */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[420px] flex-col bg-white/95 backdrop-blur-3xl shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.15)] sm:rounded-l-[2.5rem] border-l border-white overflow-hidden"
            >
              {/* Glow-uri Ambientale */}
              <div className="absolute top-0 left-0 w-full h-64 bg-[var(--mauve-magic)] opacity-5 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--royal-violet)] opacity-[0.03] blur-[100px] pointer-events-none" />

              {/* ── HEADER ── */}
              <header className="relative flex items-center justify-between px-8 py-8 border-b border-zinc-100/50 shrink-0 bg-white/50 z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={12}
                      className="text-[var(--royal-violet)]"
                    />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                      Selecția Ta
                    </p>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)] flex items-baseline gap-2">
                    Coș Cumpărături
                    <span className="text-sm font-bold text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-lg">
                      {cart.length}
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

              {/* ── PROGRESS BAR LIVRARE GRATUITĂ ── */}
              {cart.length > 0 && (
                <div className="px-6 pt-5 shrink-0 z-10">
                  <div className="p-4 bg-zinc-50/70 backdrop-blur-xl rounded-[1.25rem] border border-white shadow-sm">
                    <div className="mb-3 flex items-center justify-between font-black uppercase tracking-widest text-[8.5px]">
                      <span className="flex items-center gap-1.5 text-zinc-500">
                        <Truck
                          size={12}
                          className="text-[var(--royal-violet)]"
                        />
                        {remainingForFreeShipping === 0
                          ? "Livrare Gratuită Activă"
                          : "Livrare Standard"}
                      </span>
                      <span className="text-[var(--royal-violet)]">
                        {remainingForFreeShipping > 0
                          ? `Mai adaugă ${formatCurrency(remainingForFreeShipping)} RON`
                          : "ACTIV"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-zinc-100/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.2,
                        }}
                        className="h-full rounded-full"
                        style={{ background: "var(--primary-gradient)" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── LISTA PRODUSE ── */}
              <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar z-10">
                <LayoutGroup>
                  <motion.div layout className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {cart.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="h-[50vh] flex flex-col items-center justify-center text-center px-4"
                        >
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
                            className="relative size-24 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-8 shadow-sm"
                          >
                            <BagIcon
                              size={32}
                              strokeWidth={1.5}
                              className="text-zinc-300"
                            />
                          </motion.div>
                          <p className="text-xl font-black tracking-tight text-[var(--dark-amethyst)] mb-2">
                            Coșul tău este gol.
                          </p>
                          <p className="text-[11px] font-medium text-zinc-400 max-w-[240px] leading-relaxed mb-8">
                            Explorează colecțiile noastre și adaugă produsele
                            dorite aici.
                          </p>
                          <button
                            onClick={onClose}
                            className="relative h-12 px-8 text-white rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group active:scale-[0.98]"
                            style={{ background: "var(--primary-gradient)" }}
                          >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative font-black uppercase text-[10px] tracking-[0.2em]">
                              Înapoi la Magazin
                            </span>
                          </button>
                        </motion.div>
                      ) : (
                        cart.map((item: any, idx: number) => (
                          <motion.div
                            layout
                            key={item.sku}
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
                            className="group relative flex gap-4 p-3 bg-white/70 backdrop-blur-xl rounded-[1.25rem] border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(123,44,191,0.08)] hover:bg-white transition-all duration-300 overflow-hidden"
                          >
                            {/* Linie fină de accent în stânga */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[var(--royal-violet)] rounded-r-full opacity-0 group-hover:h-1/2 group-hover:opacity-100 transition-all duration-500" />

                            {/* Imagine mai micuță */}
                            <Link
                              to={`/product/${item.slug}`}
                              onClick={onClose}
                              className="relative aspect-[4/5] w-[80px] shrink-0 overflow-hidden bg-zinc-50 rounded-xl border border-black/5 z-10 block"
                            >
                              <img
                                src={getImageUrl(item.image_url)}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={item.name}
                              />
                            </Link>

                            {/* Detalii */}
                            <div className="flex-1 flex flex-col justify-between h-full py-1 pr-2 z-10 min-w-0">
                              <div className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] truncate">
                                    {item.brand_name || "Evem"}
                                  </p>
                                  <button
                                    onClick={() => removeFromCart(item.sku)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-50 border border-transparent text-zinc-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-colors shrink-0"
                                    aria-label="Șterge produs"
                                  >
                                    <Trash2 size={13} strokeWidth={2} />
                                  </button>
                                </div>
                                <Link
                                  to={`/product/${item.slug}`}
                                  onClick={onClose}
                                  className="text-[12px] font-bold text-[var(--dark-amethyst)] leading-tight line-clamp-2 hover:text-[var(--royal-violet)] transition-colors"
                                >
                                  {item.name}
                                </Link>
                              </div>

                              <div className="flex justify-between items-end mt-3">
                                {/* Selector Cantitate Compact */}
                                <div className="flex items-center gap-3 bg-zinc-50 rounded-[10px] px-2 py-1.5 border border-zinc-100">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                    className="p-1 disabled:opacity-20 text-zinc-400 hover:text-zinc-900 transition-colors bg-white rounded-md shadow-sm border border-black/5"
                                  >
                                    <Minus size={10} strokeWidth={2.5} />
                                  </button>
                                  <span className="text-[11px] font-black w-3 text-center text-[var(--dark-amethyst)]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors bg-white rounded-md shadow-sm border border-black/5"
                                  >
                                    <Plus size={10} strokeWidth={2.5} />
                                  </button>
                                </div>

                                {/* Preț */}
                                <div className="text-right">
                                  <p className="text-[13px] font-black tabular-nums text-[var(--dark-amethyst)]">
                                    {formatCurrency(item.price * item.quantity)}{" "}
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold ml-0.5">
                                      RON
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
              </div>

              {/* ── ZONA DE FOOTER & CHECKOUT ── */}
              {cart.length > 0 && (
                <div className="shrink-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 relative z-20">
                  {/* Zona Voucher */}
                  <div className="px-6 py-4 border-b border-zinc-50 bg-zinc-50/50">
                    {!appliedDiscount ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <Tag
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
                            size={12}
                          />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Ai un cod voucher?"
                            className="w-full h-11 pl-9 pr-3 bg-white border border-zinc-200/80 rounded-xl text-[9.5px] font-black tracking-[0.15em] focus:outline-none focus:border-[var(--royal-violet)] focus:ring-2 focus:ring-[var(--royal-violet)]/10 transition-all uppercase placeholder:text-zinc-400 placeholder:normal-case placeholder:tracking-normal text-[var(--dark-amethyst)] shadow-sm"
                          />
                        </div>
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidating || !promoCode.trim()}
                          className="px-5 h-11 bg-zinc-900 text-white text-[9.5px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:bg-zinc-800 disabled:opacity-50 shadow-md active:scale-95"
                        >
                          {isValidating ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            "Aplică"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-[10px] bg-emerald-100/50 flex items-center justify-center border border-emerald-200/50">
                            <Tag size={14} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-emerald-600 tracking-[0.2em]">
                              Reducere Activă
                            </p>
                            <p className="text-[11px] font-bold text-emerald-900 mt-0.5">
                              {appliedDiscount.code} (-
                              {formatCurrency(appliedDiscount.amount)} RON)
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeVoucher}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-transparent text-zinc-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-colors shadow-sm"
                          title="Elimină reducerea"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Total & Buton Final */}
                  <div className="px-6 py-6 pb-8">
                    <div className="flex justify-between items-end mb-6">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                          Sumar Cumpărături
                        </span>
                        <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5">
                          TVA Inclus{" "}
                          <span className="w-1 h-1 rounded-full bg-zinc-300"></span>{" "}
                          Fără taxe ascunse
                        </p>
                      </div>
                      <div className="text-right">
                        {appliedDiscount && (
                          <p className="text-[11px] font-bold text-zinc-400 line-through mb-0.5">
                            {formatCurrency(totalPrice)} RON
                          </p>
                        )}
                        <p className="text-3xl heading-serif font-medium text-[var(--dark-amethyst)] tracking-tight leading-none">
                          {formatCurrency(finalTotal)}{" "}
                          <span className="text-xs font-sans font-black ml-1 text-zinc-500">
                            RON
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        setTimeout(() => setCheckoutOpen(true), 300);
                      }}
                      className="relative h-14 w-full text-white rounded-xl overflow-hidden transition-all shadow-[0_8px_25px_rgba(123,44,191,0.25)] hover:shadow-[0_12px_30px_rgba(123,44,191,0.35)] hover:scale-[1.01] group active:scale-[0.98]"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <div className="relative flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.25em]">
                        Finalizează Comanda
                        <ArrowRight
                          size={15}
                          className="group-hover:translate-x-1.5 transition-transform duration-300"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutPopup
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart}
        discount={appliedDiscount}
      />
    </>
  );
};

export default ShoppingBag;
