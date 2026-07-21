import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ShoppingBag,
  Mail,
  Sparkles,
  MapPin,
  Truck,
  Package,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/header/Navbar";
import { SmartImage } from "@/components/ui/smart-image";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://linea-backend-production.up.railway.app";

// Helper pentru extragerea URL-ului imaginii
const getItemDetails = (item: any) => {
  const name =
    item.product_name_at_purchase || item.product?.name || "Produs EVEM";

  const price = Number(
    item.unit_price_at_purchase || item.price_at_purchase || 0,
  );

  const brand = "EVEM";
  const quantity = Number(item.quantity || 1);

  return { name, price, brand, quantity };
};

// Helper pentru imagine
const getItemImage = (item: any) => {
  const source = item.product_image || item.product?.image_url;

  if (!source) return "/placeholder.png";

  if (typeof source === "string" && source.startsWith("http")) return source;

  try {
    const parsed = typeof source === "string" ? JSON.parse(source) : source;
    return (
      parsed?.main?.medium ||
      parsed?.url ||
      parsed?.medium ||
      "/placeholder.png"
    );
  } catch {
    return "/placeholder.png";
  }
};

const getFormattedAddress = (addrInput: any) => {
  if (!addrInput) return "Adresă indisponibilă";

  let addr = addrInput;

  if (typeof addr === "string") {
    try {
      addr = JSON.parse(addr);
    } catch {
      return addr;
    }
  }

  if (typeof addr === "object" && addr !== null) {
    if (addr.locker_name) return `${addr.locker_name}, ${addr.city}`;
    if (addr.street)
      return `${addr.street}${addr.house_number ? " " + addr.house_number : ""}, ${addr.city}, ${addr.county}`;
  }

  return "Adresă indisponibilă";
};

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id") || "N/A";
  const isSuccess = searchParams.get("success") === "true";

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Curățăm coșul doar dacă suntem pe pagina de succes
  useEffect(() => {
    if (isSuccess) clearCart();
    else navigate("/");
  }, [isSuccess, clearCart, navigate]);

  // Facem fetch la detaliile comenzii din baza de date
  useEffect(() => {
    if (!isSuccess || orderId === "N/A") return;

    let cancel = false;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!cancel) setOrder(data);
        } else {
          console.error("DEBUG: Eroare API - Status nu e OK");
        }
      } catch (err) {
        console.error("DEBUG: Eroare critică la fetch:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancel = true;
    };
  }, [orderId, isSuccess]);

  // ───────────────────── TRACKING PURCHASE (DATALAYER) ─────────────────────
  useEffect(() => {
    // Rulăm DOAR când comanda s-a încărcat complet din API și avem datele
    if (loading || !order) return;

    try {
      // Declarăm interfața globală în caz că nu există
      (window as any).dataLayer = (window as any).dataLayer || [];

      // Împingem structura standard de E-commerce dorită de Google
      (window as any).dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: order.id || orderId,
          value: Number(order.total_amount || 0),
          currency: "RON",
          tax: 0, // Poți calcula valoarea dacă e nevoie
          shipping: Number(order.shipping_fee || 0),
          items: (order.items || []).map((it: any) => {
            const details = getItemDetails(it);
            return {
              item_id: it.product?.sku || it.sku || "N/A", // Trebuie să bată cu <g:id> din feed-ul XML
              item_name: details.name,
              price: details.price,
              quantity: details.quantity,
              item_brand: details.brand,
            };
          }),
        },
      });
      console.log(
        "DEBUG: Purchase event pushed successfully to dataLayer",
        order.id,
      );
    } catch (e) {
      console.error("DEBUG: Eroare la scrierea în dataLayer:", e);
    }
  }, [loading, order, orderId]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!isSuccess) return null;

  const displayOrderId =
    orderId !== "N/A"
      ? orderId.length > 8
        ? orderId.slice(-8).toUpperCase()
        : orderId.toUpperCase()
      : "N/A";

  const items: any[] = order?.items || [];
  const subtotal = Number(order?.subtotal_amount || 0);
  const discount = Number(order?.discount_amount || 0);
  const shipping = Number(order?.shipping_fee || 0);
  const total = Number(order?.total_amount || 0);
  const deliveryType = order?.delivery_type || "courier";

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[var(--deep-twilight)] font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-32 sm:pt-40 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--french-blue,#3b82f6)] opacity-[0.03] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--deep-twilight,#0a0a0a)] opacity-[0.03] blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-3xl w-full border border-zinc-100 p-6 sm:p-10 md:p-16 bg-white/80 backdrop-blur-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.04)] rounded-[2rem] md:rounded-[3rem] text-center"
        >
          <div className="flex justify-center mb-10">
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                className="size-20 sm:size-24 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
                style={{ background: "var(--primary-gradient, #0a0a0a)" }}
              >
                <Check size={36} strokeWidth={2} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 rounded-full border-2 border-zinc-300"
              />
              <Sparkles
                size={20}
                className="absolute -top-2 -right-2 text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Comandă{" "}
              <span className="text-zinc-500 italic font-light">
                Confirmată
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold">
              Vă mulțumim pentru încredere
            </p>
          </div>

          <div className="my-10 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-100" />
            <div className="size-2 rounded-full bg-zinc-200" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10">
            <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-50/60 border border-zinc-100 text-center">
              <div className="p-3 rounded-full bg-white shadow-sm text-zinc-700">
                <ShoppingBag size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                  Număr Comandă
                </p>
                <p className="text-sm font-black">#{displayOrderId}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-50/60 border border-zinc-100 text-center">
              <div className="p-3 rounded-full bg-white shadow-sm text-zinc-700">
                {deliveryType === "locker" ? (
                  <Package size={16} />
                ) : (
                  <Truck size={16} />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                  Metodă Livrare
                </p>
                <p className="text-sm font-black">
                  {deliveryType === "locker" ? "Locker GLS" : "Curier Rapid"}
                </p>
              </div>
            </div>
          </div>

          {(loading || items.length > 0) && (
            <div className="mb-10 text-left">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">
                  Produsele tale
                </p>
                {items.length > 0 && (
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                    {items.length} {items.length === 1 ? "articol" : "articole"}
                  </p>
                )}
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-zinc-50 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it, i) => {
                    const details = getItemDetails(it);
                    return (
                      <motion.div
                        key={it.product_id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-zinc-100"
                      >
                        <div className="size-16 sm:size-20 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                          <SmartImage
                            src={getItemImage(it)}
                            alt={details.name}
                            eager
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">
                            {details.brand}
                          </p>
                          <p className="text-xs sm:text-sm font-black text-zinc-900 line-clamp-1">
                            {details.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Cantitate: {details.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-black text-zinc-900 whitespace-nowrap">
                            {(details.price * details.quantity).toLocaleString(
                              "ro-RO",
                            )}{" "}
                            RON
                          </p>
                          {details.quantity > 1 && (
                            <p className="text-[9px] text-zinc-400 mt-0.5">
                              {details.price.toLocaleString("ro-RO")} RON / buc
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {order && (
                    <div className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-3">
                      <MapPin
                        size={16}
                        className="text-zinc-400 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                          Destinație (
                          {deliveryType === "locker"
                            ? "Locker"
                            : "Adresă de livrare"}
                          )
                        </p>
                        <p className="text-xs font-semibold text-zinc-800 leading-snug">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-zinc-600 leading-snug mt-0.5">
                          {getFormattedAddress(order?.shipping_address)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order && (
                    <div className="pt-6 mt-6 border-t border-zinc-100 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">
                          Subtotal produse
                        </span>
                        <span className="font-black text-zinc-900">
                          {subtotal.toLocaleString("ro-RO")} RON
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 font-medium">
                            Voucher Reducere
                          </span>
                          <span className="font-black text-emerald-600">
                            −{discount.toLocaleString("ro-RO")} RON
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">
                          Taxă Livrare{" "}
                          {deliveryType === "locker"
                            ? "(GLS Locker)"
                            : "(Curier Rapid)"}
                        </span>
                        <span className="font-black text-zinc-900">
                          {shipping === 0
                            ? "Gratuit"
                            : `${shipping.toLocaleString("ro-RO")} RON`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-zinc-900">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">
                            Total Achitat
                          </span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">
                            TVA inclus
                          </span>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-zinc-900">
                          {total.toLocaleString("ro-RO")} RON
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto font-medium italic">
              "Detaliile fac diferența. Vom pregăti coletul cu cea mai mare
              atenție, asigurându-ne că totul este impecabil."
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/")}
                className="h-14 sm:h-16 w-full text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl flex items-center justify-center gap-3 group"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand, #0a0a0a), var(--brand-ink, #2d2d2d))",
                }}
              >
                Continuă Cumpărăturile
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </motion.button>

              {user && (
                <Link
                  to="/account/orders"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors py-2"
                >
                  Urmărește statusul comenzii
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessPage;
