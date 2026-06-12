import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  RefreshCw,
  AlertCircle,
  Receipt,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSWR } from "@/lib/admin-swr";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- Utilitare ---
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(val || 0) + " RON";

const formatDate = (dateString: string) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getImage = (raw: any): string => {
  if (!raw) return "/placeholder.png";
  if (typeof raw === "string") {
    if (raw.startsWith("http")) return raw;
    try {
      const p = JSON.parse(raw);
      return p?.main?.medium || p?.main?.small || p?.url || "/placeholder.png";
    } catch {
      return "/placeholder.png";
    }
  }
  return raw?.main?.medium || raw?.url || "/placeholder.png";
};

const STATUS_MAP: Record<
  string,
  { label: string; color: string; border: string; bg: string }
> = {
  pending: {
    label: "În așteptare",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  processing: {
    label: "În procesare",
    color: "var(--royal-violet)",
    bg: "rgba(123, 44, 191, 0.05)",
    border: "rgba(123, 44, 191, 0.15)",
  },
  shipped: {
    label: "Expediată",
    color: "#0369a1",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  delivered: {
    label: "Livrată",
    color: "#15803d",
    bg: "#dcfce7",
    border: "#86efac",
  },
  canceled: {
    label: "Anulată",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
};

// --- Componente UI (Portate din OrderReviewModal) ---
const InfoBlock = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4 border-b border-zinc-50 pb-3">
      <div
        className="size-8 rounded-lg text-white flex items-center justify-center shadow-sm"
        style={{ background: "var(--primary-gradient)" }}
      >
        {icon}
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
        {title}
      </h4>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3 text-xs py-1">
    <span className="text-zinc-400 font-medium flex items-center gap-1.5 shrink-0">
      {icon} {label}
    </span>
    <span className="font-bold text-[var(--dark-amethyst)] text-right break-words min-w-0">
      {value || "—"}
    </span>
  </div>
);

const RowTotal = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | React.ReactNode;
  accent?: string;
}) => (
  <div className="flex justify-between items-center text-xs py-1">
    <span className="text-zinc-500 font-medium">{label}</span>
    <span className={`font-bold ${accent || "text-[var(--dark-amethyst)]"}`}>
      {value}
    </span>
  </div>
);

// --- Componenta Principală ---
const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const {
    data: order,
    loading,
    mutate,
    error,
  } = useAdminSWR<any>(
    orderId ? `admin:order:${orderId}` : null,
    async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${orderId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Comanda nu a putut fi găsită.");
      return res.json();
    },
    { ttl: 30_000 },
  );

  // Redirect on permanent error (e.g. 404)
  if (error && !loading && !order) {
    toast.error(error.message || "Eroare la încărcarea comenzii.");
    navigate("/admin");
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        toast.success(
          `Status actualizat la: ${STATUS_MAP[newStatus]?.label || newStatus}`,
        );
        mutate(true);
      } else {
        toast.error("Eroare la actualizarea statusului.");
      }
    } catch {
      toast.error("Eroare de rețea.");
    } finally {
      setUpdatingStatus(false);
    }
  };


  const shipping = useMemo(() => {
    if (!order?.shipping_address) return {};
    return typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;
  }, [order]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse bg-[#fcfbfe] min-h-screen">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[500px] rounded-[2.5rem]" />
          <Skeleton className="h-[500px] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatusObj = STATUS_MAP[order.status?.toLowerCase()] || {
    label: order.status,
    color: "#71717a",
    bg: "#f4f4f5",
    border: "#e4e4e7",
  };
  const isLocker = order.delivery_type === "locker";

  return (
    <div className="min-h-screen bg-[#fcfbfe] font-sans text-left pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8"
      >
        {/* ─── HEADER ─── */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-zinc-100/80 pb-8">
          <div className="space-y-4">
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[var(--royal-violet)] transition-colors group bg-white border border-zinc-200/60 px-4 py-2 rounded-full shadow-sm w-max"
            >
              <ArrowLeft
                size={13}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Înapoi la Comenzi
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-[var(--dark-amethyst)]">
                  Comanda{" "}
                  <span className="text-zinc-300 font-sans not-italic font-medium text-3xl sm:text-4xl">
                    #
                    {order.order_number?.split("-").pop() ||
                      order.id?.split("-")[0]}
                  </span>
                </h1>
                <span
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm"
                  style={{
                    backgroundColor: currentStatusObj.bg,
                    color: currentStatusObj.color,
                    borderColor: currentStatusObj.border,
                  }}
                >
                  {currentStatusObj.label}
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                <Calendar size={13} /> Înregistrată:{" "}
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* ─── COLOANA STÂNGĂ (Produse) ─── */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-2">
              <div className="p-6 bg-zinc-50/50 rounded-t-[2rem] border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white shadow-sm rounded-xl text-[var(--royal-violet)]">
                    <Package size={18} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)]">
                    Coș de Cumpărături ({order.items?.length || 0})
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {order.items?.map((item: any) => {
                  // Fix pentru pret unitar si total NaN
                  const unitPrice = Number(item.unit_price_at_purchase ?? 0);
                  const totalPrice = Number(
                    item.total_item_price ?? unitPrice * (item.quantity || 1),
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-5 p-5 rounded-[1.5rem] border border-zinc-100 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all items-center"
                    >
                      <div className="size-24 bg-white rounded-2xl border border-zinc-100 overflow-hidden shrink-0 shadow-sm p-1 group">
                        <img
                          src={getImage(item.product_image)}
                          alt={item.product_name_at_purchase}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "/placeholder.png")
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                          SKU {item.product_sku_at_purchase}
                        </p>
                        <h4 className="font-bold text-sm text-[var(--dark-amethyst)] leading-tight">
                          {item.product_name_at_purchase}
                        </h4>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                          <span className="text-[11px] font-bold text-[var(--royal-violet)] bg-[var(--royal-violet)]/10 px-3 py-1 rounded-lg">
                            Cantitate: {item.quantity}
                          </span>
                          <span className="text-[11px] font-black text-zinc-500">
                            {formatCurrency(unitPrice)} / buc
                          </span>
                        </div>
                      </div>

                      <div className="text-center sm:text-right shrink-0 bg-white sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-none border-zinc-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                          Total Produs
                        </p>
                        <p className="text-lg font-black text-[var(--dark-amethyst)]">
                          {formatCurrency(totalPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── COLOANA DREAPTĂ (Detalii Client, Livrare, Financiare) ─── */}
          <div className="space-y-6">
            {/* Client Info */}
            <InfoBlock title="Profil Client" icon={<User size={16} />}>
              <div className="pb-3 mb-3 border-b border-zinc-100 flex justify-between items-center">
                <p className="text-sm font-black text-zinc-900">
                  {order.customer_name ||
                    `${shipping.first_name || shipping.firstName || ""} ${shipping.last_name || shipping.lastName || ""}`}
                </p>
                {order.user_id && (
                  <ShieldCheck
                    size={16}
                    className="text-emerald-500"
                    aria-label="Cont Înregistrat"
                  />
                )}
              </div>
              <Row
                label="Email"
                value={order.email}
                icon={<Mail size={12} />}
              />
              <Row
                label="Telefon"
                value={order.phone}
                icon={<Phone size={12} />}
              />
            </InfoBlock>

            {/* Livrare */}
            <InfoBlock
              title={isLocker ? "Livrare — GLS Locker" : "Livrare — Curier"}
              icon={isLocker ? <Package size={16} /> : <Truck size={16} />}
            >
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-2 relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${isLocker ? "bg-yellow-400" : "bg-[var(--royal-violet)]"}`}
                />
                {isLocker ? (
                  <>
                    <p className="text-sm font-bold text-[var(--dark-amethyst)] pl-2">
                      {order.locker_name ||
                        shipping.locker_name ||
                        "Locker GLS"}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium pl-2">
                      {order.locker_address ||
                        shipping.street ||
                        shipping.address}
                      <br />
                      {shipping.city},{" "}
                      {shipping.county ||
                        shipping.zip ||
                        shipping.postalCode ||
                        shipping.postal_code}
                    </p>
                    <p className="text-[9px] font-mono text-zinc-400 pl-2 mt-2">
                      ID: {order.locker_id || "N/A"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-[var(--dark-amethyst)] pl-2">
                      {shipping.first_name || shipping.firstName}{" "}
                      {shipping.last_name || shipping.lastName}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium pl-2">
                      {shipping.street}{" "}
                      {shipping.house_number || shipping.houseNumber}
                      <br />
                      {shipping.city}, {shipping.county}
                      <br />
                      {shipping.postalCode || shipping.postal_code
                        ? `Cod: ${shipping.postalCode || shipping.postal_code}`
                        : ""}
                    </p>
                  </>
                )}
              </div>
            </InfoBlock>

            {/* Rezumat Financiar */}
            <InfoBlock title="Decontare" icon={<Receipt size={16} />}>
              <div className="space-y-1 mb-4">
                <RowTotal
                  label="Subtotal produse"
                  value={formatCurrency(Number(order.subtotal_amount || 0))}
                />
                <RowTotal
                  label="Taxă livrare"
                  value={
                    Number(order.shipping_fee) > 0
                      ? formatCurrency(Number(order.shipping_fee))
                      : "Gratuit"
                  }
                />
                {Number(order.discount_amount) > 0 && (
                  <RowTotal
                    label="Reducere (Voucher)"
                    value={`-${formatCurrency(Number(order.discount_amount))}`}
                    accent="text-rose-500"
                  />
                )}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Suma Totală
                </span>
                <span className="text-2xl font-black italic tracking-tighter text-[var(--royal-violet)]">
                  {formatCurrency(Number(order.total_amount || 0))}
                </span>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={14}
                    className={
                      order.payment_method === "card"
                        ? "text-[var(--royal-violet)]"
                        : "text-zinc-500"
                    }
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
                    {order.payment_method === "card"
                      ? "Card (Stripe)"
                      : "Ramburs (C.O.D)"}
                  </span>
                </div>
                {order.payment_method === "card" && (
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">
                    Achitat
                  </span>
                )}
              </div>

              {order.stripe_payment_id && (
                <p className="text-[9px] text-zinc-400 flex items-center gap-1 font-mono mt-2 justify-center">
                  <AlertCircle size={10} /> ID Tranzacție:{" "}
                  {order.stripe_payment_id}
                </p>
              )}
            </InfoBlock>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOrderDetail;
