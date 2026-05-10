import {
  Truck,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  CreditCard,
  Calendar,
  Package,
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

  // Helper Adresă Safe (Previne crash-ul dacă adresa e obiect)
  const getSafeAddress = () => {
    try {
      if (!order.shipping_address) return "Adresă indisponibilă";
      const a =
        typeof order.shipping_address === "string"
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
      if (typeof a !== "object") return String(order.shipping_address);
      return `Strada ${a.street || ""}, ${a.city || ""}, ${a.county || ""}`;
    } catch {
      return String(order.shipping_address);
    }
  };

  const currentStepIndex = (() => {
    const s = order.status?.toUpperCase() || "";
    if (s === "DELIVERED") return 4;
    if (s === "SHIPPED") return 3;
    if (["PROCESSING", "PAID", "CONFIRMED"].includes(s)) return 2;
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
      async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
        );
        if (!response.ok) throw new Error("Documentul nu este disponibil.");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${docName}-${order.order_number}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloading(false);
      },
      {
        loading: `Se generează ${docName}...`,
        success: `${docName} descărcată.`,
        error: () => {
          setIsDownloading(false);
          return "Eroare la descărcare.";
        },
      },
    );
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // pt-10 repară bulina tăiată
        className="group border border-zinc-100 p-6 md:p-8 pt-10 rounded-[2.5rem] transition-all duration-500 bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col justify-between relative"
      >
        <div>
          <header className="flex justify-between items-start mb-8 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--royal-violet)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--royal-violet)]"></span>
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  #{order.order_number?.split("-").pop()}
                </p>
              </div>
              <h3 className="heading-serif text-xl italic text-[var(--dark-amethyst)]">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mb-1">
                Total
              </p>
              <p className="font-black text-lg text-[var(--dark-amethyst)]">
                {order.total_amount?.toLocaleString()} RON
              </p>
            </div>
          </header>

          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="relative shrink-0">
                <div className="size-14 rounded-2xl overflow-hidden border border-zinc-50 bg-zinc-50 shadow-inner">
                  <img
                    src={getValidImageUrl(item)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <span className="absolute -top-2 -right-2 bg-[var(--dark-amethyst)] text-white text-[8px] font-black size-5 rounded-full flex items-center justify-center border-2 border-white">
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
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1">
                  <div
                    className="h-1 rounded-full transition-all duration-1000"
                    style={{
                      background:
                        step <= currentStepIndex
                          ? "var(--primary-gradient)"
                          : "#F4F4F5",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "var(--primary-gradient)" }}
        >
          Detalii Comandă <ChevronRight size={14} />
        </button>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Detalii Achiziție"
        description={order.order_number}
      >
        {/* FIX TRANSPARENȚĂ: bg-white și z-index forțat */}
        <div className="space-y-8 py-4 bg-white rounded-b-[2.5rem] relative z-[1001] text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <MapPin size={12} className="text-[var(--royal-violet)]" />{" "}
                Livrare
              </p>
              <p className="font-black text-sm text-[var(--dark-amethyst)]">
                {order.customer_name}
              </p>
              <p className="text-xs text-zinc-500 italic mt-1 leading-relaxed">
                {getSafeAddress()}
              </p>
            </div>

            <div className="p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col justify-center gap-3">
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

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase text-zinc-400 ml-2">
              Articole
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-[1.5rem]"
                >
                  <img
                    src={getValidImageUrl(item)}
                    className="size-14 rounded-2xl object-cover shadow-sm"
                    alt=""
                  />
                  <div className="flex-1">
                    <h4 className="text-[11px] font-black uppercase text-[var(--dark-amethyst)] line-clamp-1">
                      {item.product_name || "Bijuterie Evem"}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--royal-violet)]">
                      Buc: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-xs">
                    {(
                      item.price_at_purchase || item.unit_price_at_purchase
                    )?.toLocaleString()}{" "}
                    RON
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white">
            <button
              onClick={handleDownloadDocs}
              disabled={isDownloading}
              className="w-full sm:w-auto h-16 px-10 rounded-2xl border-2 border-[var(--dark-amethyst)] text-[var(--dark-amethyst)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[var(--dark-amethyst)] hover:text-white transition-all disabled:opacity-50 shadow-sm"
            >
              <Download size={16} />
              {["SHIPPED", "DELIVERED"].includes(order.status?.toUpperCase())
                ? "Factură Fiscală"
                : "Proformă PDF"}
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mb-1">
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
