import {
  Truck,
  MapPin,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Calendar,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
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
    if (!source) return "/placeholder-product.jpg";
    if (typeof source === "string" && source.startsWith("http")) return source;
    try {
      const parsed = typeof source === "string" ? JSON.parse(source) : source;
      return (
        parsed?.main?.medium ||
        parsed?.url ||
        parsed?.medium ||
        "/placeholder-product.jpg"
      );
    } catch {
      return "/placeholder-product.jpg";
    }
  };

  const getSafeAddress = () => {
    try {
      if (!order.shipping_address) return "Adresă nespecificată";
      const a =
        typeof order.shipping_address === "string"
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
      if (typeof a !== "object") return String(order.shipping_address);
      return `${a.street || ""}, ${a.city || ""}, ${a.county || ""}`;
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

  // 🚀 REPARAT ATOMIC: Logica unică de parsare și design pentru Badge-ul de Status Modern
  const statusStyles = useMemo(() => {
    const s = order.status?.toUpperCase() || "PENDING";
    switch (s) {
      case "DELIVERED":
        return {
          text: "Livrat",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
      case "SHIPPED":
        return {
          text: "Pe drum",
          bg: "bg-blue-50 text-blue-700 border-blue-100",
        };
      case "PROCESSING":
      case "CONFIRMED":
      case "PAID":
        return {
          text: "În procesare",
          bg: "bg-amber-50 text-amber-700 border-amber-100",
        };
      case "CANCELLED":
        return {
          text: "Anulată",
          bg: "bg-zinc-100 text-zinc-600 border-zinc-200",
        };
      default:
        return {
          text: order.status || "Preluată",
          bg: "bg-purple-50 text-purple-700 border-purple-100",
        };
    }
  }, [order.status]);

  // 🚀 REPARAT ATOMIC: Mapare estetică premium pentru metoda de plată
  const paymentDetails = useMemo(() => {
    const method = order.payment_method?.toLowerCase() || "cod";
    if (method === "card") {
      return {
        text: "Card Online",
        icon: <CreditCard size={12} className="inline mr-1" />,
      };
    }
    return {
      text: "Ramburs (COD)",
      icon: <Truck size={12} className="inline mr-1" />,
    };
  }, [order.payment_method]);

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
          { credentials: "include" },
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
        loading: `Se pregătește ${docName}...`,
        success: `${docName} a fost descărcată.`,
        error: "Eroare la descărcare sau sesiune expirată.",
      },
    );
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative bg-white border border-zinc-150/60 p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:border-zinc-200 flex flex-col justify-between h-full min-h-[420px]"
      >
        <div className="text-left flex-1 flex flex-col">
          <header className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                REF: {order.order_number?.split("-").pop()}
              </p>
              <h3 className="heading-serif text-2xl italic text-[var(--dark-amethyst)] font-medium">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>

            {/* 🚀 MODIFICAT: Înlocuit bulina pulsing cu un Status Badge curat, modern, minimalist */}
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${statusStyles.bg}`}
            >
              {statusStyles.text}
            </span>
          </header>

          {/* Grila Produse */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {order.items?.slice(0, 3).map((item: any, i: number) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-zinc-50 bg-zinc-50 shadow-inner"
              >
                <img
                  src={getValidImageUrl(item)}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  alt=""
                />
                {item.quantity > 1 && (
                  <span className="absolute bottom-1 right-1 bg-zinc-950/90 text-white text-[8px] font-black h-4 w-4 rounded-md flex items-center justify-center">
                    {item.quantity}
                  </span>
                )}
              </div>
            ))}
            {order.items?.length > 3 && (
              <div className="aspect-square rounded-xl bg-zinc-900 flex flex-col items-center justify-center text-white">
                <span className="text-[10px] font-black">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>

          {/* Timeline Progres subțire elegant */}
          <div className="space-y-3 mb-6 mt-auto">
            <div className="flex gap-1 h-[3px]">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className="flex-1 rounded-full bg-zinc-100 overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: step <= currentStepIndex ? "100%" : "0%",
                    }}
                    className="h-full bg-zinc-900 transition-all duration-1000"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Secțiunea de jos cu Metoda de Plată și Totalul */}
          <div className="pt-4 border-t border-zinc-50 flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">
                Metodă Plată
              </span>
              <span className="text-[10px] font-bold text-zinc-600 mt-0.5 flex items-center gap-1">
                {paymentDetails.text}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 block">
                Total
              </span>
              <p className="font-black text-lg text-[var(--dark-amethyst)] mt-0.5">
                {order.total_amount?.toLocaleString()}{" "}
                <span className="text-[10px] font-medium text-zinc-400">
                  RON
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-xl bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all hover:bg-zinc-900 active:scale-[0.99] shadow-sm"
        >
          Gestionare Comandă <ArrowUpRight size={14} />
        </button>
      </motion.article>

      {/* LUXURY MODAL DETAILS */}
      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Arhiva Comandă"
        description={order.order_number}
      >
        <div
          className="space-y-10 py-4 bg-white text-left w-full font-sans"
          style={{ backgroundColor: "#ffffff", opacity: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-8 bg-zinc-50/70 rounded-[2rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                <MapPin size={12} className="text-zinc-800" /> Adresa Livrare
              </p>
              <div className="space-y-1">
                <p className="font-black text-base text-zinc-900">
                  {order.customer_name}
                </p>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                  {getSafeAddress()}
                </p>
              </div>
            </div>

            <div className="p-8 bg-zinc-50/70 rounded-[2rem] border border-zinc-100 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Data înregistrării
                </span>
                <span className="font-bold text-zinc-800">
                  {new Date(order.created_at).toLocaleDateString("ro-RO")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Metodă Plată
                </span>
                <span className="font-bold text-zinc-800 flex items-center gap-1">
                  {paymentDetails.text}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">
              Conținut Colet
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-5 p-4 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-200 transition-all"
                >
                  <img
                    src={getValidImageUrl(item)}
                    className="size-14 rounded-xl object-cover shadow-sm shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      {item.product_name || "Articol Evem"}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                      Bucăți: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-sm text-zinc-900">
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
              className="w-full sm:w-auto h-14 px-8 rounded-xl border-2 border-zinc-900 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50"
            >
              <Receipt size={14} />
              {["SHIPPED", "DELIVERED"].includes(order.status?.toUpperCase())
                ? "Descarcă Factura"
                : "Proforma Digitală"}
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest mb-0.5">
                Total Achitat
              </p>
              <p className="heading-serif text-4xl font-bold text-zinc-900 leading-none">
                {order.total_amount?.toLocaleString()}{" "}
                <span className="text-sm font-sans font-black text-zinc-400">
                  RON
                </span>
              </p>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </>
  );
};
