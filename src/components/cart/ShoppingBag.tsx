import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import CheckoutPopup from "./CheckoutPopup";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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

  const { cart, totalPrice, updateQuantity, removeFromCart } = useCart();

  const FREE_SHIPPING = 250;
  const remainingForFreeShipping = Math.max(FREE_SHIPPING - totalPrice, 0);
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING) * 100, 100);

  /**
   * 1. Validare Voucher prin API
   * Sincronizat cu backend-ul pentru a evita erorile de tip 422 (category_id missing)
   */
  const handleApplyVoucher = async () => {
    if (!promoCode.trim() || cart.length === 0) return;

    setIsValidating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/vouchers/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          items: cart.map((item) => ({
            product_id: item.id, // Backend-ul se așteaptă la ID-ul bazei de date
            category_id: item.category_id, // TRIMITE ID-ul REAL salvat în context
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
        // Preluăm mesajul de eroare setat profesional pe backend
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

  /**
   * 2. Imagine URL Helper
   * Procesare avansată pentru a asigura randarea pozelor din orice format (S3/CloudFront)
   */
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
    let rawUrl =
      source?.medium ||
      source?.small ||
      source?.large ||
      (typeof source === "string" ? source : "");
    if (!rawUrl) return "";

    // S3 deja livrează variante optimizate (small/medium/large)
    return rawUrl;
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[700] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[460px] flex-col bg-white shadow-2xl"
            >
              <header className="flex items-center justify-between px-8 py-8 border-b border-zinc-100 bg-white">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                    Coșul tău
                  </p>
                  <p className="heading-serif text-3xl tracking-tighter text-[var(--dark-amethyst)]">
                    Shopping Bag
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 flex items-center justify-center rounded-full border border-zinc-100 hover:bg-[var(--dark-amethyst)] hover:text-white transition-all text-[var(--dark-amethyst)]"
                >
                  <X size={18} />
                </button>
              </header>

              {cart.length > 0 && (
                <div className="bg-zinc-50/50 px-8 py-5 border-b border-zinc-100">
                  <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-widest text-[10px]">
                    <span className="flex items-center gap-2">
                      <Truck size={14} className="text-[var(--royal-violet)]" />{" "}
                      {remainingForFreeShipping === 0
                        ? "Livrare Gratuită"
                        : "Livrare Standard"}
                    </span>
                    <span className="text-[var(--royal-violet)] font-black">
                      {remainingForFreeShipping > 0
                        ? `${remainingForFreeShipping.toFixed(2)} RON rămași`
                        : "ACTIV"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      className="h-full bg-[var(--royal-violet)]"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-8 py-6 luxury-scrollbar">
                <LayoutGroup>
                  <motion.div layout className="space-y-8">
                    <AnimatePresence mode="popLayout">
                      {cart.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center gap-4 opacity-40">
                          <BagIcon
                            size={40}
                            className="text-[var(--dark-amethyst)]"
                          />
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dark-amethyst)]">
                            Coșul este gol
                          </p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <motion.div
                            layout
                            key={item.sku}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex gap-6 items-center border-b border-zinc-50 pb-6 last:border-none"
                          >
                            <div className="aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100 shadow-sm">
                              <img
                                src={getImageUrl(item.image_url)}
                                className="h-full w-full object-cover"
                                alt={item.name}
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start gap-2 text-left">
                                <h4 className="text-[11px] font-black uppercase tracking-tight line-clamp-2 text-[var(--dark-amethyst)]">
                                  {item.name}
                                </h4>
                                <button
                                  onClick={() => removeFromCart(item.sku)}
                                  className="text-zinc-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 bg-zinc-50 rounded-full px-2 py-1 border border-zinc-100 shadow-sm">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                    className="p-1 disabled:opacity-20 text-[var(--dark-amethyst)] hover:scale-110 transition-transform"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-[11px] font-black w-4 text-center text-[var(--dark-amethyst)]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="p-1 text-[var(--dark-amethyst)] hover:scale-110 transition-transform"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <p className="text-xs font-black text-[var(--dark-amethyst)] tracking-tighter">
                                  {(item.price * item.quantity).toLocaleString(
                                    "ro-RO",
                                    { minimumFractionDigits: 2 },
                                  )}{" "}
                                  RON
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-zinc-100 space-y-6 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                          size={14}
                        />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="COD PROMOȚIONAL"
                          className="w-full h-12 pl-10 pr-4 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-black tracking-[0.2em] focus:outline-none focus:border-[var(--royal-violet)] focus:bg-white transition-all uppercase text-[var(--dark-amethyst)]"
                        />
                      </div>
                      <button
                        onClick={handleApplyVoucher}
                        disabled={isValidating || !promoCode.trim()}
                        className="px-6 h-12 bg-[var(--dark-amethyst)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-900/10"
                      >
                        {isValidating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Aplică"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-[var(--royal-violet)]/10 rounded-xl animate-in fade-in zoom-in duration-500">
                      <div className="flex items-center gap-3">
                        <Tag size={14} className="text-[var(--royal-violet)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--royal-violet)] tracking-widest">
                          {appliedDiscount.code} (-{appliedDiscount.amount} RON)
                        </span>
                      </div>
                      <button
                        onClick={removeVoucher}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-end border-b border-zinc-50 pb-4">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                      Total de plată
                    </span>
                    <div className="text-right">
                      {appliedDiscount && (
                        <p className="text-[10px] font-bold text-zinc-300 line-through mb-[-2px]">
                          {totalPrice.toLocaleString("ro-RO", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          RON
                        </p>
                      )}
                      <p className="text-4xl heading-serif font-medium text-[var(--dark-amethyst)] tracking-tighter">
                        {finalTotal.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        <span className="text-xs font-sans not-italic font-black">
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
                    className="relative h-16 w-full text-white rounded-2xl overflow-hidden transition-all shadow-2xl group active:scale-[0.98] border-none outline-none"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-4 font-black uppercase text-[11px] tracking-[0.5em]">
                      Checkout{" "}
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-2 transition-transform duration-300"
                      />
                    </div>
                  </button>
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
