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
  X,
  Star,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LuxuryModal } from "@/components/ui/luxury-modal";
import { OrderTracking } from "@/components/account/OrderTracking";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const ReviewDialog = ({
  open,
  onClose,
  item,
  orderId,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
  orderId: any;
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const productId = item?.product_id || item?.product?.id;
  const productName =
    item?.product_name || item?.product_name_at_purchase || "Articol";

  const submit = async () => {
    if (rating === 0) {
      toast({ variant: "destructive", title: "Selectează un rating." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/reviews/products/${productId}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            comment: comment.trim(),
            order_id: orderId,
          }),
        },
      );
      if (!res.ok) throw new Error();
      toast({
        title: "Mulțumim pentru recenzie!",
        description: "Va fi vizibilă după aprobare.",
      });
      onClose();
      setRating(0);
      setComment("");
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut trimite recenzia. Reîncearcă.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 glass-overlay"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full sm:max-w-lg overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.25rem] shadow-[0_30px_80px_-20px_rgba(16,0,43,0.45)]"
            style={{
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)",
              border: "1px solid rgba(123,44,191,0.18)",
            }}
          >
            {/* Decorative orbs */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full opacity-40 blur-3xl"
              style={{ background: "var(--mauve-magic)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--lavender-purple)" }}
            />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 size-9 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-zinc-500 hover:text-[var(--royal-violet)] hover:bg-white transition-all"
              aria-label="Închide"
            >
              <X size={16} strokeWidth={1.75} />
            </button>

            <div className="relative px-7 sm:px-10 pt-10 pb-9">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle
                  size={11}
                  className="text-[var(--royal-violet)] fill-[var(--royal-violet)]"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                  Recenzie verificată
                </span>
              </div>
              <h2 className="heading-serif italic text-3xl sm:text-4xl text-[var(--dark-amethyst)] leading-tight tracking-tight">
                Spune-ne părerea ta
              </h2>
              <p className="text-[11px] mt-2 text-zinc-500 line-clamp-2">
                {productName}
              </p>

              <div className="mt-8 space-y-7">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-3">
                    Cât de mulțumit ești?
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const active = n <= (hover || rating);
                      return (
                        <button
                          key={n}
                          type="button"
                          onMouseEnter={() => setHover(n)}
                          onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(n)}
                          className="relative group transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <Star
                            size={34}
                            strokeWidth={1.5}
                            className={`transition-all duration-300 ${
                              active
                                ? "fill-[var(--royal-violet)] text-[var(--royal-violet)] drop-shadow-[0_4px_10px_rgba(123,44,191,0.45)]"
                                : "text-zinc-200"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {rating > 0 ? `${rating} / 5` : "—"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-3">
                    Părerea ta
                  </p>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ce ți-a plăcut cel mai mult? Cum a fost calitatea?"
                    className="min-h-32 resize-none rounded-2xl border-zinc-200/80 bg-white/70 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-[var(--royal-violet)]/30 focus-visible:border-[var(--royal-violet)]/40 text-sm"
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={submitting || rating === 0}
                  className="w-full h-13 py-4 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_15px_40px_-10px_rgba(123,44,191,0.55)] active:scale-[0.99]"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkle size={13} className="fill-white" />
                  )}
                  Trimite recenzia
                </button>

                <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-[0.3em]">
                  Va fi publicată după aprobare
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const OrderItem = ({ order }: any) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reviewItem, setReviewItem] = useState<any>(null);
  const { toast } = useToast();

  const getValidImageUrl = (item: any) => {
    const source = item.product_image || item.product?.image_url;
    if (!source) return "/placeholder-product.jpg";

    if (typeof source === "string") {
      if (source.startsWith("http")) return source;
      try {
        const parsed = JSON.parse(source);
        return (
          parsed?.main?.medium ||
          parsed?.url ||
          parsed?.medium ||
          "/placeholder-product.jpg"
        );
      } catch {
        return "/placeholder-product.jpg";
      }
    }
    return (
      source?.main?.medium ||
      source?.url ||
      source?.medium ||
      "/placeholder-product.jpg"
    );
  };

  const isLocker = order.delivery_type === "locker";

  const addressObj = useMemo(() => {
    if (!order.shipping_address) return {};
    return typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;
  }, [order.shipping_address]);

  const normalizedStatus = useMemo(() => {
    return order.status?.trim().toUpperCase() || "PENDING";
  }, [order.status]);

  // ORICE status final umple bara complet, restul parcurg pașii
  const currentStepIndex = (() => {
    if (["DELIVERED", "RETURNED", "CANCELLED"].includes(normalizedStatus))
      return 5;
    if (normalizedStatus === "SHIPPED") return 4;
    if (normalizedStatus === "CONFIRMED") return 3;
    if (["PROCESSING", "PAID"].includes(normalizedStatus)) return 2;
    return 1;
  })();

  const steps = [
    { label: "Preluată", icon: ClipboardList },
    { label: "În procesare", icon: Clock },
    { label: "Confirmată", icon: CheckCircle },
    { label: "În livrare", icon: isLocker ? Package : Truck },
    {
      label: ["CANCELLED", "RETURNED"].includes(normalizedStatus)
        ? normalizedStatus === "RETURNED"
          ? "Returnată"
          : "Anulată"
        : "Finalizată",
      icon: ["CANCELLED", "RETURNED"].includes(normalizedStatus) ? X : Check,
    },
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
          text: "Expediată",
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
      case "RETURNED":
        return {
          text: normalizedStatus === "RETURNED" ? "Returnată" : "Anulată",
          border: "border-rose-100 hover:border-rose-400 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.12)]",
          badge: "bg-rose-500 text-white border-rose-400",
          colorClass: "text-rose-500",
          progress: "bg-rose-500",
        };
      default:
        return {
          text: "În așteptare",
          border: "border-zinc-100 hover:border-zinc-300 bg-white",
          glow: "hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.02)]",
          badge: "bg-zinc-500 text-white border-zinc-400",
          colorClass: "text-zinc-500",
          progress: "bg-zinc-500",
        };
    }
  }, [normalizedStatus]);

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
      bg: "bg-zinc-50 text-zinc-700 border-zinc-200",
    };
  }, [order.payment_method]);

  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const isFinal = ["SHIPPED", "DELIVERED", "RETURNED"].includes(
      normalizedStatus,
    );
    const docName = isFinal ? "Factura" : "Proforma";

    toast({
      title: `Se descarcă ${docName}`,
      description: "Generarea fișierului a început...",
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/orders/${order.id}/document`,
        { credentials: "include" },
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
        title: "Succes",
        description: `${docName} a fost salvată pe dispozitivul dvs.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare descărcare",
        description: "Documentul nu a fost încă generat sau este indisponibil.",
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
        className={`group relative border p-6 md:p-7 rounded-[2.5rem] flex flex-col justify-between h-full min-h-[460px] transition-all duration-300 ${statusConfig.border} ${statusConfig.glow} !bg-white/55 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_40px_-12px_rgba(16,0,43,0.08)]`}
        style={{ isolation: "isolate" }}
      >
        <div className="text-left flex-1 flex flex-col">
          <header className="flex justify-between items-center mb-6">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles
                  size={10}
                  className="text-[var(--royal-violet)] animate-pulse"
                />
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  {order.order_number}
                </p>
              </div>
              <h3 className="heading-serif text-2xl italic text-zinc-900 font-bold tracking-tight">
                {new Date(order.created_at).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt=""
                />
                {item.quantity > 1 && (
                  <span className="absolute bottom-1 right-1 bg-zinc-950/80 backdrop-blur-md text-white text-[8px] font-black h-4 px-1.5 rounded-md flex items-center justify-center">
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
                      className={`text-[8px] font-black uppercase tracking-tighter block transition-colors ${isCurrentOrPast ? "text-zinc-800" : "text-zinc-300"}`}
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
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
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
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block">
                Total Final
              </span>
              <p className="font-black text-2xl text-zinc-950 mt-0.5 tracking-tight">
                {order.total_amount?.toLocaleString("ro-RO", {
                  minimumFractionDigits: 2,
                })}{" "}
                <span className="text-[10px] font-bold text-zinc-400">RON</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFullDetails(true)}
          className="w-full h-14 rounded-2xl text-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.2] border border-[var(--royal-violet)]/20 text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-[var(--royal-violet)] hover:text-white transition-all duration-300 shadow-sm active:scale-[0.98]"
        >
          Detalii Comandă{" "}
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
        description={`REF: ${order.order_number}`}
      >
        <div className="space-y-8 py-2 bg-white text-left w-full font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-7 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                {isLocker ? (
                  <Package size={12} className="text-violet-500" />
                ) : (
                  <MapPin size={12} className="text-blue-500" />
                )}
                {isLocker ? "Locație Locker GLS" : "Adresă Livrare"}
              </p>

              <div className="space-y-1">
                <p className="font-black text-[15px] text-zinc-900">
                  {order.customer_name}
                </p>
                {isLocker ? (
                  <div className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">
                    <span className="block font-bold text-violet-600 mb-0.5">
                      {addressObj.locker_name ||
                        order.locker_address ||
                        "GLS Locker"}
                    </span>
                    {addressObj.street || ""} {addressObj.house_number || ""}
                    <br />
                    {addressObj.city || ""}{" "}
                    {addressObj.postal_code
                      ? `- ${addressObj.postal_code}`
                      : ""}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">
                    {addressObj.street || "Strada lipsă"}{" "}
                    {addressObj.house_number
                      ? `Nr. ${addressObj.house_number}`
                      : ""}
                    <br />
                    {addressObj.city || ""}, {addressObj.county || ""}
                    <br />
                    {addressObj.postal_code
                      ? `Cod poștal: ${addressObj.postal_code}`
                      : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="p-7 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col justify-center space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Data Plasării
                </span>
                <span className="font-bold text-zinc-800 text-xs">
                  {new Date(order.created_at).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Status Actual
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${statusConfig.colorClass}`}
                >
                  {statusConfig.text}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Metodă Plată
                </span>
                <span
                  className={`text-[9px] font-black uppercase flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${paymentConfig.bg}`}
                >
                  {paymentConfig.icon} {paymentConfig.text}
                </span>
              </div>
            </div>
          </div>

          {/* TRACKING ÎN TIMP REAL — GLS */}
          <OrderTracking
            orderId={order.id}
            awb={
              order.tracking?.awb_number ||
              order.awb_number ||
              order.gls_parcel_number
            }
            orderStatus={normalizedStatus}
            placeholderStatus={
              normalizedStatus === "PENDING"
                ? "Comanda așteaptă confirmare. AWB-ul va fi generat după procesare."
                : normalizedStatus === "PROCESSING" ||
                    normalizedStatus === "PAID"
                  ? "Comanda este în pregătire în depozit. AWB-ul va apărea aici imediat ce coletul este predat curierului."
                  : normalizedStatus === "CONFIRMED"
                    ? "Comanda a fost confirmată. Urmează generarea AWB-ului."
                    : undefined
            }
          />

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase text-zinc-400 ml-2 tracking-widest">
              Produse Comandate
            </p>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-white border border-zinc-100 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={getValidImageUrl(item)}
                      className="size-16 rounded-xl object-cover border border-zinc-50 shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">
                        {item.product_name ||
                          item.product_name_at_purchase ||
                          "Articol Evem"}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-400 mt-1">
                        Bucăți: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-[13px] text-zinc-900">
                        {(
                          item.price_at_purchase || item.unit_price_at_purchase
                        )?.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        RON
                      </p>
                      <p className="text-[9px] font-bold text-zinc-400">
                        / buc
                      </p>
                    </div>
                  </div>
                  {normalizedStatus === "DELIVERED" ? (
                    <button
                      onClick={() => {
                        setShowFullDetails(false);
                        setReviewItem(item);
                      }}
                      className="sm:ml-2 h-9 px-3 rounded-xl bg-[var(--royal-violet)] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                    >
                      <Star size={12} />
                      Recenzie
                    </button>
                  ) : (
                    <p className="text-[8px] text-zinc-400 uppercase italic">
                      Status: {normalizedStatus}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white">
            <button
              onClick={handleDownloadDocs}
              disabled={isDownloading}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              <Receipt size={14} />
              {["SHIPPED", "DELIVERED", "RETURNED"].includes(normalizedStatus)
                ? "Descarcă Factura"
                : "Proforma Digitală"}
            </button>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">
                Total Achitat
              </p>
              <p className="heading-serif text-3xl font-bold text-zinc-950 leading-none">
                {order.total_amount?.toLocaleString("ro-RO", {
                  minimumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-black text-zinc-400">RON</span>
              </p>
            </div>
          </div>
        </div>
      </LuxuryModal>

      <ReviewDialog
        open={!!reviewItem}
        onClose={() => {
          setReviewItem(null);
          setShowFullDetails(true);
        }}
        item={reviewItem}
        orderId={order.id}
      />
    </>
  );
};
