import {
  Truck,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  CreditCard,
  Calendar,
  Package,
  X,
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

  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const isFinal = ["SHIPPED", "DELIVERED"].includes(
      order.status?.toUpperCase(),
    );

    toast.promise(
      async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Document-${order.order_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
      },
      {
        loading: "Generare document...",
        success: "Descărcat!",
        error: "Eroare la descărcare.",
      },
    );
  };

  return (
    <>
      <motion.article
        layout
        className="relative bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
        style={{ overflow: "visible" }} // REPARARE BULINĂ: Forțăm vizibilitatea
      >
        <div className="relative" style={{ overflow: "visible" }}>
          <header className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {/* BULINA - Poziționată absolut pentru a scăpa de orice overflow părinte */}
                <div className="relative w-2.5 h-2.5 flex shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[var(--royal-violet)] opacity-75"></span>
                  <span className="relative w-2.5 h-2.5 rounded-full bg-[var(--royal-violet)] shadow-[0_0_10px_rgba(123,44,191,0.5)]"></span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                  #{order.order_number?.split("-").pop()}
                </p>
              </div>
              <h3 className="heading-serif text-xl italic text-[var(--dark-amethyst)] text-left">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
            <p className="font-black text-lg text-[var(--dark-amethyst)]">
              {order.total_amount?.toLocaleString()} RON
            </p>
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
                <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black size-5 rounded-full flex items-center justify-center border-2 border-white">
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <span className="flex items-center gap-2">
                <Truck size={12} className="text-[var(--royal-violet)]" />{" "}
                Tracking
              </span>
              <span className="text-[var(--dark-amethyst)] font-bold">
                {order.status}
              </span>
            </div>
            <div className="flex gap-2 h-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className="flex-1 rounded-full bg-zinc-100 overflow-hidden"
                >
                  <div
                    className="h-full bg-[var(--primary-gradient)] transition-all duration-1000"
                    style={{ width: s <= 2 ? "100%" : "0%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-[0.98]"
        >
          Detalii Comandă <ChevronRight size={14} />
        </button>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Rezumat Achiziție"
        description={order.order_number}
      >
        {/* REPARARE TRANSPARENȚĂ: Aplicăm fundal solid forțat (opacitate 1) */}
        <div
          className="space-y-10 py-6 text-left w-full"
          style={{
            backgroundColor: "#ffffff",
            opacity: 1,
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        >
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
                {(() => {
                  try {
                    const a =
                      typeof order.shipping_address === "string"
                        ? JSON.parse(order.shipping_address)
                        : order.shipping_address;
                    return `Strada ${a.street || ""}, ${a.city || ""}, ${a.county || ""}`;
                  } catch {
                    return String(order.shipping_address);
                  }
                })()}
              </p>
            </div>

            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase">Data</span>
                <span className="font-bold">
                  {new Date(order.created_at).toLocaleDateString("ro-RO")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase">Plată</span>
                <span className="font-bold uppercase">
                  {order.payment_method}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-widest">
              Produse în Colet
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
                      Buc: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-sm text-[var(--dark-amethyst)]">
                    {item.price_at_purchase?.toLocaleString()} RON
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-8">
            <button
              onClick={handleDownloadDocs}
              disabled={isDownloading}
              className="w-full sm:w-auto h-16 px-10 rounded-2xl border-2 border-zinc-900 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50"
            >
              <Download size={16} />
              {["SHIPPED", "DELIVERED"].includes(order.status?.toUpperCase())
                ? "Factură"
                : "Proformă"}
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest mb-1">
                Total Achitat
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
