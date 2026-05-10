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
import { motion, AnimatePresence } from "framer-motion";
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
      return parts.join(", ") || "Adresă parțială";
    } catch {
      return String(order.shipping_address);
    }
  };

  const steps = [
    { id: "PENDING", label: "Preluată" },
    { id: "PROCESSING", label: "În Atelier" },
    { id: "SHIPPED", label: "Expediată" },
    { id: "DELIVERED", label: "Livrată" },
  ];

  const statusMap: Record<string, number> = {
    PENDING: 1,
    PROCESSING: 2,
    CONFIRMED: 2,
    PAID: 2,
    SHIPPED: 3,
    DELIVERED: 4,
  };

  const currentStepIndex = statusMap[order.status?.toUpperCase()] || 1;

  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const isFinal = ["SHIPPED", "DELIVERED"].includes(
      order.status?.toUpperCase(),
    );
    const docName = isFinal ? "Factura Fiscală" : "Proforma";

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
          );
          if (!response.ok) throw new Error();
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
        } catch {
          reject();
        } finally {
          setIsDownloading(false);
        }
      }),
      {
        loading: `Se securizează documentul...`,
        success: `${docName} a fost descărcată.`,
        error: "Documentul nu este gata. Reîncercați în câteva minute.",
      },
    );
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        // FIX BULINE: Eliminat overflow-hidden, adăugat padding generos
        className="group relative bg-white border border-zinc-100 p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] flex flex-col justify-between"
      >
        <div className="absolute top-6 right-8 text-zinc-100 group-hover:text-zinc-200 transition-colors pointer-events-none">
          <Package size={80} strokeWidth={0.5} />
        </div>

        <div className="relative z-10">
          <header className="flex justify-between items-start mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* BULINA FIX: Acum are spațiu să pulseze */}
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--french-blue)] opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--french-blue)]"></span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                  ID: {order.order_number?.split("-").pop()}
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

          <div className="flex -space-x-3 mb-10 group-hover:space-x-2 transition-all duration-500">
            {order.items?.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="relative">
                <div className="size-16 rounded-full overflow-hidden border-4 border-white shadow-xl bg-zinc-50">
                  <img
                    src={getValidImageUrl(item)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                {item.quantity > 1 && (
                  <span className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] font-black size-5 rounded-full flex items-center justify-center border-2 border-white">
                    {item.quantity}
                  </span>
                )}
              </div>
            ))}
            {order.items?.length > 4 && (
              <div className="size-16 rounded-full border-4 border-white shadow-xl bg-[var(--royal-violet)] text-white flex items-center justify-center text-[10px] font-bold">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Truck size={12} className="text-[var(--french-blue)]" /> Status
                Expediție
              </span>
              <span className="text-[10px] font-bold py-1 px-3 bg-zinc-50 rounded-full text-[var(--dark-amethyst)] border border-zinc-100">
                {order.status}
              </span>
            </div>
            <div className="flex gap-1.5 h-1.5 px-1">
              {steps.map((_, i) => (
                <div key={i} className="flex-1 relative">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      background:
                        i + 1 <= currentStepIndex
                          ? "var(--primary-gradient)"
                          : "#F4F4F5",
                      opacity: i + 1 <= currentStepIndex ? 1 : 0.5,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFullDetails(true)}
            className="flex-1 h-14 rounded-2xl bg-[var(--dark-amethyst)] text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-[0.98] shadow-lg shadow-zinc-200"
          >
            Gestionare <ArrowUpRight size={14} />
          </button>
          <button
            onClick={handleDownloadDocs}
            className="size-14 rounded-2xl border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-[var(--royal-violet)] hover:border-[var(--royal-violet)] transition-all"
          >
            <Download size={18} />
          </button>
        </div>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Arhivă Comandă"
        description={order.order_number}
      >
        {/* MODAL FIX: Fundal alb solid cu layout modern */}
        <div className="space-y-8 bg-white relative z-[1001] w-full text-left overflow-hidden">
          {/* Header Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-6 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <MapPin size={12} className="text-[var(--french-blue)]" />{" "}
                Destinație Livrare
              </p>
              <div className="space-y-1">
                <p className="font-black text-base text-[var(--dark-amethyst)]">
                  {order.customer_name}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                  {getSafeAddress()}
                </p>
              </div>
            </div>
            <div className="p-6 bg-[var(--dark-amethyst)] rounded-[2.5rem] text-white flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black uppercase opacity-60">
                  Metodă Plată
                </span>
                <CreditCard size={14} className="opacity-60" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">
                {order.payment_method}
              </p>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4 px-2">
            <div className="flex justify-between items-end">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Articole Achiziționate ({order.items?.length || 0})
              </p>
              <div className="h-px flex-1 bg-zinc-100 mx-4 mb-1" />
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-5 p-4 bg-white border border-zinc-100 rounded-3xl hover:border-[var(--french-blue)]/30 transition-colors"
                >
                  <div className="size-16 rounded-2xl overflow-hidden bg-zinc-50 shrink-0">
                    <img
                      src={getValidImageUrl(item)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black uppercase text-[var(--dark-amethyst)] truncate">
                      {item.product_name || "Evem Signature"}
                    </h4>
                    <p className="text-[10px] font-bold text-[var(--french-blue)] mt-1">
                      Cantitate: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs">
                      {(
                        item.price_at_purchase || item.unit_price_at_purchase
                      )?.toLocaleString()}{" "}
                      RON
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8 bg-white">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">
                Valoare Totală
              </p>
              <p className="heading-serif text-4xl font-bold text-[var(--dark-amethyst)]">
                {order.total_amount?.toLocaleString()}{" "}
                <span className="text-sm font-sans uppercase opacity-40">
                  Ron
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadDocs}
                disabled={isDownloading}
                className="h-16 px-8 rounded-2xl bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
              >
                <Receipt size={16} />{" "}
                {["SHIPPED", "DELIVERED"].includes(order.status?.toUpperCase())
                  ? "Factură"
                  : "Proforma"}
              </button>
              <div className="h-16 px-8 rounded-2xl border border-zinc-100 flex items-center gap-3 text-zinc-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Tranzacție Securizată
                </span>
              </div>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </>
  );
};
