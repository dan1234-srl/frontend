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
              className="absolute inset-0 bg-zinc-950/30 backdrop-blur-sm"
            />

            {/* Main Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[480px] flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <header className="flex items-center justify-between px-6 sm:px-10 py-8 shrink-0">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--primary-gradient)" }}
                    />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                      Coșul tău
                    </p>
                  </div>
                  <h2 className="heading-serif text-3xl tracking-tighter text-[var(--dark-amethyst)]">
                    Shopping Bag{" "}
                    <span className="text-zinc-300 font-sans text-xl ml-1">
                      ({cart.length})
                    </span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="h-12 w-12 flex items-center justify-center rounded-full border border-zinc-100 hover:border-transparent hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900 group"
                >
                  <X
                    size={18}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                </button>
              </header>

              {/* Progress Bar Livrare Gratuită */}
              {cart.length > 0 && (
                <div className="px-6 sm:px-10 pb-6 shrink-0">
                  <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                    <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                      <span className="flex items-center gap-2 text-zinc-600">
                        <Truck
                          size={14}
                          className="text-[var(--royal-violet)]"
                        />
                        {remainingForFreeShipping === 0
                          ? "Livrare Gratuită"
                          : "Livrare Standard"}
                      </span>
                      <span className="text-[var(--royal-violet)] font-black">
                        {remainingForFreeShipping > 0
                          ? `Mai adaugă ${formatCurrency(remainingForFreeShipping)} RON`
                          : "ACTIV"}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-200/60 rounded-full overflow-hidden">
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
              <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-10 custom-scrollbar">
                <LayoutGroup>
                  <motion.div layout className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {cart.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="h-[50vh] flex flex-col items-center justify-center text-center gap-6"
                        >
                          <div className="h-24 w-24 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mb-2">
                            <BagIcon size={40} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-xl heading-serif text-[var(--dark-amethyst)] mb-2">
                              Coșul tău este gol
                            </p>
                            <p className="text-xs text-zinc-400 font-medium">
                              Explorează colecțiile noastre și adaugă
                              <br />
                              produsele dorite aici.
                            </p>
                          </div>
                          <button
                            onClick={onClose}
                            className="mt-4 px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-colors"
                          >
                            Înapoi la magazin
                          </button>
                        </motion.div>
                      ) : (
                        cart.map((item: any) => (
                          <motion.div
                            layout
                            key={item.sku}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                              opacity: 0,
                              scale: 0.95,
                              filter: "blur(4px)",
                            }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-5 items-center group/item"
                          >
                            {/* Imagine */}
                            <div className="aspect-[3/4] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
                              <img
                                src={getImageUrl(item.image_url)}
                                className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/item:scale-105"
                                alt={item.name}
                              />
                            </div>

                            {/* Detalii */}
                            <div className="flex-1 flex flex-col justify-between h-full py-1">
                              <div className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest truncate">
                                    {item.brand_name || "Evem"}
                                  </p>
                                  <button
                                    onClick={() => removeFromCart(item.sku)}
                                    className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                                    aria-label="Șterge produs"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-[var(--dark-amethyst)] leading-tight line-clamp-2 pr-4">
                                  {item.name}
                                </h4>
                              </div>

                              <div className="flex justify-between items-end mt-4">
                                {/* Selector Cantitate */}
                                <div className="flex items-center gap-4 bg-zinc-50/80 rounded-full px-3 py-1.5 border border-zinc-200/50">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                    className="p-1 disabled:opacity-20 text-zinc-500 hover:text-black transition-colors"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-black w-4 text-center text-zinc-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.sku,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="p-1 text-zinc-500 hover:text-black transition-colors"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                {/* Preț per linie */}
                                <p className="text-sm font-black text-[var(--dark-amethyst)]">
                                  {formatCurrency(item.price * item.quantity)}{" "}
                                  <span className="text-[10px]">RON</span>
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
                  <div className="px-6 sm:px-10 py-5 border-b border-zinc-50">
                    {!appliedDiscount ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <Tag
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[var(--royal-violet)] transition-colors"
                            size={14}
                          />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="COD VOUCHER"
                            className="w-full h-12 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-black tracking-[0.2em] focus:outline-none focus:border-[var(--royal-violet)] focus:bg-white transition-all uppercase placeholder:text-zinc-400 text-zinc-900"
                          />
                        </div>
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidating || !promoCode.trim()}
                          className="px-6 h-12 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isValidating ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Aplică"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Tag size={12} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">
                              Voucher Activat
                            </p>
                            <p className="text-xs font-bold text-emerald-900 mt-0.5">
                              {appliedDiscount.code} (-
                              {formatCurrency(appliedDiscount.amount)} RON)
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeVoucher}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Zona de Checkout */}
                  <div className="px-6 sm:px-10 py-6 sm:py-8 bg-zinc-50/30">
                    <div className="flex justify-between items-end mb-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                          Suma totală
                        </span>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          TVA inclus
                        </p>
                      </div>
                      <div className="text-right">
                        {appliedDiscount && (
                          <p className="text-xs font-bold text-zinc-400 line-through mb-1">
                            {formatCurrency(totalPrice)} RON
                          </p>
                        )}
                        <p className="text-4xl heading-serif font-medium text-[var(--dark-amethyst)] tracking-tighter">
                          {formatCurrency(finalTotal)}{" "}
                          <span className="text-sm font-sans font-black">
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
                      className="relative h-16 w-full text-white rounded-[1.2rem] overflow-hidden transition-all shadow-xl hover:shadow-2xl group active:scale-[0.98]"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <div className="relative flex items-center justify-center gap-4 font-black uppercase text-xs tracking-[0.3em]">
                        Finalizează Comanda
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-2 transition-transform duration-300"
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
