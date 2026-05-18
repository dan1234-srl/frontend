import {
  Truck,
  MapPin,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Sparkles,
  Calendar,
  Layers,
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

  // 🚀 REPARATĂ ALINIEREA STATUSURILOR: Corelat direct cu string-urile reale intrate din DB
  const currentStepIndex = (() => {
    const s = order.status?.toUpperCase() || "";
    if (s === "DELIVERED") return 4;
    if (s === "SHIPPED") return 3;
    if (["PROCESSING", "PAID", "CONFIRMED"].includes(s)) return 2;
    return 1;
  })();

  const statusConfig = useMemo(() => {
    const s = order.status?.toUpperCase() || "PENDING";
    switch (s) {
      case "DELIVERED":
        return {
          text: "Livrat",
          bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case "SHIPPED":
        return {
          text: "Pe drum",
          bg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      case "PROCESSING":
      case "PAID":
      case "CONFIRMED":
        return {
          text: "În procesare",
          bg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        };
      case "CANCELLED":
        return {
          text: "Anulată",
          bg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        };
      default:
        return {
          text: order.status || "Preluată",
          bg: "bg-zinc-50 text-zinc-600 border-zinc-200",
        };
    }
  }, [order.status]);

  const paymentConfig = useMemo(() => {
    const method = order.payment_method?.toLowerCase() || "cod";
    if (method === "card") {
      return {
        text: "Card Online",
        icon: <CreditCard size={12} className="text-purple-600" />,
        bg: "bg-purple-50/80 border-purple-100/50",
      };
    }
    return {
      text: "Ramburs (COD)",
      icon: <Truck size={12} className="text-zinc-600" />,
      bg: "bg-zinc-50 border-zinc-200/60",
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
      {/* 🚀 MODIFICAT COMPLET: Layout orizontal asimetric, fundal fin semi-transparent, fără margini negre */}
      <motion.article
        layout
        whileHover={{
          y: -3,
          boxShadow: "0 30px 60px -15px rgba(147,51,234,0.06)",
        }}
        className="w-full bg-white/80 border border-zinc-100 p-5 md:p-6 rounded-[2rem] transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between items-stretch relative overflow-hidden backdrop-blur-sm group"
      >
        {/* Glow dinamic de fundal pe culorile site-ului */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none -z-10 transition-opacity group-hover:opacity-150" />

        {/* SECȚIUNEA STÂNGA: Previzualizare Imagini & Detalii de bază */}
        <div className="flex flex-1 gap-5 items-center min-w-0">
          {/* Stack Orizontal compact de imagini */}
          <div className="flex items-center -space-x-4 shrink-0 relative pr-2">
            {order.items?.slice(0, 2).map((item: any, i: number) => (
              <div
                key={i}
                className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-white bg-zinc-50 shadow-md relative transition-transform group-hover:translate-x-1 duration-300"
                style={{ zIndex: 10 - i }}
              >
                <img
                  src={getValidImageUrl(item)}
                  className="w-full h-full object-cover"
                  alt=""
                />
                {item.quantity > 1 && (
                  <span className="absolute bottom-1 right-1 bg-zinc-950 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                    x{item.quantity}
                  </span>
                )}
              </div>
            ))}
            {order.items?.length > 2 && (
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md relative z-30 transform translate-x-2">
                +{order.items.length - 2}
              </div>
            )}
          </div>

          {/* Date descriptive textuale în stânga */}
          <div className="space-y-1.5 text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-md">
                REF: {order.order_number?.split("-").pop()}
              </span>
              <span
                className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}
              >
                {statusConfig.text}
              </span>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 truncate tracking-tight">
              Comandă din{" "}
              {new Date(order.created_at).toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </h3>

            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wide pt-1">
              <span
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${paymentConfig.bg}`}
              >
                {paymentConfig.icon} {paymentConfig.text}
              </span>
              <span className="flex items-center gap-1 text-zinc-500 py-0.5">
                <Layers size={11} />{" "}
                {order.items?.reduce(
                  (acc: number, item: any) => acc + item.quantity,
                  0,
                )}{" "}
                produse
              </span>
            </div>
          </div>
        </div>

        {/* SECȚIUNEA DREAPTĂ: Timeline Micro, Total & Buton Acțiune */}
        <div className="w-full md:w-72 flex md:flex-col justify-between items-center md:items-end gap-4 md:border-l md:border-zinc-100/80 md:pl-6 pt-4 md:pt-0 border-t border-zinc-50 md:border-t-0">
          <div className="text-left md:text-right space-y-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 block">
              Total achitat
            </span>
            <p className="font-black text-2xl text-[var(--dark-amethyst)] tracking-tight leading-none">
              {order.total_amount?.toLocaleString()}{" "}
              <span className="text-xs font-sans font-bold text-zinc-400">
                RON
              </span>
            </p>
          </div>

          {/* Micro Mini-Tracker de pași integrat pe orizontală */}
          <div className="hidden md:flex gap-1 w-full h-[3px] bg-zinc-100 rounded-full overflow-hidden my-1">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    step <= currentStepIndex
                      ? order.status?.toUpperCase() === "CANCELLED"
                        ? "bg-rose-400"
                        : "bg-[var(--royal-violet)]"
                      : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowFullDetails(true)}
            className="h-12 px-6 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.99] shadow-md shadow-purple-900/5 whitespace-nowrap"
            style={{ background: "var(--primary-gradient)" }}
          >
            Detalii <ArrowUpRight size={13} />
          </button>
        </div>
      </motion.article>

      {/* LUXURY DETAIL MODAL */}
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
            <div className="p-8 bg-gradient-to-br from-zinc-50 to-purple-50/20 rounded-[2rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                <MapPin size={12} className="text-[var(--royal-violet)]" />{" "}
                Adresa Livrare
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

            <div className="p-8 bg-gradient-to-br from-zinc-50 to-blue-50/10 rounded-[2rem] border border-zinc-100 flex flex-col justify-center space-y-4">
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
                <span
                  className={`text-[9px] font-black uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${paymentConfig.bg}`}
                >
                  {paymentConfig.icon} {paymentConfig.text}
                </span>
              </div>
            </div>
          </div>

          {/* Progresul Vizual al etapelor explicite pe 4 faze */}
          <div className="space-y-4 bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
              Stadiu fizic colet
            </p>
            <div className="grid grid-cols-4 gap-1 text-center">
              {["Preluată", "Confirmată", "Expediată", "Livrată"].map(
                (lbl, idx) => {
                  const stepNum = idx + 1;
                  const active = stepNum <= currentStepIndex;
                  return (
                    <div key={idx} className="space-y-1">
                      <div
                        className={`mx-auto size-2 rounded-full ${active ? (order.status?.toUpperCase() === "CANCELLED" ? "bg-rose-500" : "bg-[var(--royal-violet)]") : "bg-zinc-200"}`}
                      />
                      <span
                        className={`text-[9px] font-black uppercase tracking-tighter block ${active ? "text-zinc-800" : "text-zinc-300"}`}
                      >
                        {lbl}
                      </span>
                    </div>
                  );
                },
              )}
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
                  className="flex items-center gap-5 p-4 bg-white border border-zinc-100 rounded-2xl hover:border-purple-100 transition-all shadow-sm"
                >
                  <img
                    src={getValidImageUrl(item)}
                    className="size-14 rounded-xl object-cover shadow-sm shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      {item.product_name ||
                        item.product_name_at_purchase ||
                        "Articol Evem"}
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
              className="w-full sm:w-auto h-14 px-8 rounded-xl border-2 border-zinc-950 text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-950 hover:text-white transition-all disabled:opacity-50 font-sans"
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
              <p className="heading-serif text-4xl font-bold text-zinc-950 leading-none">
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
