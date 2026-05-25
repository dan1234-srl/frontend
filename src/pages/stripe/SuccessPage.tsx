import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ShoppingBag, Mail, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/header/Navbar";
import { SmartImage } from "@/components/ui/smart-image";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://linea-backend-production.up.railway.app";

const getItemImage = (item: any) => {
  const source = item.product_image || item.product?.image_url;
  if (!source) return "/placeholder.png";
  if (typeof source === "string") {
    if (source.startsWith("http")) return source;
    try {
      const parsed = JSON.parse(source);
      return (
        parsed?.main?.medium ||
        parsed?.url ||
        parsed?.medium ||
        "/placeholder.png"
      );
    } catch {
      return "/placeholder.png";
    }
  }
  return (
    source?.main?.medium || source?.url || source?.medium || "/placeholder.png"
  );
};

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id") || "N/A";
  const isSuccess = searchParams.get("success") === "true";

  const [order, setOrder] = useState<any | null>(null);
  const [itemsWithNames, setItemsWithNames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuccess) clearCart();
    else navigate("/");
  }, [isSuccess, clearCart, navigate]);

  useEffect(() => {
    if (!isSuccess || orderId === "N/A") return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);

          // 🚀 AUTO-POPULARE NUME PRODUSE
          if (data.items) {
            const updated = await Promise.all(
              data.items.map(async (item: any) => {
                if (item.product_name) return item;
                try {
                  const pRes = await fetch(
                    `${API_BASE_URL}/api/v1/products/${item.product_id}`,
                  );
                  const pData = await pRes.json();
                  return {
                    ...item,
                    product_name: pData.name || "Produs fără nume",
                  };
                } catch {
                  return { ...item, product_name: "Produs fără nume" };
                }
              }),
            );
            setItemsWithNames(updated);
          }
        }
      } catch (err) {
        console.error("Eroare fetch:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, isSuccess]);

  if (!isSuccess) return null;

  const displayOrderId =
    orderId.length > 8
      ? orderId.slice(-8).toUpperCase()
      : orderId.toUpperCase();
  const subtotal = Number(order?.subtotal_amount || 0);
  const discount = Number(order?.discount_amount || 0);
  const shipping = Number(order?.shipping_fee || 0);
  const total = Number(order?.total_amount || order?.total || 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-4 pt-28 pb-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full p-10 bg-white/80 backdrop-blur-xl shadow-xl rounded-[2rem] text-center"
        >
          {/* Header Succes */}
          <div className="mb-10 flex justify-center">
            <div
              className="size-20 rounded-full flex items-center justify-center text-white"
              style={{ background: "var(--primary-gradient)" }}
            >
              <Check size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
            Comandă Confirmată
          </h1>

          {/* Lista Produse */}
          <div className="text-left space-y-3 mb-10">
            {itemsWithNames.map((it, i) => (
              <div
                key={it.id || i}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-zinc-100"
              >
                <div className="size-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                  <SmartImage
                    src={getItemImage(it)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black">{it.product_name}</p>
                  <p className="text-[10px] text-zinc-400">
                    Cantitate: {it.quantity}
                  </p>
                </div>
                <p className="font-black">
                  {(Number(it.price_at_purchase) * it.quantity).toLocaleString(
                    "ro-RO",
                  )}{" "}
                  RON
                </p>
              </div>
            ))}
          </div>

          {/* Totale */}
          <div className="border-t border-zinc-100 pt-6 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString("ro-RO")} RON</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Livrare</span>
              <span>
                {shipping > 0
                  ? `${shipping.toLocaleString("ro-RO")} RON`
                  : "Gratuit"}
              </span>
            </div>
            <div className="flex justify-between text-lg font-black pt-2">
              <span>Total</span>
              <span>{total.toLocaleString("ro-RO")} RON</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-10 h-14 w-full bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Continuă Cumpărăturile
          </button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessPage;
