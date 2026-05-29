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

  const { cart, totalPrice, updateQuantity, removeFromCart, syncCart }: any =
    useCart();
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(250);

  // --- LOGICĂ ---
  useEffect(() => {
    const fetchShippingConfig = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders/shipping/config`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.free_threshold)
            setFreeShippingThreshold(Number(data.free_threshold));
        }
      } catch (error) {
        console.error("Eroare config:", error);
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
          if (typeof syncCart === "function") syncCart(freshData);
        }
      } catch (error) {
        console.error("Eroare sync:", error);
      }
    };
    synchronizeCartPrices();
  }, [isOpen]);

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
        toast.error(
          typeof data.detail === "string" ? data.detail : "Voucher invalid",
        );
      }
    } catch {
      toast.error("Eroare de conexiune");
    } finally {
      setIsValidating(false);
    }
  };

  const finalTotal = useMemo(
    () => Math.max(totalPrice - (appliedDiscount?.amount || 0), 0),
    [totalPrice, appliedDiscount],
  );
  const removeVoucher = () => setAppliedDiscount(null);

  const getImageUrl = (imageInput: any) => {
    if (!imageInput) return "";
    try {
      const data =
        typeof imageInput === "string" ? JSON.parse(imageInput) : imageInput;
      const source = data?.main || (Array.isArray(data) ? data[0] : data);
      return source?.medium || source?.small || source || "";
    } catch {
      return "";
    }
  };

  const remainingForFreeShipping = Math.max(
    freeShippingThreshold - totalPrice,
    0,
  );
  const shippingProgress = Math.min(
    (totalPrice / freeShippingThreshold) * 100,
    100,
  );

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
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[420px] flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <header className="flex items-center justify-between px-8 py-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                    Coșul tău
                  </p>
                  <p className="heading-serif text-2xl tracking-tighter text-[var(--dark-amethyst)]">
                    Shopping Bag
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900"
                >
                  <X size={18} />
                </button>
              </header>

              {/* Progress Transport */}
              {cart.length > 0 && (
                <div className="px-8 pb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dark-amethyst)]">
                      <Truck size={14} className="text-[var(--royal-violet)]" />
                      {remainingForFreeShipping === 0
                        ? "Livrare Gratuită"
                        : "Transport"}
                    </span>
                    <span className="text-[10px] font-black text-[var(--royal-violet)]">
                      {remainingForFreeShipping > 0
                        ? `${remainingForFreeShipping.toFixed(0)} RON rămase`
                        : "ACTIV"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      className="h-full bg-[var(--royal-violet)]"
                    />
                  </div>
                </div>
              )}

              {/* Lista Produse */}
              <div className="flex-1 overflow-y-auto px-8">
                <LayoutGroup>
                  <motion.div layout className="space-y-6">
                    {cart.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-zinc-300">
                        <BagIcon size={40} strokeWidth={1} />
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest">
                          Coșul este gol
                        </p>
                      </div>
                    ) : (
                      cart.map((item: any) => (
                        <motion.div
                          layout
                          key={item.sku}
                          className="flex gap-4 items-center"
                        >
                          <div className="h-20 w-16 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100">
                            <img
                              src={getImageUrl(item.image_url)}
                              className="h-full w-full object-cover"
                              alt={item.name}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-[11px] font-bold text-[var(--dark-amethyst)] uppercase line-clamp-1">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.sku)}
                                className="text-zinc-300 hover:text-red-500"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center bg-zinc-50 rounded-full px-2 py-0.5 border border-zinc-100">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.sku, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1}
                                  className="p-1 text-[var(--dark-amethyst)] disabled:opacity-30"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-[10px] font-black w-4 text-center text-[var(--dark-amethyst)]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.sku, item.quantity + 1)
                                  }
                                  className="p-1 text-[var(--dark-amethyst)]"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <span className="text-[11px] font-black text-[var(--dark-amethyst)]">
                                {(item.price * item.quantity).toFixed(2)} RON
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </LayoutGroup>
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-8 border-t border-zinc-50 bg-white space-y-6">
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="COD PROMO"
                        className="flex-1 h-12 px-4 text-[10px] bg-zinc-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--royal-violet)] uppercase tracking-widest font-bold text-[var(--dark-amethyst)]"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={isValidating || !promoCode.trim()}
                        className="px-6 h-12 bg-[var(--dark-amethyst)] text-white text-[10px] font-black rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {isValidating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "APLICĂ"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 bg-[var(--royal-violet)]/5 border border-[var(--royal-violet)]/10 rounded-xl">
                      <span className="text-[10px] font-black text-[var(--royal-violet)] uppercase tracking-widest">
                        {appliedDiscount.code} (-{appliedDiscount.amount} RON)
                      </span>
                      <button
                        onClick={removeVoucher}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                      Total
                    </span>
                    <span className="text-2xl font-medium text-[var(--dark-amethyst)] tracking-tighter">
                      {finalTotal.toFixed(2)}{" "}
                      <span className="text-[10px] font-sans font-black">
                        RON
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => setCheckoutOpen(true), 300);
                    }}
                    className="w-full h-14 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-transform active:scale-[0.98]"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    Finalizează comanda
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
