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
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LuxuryModal } from "@/components/ui/luxury-modal";
import { OrderTracking } from "@/components/account/OrderTracking";
import { Textarea } from "@/components/ui/textarea";
import { prefetchTracking } from "@/lib/tracking-cache";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// ─── REVIEW DIALOG ─────────────────────────────────────────────────────────

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
      toast({
        variant: "destructive",
        title: "Te rugăm să acorzi un număr de stele.",
      });
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
        title: "Recenzie trimisă cu succes!",
        description:
          "Îți mulțumim pentru feedback. Va fi vizibil după moderare.",
      });
      onClose();
      setRating(0);
      setComment("");
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare de comunicare",
        description: "Nu am putut salva recenzia. Te rugăm să reîncerci.",
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
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-lg overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-white/70 backdrop-blur-3xl backdrop-saturate-150 border border-white/60 shadow-[0_40px_100px_-20px_rgba(123,44,191,0.25)]"
          >
            {/* Glowing Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-[var(--royal-violet)] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[var(--lavender-purple)] rounded-full mix-blend-multiply filter blur-[80px] opacity-30 pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 size-10 rounded-full bg-white/50 hover:bg-white border border-white/60 shadow-sm flex items-center justify-center text-zinc-500 hover:text-[var(--royal-violet)] transition-all active:scale-95"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <div className="relative z-10 px-8 pt-12 pb-10 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-[var(--royal-violet)]/10 mb-6 shadow-sm">
                <ShieldCheck size={14} className="text-[var(--royal-violet)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
                  Achiziție Verificată
                </span>
              </div>

              <h2 className="text-3xl font-black text-[var(--dark-amethyst)] tracking-tight mb-2">
                Evaluează Produsul
              </h2>
              <p className="text-sm text-zinc-500 font-medium max-w-[80%] line-clamp-2">
                {productName}
              </p>

              <div className="mt-10 w-full">
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = n <= (hover || rating);
                    return (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        className="relative group transition-all duration-300 hover:scale-110 active:scale-90 p-1"
                      >
                        <Star
                          size={42}
                          strokeWidth={active ? 0 : 1.5}
                          className={`transition-all duration-300 ${
                            active
                              ? "fill-[var(--royal-violet)] text-[var(--royal-violet)] filter drop-shadow-[0_0_12px_rgba(123,44,191,0.5)]"
                              : "text-zinc-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-left w-full space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dark-amethyst)] ml-1">
                    Experiența ta (Opțional)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Detaliază ce ți-a plăcut sau ce ar putea fi îmbunătățit..."
                    className="min-h-[120px] resize-none rounded-2xl bg-white/50 border-white/60 shadow-inner focus-visible:ring-2 focus-visible:ring-[var(--royal-violet)]/30 text-sm font-medium placeholder:text-zinc-400 placeholder:font-normal"
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={submitting || rating === 0}
                  className="mt-8 w-full py-4 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_10px_30px_-10px_rgba(123,44,191,0.6)] active:scale-[0.98] relative overflow-hidden group"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkle size={16} className="fill-white" />
                    )}
                    Trimite Recenzia
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ─── ORDER ITEM CARD ───────────────────────────────────────────────────────

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

  const normalizedStatus = useMemo(
    () => order.status?.trim().toUpperCase() || "PENDING",
    [order.status],
  );

  const currentStepIndex = (() => {
    if (["DELIVERED", "RETURNED", "CANCELLED"].includes(normalizedStatus))
      return 5;
    if (normalizedStatus === "SHIPPED") return 4;
    if (normalizedStatus === "CONFIRMED") return 3;
    if (["PROCESSING", "PAID"].includes(normalizedStatus)) return 2;
    return 1;
  })();

  const steps = [
    { label: "Plasează", icon: ClipboardList },
    { label: "Procesare", icon: Clock },
    { label: "Confirmă", icon: CheckCircle },
    { label: "Curier", icon: isLocker ? Package : Truck },
    {
      label: ["CANCELLED", "RETURNED"].includes(normalizedStatus)
        ? normalizedStatus === "RETURNED"
          ? "Retur"
          : "Anulat"
        : "Finalizat",
      icon: ["CANCELLED", "RETURNED"].includes(normalizedStatus) ? X : Check,
    },
  ];

  const statusConfig = useMemo(() => {
    switch (normalizedStatus) {
      case "DELIVERED":
        return {
          text: "Livrată",
          ring: "ring-emerald-500/20",
          badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
          progress:
            "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
          color: "text-emerald-600",
        };
      case "SHIPPED":
        return {
          text: "Expediată",
          ring: "ring-blue-500/20",
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          progress:
            "bg-gradient-to-r from-blue-400 to-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]",
          color: "text-blue-600",
        };
      case "CONFIRMED":
        return {
          text: "Confirmată",
          ring: "ring-[var(--royal-violet)]/20",
          badge:
            "bg-[var(--royal-violet)]/10 text-[var(--royal-violet)] border-[var(--royal-violet)]/20",
          progress:
            "bg-gradient-to-r from-[var(--royal-violet)] to-[var(--mauve-magic)] shadow-[0_0_12px_rgba(123,44,191,0.4)]",
          color: "text-[var(--royal-violet)]",
        };
      case "PROCESSING":
      case "PAID":
        return {
          text: "În Procesare",
          ring: "ring-indigo-500/20",
          badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
          progress:
            "bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]",
          color: "text-indigo-600",
        };
      case "CANCELLED":
      case "RETURNED":
        return {
          text: normalizedStatus === "RETURNED" ? "Returnată" : "Anulată",
          ring: "ring-rose-500/20",
          badge: "bg-rose-100 text-rose-700 border-rose-200",
          progress: "bg-rose-500",
          color: "text-rose-600",
        };
      default:
        return {
          text: "Așteptare",
          ring: "ring-zinc-500/20",
          badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
          progress: "bg-zinc-400",
          color: "text-zinc-600",
        };
    }
  }, [normalizedStatus]);

  const paymentConfig = useMemo(() => {
    const method = order.payment_method?.toLowerCase() || "cod";
    if (method === "card")
      return { text: "Card Online", icon: <CreditCard size={12} /> };
    return { text: "Ramburs", icon: <Truck size={12} /> };
  }, [order.payment_method]);

  const handleDownloadDocs = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const docName = ["SHIPPED", "DELIVERED", "RETURNED"].includes(
      normalizedStatus,
    )
      ? "Factura"
      : "Proforma";
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
      toast({ title: "Succes", description: `${docName} a fost salvată.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Document indisponibil.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`group relative flex flex-col bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] ring-1 ${statusConfig.ring} ring-inset overflow-hidden`}
      >
        {/* Decorative ambient gradient inside card */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

        {/* ── HEADER ── */}
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={10} className={statusConfig.color} />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                COM #{order.order_number.slice(-6)}
              </span>
            </div>
            <h3 className="text-xl font-black text-[var(--dark-amethyst)] tracking-tight">
              {new Date(order.created_at).toLocaleDateString("ro-RO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </h3>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusConfig.badge}`}
          >
            {statusConfig.text}
          </div>
        </div>

        {/* ── BENTO BODY ── */}
        <div className="relative z-10 flex-1 flex flex-col gap-5">
          {/* Images Stack */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {order.items?.slice(0, 4).map((item: any, i: number) => (
                <div
                  key={i}
                  className="relative size-12 sm:size-14 rounded-full border-2 border-white bg-zinc-50 shadow-sm overflow-hidden z-10 hover:z-20 hover:scale-110 transition-transform"
                >
                  <img
                    src={getValidImageUrl(item)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {order.items?.length > 4 && (
              <div className="size-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center z-0 ml-1">
                <span className="text-[10px] font-black text-zinc-500">
                  +{order.items.length - 4}
                </span>
              </div>
            )}
          </div>

          {/* Futuristic Progress Track */}
          <div className="bg-white/50 border border-white/60 p-4 rounded-2xl shadow-inner mt-2">
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-zinc-200/60 rounded-full" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(currentStepIndex - 1) * 25}%` }}
              >
                <div className={`w-full h-full ${statusConfig.progress}`} />
              </div>

              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const passed = stepNum <= currentStepIndex;
                const active = stepNum === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div
                    key={idx}
                    className="relative z-10 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`size-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                        passed
                          ? active
                            ? statusConfig.badge
                            : "bg-white text-zinc-800 border border-zinc-200 shadow-sm"
                          : "bg-zinc-100 text-zinc-300 border border-zinc-200/50"
                      }`}
                    >
                      <StepIcon size={10} strokeWidth={active ? 2.5 : 2} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="relative z-10 mt-6 pt-5 border-t border-zinc-200/50 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-0.5">
              Total
            </span>
            <p className="text-lg font-black text-[var(--dark-amethyst)] leading-none">
              {order.total_amount?.toLocaleString("ro-RO")}{" "}
              <span className="text-[10px] font-bold">RON</span>
            </p>
          </div>

          <button
            onClick={() => setShowFullDetails(true)}
            onMouseEnter={() => prefetchTracking(order.id)}
            className="h-10 px-5 rounded-xl bg-white border border-zinc-200 text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] flex items-center gap-1.5 hover:bg-[var(--royal-violet)] hover:text-white hover:border-[var(--royal-violet)] transition-all shadow-sm active:scale-95"
          >
            Detalii <ChevronRight size={14} />
          </button>
        </div>
      </motion.article>

      {/* ── LUXURY MODAL (BENTO GRID INSIDE) ── */}
      <LuxuryModal
        open={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        title="Arhiva Comandă"
        description={`Referință: ${order.order_number}`}
      >
        <div className="space-y-4 py-2 font-sans w-full">
          {/* Top Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Details Bento */}
            <div className="p-6 bg-zinc-50/80 rounded-[2rem] border border-zinc-100/80 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                {isLocker ? <Package size={100} /> : <MapPin size={100} />}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`p-2 rounded-xl ${isLocker ? "bg-violet-100 text-violet-600" : "bg-blue-100 text-blue-600"}`}
                >
                  {isLocker ? <Package size={14} /> : <MapPin size={14} />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {isLocker ? "Locker GLS" : "Adresă Livrare"}
                </span>
              </div>
              <p className="font-black text-sm text-[var(--dark-amethyst)] mb-1 relative z-10">
                {order.customer_name}
              </p>
              <div className="text-xs text-zinc-500 font-medium leading-relaxed relative z-10">
                {isLocker ? (
                  <>
                    <span className="block font-bold text-violet-600 mb-1">
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Order Summary Bento */}
            <div className="p-6 bg-zinc-50/80 rounded-[2rem] border border-zinc-100/80 flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center border-b border-zinc-200/60 pb-3">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Data Plasării
                </span>
                <span className="font-black text-zinc-800 text-xs">
                  {new Date(order.created_at).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-200/60 pb-3">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Status
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${statusConfig.badge}`}
                >
                  {statusConfig.text}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
                  Plată
                </span>
                <span className="text-[10px] font-black uppercase flex items-center gap-1.5 text-zinc-700">
                  {paymentConfig.icon} {paymentConfig.text}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking Component */}
          <div className="w-full">
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
                  ? "Sincronizare în așteptare cu sistemul de curierat."
                  : normalizedStatus === "PROCESSING" ||
                      normalizedStatus === "PAID"
                    ? "Pachetul este în depozit. AWB-ul va fi emis curând."
                    : normalizedStatus === "CONFIRMED"
                      ? "Status confirmat. Urmează generarea rutei."
                      : undefined
              }
            />
          </div>

          {/* Items List Bento */}
          <div className="bg-zinc-50/80 rounded-[2rem] border border-zinc-100/80 p-6">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-4">
              Conținut Pachet
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-white border border-zinc-100/80 rounded-2xl shadow-sm transition-all hover:shadow-md"
                >
                  <img
                    src={getValidImageUrl(item)}
                    className="size-16 rounded-[1rem] object-cover border border-zinc-50 shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black text-[var(--dark-amethyst)] truncate">
                      {item.product_name ||
                        item.product_name_at_purchase ||
                        "Articol Evem"}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                      Cantitate: {item.quantity} buc.
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 sm:gap-1 mt-2 sm:mt-0 border-t sm:border-t-0 border-zinc-100 pt-3 sm:pt-0">
                    <p className="font-black text-sm text-[var(--dark-amethyst)]">
                      {(
                        item.price_at_purchase || item.unit_price_at_purchase
                      )?.toLocaleString("ro-RO", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      <span className="text-[10px] text-zinc-400">RON</span>
                    </p>
                    {normalizedStatus === "DELIVERED" ? (
                      <button
                        onClick={() => {
                          setShowFullDetails(false);
                          setReviewItem(item);
                        }}
                        className="h-8 px-4 rounded-xl bg-white border border-zinc-200 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[var(--royal-violet)] hover:text-white hover:border-[var(--royal-violet)] transition-all shadow-sm"
                      >
                        <Star size={10} /> Review
                      </button>
                    ) : (
                      <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-widest">
                        {normalizedStatus}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-6">
            <button
              onClick={handleDownloadDocs}
              disabled={isDownloading}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[var(--dark-amethyst)] text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Receipt size={14} />
              {["SHIPPED", "DELIVERED", "RETURNED"].includes(normalizedStatus)
                ? "Descarcă Factură"
                : "Descarcă Proformă"}
            </button>
            <div className="text-center sm:text-right bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm min-w-[200px]">
              <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                Total Achitat
              </p>
              <p className="text-3xl font-black text-[var(--dark-amethyst)] leading-none tracking-tight">
                {order.total_amount?.toLocaleString("ro-RO", {
                  minimumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-bold text-zinc-400">RON</span>
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
