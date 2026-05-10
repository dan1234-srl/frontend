import {
  Truck,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  CreditCard,
  Calendar,
  Package,
  ShieldCheck,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { LuxuryModal } from "@/components/ui/luxury-modal";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

export const OrderItem = ({ order }: any) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getValidImageUrl = (item: any) => {
    const source = item.product_image || item.product?.image_url;
    if (!source) return "/placeholder-jewelry.jpg";
    if (typeof source === "string" && source.startsWith("http")) return source;
    try {
      const parsed = typeof source === "string" ? JSON.parse(source) : source;
      return parsed?.main?.medium || parsed?.url || "/placeholder-jewelry.jpg";
    } catch {
      return "/placeholder-jewelry.jpg";
    }
  };

  const getSafeAddress = () => {
    try {
      if (!order.shipping_address) return "Adresă indisponibilă";
      const a =
        typeof order.shipping_address === "string"
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
      if (typeof a !== "object") return String(order.shipping_address);
      const parts = [a.street, a.city, a.county].filter(Boolean);
      return parts.join(", ") || "Adresă nespecificată";
    } catch {
      return String(order.shipping_address);
    }
  };

  const currentStepIndex = (() => {
    const s = order.status?.toUpperCase() || "";
    if (s === "DELIVERED") return 4;
    if (s === "SHIPPED") return 3;
    if (["PROCESSING", "CONFIRMED", "PAID"].includes(s)) return 2;
    return 1;
  })();

  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const isFinal = ["SHIPPED", "DELIVERED"].includes(
      order.status?.toUpperCase(),
    );
    const docName = isFinal ? "Factura" : "Proforma";

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
            {
              method: "GET",
              // FIX PENTRU EROAREA 401: Trimite cookie-urile de sesiune
              credentials: "include",
              headers: {
                Accept: "application/pdf",
              },
            },
          );

          if (response.status === 401)
            throw new Error(
              "Sesiune expirată. Vă rugăm să vă reautentificați.",
            );
          if (!response.ok) throw new Error("Documentul nu este generat încă.");

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${docName}-${order.order_number}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
          resolve(true);
        } catch (err: any) {
          reject(err);
        } finally {
          setIsDownloading(false);
        }
      }),
      {
        loading: `Se pregătește ${docName}...`,
        success: `${docName} a fost descărcată.`,
        error: (err) => err.message || "Eroare la descărcare.",
      },
    );
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white border border-zinc-100 p-8 pt-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 flex flex-col justify-between"
      >
        <div className="relative z-10 text-left">
          <header className="flex justify-between items-start mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--royal-violet)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--royal-violet)]"></span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                  #{order.order_number?.split("-").pop()}
                </p>
              </div>
              <h3 className="heading-serif text-2xl italic text-[var(--dark-amethyst)]">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
          </header>

          <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="relative shrink-0">
                <div className="size-16 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                  <img
                    src={getValidImageUrl(item)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black size-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <span className="flex items-center gap-2">
                <Truck size={12} className="text-[var(--royal-violet)]" />{" "}
                Expediție
              </span>
              <span className="text-[var(--dark-amethyst)] font-bold">
                {order.status}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className="flex-1 h-1.5 rounded-full bg-zinc-100 relative overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: step <= currentStepIndex ? "100%" : "0%",
                    }}
                    className="h-full"
                    style={{ background: "var(--primary-gradient)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-[0.98] shadow-lg"
        >
          Detalii Achiziție <ChevronRight size={14} />
        </button>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Informații Comandă"
        description={order.order_number}
      >
        {/* MODAL FIX: bg-white pur, z-index ridicat, fara blur */}
        <div className="space-y-10 py-4 bg-white relative z-50 text-left w-full overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2">
                <MapPin size={12} className="text-[var(--royal-violet)]" />{" "}
                Adresa Livrare
              </p>
              <p className="font-black text-base text-[var(--dark-amethyst)]">
                {order.customer_name}
              </p>
              <p className="text-xs text-zinc-500 italic mt-2 leading-relaxed">
                {getSafeAddress()}
              </p>
            </div>

            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase flex items-center gap-2">
                  <Calendar size={12} className="text-[var(--royal-violet)]" />{" "}
                  Data
                </span>
                <span className="font-bold">
                  {new Date(order.created_at).toLocaleDateString("ro-RO")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase flex items-center gap-2">
                  <CreditCard
                    size={12}
                    className="text-[var(--royal-violet)]"
                  />{" "}
                  Plată
                </span>
                <span className="font-bold uppercase">
                  {order.payment_method}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-widest">
              Produse Selectate
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-5 p-5 bg-white border border-zinc-100 rounded-[2rem]"
                >
                  <img
                    src={getValidImageUrl(item)}
                    className="size-16 rounded-2xl object-cover shadow-sm shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black uppercase text-[var(--dark-amethyst)] truncate">
                      {item.product_name || "Bijuterie Evem"}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--royal-violet)] mt-1">
                      Cantitate: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-sm text-[var(--dark-amethyst)]">
                    {(
                      item.price_at_purchase || item.unit_price_at_purchase
                    )?.toLocaleString()}{" "}
                    RON
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-8 bg-white">
            <button
              onClick={handleDownloadDocs}
              disabled={isDownloading}
              className="w-full sm:w-auto h-16 px-10 rounded-2xl border-2 border-zinc-900 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50"
            >
              <Download size={16} />
              {["SHIPPED", "DELIVERED"].includes(order.status?.toUpperCase())
                ? "Descarcă Factura"
                : "Descarcă Proforma"}
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest mb-1">
                Total Plată
              </p>
              <p className="heading-serif text-4xl font-bold text-[var(--dark-amethyst)]">
                {order.total_amount?.toLocaleString()} RON
              </p>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </>
  );
};
