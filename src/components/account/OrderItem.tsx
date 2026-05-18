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
import { useToast } from "@/hooks/use-toast"; // 🚀 REPARAT ATOMIC: Importăm hook-ul nativ Shadcn UI în loc de sonner
import { LuxuryModal } from "@/components/ui/luxury-modal";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

export const OrderItem = ({ order }: any) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast(); // 🚀 REPARAT ATOMIC: Inițializăm generatorul de ferestre toast native

  const getValidImageUrl = (item: any) => {
    const source = item.product_image || item.product?.image_url;
    if (!source) return "/placeholder-product.jpg";

    let rawUrl = "";
    if (typeof source === "string") {
      if (source.startsWith("http")) {
        rawUrl = source;
      } else {
        try {
          const parsed = JSON.parse(source);
          rawUrl = parsed?.main?.medium || parsed?.url || parsed?.medium || "";
        } catch {
          return "/placeholder-product.jpg";
        }
      }
    } else {
      rawUrl = source?.main?.medium || source?.url || source?.medium || "";
    }

    return rawUrl
      ? `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}&w=300&fit=cover&output=webp`
      : "/placeholder-product.jpg";
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

  const normalizedStatus = useMemo(() => {
    return order.status?.trim().toUpperCase() || "PENDING";
  }, [order.status]);

  const currentStepIndex = (() => {
    if (normalizedStatus === "DELIVERED") return 5;
    if (normalizedStatus === "SHIPPED") return 4;
    if (normalizedStatus === "CONFIRMED") return 3;
    if (["PROCESSING", "PAID"].includes(normalizedStatus)) return 2;
    return 1;
  })();

  const steps = [
    { label: "Preluată", icon: ClipboardList },
    { label: "În procesare", icon: Clock },
    { label: "Confirmată", icon: CheckCircle },
    { label: "În livrare", icon: Package },
    { label: "Livrată", icon: Check },
  ];

  const statusConfig = useMemo(() => {
    switch (normalizedStatus) {
      case "DELIVERED":
        return {
          text: "Livrată",
          border: "border-emerald-100 hover:border-emerald-400 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.12)]",
          badge: "bg-emerald-500 text-white border-emerald-400",
          colorClass: "text-emerald-500",
          progress: "bg-emerald-500 shadow-[0_0_10px_#10b981]",
        };
      case "SHIPPED":
        return {
          text: "În livrare",
          border: "border-blue-100 hover:border-blue-400 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.12)]",
          badge: "bg-blue-500 text-white border-blue-400",
          colorClass: "text-blue-500",
          progress: "bg-blue-500 shadow-[0_0_10px_#3b82f6]",
        };
      case "CONFIRMED":
        return {
          text: "Confirmată",
          border: "border-indigo-100 hover:border-indigo-400 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.12)]",
          badge: "bg-indigo-500 text-white border-indigo-400",
          colorClass: "text-indigo-500",
          progress: "bg-indigo-500 shadow-[0_0_10px_#6366f1]",
        };
      case "PROCESSING":
      case "PAID":
        return {
          text: "În procesare",
          border: "border-blue-100 hover:border-blue-400 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.12)]",
          badge:
            "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-md shadow-blue-100",
          colorClass: "text-blue-500",
          progress:
            "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_12px_#3b82f6]",
        };
      case "CANCELLED":
        return {
          text: "Anulată",
          border: "border-rose-100 hover:border-rose-400 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.12)]",
          badge: "bg-rose-500 text-white border-rose-400",
          colorClass: "text-rose-500",
          progress: "bg-rose-500",
        };
      default:
        return {
          text: order.status || "Preluată",
          border: "border-zinc-100 hover:border-zinc-300 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.02)]",
          badge: "bg-zinc-500 text-white border-zinc-400",
          colorClass: "text-zinc-500",
          progress: "bg-zinc-500",
        };
    }
  }, [normalizedStatus, order.status]);

  const paymentConfig = useMemo(() => {
    const method = order.payment_method?.toLowerCase() || "cod";
    if (method === "card") {
      return {
        text: "Card Online",
        icon: <CreditCard size={12} className="text-blue-500" />,
        bg: "bg-blue-50/40 text-blue-700 border-blue-100/60",
      };
    }
    return {
      text: "Ramburs (COD)",
      icon: <Truck size={12} className="text-zinc-500" />,
      bg: "bg-zinc-50 text-zinc-700 border-zinc-150",
    };
  }, [order.payment_method]);

  // 🚀 REPARAT ATOMIC: Transformat din structura asincronă sonner.promise în apeluri consecutive sub useToast() native
  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const isFinal = ["SHIPPED", "DELIVERED"].includes(normalizedStatus);
    const docName = isFinal ? "Factura" : "Proforma";

    toast({
      title: `Se pregătește ${docName}`,
      description: "Generarea fișierului securizat a început...",
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
        {
          credentials: "include",
        },
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

      toast({
        title: "Descărcare reușită",
        description: `${docName} pentru comanda ${order.order_number} a fost salvată.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare descărcare",
        description:
          "Documentul nu este disponibil momentan sau sesiunea a expirat.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -4, scale: 1.002 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`group relative border p-6 md:p-7 rounded-[2.5rem] flex flex-col justify-between h-full min-h-[460px] transition-all duration-300 ${statusConfig.border} ${statusConfig.glow}`}
        style={{ isolation: "isolate" }}
      >
        <div className="text-left flex-1 flex flex-col">
          <header className="flex justify-between items-center mb-6">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-amber-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-300">
                  REF: {order.order_number?.split("-").pop()}
                </p>
              </div>
              <h3 className="heading-serif text-2xl italic text-zinc-900 font-bold tracking-tight">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${statusConfig.badge}`}
            >
              {statusConfig.text}
            </span>
          </header>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {order.items?.slice(0, 3).map((item: any, i: number) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50/50 shadow-inner"
              >
                <img
                  src={getValidImageUrl(item)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
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
              <div className="aspect-[4/3] rounded-xl bg-zinc-950 flex flex-col items-center justify-center text-white border border-zinc-800">
                <span className="text-[10px] font-black">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6 mt-auto">
            <div className="grid grid-cols-5 gap-0.5 text-center">
              {steps.map((stepObj, idx) => {
                const stepNum = idx + 1;
                const isCurrentOrPast = stepNum <= currentStepIndex;
                const StepIcon = stepObj.icon;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <StepIcon
                      size={13}
                      className={`transition-colors duration-300 ${
                        isCurrentOrPast
                          ? statusConfig.colorClass
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
          className="w-full h-14 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-950/5 hover:brightness-110 active:scale-[0.99]"
          style={{ background: "var(--primary-gradient)" }}
        >
          Gestionare Comandă{" "}
          <ArrowUpRight
            size={14}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </motion.article>

      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Arhiva Comandă"
        description={order.order_number}
      >
        <div className="space-y-10 py-4 bg-white text-left w-full font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                <MapPin size={12} className={statusConfig.colorClass} /> Adresa
                Livrare
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

            <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col justify-center space-y-4">
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
                      className={`mx-auto size-2 rounded-full ${active ? statusConfig.progress.split(" ")[0] : "bg-zinc-200"}`}
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
                  className="flex items-center gap-5 p-4 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-200 transition-all shadow-sm"
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
              className="w-full sm:w-auto h-14 px-8 rounded-xl border-2 border-zinc-950 text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-950 hover:text-white transition-all disabled:opacity-50"
            >
              <Receipt size={14} />
              {["SHIPPED", "DELIVERED"].includes(normalizedStatus)
                ? "Descarcă Factura"
                : "Proforma Digitală"}
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest mb-0.5">
                Total Achitat
              </p>
              <p className="heading-serif text-4xl font-bold text-zinc-950 leading-none">
                {order.total_amount?.toLocaleString()}{" "}
                <span className="text-sm font-black text-zinc-400">RON</span>
              </p>
            </div>
          </div>
        </div>
      </LuxuryModal>
    </>
  );
};
