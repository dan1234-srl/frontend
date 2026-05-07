import {
  Truck,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  ShieldCheck,
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

  // Extracție sigură a imaginii
  const getValidImageUrl = (item: any) => {
    const source = item.product_image || item.product?.image_url;
    if (!source) return "/placeholder-jewelry.jpg";
    if (typeof source === "string" && source.startsWith("http")) return source;
    try {
      const parsed = typeof source === "string" ? JSON.parse(source) : source;
      return (
        parsed.main?.medium ||
        parsed.url ||
        parsed.medium ||
        "/placeholder-jewelry.jpg"
      );
    } catch {
      return "/placeholder-jewelry.jpg";
    }
  };

  const steps = [
    { id: "PENDING", label: "Înregistrată" },
    { id: "PROCESSING", label: "În Preparare" },
    { id: "SHIPPED", label: "Expediată" },
    { id: "DELIVERED", label: "Livrată" },
  ];

  const currentStepIndex = (() => {
    const s = order.status?.toUpperCase();
    if (s === "DELIVERED") return 4;
    if (s === "SHIPPED") return 3;
    if (["PROCESSING", "PAID", "CONFIRMED"].includes(s)) return 2;
    return 1;
  })();

  const handleDownloadDocs = () => {
    const isFinal = ["SHIPPED", "DELIVERED"].includes(
      order.status?.toUpperCase(),
    );
    toast.info(`Se generează ${isFinal ? "Factura" : "Proforma"}...`);
    window.open(`${API_BASE_URL}/api/v1/orders/${order.id}/document`, "_blank");
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group border border-zinc-100 p-8 rounded-[2.5rem] transition-all duration-500 text-left bg-white hover:shadow-2xl hover:shadow-zinc-200/50"
      >
        <header className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--royal-violet)" }}
              />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                #{order.order_number?.split("-").pop() || order.id.slice(0, 8)}
              </p>
            </div>
            <h3 className="heading-serif text-xl italic text-[var(--dark-amethyst)]">
              {new Date(order.created_at).toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>
          <div className="text-right">
            <p
              className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50"
              style={{ color: "var(--royal-violet)" }}
            >
              Total Achitat
            </p>
            <p className="heading-serif text-xl font-bold text-[var(--dark-amethyst)]">
              {order.total_amount?.toLocaleString()} RON
            </p>
          </div>
        </header>

        {/* Preview Produse */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="relative shrink-0 group/img">
              <div className="size-16 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 shadow-sm">
                <img
                  src={getValidImageUrl(item)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  alt=""
                />
              </div>
              <span
                className="absolute -top-2 -right-2 text-white text-[8px] font-black size-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                style={{ backgroundColor: "var(--dark-amethyst)" }}
              >
                {item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Bara de Progress Livrare */}
        <div className="space-y-5 mb-8">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
            <span className="flex items-center gap-2">
              <Truck size={12} style={{ color: "var(--royal-violet)" }} />{" "}
              Status Livrare
            </span>
            <span
              className="font-bold uppercase tracking-tighter"
              style={{ color: "var(--dark-amethyst)" }}
            >
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex-1 space-y-2">
                <div
                  className={`h-1 rounded-full transition-all duration-700 ${
                    i + 1 <= currentStepIndex ? "" : "bg-zinc-100"
                  }`}
                  style={{
                    background:
                      i + 1 <= currentStepIndex
                        ? "var(--primary-gradient)"
                        : undefined,
                    backgroundColor:
                      i + 1 <= currentStepIndex ? undefined : "#f4f4f5",
                  }}
                />
                <p
                  className={`text-[7px] font-black uppercase tracking-tighter text-center transition-colors ${
                    i + 1 <= currentStepIndex
                      ? "text-[var(--dark-amethyst)]"
                      : "text-zinc-300"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-2xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl hover:brightness-110"
          style={{ background: "var(--primary-gradient)" }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Detalii & Factură
          </span>
          <ChevronRight size={14} />
        </button>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Detaliu Comandă"
        description={order.order_number}
      >
        <div className="space-y-10 py-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                <MapPin size={12} style={{ color: "var(--royal-violet)" }} />{" "}
                Adresă Livrare
              </p>
              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-inner">
                <p className="font-bold text-sm text-[var(--dark-amethyst)] mb-1">
                  {order.customer_name}
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed italic">
                  {(() => {
                    try {
                      const a =
                        typeof order.shipping_address === "string"
                          ? JSON.parse(order.shipping_address)
                          : order.shipping_address;
                      return `${a.street}, ${a.city}, ${a.county}`;
                    } catch {
                      return order.shipping_address || "Adresă nespecificată";
                    }
                  })()}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                <Clock size={12} style={{ color: "var(--royal-violet)" }} />{" "}
                Logistica
              </p>
              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-3 shadow-inner">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-tighter">
                    Data
                  </span>
                  <span className="font-bold text-[var(--dark-amethyst)]">
                    {new Date(order.created_at).toLocaleDateString("ro-RO")}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-tighter">
                    Metodă
                  </span>
                  <span className="font-bold uppercase text-[var(--dark-amethyst)]">
                    {order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-tighter">
                    Curier
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    Evem Express
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              Articole achiziționate
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {order.items?.map((item: any, i: number) => {
                const name =
                  item.product_name || item.product?.name || "Bijuterie Evem";
                const price =
                  item.price_at_purchase || item.unit_price_at_purchase || 0;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-5 p-4 bg-white border border-zinc-100 rounded-[1.5rem] hover:border-[var(--royal-violet)]/30 transition-colors"
                  >
                    <div className="size-16 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 shrink-0">
                      <img
                        src={getValidImageUrl(item)}
                        className="w-full h-full object-cover"
                        alt={name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] truncate">
                        {name}
                      </h4>
                      <p
                        className="text-[10px] font-bold mt-1"
                        style={{ color: "var(--royal-violet)" }}
                      >
                        Cantitate: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-[var(--dark-amethyst)] text-sm whitespace-nowrap">
                      {price?.toLocaleString()} RON
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-zinc-100">
            <button
              onClick={handleDownloadDocs}
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all shadow-lg active:scale-95 px-8 py-4 rounded-2xl"
              style={{
                borderColor: "var(--dark-amethyst)",
                color: "var(--dark-amethyst)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--dark-amethyst)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--dark-amethyst)";
              }}
            >
              <Download size={14} />
              {["SHIPPED", "DELIVERED"].includes(order.status?.toUpperCase())
                ? "Factură Fiscală"
                : "Proformă"}
            </button>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                Total Tranzacție
              </p>
              <p
                className="heading-serif text-3xl font-bold"
                style={{ color: "var(--royal-violet)" }}
              >
                {order.total_amount?.toLocaleString()} RON
              </p>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </>
  );
};
