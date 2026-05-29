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
        console.error("Eroare la preluarea config-ului:", error);
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
        console.error("Eroare la sincronizare:", error);
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
        toast.error(
          typeof data.detail === "string" ? data.detail : "Cod invalid",
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
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
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[420px] flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <header className="flex items-center justify-between px-6 py-6 bg-white">
                <h2 className="text-sm font-semibold text-zinc-900 tracking-wide">
                  Coșul tău
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500"
                >
                  <X size={20} />
                </button>
              </header>

              {/* Progress Bar Transport */}
              {cart.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-500 mb-2">
                    <span>
                      {remainingForFreeShipping === 0
                        ? "Livrare gratuită activată"
                        : "Livrare gratuită"}
                    </span>
                    <span className="text-zinc-900">
                      {remainingForFreeShipping > 0
                        ? `${remainingForFreeShipping.toFixed(0)} RON rămași`
                        : "GRATUIT"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      className="h-full bg-zinc-900"
                    />
                  </div>
                </div>
              )}

              {/* Lista Produse */}
              <div className="flex-1 overflow-y-auto px-6 py-2">
                <LayoutGroup>
                  <motion.div layout className="space-y-6">
                    {cart.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
                        <BagIcon size={48} strokeWidth={1} />
                        <p className="mt-4 text-xs font-medium uppercase tracking-widest">
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
                          <div className="h-20 w-16 bg-zinc-100 rounded-md overflow-hidden shrink-0">
                            <img
                              src={getImageUrl(item.image_url)}
                              className="h-full w-full object-cover"
                              alt={item.name}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.sku)}
                                className="text-zinc-300 hover:text-zinc-900"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center gap-2 border rounded-full px-2 py-0.5">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.sku, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1}
                                  className="p-1 disabled:opacity-30"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-[10px] font-medium w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.sku, item.quantity + 1)
                                  }
                                  className="p-1"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <span className="text-xs font-semibold">
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
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Cod promoțional"
                        className="flex-1 h-10 px-4 text-xs bg-white border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-900 outline-none uppercase tracking-wide"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={isValidating || !promoCode}
                        className="px-4 h-10 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
                      >
                        {isValidating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Aplică"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2 bg-white border border-zinc-200 rounded-lg">
                      <span className="text-xs font-medium text-zinc-900">
                        {appliedDiscount.code}
                      </span>
                      <button
                        onClick={removeVoucher}
                        className="text-zinc-500 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-zinc-500">Total</span>
                    <span className="text-xl font-semibold text-zinc-900">
                      {finalTotal.toFixed(2)} RON
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => setCheckoutOpen(true), 300);
                    }}
                    className="w-full h-12 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Finalizează Comanda <ArrowRight size={14} />
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
