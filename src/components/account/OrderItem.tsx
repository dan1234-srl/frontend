import {
  Truck,
  MapPin,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Sparkles,
  ClipboardList,
  Clock,
  CheckCircle,
  Package,
  Check,
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

  // 🚀 REPARAT ATOMIC: Logica celor 5 pași aliniați perfect cu statusurile din DB
  const currentStepIndex = (() => {
    const s = order.status?.toUpperCase() || "";
    if (s === "DELIVERED") return 5;
    if (s === "SHIPPED") return 4;
    if (s === "CONFIRMED") return 3;
    if (["PROCESSING", "PAID"].includes(s)) return 2;
    return 1; // PENDING sau oricare alt status inițial
  })();

  // 🚀 REPARAT: Vectorul celor 5 pași ceruți de tine
  const steps = [
    { label: "Preluată", icon: ClipboardList },
    { label: "În procesare", icon: Clock },
    { label: "Confirmată", icon: CheckCircle },
    { label: "În livrare", icon: Package },
    { label: "Livrată", icon: Check },
  ];

  const statusConfig = useMemo(() => {
    const s = order.status?.toUpperCase() || "PENDING";
    switch (s) {
      case "DELIVERED":
        return {
          text: "Livrată",
          bg: "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-100",
          progress: "bg-emerald-500 shadow-[0_0_10px_#10b981]",
        };
      case "SHIPPED":
        return {
          text: "În livrare",
          bg: "bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-100",
          progress: "bg-blue-500 shadow-[0_0_10px_#3b82f6]",
        };
      case "CONFIRMED":
        return {
          text: "Confirmată",
          bg: "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-100",
          progress: "bg-indigo-500 shadow-[0_0_10px_#6366f1]",
        };
      case "PROCESSING":
      case "PAID":
        return {
          text: "În procesare",
          bg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-amber-100",
          progress:
            "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_#f59e0b]",
        };
      case "CANCELLED":
        return {
          text: "Anulată",
          bg: "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-100",
          progress: "bg-rose-500",
        };
      default:
        return {
          text: order.status || "Preluată",
          bg: "bg-purple-50 text-purple-700 border-purple-100",
          progress: "bg-purple-500",
        };
    }
  }, [order.status]);

  const paymentConfig = useMemo(() => {
    const method = order.payment_method?.toLowerCase() || "cod";
    if (method === "card") {
      return {
        text: "Card Online",
        icon: <CreditCard size={12} className="text-purple-600" />,
        bg: "bg-purple-50 text-purple-700 border-purple-100",
      };
    }
    return {
      text: "Ramburs (COD)",
      icon: <Truck size={12} className="text-blue-600" />,
      bg: "bg-blue-50 text-blue-700 border-blue-100",
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
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="group relative bg-white border border-zinc-150 p-6 md:p-7 rounded-[2.5rem] flex flex-col justify-between h-full min-h-[460px] hover:border-purple-200 hover:shadow-[0_40px_80px_-15px_rgba(109,40,217,0.08)] duration-300"
        style={{ isolation: "isolate" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-50/0 via-amber-50/0 to-blue-50/0 group-hover:from-purple-50/10 group-hover:via-amber-50/5 group-hover:to-blue-50/10 rounded-[2.5rem] transition-all duration-500 pointer-events-none -z-10" />

        <div className="text-left flex-1 flex flex-col">
          <header className="flex justify-between items-center mb-6">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-amber-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-300">
                  REF: {order.order_number?.split("-").pop()}
                </p>
              </div>
              <h3 className="heading-serif text-2xl italic text-[var(--dark-amethyst)] font-bold tracking-tight">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${statusConfig.bg}`}
            >
              {statusConfig.text}
            </span>
          </header>

          {/* Grila Imagini Colet Landscape */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {order.items?.slice(0, 3).map((item: any, i: number) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-150 bg-zinc-50 shadow-inner group-hover:border-purple-100 transition-all duration-300"
              >
                <img
                  src={getValidImageUrl(item)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt=""
                />
                {item.quantity > 1 && (
                  <span className="absolute bottom-1 right-1 bg-zinc-950 text-white text-[8px] font-black h-4 px-1.5 rounded-md flex items-center justify-center">
                    x{item.quantity}
                  </span>
                )}
              </div>
            ))}
            {order.items?.length > 3 && (
              <div className="aspect-[4/3] rounded-xl bg-zinc-950 flex flex-col items-center justify-center text-white shadow-sm border border-zinc-800">
                <span className="text-[10px] font-black">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>

          {/* 🚀 REPARAT: Tracker Etape distribuit perfect pe 5 pași textuali independenți */}
          <div className="space-y-4 mb-6 mt-auto">
            <div className="grid grid-cols-5 gap-0.5 text-center">
              {steps.map((stepObj, idx) => {
                const stepNum = idx + 1;
                const isCurrentOrPast = stepNum <= currentStepIndex;
                const StepIcon = stepObj.icon;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <StepIcon
                      size={12}
                      className={`transition-colors duration-300 ${
                        isCurrentOrPast
                          ? order.status?.toUpperCase() === "CANCELLED"
                            ? "text-rose-500"
                            : "text-[var(--royal-violet)]"
                          : "text-zinc-300"
                      }`}
                    />
                    <span
                      className={`text-[8px] font-black uppercase tracking-tighter block transition-colors ${
                        isCurrentOrPast ? "text-zinc-800" : "text-zinc-300"
                      }`}
                    >
                      {stepObj.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 🚀 REPARAT: Bara de progres împărțită acum în 5 segmente asortate */}
            <div className="flex gap-1 h-[4px] bg-zinc-100 rounded-full overflow-hidden">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: step <= currentStepIndex ? "100%" : "0%",
                    }}
                    className={`h-full ${statusConfig.progress} transition-all duration-1000`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Metodă Plată & Total */}
          <div className="pt-5 border-t border-zinc-100 flex items-center justify-between mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">
                Metodă Plată
              </span>
              <div
                className={`text-[9px] font-black uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm ${paymentConfig.bg}`}
              >
                {paymentConfig.icon}
                <span>{paymentConfig.text}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 block">
                Total Final
              </span>
              <p className="font-black text-2xl text-zinc-950 mt-0.5 tracking-tight">
                {order.total_amount?.toLocaleString()}{" "}
                <span className="text-[10px] font-bold text-zinc-400">RON</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-900/5 group-hover:shadow-purple-900/10 hover:brightness-110 active:scale-[0.99]"
          style={{ background: "var(--primary-gradient)" }}
        >
          Gestionare Comandă{" "}
          <ArrowUpRight
            size={14}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </motion.article>

      {/* LUXURY MODAL CORECTAT PE PAȘII NOI */}
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
                  className={`text-[9px] font-black uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm ${paymentConfig.bg}`}
                >
                  {paymentConfig.icon} {paymentConfig.text}
                </span>
              </div>
            </div>
          </div>

          {/* Tracker Orizontal cu 5 etape în interiorul Modalului */}
          <div className="space-y-4 bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
              Stadiu fizic colet
            </p>
            <div className="grid grid-cols-5 gap-1 text-center">
              {steps.map((stepObj, idx) => {
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
                      {stepObj.label}
                    </span>
                  </div>
                );
              })}
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
