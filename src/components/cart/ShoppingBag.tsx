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
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />

            {/* Main Drawer - Mai micuț (max-w-[400px]) pentru o senzație mai finuță */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[400px] flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <header className="flex items-center justify-between px-6 py-6 shrink-0 border-b border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--primary-gradient)" }}
                    />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">
                      Coșul tău
                    </p>
                  </div>
                  <h2 className="heading-serif text-2xl tracking-tighter text-[var(--dark-amethyst)]">
                    Shopping Bag{" "}
                    <span className="text-zinc-300 font-sans text-lg ml-1">
                      ({cart.length})
                    </span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="h-9 w-9 flex items-center justify-center rounded-full border border-zinc-100 hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900 group"
                >
                  <X
                    size={16}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                </button>
              </header>

              {/* Progress Bar Livrare Gratuită */}
              {cart.length > 0 && (
                <div className="px-6 pt-5 shrink-0">
                  <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-100">
                    <div className="mb-2.5 flex items-center justify-between font-black uppercase tracking-widest text-[8px] sm:text-[9px]">
                      <span className="flex items-center gap-1.5 text-zinc-500">
                        <Truck
                          size={12}
                          className="text-[var(--royal-violet)]"
                        />
                        {remainingForFreeShipping === 0
                          ? "Livrare Gratuită"
                          : "Livrare Standard"}
                      </span>
                      <span className="text-[var(--royal-violet)]">
                        {remainingForFreeShipping > 0
                          ? `Mai adaugă ${formatCurrency(remainingForFreeShipping)} RON`
                          : "ACTIV"}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-200/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "var(--primary-gradient)" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Lista Produse */}
              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                <LayoutGroup>
                  <motion.div layout className="space-y-5">
                    <AnimatePresence mode="popLayout">
                      {cart.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="h-[50vh] flex flex-col items-center justify-center text-center gap-5"
                        >
                          <div className="h-20 w-20 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-2">
                            <BagIcon size={32} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-xl heading-serif text-[var(--dark-amethyst)] mb-1.5">
                              Coșul tău este gol
                            </p>
                            <p className="text-[11px] text-zinc-400 font-medium">
                              Explorează colecțiile noastre și
                              <br />
                              adaugă produsele dorite aici.
                            </p>
                          </div>
                          <button
                            onClick={onClose}
                            className="mt-3 px-6 h-10 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-zinc-800 transition-colors"
                          >
                            Înapoi la magazin
                          </button>
                        </motion.div>
                      ) : (
                        cart.map((item: any) => (
                          <motion.div
                            layout
                            key={item.sku}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                              opacity: 0,
                              scale: 0.95,
                              filter: "blur(2px)",
                            }}
                            transition={{ duration: 0.25 }}
                            className="flex gap-4 items-center group/item pb-5 border-b border-zinc-50 last:border-0 last:pb-0"
                          >
                            {/* Imagine mai micuță */}
                            <div className="aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
                              <img
                                src={getImageUrl(item.image_url)}
                                className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/item:scale-105"
                                alt={item.name}
                              />
                            </div>

                            {/* Detalii */}
                            <div className="flex-1 flex flex-col justify-between h-full py-0.5">
                              <div className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] truncate">
                                    {item.brand_name || "Evem"}
                                  </p>
                                  <button
                                    onClick={() => removeFromCart(item.sku)}
                                    className="text-zinc-300 hover:text-rose-500 transition-colors"
                                    aria-label="Șterge produs"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <h4 className="text-[12px] font-bold text-[var(--dark-amethyst)] leading-tight line-clamp-2 pr-2">
                                  {item.name}
                                </h4>
                              </div>

                              <div className="flex justify-between items-end mt-3">
                                {/* Selector Cantitate Compact */}
                                <div className="flex items-center gap-3 bg-zinc-50/80 rounded-lg px-2.5 py-1.5 border border-zinc-200/60">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                    className="p-0.5 disabled:opacity-20 text-zinc-500 hover:text-black transition-colors"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-[11px] font-black w-3 text-center text-zinc-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="p-0.5 text-zinc-500 hover:text-black transition-colors"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>

                                {/* Preț */}
                                <p className="text-[13px] font-black text-[var(--dark-amethyst)]">
                                  {formatCurrency(item.price * item.quantity)}{" "}
                                  <span className="text-[9px]">RON</span>
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

              {/* Zona de Footer & Checkout */}
              {cart.length > 0 && (
                <div className="shrink-0 border-t border-zinc-100 bg-white">
                  {/* Zona Voucher */}
                  <div className="px-6 py-4 border-b border-zinc-50">
                    {!appliedDiscount ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <Tag
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
                            size={12}
                          />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="COD VOUCHER"
                            className="w-full h-10 pl-8 pr-3 bg-zinc-50 border border-zinc-200/80 rounded-xl text-[9px] font-black tracking-[0.2em] focus:outline-none focus:border-[var(--royal-violet)] focus:ring-2 focus:ring-[var(--royal-violet)]/10 focus:bg-white transition-all uppercase placeholder:text-zinc-400 text-zinc-900"
                          />
                        </div>
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidating || !promoCode.trim()}
                          className="px-5 h-10 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isValidating ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            "Aplică"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Tag size={10} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-emerald-700 tracking-[0.2em]">
                              Voucher Activat
                            </p>
                            <p className="text-[11px] font-bold text-emerald-900 mt-0.5">
                              {appliedDiscount.code} (-
                              {formatCurrency(appliedDiscount.amount)} RON)
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeVoucher}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Zona de Checkout */}
                  <div className="px-6 py-6 bg-zinc-50/50">
                    <div className="flex justify-between items-end mb-5">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                          Suma totală
                        </span>
                        <p className="text-[9px] text-zinc-500 font-medium">
                          TVA inclus
                        </p>
                      </div>
                      <div className="text-right">
                        {appliedDiscount && (
                          <p className="text-[11px] font-bold text-zinc-400 line-through mb-0.5">
                            {formatCurrency(totalPrice)} RON
                          </p>
                        )}
                        <p className="text-3xl heading-serif font-medium text-[var(--dark-amethyst)] tracking-tight">
                          {formatCurrency(finalTotal)}{" "}
                          <span className="text-xs font-sans font-black">
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
                      className="relative h-12 w-full text-white rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group active:scale-[0.98]"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <div className="relative flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em]">
                        Spre Checkout
                        <ArrowRight
                          size={14}
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
