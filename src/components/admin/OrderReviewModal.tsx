/**
 * OrderReviewModal — Split Cinematic
 *
 * Built on top of AdminDialogShell. Desktop split layout: timeline + produse
 * (stânga 7 col), client / livrare / plată / sumar (dreapta 5 col sticky).
 * Mobile: bottom-sheet single column. Toată logica (fetch, save, approve,
 * dispatch, reject, GLS) este păstrată intactă.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Package,
  Truck,
  User,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Store,
  CreditCard,
  Receipt,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminDialogShell,
  AdminDialogTitle,
} from "@/components/admin/AdminDialogShell";
import { SmartImage } from "@/components/ui/smart-image";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

export type ProductSpecs = {
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
};

export type OrderItem = {
  id: string;
  product_id?: string;
  product_name_at_purchase: string;
  product_sku_at_purchase: string;
  product_image?: string | null;
  quantity: number;
  unit_price_at_purchase: number;
  total_item_price: number;
  product?: ProductSpecs;
};

export type ShippingAddress = {
  street?: string;
  house_number?: string;
  houseNumber?: string;
  city?: string;
  county?: string;
  sector?: string;
  postalCode?: string;
  postal_code?: string;
  zip?: string;
  locker_id?: string;
  locker_name?: string;
};

export type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: ShippingAddress;
  payment_method: string;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  delivery_type?: string;
  locker_id?: string | null;
  locker_address?: string | null;

  // 🚀 AWB și date GLS primite de la backend
  awb_number?: string | null; // Același lucru cu gls_parcel_number
  gls_parcel_number?: number | null;
  gls_last_status_code?: string | null;
  gls_last_status_desc?: string | null;
  gls_label_pdf_url?: string | null;

  items: OrderItem[];
};

interface Props {
  orderId: string | null;
  onClose: () => void;
  onActionComplete: () => void;
}

const getImage = (raw: any): string => {
  if (!raw) return "/placeholder.svg";
  if (typeof raw === "string") {
    if (raw.startsWith("http")) return raw;
    try {
      const p = JSON.parse(raw);
      return p?.main?.medium || p?.main?.small || p?.url || "/placeholder.svg";
    } catch {
      return "/placeholder.svg";
    }
  }
  return raw?.main?.medium || raw?.url || "/placeholder.svg";
};

const STATUS_TIMELINE = [
  { key: "pending", label: "Plasată" },
  { key: "processing", label: "Procesată" },
  { key: "shipped", label: "Expediată" },
  { key: "delivered", label: "Livrată" },
];

const resolveStep = (raw: string): number => {
  const s = (raw || "").toLowerCase();
  if (["livrat", "delivered", "completed"].includes(s)) return 3;
  if (["expediat", "shipped", "shipping"].includes(s)) return 2;
  if (["procesare", "processing", "confirmed", "paid"].includes(s)) return 1;
  if (["pending"].includes(s)) return 0;
  return -1;
};

export const OrderReviewModal = ({
  orderId,
  onClose,
  onActionComplete,
}: Props) => {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"approve" | "reject" | "dispatch" | null>(
    null,
  );
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [pickupLocationKey, setPickupLocationKey] = useState("");
  const [locationOptions, setLocationOptions] = useState<
    { key: string; label: string }[]
  >([]);

  const [edits, setEdits] = useState<Record<string, ProductSpecs>>({});
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [shippingEdits, setShippingEdits] = useState<Partial<ShippingAddress>>(
    {},
  );
  const [savingShipping, setSavingShipping] = useState(false);

  const saveShippingAddress = async () => {
    if (!order) return;
    setSavingShipping(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${order.id}/shipping-address`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(shippingEdits),
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Adresă actualizată.");
        setOrder((o) =>
          o ? { ...o, shipping_address: data.shipping_address } : o,
        );
        setShippingEdits({});
      } else {
        toast.error(data.detail || "Salvare eșuată.");
      }
    } catch {
      toast.error("Eroare rețea.");
    } finally {
      setSavingShipping(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setShowRejectForm(false);
      setRejectReason("");
      setEdits({});
      setShippingEdits({});
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const orderRes = await fetch(
          `${API_BASE_URL}/api/v1/orders/admin/${orderId}`,
          { credentials: "include" },
        );
        const orderData = await orderRes.json();
        setOrder(orderData);

        const locRes = await fetch(
          `${API_BASE_URL}/api/v1/orders/admin/pickup-locations`,
          { credentials: "include" },
        );
        const locData = await locRes.json();
        setLocationOptions(locData);
        if (locData && locData.length > 0) {
          setPickupLocationKey(locData[0].key);
        }
      } catch {
        toast.error("Eroare la încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const shipping = useMemo(() => {
    if (!order?.shipping_address) return {};
    return typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address as any)
      : order.shipping_address;
  }, [order]);

  const validation = useMemo(() => {
    if (!order) return { ok: true, issues: [] as string[] };
    const issues: string[] = [];
    if (order.delivery_type !== "locker") {
      if (!shipping.city && !(shipping as any).City)
        issues.push("Lipsește orașul");
      if (
        !shipping.county &&
        !(shipping as any).County &&
        !shipping.sector &&
        !(shipping as any).Sector
      )
        issues.push("Lipsește județul/sectorul");
      if (
        !shipping.postalCode &&
        !shipping.postal_code &&
        !shipping.zip &&
        !(shipping as any).Zip
      )
        issues.push("Lipsește codul poștal");
      if (!shipping.street && !(shipping as any).Street)
        issues.push("Lipsește strada");
    } else {
      if (!order.locker_id) issues.push("Lipsește locker-ul GLS");
      if (
        !shipping.postalCode &&
        !shipping.postal_code &&
        !shipping.zip &&
        !(shipping as any).Zip
      )
        issues.push("Lipsește codul poștal (necesar și pentru locker)");
    }
    if (!order.phone) issues.push("Lipsește telefonul de contact");
    if (!order.email) issues.push("Lipsește email-ul de contact");
    if (!pickupLocationKey)
      issues.push("Selecția depozitului de expediere este obligatorie");

    order.items?.forEach((it) => {
      const p = it.product || {};
      const eff: ProductSpecs = {
        weight: edits[it.product_id || ""]?.weight ?? p.weight,
        length: edits[it.product_id || ""]?.length ?? p.length,
        width: edits[it.product_id || ""]?.width ?? p.width,
        height: edits[it.product_id || ""]?.height ?? p.height,
      };
      if (!eff.weight || Number(eff.weight) <= 0)
        issues.push(`Greutate lipsă: ${it.product_sku_at_purchase}`);
      if (!eff.length || !eff.width || !eff.height)
        issues.push(`Dimensiuni incomplete: ${it.product_sku_at_purchase}`);
    });

    return { ok: issues.length === 0, issues };
  }, [order, shipping, edits, pickupLocationKey]);

  const updateEdit = (
    pid: string,
    field: keyof ProductSpecs,
    value: string,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [field]: value === "" ? null : Number(value) },
    }));
  };

  const saveProductSpecs = async (item: OrderItem) => {
    if (!item.product_id) {
      toast.error("Produs fără ID — nu poate fi salvat.");
      return;
    }
    const patch = edits[item.product_id];
    if (!patch || Object.keys(patch).length === 0) {
      toast.info("Nicio modificare de salvat.");
      return;
    }
    setSavingSku(item.product_sku_at_purchase);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/products/${item.product_id}/specs`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patch),
        },
      );
      if (res.ok) {
        toast.success(
          `Specs actualizate pentru ${item.product_sku_at_purchase}`,
        );
        setOrder((o) =>
          o
            ? {
                ...o,
                items: o.items.map((it) =>
                  it.id === item.id
                    ? { ...it, product: { ...(it.product || {}), ...patch } }
                    : it,
                ),
              }
            : o,
        );
        setEdits((prev) => {
          const n = { ...prev };
          delete n[item.product_id!];
          return n;
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Salvare eșuată.");
      }
    } catch {
      toast.error("Eroare rețea la salvare.");
    } finally {
      setSavingSku(null);
    }
  };

  const handleApprove = async () => {
    if (!order) return;
    if (!validation.ok) {
      toast.error("Nu se poate aproba: date lipsă.");
      return;
    }
    setBusy("approve");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${order.id}/process`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "approve",
            pickup_location_key: pickupLocationKey,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "Comandă aprobată cu succes.");
        onActionComplete();
        onClose();
      } else {
        toast.error(data.detail || "Aprobarea a eșuat.");
      }
    } catch {
      toast.error("Eroare rețea la aprobare.");
    } finally {
      setBusy(null);
    }
  };

  const handleDispatch = async () => {
    if (!order) return;
    if (!validation.ok) {
      toast.error("Completează datele lipsă înainte de a expedia comanda.");
      return;
    }
    setBusy("dispatch");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${order.id}/dispatch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            courier_name: "GLS",
            use_gls_api: true,
            pickup_location_key: pickupLocationKey,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Comanda a fost expediată și AWB-ul a fost generat!");
        onActionComplete();
        onClose();
      } else {
        toast.error(data.detail || "Expedierea a eșuat.");
      }
    } catch {
      toast.error("Eroare de rețea la expediere.");
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (!order) return;
    if (!rejectReason.trim()) {
      toast.error("Introduceți un motiv pentru respingere.");
      return;
    }
    setBusy("reject");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/${order.id}/process`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "reject", reason: rejectReason }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Comandă respinsă. Stocul a fost restaurat.");
        onActionComplete();
        onClose();
      } else {
        toast.error(data.detail || "Respingere eșuată.");
      }
    } catch {
      toast.error("Eroare rețea.");
    } finally {
      setBusy(null);
    }
  };

  const currentStatus = order?.status?.trim().toLowerCase() || "";
  const isActionable = !["delivered", "cancelled", "returned"].includes(
    currentStatus,
  );
  const stepIdx = resolveStep(currentStatus);

  const initials = (order?.customer_name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AdminDialogShell
      open={!!orderId}
      onOpenChange={(o) => !o && onClose()}
      size="xl"
      mobileVariant="sheet"
    >
      <AdminDialogTitle>
        Review comandă {order?.order_number || ""}
      </AdminDialogTitle>

      {/* ── HERO HEADER ──────────────────────────────────────────────── */}
      <header className="relative overflow-hidden px-6 sm:px-10 pt-7 pb-6 border-b border-zinc-100 shrink-0">
        {/* Aurora */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, var(--royal-violet) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, var(--dark-amethyst) 0%, transparent 55%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)] mb-1.5">
              Review & Aprobare Comandă
            </p>
            <h2 className="heading-serif text-3xl sm:text-4xl tracking-tighter text-[var(--dark-amethyst)] font-medium leading-none">
              {order?.order_number || "Se încarcă..."}
            </h2>
            {order && (
              <p className="text-[11px] font-medium text-zinc-500 mt-2">
                {new Date(order.created_at).toLocaleString("ro-RO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          {order && (
            <div className="flex flex-col sm:items-end gap-1">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Total
              </p>
              <p className="heading-serif text-3xl tracking-tight text-[var(--dark-amethyst)] font-medium tabular-nums">
                {Number(order.total_amount || 0).toLocaleString("ro-RO")}
                <span className="text-xs font-black ml-1.5 opacity-50 uppercase tracking-widest">
                  RON
                </span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto luxury-scrollbar">
        {loading ? (
          <SplitSkeleton />
        ) : !order ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-400 gap-2">
            <AlertTriangle size={32} />
            <span className="text-sm font-bold">Comandă indisponibilă</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
            {/* ── STÂNGA (timeline + produse) ─────────────────── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Validation banner */}
              <div
                className={`rounded-2xl border p-4 ${
                  validation.ok
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-amber-200 bg-amber-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {validation.ok ? (
                    <ShieldCheck
                      className="text-emerald-600 shrink-0"
                      size={18}
                    />
                  ) : (
                    <AlertTriangle
                      className="text-amber-600 shrink-0"
                      size={18}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[11px] font-black uppercase tracking-widest ${
                        validation.ok ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {validation.ok
                        ? "Toate datele sunt valide — gata pentru AWB"
                        : `${validation.issues.length} problemă(e) detectate`}
                    </p>
                    {!validation.ok && (
                      <ul className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                        {validation.issues.map((iss, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-amber-900/80 flex items-start gap-2"
                          >
                            <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {iss}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline vertical */}
              <SectionCard
                eyebrow="Status"
                title="Evoluție comandă"
                icon={<Truck size={14} />}
              >
                <div className="relative pl-6 mt-2">
                  <div
                    aria-hidden
                    className="absolute left-[10px] top-1 bottom-1 w-[2px] bg-zinc-100"
                  />
                  {stepIdx >= 0 && (
                    <motion.div
                      aria-hidden
                      className="absolute left-[10px] top-1 w-[2px] rounded-full"
                      initial={{ height: 0 }}
                      animate={{
                        height: reduce
                          ? `${((stepIdx + 1) / STATUS_TIMELINE.length) * 100}%`
                          : `${((stepIdx + 1) / STATUS_TIMELINE.length) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        background:
                          "linear-gradient(180deg, var(--royal-violet), var(--lavender-purple, #a78bfa))",
                      }}
                    />
                  )}
                  <div className="space-y-3">
                    {STATUS_TIMELINE.map((s, i) => {
                      const done = i <= stepIdx;
                      const current = i === stepIdx;
                      return (
                        <div
                          key={s.key}
                          className="relative flex items-center gap-3"
                        >
                          <div
                            className={`absolute -left-6 size-[22px] rounded-full flex items-center justify-center transition ${
                              done
                                ? "bg-white"
                                : "bg-white border border-zinc-100"
                            }`}
                            style={
                              done
                                ? {
                                    boxShadow: current
                                      ? "0 0 0 4px color-mix(in srgb, var(--royal-violet) 18%, transparent)"
                                      : "0 0 0 2px color-mix(in srgb, var(--royal-violet) 12%, transparent)",
                                  }
                                : undefined
                            }
                          >
                            {done && (
                              <span
                                className="size-2 rounded-full"
                                style={{ background: "var(--royal-violet)" }}
                              />
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-black uppercase tracking-[0.25em] ${
                              done
                                ? "text-[var(--dark-amethyst)]"
                                : "text-zinc-400"
                            }`}
                          >
                            {s.label}
                          </span>
                          {current && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{
                                background:
                                  "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                                color: "var(--royal-violet)",
                              }}
                            >
                              Activ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>

              {/* Produse */}
              <SectionCard
                eyebrow={`${order.items?.length || 0} produse`}
                title="Articole comandă"
                icon={<Package size={14} />}
              >
                <div className="space-y-3 mt-2">
                  {order.items?.map((it) => {
                    const p = it.product || {};
                    const eff: ProductSpecs = {
                      weight: edits[it.product_id || ""]?.weight ?? p.weight,
                      length: edits[it.product_id || ""]?.length ?? p.length,
                      width: edits[it.product_id || ""]?.width ?? p.width,
                      height: edits[it.product_id || ""]?.height ?? p.height,
                    };
                    const missingWeight =
                      !eff.weight || Number(eff.weight) <= 0;
                    const missingDims =
                      !eff.length || !eff.width || !eff.height;
                    const hasEdits =
                      it.product_id &&
                      edits[it.product_id] &&
                      Object.keys(edits[it.product_id]).length > 0;

                    const unitPrice = Number(it.unit_price_at_purchase ?? 0);
                    const totalPrice = Number(
                      it.total_item_price ?? unitPrice * (it.quantity || 1),
                    );

                    return (
                      <div
                        key={it.id}
                        className="rounded-2xl border border-zinc-100 bg-white overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                          <div className="size-20 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                            <SmartImage
                              src={getImage(it.product_image)}
                              alt={it.product_name_at_purchase}
                              aspectRatio="1/1"
                              objectFit="cover"
                              className="w-full h-full"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                              SKU {it.product_sku_at_purchase}
                            </p>
                            <p className="text-sm font-black text-[var(--dark-amethyst)] line-clamp-2">
                              {it.product_name_at_purchase}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 mt-1.5">
                              <span>
                                Cant: <b>{it.quantity}</b>
                              </span>
                              <span>
                                Preț:{" "}
                                <b>{unitPrice.toLocaleString("ro-RO")} RON</b>
                              </span>
                              <span>
                                Total:{" "}
                                <b className="text-[var(--dark-amethyst)]">
                                  {totalPrice.toLocaleString("ro-RO")} RON
                                </b>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-zinc-50/60 border-t border-zinc-100 p-4">
                          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                              Specificații logistice
                            </p>
                            {(missingWeight || missingDims) && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle size={10} /> Date lipsă
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                            <SpecInput
                              label="kg"
                              value={eff.weight}
                              missing={missingWeight}
                              onChange={(v) =>
                                it.product_id &&
                                updateEdit(it.product_id, "weight", v)
                              }
                            />
                            <SpecInput
                              label="L (cm)"
                              value={eff.length}
                              missing={!eff.length}
                              onChange={(v) =>
                                it.product_id &&
                                updateEdit(it.product_id, "length", v)
                              }
                            />
                            <SpecInput
                              label="l (cm)"
                              value={eff.width}
                              missing={!eff.width}
                              onChange={(v) =>
                                it.product_id &&
                                updateEdit(it.product_id, "width", v)
                              }
                            />
                            <SpecInput
                              label="H (cm)"
                              value={eff.height}
                              missing={!eff.height}
                              onChange={(v) =>
                                it.product_id &&
                                updateEdit(it.product_id, "height", v)
                              }
                            />
                            <button
                              disabled={
                                !hasEdits ||
                                savingSku === it.product_sku_at_purchase
                              }
                              onClick={() => saveProductSpecs(it)}
                              className="h-10 px-3 rounded-xl text-white text-[9px] font-black uppercase tracking-widest shadow-sm disabled:opacity-30 transition flex items-center justify-center gap-1.5 self-end"
                              style={{ background: "var(--primary-gradient)" }}
                            >
                              {savingSku === it.product_sku_at_purchase ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <Save size={12} />
                              )}
                              Salvează
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            {/* ── DREAPTA (sticky panel) ──────────────────────── */}
            <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-0 self-start">
              {(order.gls_parcel_number || order.awb_number) && (
                <SectionCard
                  eyebrow="Livrare GLS"
                  title={`AWB: ${order.gls_parcel_number || order.awb_number}`}
                  icon={<Truck size={14} />}
                >
                  <div className="mt-4 space-y-4">
                    {loadingTracking ? (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 animate-pulse">
                        <Loader2 className="animate-spin" size={12} /> Se
                        actualizează statusul...
                      </div>
                    ) : trackingData.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-[var(--royal-violet)]">
                          Status: {trackingData[0].StatusDescription}
                        </p>
                        <div className="relative pl-4 border-l-2 border-zinc-200 space-y-3">
                          {trackingData.slice(0, 3).map((t, i) => (
                            <div key={i} className="text-[10px]">
                              <p className="font-bold text-zinc-700">
                                {t.StatusDescription}
                              </p>
                              <p className="text-zinc-400">
                                {formatGlsDate(t.StatusDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <a
                      href={`https://gls-group.com/RO/ro/urmarire-colet?match=${order.gls_parcel_number || order.awb_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 text-[9px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-zinc-100 transition"
                    >
                      Vezi tot istoricul pe GLS
                    </a>
                  </div>
                </SectionCard>
              )}

              {/* Pickup location */}
              <SectionCard
                eyebrow="Expeditor"
                title="Depozit ridicare"
                icon={<Store size={14} />}
              >
                <select
                  value={pickupLocationKey}
                  onChange={(e) => setPickupLocationKey(e.target.value)}
                  className="w-full h-11 rounded-xl border-2 border-zinc-100 px-4 text-xs font-bold text-[var(--dark-amethyst)] outline-none focus:border-[var(--royal-violet)] transition cursor-pointer bg-zinc-50 hover:bg-zinc-100/80 mt-2"
                >
                  {locationOptions.length === 0 ? (
                    <option value="">Se încarcă locațiile...</option>
                  ) : (
                    locationOptions.map((loc) => (
                      <option key={loc.key} value={loc.key}>
                        {loc.label}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-[10px] text-zinc-400 font-medium mt-2">
                  Adresa de la care curierul GLS ridică coletul.
                </p>
              </SectionCard>

              {/* Client */}
              <SectionCard
                eyebrow="Client"
                title={order.customer_name || "Anonim"}
                icon={<User size={14} />}
              >
                <div className="flex items-center gap-3 mt-2 mb-3">
                  <div
                    className="size-11 rounded-full flex items-center justify-center text-xs font-black"
                    style={{
                      background:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                      color: "var(--royal-violet)",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 truncate">
                      <Mail size={11} /> {order.email || "—"}
                    </p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 truncate">
                      <Phone size={11} /> {order.phone || "—"}
                    </p>
                  </div>
                </div>
              </SectionCard>
              {order.awb_number && (
                <SectionCard
                  eyebrow="Tracking Courier"
                  title={`AWB: ${order.awb_number}`}
                  icon={<Truck size={14} />}
                >
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`https://gls-group.com/RO/ro/urmarire-colet?match=${order.awb_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 h-9 rounded-xl border border-zinc-200 bg-zinc-50 text-[9px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] flex items-center justify-center hover:bg-zinc-100 transition"
                    >
                      Urmărește Coletul
                    </a>
                  </div>
                </SectionCard>
              )}
              {/* Livrare */}
              <SectionCard
                eyebrow={
                  order.delivery_type === "locker"
                    ? "Livrare locker"
                    : "Livrare curier"
                }
                title={
                  order.delivery_type === "locker"
                    ? order.locker_id || "Locker GLS"
                    : "Adresă livrare"
                }
                icon={
                  order.delivery_type === "locker" ? (
                    <Package size={14} />
                  ) : (
                    <MapPin size={14} />
                  )
                }
              >
                <div className="space-y-1.5 mt-2">
                  {order.delivery_type === "locker" ? (
                    <>
                      <Row label="Adresă" value={order.locker_address || "—"} />
                      <EditableRow
                        label="Cod poștal"
                        defaultValue={
                          shipping.postalCode || shipping.postal_code || ""
                        }
                        onChange={(v) =>
                          setShippingEdits((prev) => ({
                            ...prev,
                            postal_code: v,
                          }))
                        }
                      />
                    </>
                  ) : (
                    <>
                      <EditableRow
                        label="Stradă"
                        defaultValue={`${shipping.street || ""} ${shipping.house_number || ""}`.trim()}
                        onChange={(v) =>
                          setShippingEdits((prev) => ({ ...prev, street: v }))
                        }
                      />
                      <EditableRow
                        label="Oraș"
                        defaultValue={shipping.city || ""}
                        onChange={(v) =>
                          setShippingEdits((prev) => ({ ...prev, city: v }))
                        }
                      />
                      <EditableRow
                        label="Județ"
                        defaultValue={shipping.county || ""}
                        onChange={(v) =>
                          setShippingEdits((prev) => ({ ...prev, county: v }))
                        }
                      />
                      <EditableRow
                        label="Cod poștal"
                        defaultValue={
                          shipping.postalCode || shipping.postal_code || ""
                        }
                        onChange={(v) =>
                          setShippingEdits((prev) => ({
                            ...prev,
                            postal_code: v,
                          }))
                        }
                      />
                    </>
                  )}

                  {Object.keys(shippingEdits).length > 0 && (
                    <button
                      onClick={saveShippingAddress}
                      disabled={savingShipping}
                      className="mt-3 w-full h-9 rounded-xl text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      {savingShipping ? (
                        <Loader2 className="animate-spin" size={11} />
                      ) : (
                        <Save size={11} />
                      )}
                      Salvează adresa
                    </button>
                  )}
                </div>
              </SectionCard>

              {/* Plată */}
              <SectionCard
                eyebrow="Plată"
                title={
                  order.payment_method === "cod"
                    ? "Ramburs (COD)"
                    : "Card online"
                }
                icon={<CreditCard size={14} />}
              />

              {/* Totals */}
              <SectionCard
                eyebrow="Sumar"
                title="Totaluri"
                icon={<Receipt size={14} />}
              >
                <div className="space-y-1.5 mt-2">
                  <RowTotal
                    label="Subtotal"
                    value={Number(order.subtotal_amount || 0).toLocaleString(
                      "ro-RO",
                    )}
                  />
                  {Number(order.discount_amount) > 0 && (
                    <RowTotal
                      label="Reducere"
                      value={`−${Number(order.discount_amount).toLocaleString("ro-RO")}`}
                      accent="text-emerald-600"
                    />
                  )}
                  <RowTotal
                    label="Livrare"
                    value={
                      Number(order.shipping_fee) > 0
                        ? Number(order.shipping_fee).toLocaleString("ro-RO")
                        : "Gratuit"
                    }
                  />
                  <div className="pt-2 mt-1 border-t border-zinc-100 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--dark-amethyst)]">
                      Total
                    </span>
                    <span className="heading-serif text-xl tracking-tight text-[var(--dark-amethyst)] font-medium">
                      {Number(order.total_amount || 0).toLocaleString("ro-RO")}{" "}
                      RON
                    </span>
                  </div>
                </div>
              </SectionCard>
            </aside>

            {/* Reject form (full-width sub) */}
            <AnimatePresence>
              {showRejectForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden lg:col-span-12"
                >
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                      Motiv respingere (vizibil clientului)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full bg-white border-2 border-rose-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 resize-none"
                      placeholder="ex. Produsul nu mai este pe stoc."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── FOOTER ACTIONS ──────────────────────────────────────────── */}
      {order && (
        <footer
          className="px-6 sm:px-8 py-4 sm:py-5 border-t border-zinc-100 bg-white/80 backdrop-blur-xl shrink-0 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
        >
          {!showRejectForm ? (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={!!busy || !isActionable}
                className="sm:flex-1 h-12 rounded-xl border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 transition flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <XCircle size={14} /> Respinge
              </button>
              <button
                onClick={handleApprove}
                disabled={!!busy || !validation.ok || !isActionable}
                className="sm:flex-1 h-12 rounded-xl bg-white border-2 border-[var(--royal-violet)] text-[var(--royal-violet)] text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center justify-center gap-2 hover:bg-[var(--royal-violet)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {busy === "approve" ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Aprobă
              </button>
              <button
                onClick={handleDispatch}
                disabled={!!busy || !validation.ok || !isActionable}
                className="sm:flex-[2] h-12 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99]"
                style={{ background: "var(--primary-gradient)" }}
              >
                {busy === "dispatch" ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Truck size={14} />
                )}
                {validation.ok
                  ? "Expediază (Dispatch AWB)"
                  : "Completează datele lipsă"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
                disabled={!!busy}
                className="sm:flex-1 h-12 rounded-xl bg-white border border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 transition"
              >
                Anulează
              </button>
              <button
                onClick={handleReject}
                disabled={!!busy || !rejectReason.trim()}
                className="sm:flex-[2] h-12 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition disabled:opacity-30 flex items-center justify-center gap-2 hover:bg-rose-700"
              >
                {busy === "reject" ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                Confirmă respingere
              </button>
            </>
          )}
        </footer>
      )}
    </AdminDialogShell>
  );
};

// ───────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────

const SectionCard = ({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-zinc-100 bg-white p-5">
    <div className="flex items-center gap-3">
      <div
        className="size-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          color: "var(--royal-violet)",
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
          {eyebrow}
        </p>
        <p className="text-sm font-bold text-[var(--dark-amethyst)] truncate">
          {title}
        </p>
      </div>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3 text-xs">
    <span className="text-zinc-400 font-medium shrink-0">{label}</span>
    <span className="font-bold text-[var(--dark-amethyst)] text-right break-words min-w-0">
      {value || "—"}
    </span>
  </div>
);

const EditableRow = ({
  label,
  defaultValue,
  onChange,
}: {
  label: string;
  defaultValue: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <span className="text-zinc-400 font-medium shrink-0">{label}</span>
    <input
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      className="text-right font-bold text-[var(--dark-amethyst)] bg-transparent border-b border-dashed border-zinc-200 focus:border-[var(--royal-violet)] outline-none min-w-0 flex-1"
    />
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
  <div className="flex justify-between items-center text-xs">
    <span className="text-zinc-500">{label}</span>
    <span className={`font-bold ${accent || "text-zinc-800"}`}>
      {value} RON
    </span>
  </div>
);

const SpecInput = ({
  label,
  value,
  missing,
  onChange,
}: {
  label: string;
  value: any;
  missing: boolean;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1">
    <label
      className={`text-[8px] font-black uppercase tracking-widest block ${
        missing ? "text-amber-600" : "text-zinc-400"
      }`}
    >
      {label}
    </label>
    <input
      type="number"
      step="0.01"
      min="0"
      defaultValue={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="—"
      className={`w-full h-10 rounded-xl px-3 text-xs font-bold outline-none transition ${
        missing
          ? "bg-amber-50 border-2 border-amber-200 focus:border-amber-400"
          : "bg-white border-2 border-zinc-100 focus:border-[var(--royal-violet)]"
      }`}
    />
  </div>
);

const SplitSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 animate-pulse">
    <div className="lg:col-span-7 space-y-4">
      <div className="h-16 rounded-2xl bg-zinc-100" />
      <div className="h-40 rounded-2xl bg-zinc-100" />
      <div className="h-32 rounded-2xl bg-zinc-100" />
      <div className="h-32 rounded-2xl bg-zinc-100" />
    </div>
    <div className="lg:col-span-5 space-y-4">
      <div className="h-24 rounded-2xl bg-zinc-100" />
      <div className="h-28 rounded-2xl bg-zinc-100" />
      <div className="h-36 rounded-2xl bg-zinc-100" />
      <div className="h-20 rounded-2xl bg-zinc-100" />
    </div>
  </div>
);

export default OrderReviewModal;
