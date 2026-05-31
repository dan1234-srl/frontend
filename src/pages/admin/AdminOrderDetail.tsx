import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

const getImageUrl = (imageInput: any) => {
  if (!imageInput) return "/placeholder.png";
  let data = imageInput;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return data.startsWith("http") ? data : "/placeholder.png";
    }
  }
  const source = data?.main || (Array.isArray(data) ? data[0] : data);
  return (
    source?.medium ||
    source?.small ||
    source?.large ||
    (typeof source === "string" ? source : "/placeholder.png")
  );
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

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${orderId}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Comanda nu a putut fi găsită.");
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      toast.error(err.message || "Eroare la încărcarea comenzii.");
      navigate("/admin"); // Redirect dacă nu există
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

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
        fetchOrder();
      } else {
        toast.error("Eroare la actualizarea statusului.");
      }
    } catch {
      toast.error("Eroare de rețea.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
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
  const shipping = order.shipping_details || {};
  const isLocker = shipping.delivery_type === "locker";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans text-left pb-24"
    >
      {/* ─── HEADER ─── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-zinc-100 pb-8">
        <div className="space-y-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[var(--royal-violet)] transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Înapoi la Comenzi
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-[var(--dark-amethyst)]">
                Comanda{" "}
                <span className="text-zinc-300 font-sans not-italic font-medium text-3xl sm:text-4xl">
                  #{order.order_number || order.id?.split("-")[0]}
                </span>
              </h1>
              <span
                className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border"
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
              <Calendar size={12} /> {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
          <select
            value={order.status?.toLowerCase()}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updatingStatus}
            className="h-10 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-[var(--royal-violet)] min-w-[160px] cursor-pointer disabled:opacity-50"
          >
            <option value="pending">În așteptare</option>
            <option value="processing">În procesare</option>
            <option value="shipped">Expediată</option>
            <option value="delivered">Livrată</option>
            <option value="canceled">Anulată</option>
          </select>
          {updatingStatus && (
            <RefreshCw
              size={16}
              className="animate-spin text-[var(--royal-violet)]"
            />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* ─── COLOANA STÂNGĂ (Produse) ─── */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-50 flex items-center gap-2">
              <Package size={16} className="text-[var(--royal-violet)]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Produse Comandate ({order.items?.length || 0})
              </h3>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors items-center"
                >
                  <div className="size-16 sm:size-20 bg-white rounded-xl border border-zinc-100 overflow-hidden shrink-0">
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[var(--dark-amethyst)] truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      SKU: {item.product_sku}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-bold text-zinc-500 bg-zinc-200/50 px-2 py-0.5 rounded-md">
                        Cantitate: {item.quantity}
                      </span>
                      <span className="text-xs font-black text-zinc-800">
                        {formatCurrency(item.unit_price)} / buc
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                      Total
                    </p>
                    <p className="text-sm font-black text-[var(--dark-amethyst)]">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── COLOANA DREAPTĂ (Detalii Client, Livrare, Financiare) ─── */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
              <User size={14} className="text-[var(--royal-violet)]" /> Date
              Client
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  {order.customer_name ||
                    `${shipping.firstName} ${shipping.lastName}`}
                </p>
                {order.user_id && (
                  <p className="text-[9px] font-bold text-[var(--royal-violet)] bg-[var(--royal-violet)]/10 w-max px-2 py-0.5 rounded-full mt-1">
                    Client Înregistrat
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <a
                  href={`mailto:${order.email}`}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-[var(--royal-violet)] transition-colors"
                >
                  <Mail size={12} /> {order.email}
                </a>
                <a
                  href={`tel:${shipping.phone}`}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-[var(--royal-violet)] transition-colors"
                >
                  <Phone size={12} /> {shipping.phone || "Lipsă telefon"}
                </a>
              </div>
            </div>
          </div>

          {/* Livrare */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
              <MapPin size={14} className="text-[var(--royal-violet)]" /> Adresă
              Livrare
            </h3>
            <div className="p-4 rounded-xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 space-y-2">
              {isLocker ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-sm">
                      Locker GLS
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {shipping.locker_name}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {shipping.address?.street} {shipping.address?.house_number}
                    <br />
                    {shipping.address?.city}, {shipping.address?.county}
                    <br />
                    {shipping.address?.postal_code &&
                      `Cod Poștal: ${shipping.address.postal_code}`}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm">
                      <Truck size={9} className="inline mr-1" /> Curier Rapid
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {shipping.firstName} {shipping.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {shipping.address?.street} {shipping.address?.house_number}
                    <br />
                    {shipping.address?.city}, {shipping.address?.county}
                    <br />
                    {shipping.address?.postal_code &&
                      `Cod Poștal: ${shipping.address.postal_code}`}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Rezumat Financiar */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 flex items-center gap-2">
              <Receipt size={14} className="text-[var(--royal-violet)]" />{" "}
              Financiare
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-zinc-500">
                <span>Subtotal produse</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-zinc-500">
                <span>Taxă livrare</span>
                <span>
                  {order.shipping_fee > 0
                    ? formatCurrency(order.shipping_fee)
                    : "Gratuit"}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-500">
                  <span>Reducere (Voucher)</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Total de încasat
                </span>
                <span className="text-2xl font-black italic tracking-tighter text-[var(--dark-amethyst)]">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Metodă Plată
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <CreditCard
                  size={12}
                  className={
                    order.payment_method === "card"
                      ? "text-[var(--royal-violet)]"
                      : "text-zinc-500"
                  }
                />
                <span className="text-xs font-bold uppercase text-zinc-700">
                  {order.payment_method === "card"
                    ? "Card Online (Stripe)"
                    : "Ramburs"}
                </span>
              </div>
            </div>
            {order.stripe_payment_id && (
              <p className="text-[9px] text-zinc-400 flex items-center gap-1 font-mono">
                <AlertCircle size={10} /> ID Stripe: {order.stripe_payment_id}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrderDetail;
