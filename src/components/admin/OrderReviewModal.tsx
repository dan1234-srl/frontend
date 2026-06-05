import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Package,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Store,
} from "lucide-react";
import { toast } from "sonner";

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

  items: OrderItem[];
};

interface Props {
  orderId: string | null;
  onClose: () => void;
  onActionComplete: () => void;
}

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

export const OrderReviewModal = ({
  orderId,
  onClose,
  onActionComplete,
}: Props) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"approve" | "reject" | "dispatch" | null>(
    null,
  );
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // STATE-URI PENTRU LOCAȚIILE DINAMICE
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

  // EFFECT PENTRU FETCH ORDER DETAILS
  useEffect(() => {
    if (!orderId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Încarcă comanda
        const orderRes = await fetch(
          `${API_BASE_URL}/api/v1/orders/admin/${orderId}`,
          { credentials: "include" },
        );
        const orderData = await orderRes.json();
        setOrder(orderData);

        // 2. Încarcă locațiile după ce comanda e gata
        const locRes = await fetch(
          `${API_BASE_URL}/api/v1/orders/admin/pickup-locations`,
          { credentials: "include" },
        );
        const locData = await locRes.json();
        setLocationOptions(locData);
        if (locData && locData.length > 0) {
          setPickupLocationKey(locData[0].key);
        }
      } catch (err) {
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
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;
  }, [order]);

  const validation = useMemo(() => {
    if (!order) return { ok: true, issues: [] as string[] };
    const issues: string[] = [];

    if (order.delivery_type !== "locker") {
      if (!shipping.city && !shipping.City) issues.push("Lipsește orașul");
      if (
        !shipping.county &&
        !shipping.County &&
        !shipping.sector &&
        !shipping.Sector
      ) {
        issues.push("Lipsește județul/sectorul");
      }
      if (
        !shipping.postalCode &&
        !shipping.postal_code &&
        !shipping.zip &&
        !shipping.Zip
      ) {
        issues.push("Lipsește codul poștal");
      }
      if (!shipping.street && !shipping.Street) {
        issues.push("Lipsește strada");
      }
    } else {
      if (!order.locker_id) {
        issues.push("Lipsește locker-ul GLS");
      }
      if (
        !shipping.postalCode &&
        !shipping.postal_code &&
        !shipping.zip &&
        !shipping.Zip
      ) {
        issues.push("Lipsește codul poștal (necesar și pentru locker)");
      }
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

  // --- APROBARE SIMPLĂ (PATCH /process) ---
  const handleApprove = async () => {
    if (!order) return;
    if (!validation.ok) {
      toast.error(`Nu se poate aproba: date lipsă.`);
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

  // --- EXPEDIERE / DISPATCH (POST /dispatch) ---
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
            pickup_location_key: pickupLocationKey, // <--- ADĂUGAT AICI
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

  // --- RESPINGERE (PATCH /process) ---
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

  if (!orderId) return null;
  const currentStatus = order?.status?.trim().toLowerCase() || "";

  // Verificăm dacă comanda a fost deja expediată/anulată
  const isActionable = ![
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ].includes(currentStatus);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/50 backdrop-blur-md"
        />
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative w-full max-w-5xl bg-white sm:rounded-[2.5rem] rounded-t-[2rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        >
          {/* HEADER */}
          <header className="flex items-start justify-between p-5 sm:p-8 border-b border-zinc-100 shrink-0">
            <div className="space-y-1">
              <span
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em]"
                style={{ color: "var(--royal-violet)" }}
              >
                Review & Aprobare Comandă
              </span>
              <h2 className="heading-serif text-2xl sm:text-4xl italic text-[var(--dark-amethyst)]">
                {order?.order_number || "Se încarcă..."}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="size-10 sm:size-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </header>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3 text-zinc-400">
                <Loader2 className="animate-spin" size={28} />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  Sincronizare detalii comandă...
                </span>
              </div>
            ) : !order ? (
              <div className="flex flex-col items-center justify-center py-32 text-zinc-400 gap-2">
                <AlertTriangle size={32} />
                <span className="text-sm font-bold">Comandă indisponibilă</span>
              </div>
            ) : (
              <div className="p-5 sm:p-8 space-y-8">
                {/* VALIDATION BANNER */}
                <div
                  className={`rounded-2xl border p-5 ${
                    validation.ok
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-amber-200 bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {validation.ok ? (
                      <ShieldCheck
                        className="text-emerald-600 shrink-0"
                        size={20}
                      />
                    ) : (
                      <AlertTriangle
                        className="text-amber-600 shrink-0"
                        size={20}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-black uppercase tracking-widest ${
                          validation.ok ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {validation.ok
                          ? "Toate datele sunt valide — gata pentru AWB"
                          : `${validation.issues.length} problemă(e) detectate`}
                      </p>
                      {!validation.ok && (
                        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
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

                {/* CUSTOMER + SHIPPING + PICKUP LOCATION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Punct de ridicare AWB (Randat Dinamic) */}
                  <div className="lg:col-span-2">
                    <InfoBlock
                      title="Locație Ridicare Colet (Depozit GLS)"
                      icon={<Store size={14} />}
                    >
                      <div className="space-y-2 mt-1">
                        <select
                          value={pickupLocationKey}
                          onChange={(e) => setPickupLocationKey(e.target.value)}
                          className="w-full h-11 rounded-xl border-2 border-zinc-100 px-4 text-xs font-bold text-[var(--dark-amethyst)] outline-none focus:border-[var(--royal-violet)] transition-colors cursor-pointer appearance-none bg-zinc-50 hover:bg-zinc-100/80"
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
                        <p className="text-[10px] text-zinc-400 font-medium px-1">
                          Curierul GLS va fi trimis la această adresă pentru a
                          ridica comanda. Această adresă va fi setată automat ca
                          "Expeditor" pe AWB.
                        </p>
                      </div>
                    </InfoBlock>
                  </div>

                  <InfoBlock title="Client" icon={<User size={14} />}>
                    <Row label="Nume" value={order.customer_name} />
                    <Row
                      label="Email"
                      value={order.email}
                      icon={<Mail size={11} />}
                    />
                    <Row
                      label="Telefon"
                      value={order.phone}
                      icon={<Phone size={11} />}
                    />
                    <Row
                      label="Plată"
                      value={
                        order.payment_method === "cod"
                          ? "Ramburs (COD)"
                          : "Card online"
                      }
                    />
                  </InfoBlock>

                  <InfoBlock
                    title={
                      order.delivery_type === "locker"
                        ? "Livrare — Locker GLS"
                        : "Livrare — Curier"
                    }
                    icon={
                      order.delivery_type === "locker" ? (
                        <Package size={14} />
                      ) : (
                        <Truck size={14} />
                      )
                    }
                  >
                    {order.delivery_type === "locker" ? (
                      <>
                        <Row label="Locker" value={order.locker_id || "—"} />
                        <Row
                          label="Adresă"
                          value={order.locker_address || "—"}
                        />

                        <div className="flex items-center justify-between gap-2 text-xs mt-3 pt-3 border-t border-zinc-100">
                          <span className="text-zinc-400 font-medium shrink-0">
                            Cod poștal
                          </span>
                          <input
                            defaultValue={
                              shipping.postalCode || shipping.postal_code || ""
                            }
                            onChange={(e) =>
                              setShippingEdits((prev) => ({
                                ...prev,
                                postal_code: e.target.value,
                              }))
                            }
                            className="text-right font-bold text-[var(--dark-amethyst)] bg-transparent border-b border-dashed border-zinc-200 focus:border-[var(--royal-violet)] outline-none min-w-0 w-32"
                            placeholder="ex. 012345"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {[
                          {
                            label: "Stradă",
                            field: "street" as const,
                            value: `${shipping.street || ""} ${shipping.house_number || ""}`,
                          },
                          {
                            label: "Oraș",
                            field: "city" as const,
                            value: shipping.city,
                          },
                          {
                            label: "Județ",
                            field: "county" as const,
                            value: shipping.county,
                          },
                          {
                            label: "Cod poștal",
                            field: "postal_code" as const,
                            value: shipping.postalCode || shipping.postal_code,
                          },
                        ].map(({ label, field, value }) => (
                          <div
                            key={field}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-zinc-400 font-medium shrink-0">
                              {label}
                            </span>
                            <input
                              defaultValue={value || ""}
                              onChange={(e) =>
                                setShippingEdits((prev) => ({
                                  ...prev,
                                  [field]: e.target.value,
                                }))
                              }
                              className="text-right font-bold text-[var(--dark-amethyst)] bg-transparent border-b border-dashed border-zinc-200 focus:border-[var(--royal-violet)] outline-none min-w-0 w-32"
                            />
                          </div>
                        ))}
                      </>
                    )}

                    {Object.keys(shippingEdits).length > 0 && (
                      <button
                        onClick={saveShippingAddress}
                        disabled={savingShipping}
                        className="mt-3 w-full h-8 rounded-xl text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
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
                  </InfoBlock>
                </div>

                {/* ITEMS */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                    Produse ({order.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
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

                      const unitPrice = Number(
                        it.unit_price_at_purchase ??
                          it.unit_price_at_purchase ??
                          0,
                      );
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
                              <img
                                src={getImage(it.product_image)}
                                alt={it.product_name_at_purchase}
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                  ((e.target as HTMLImageElement).src =
                                    "/placeholder.png")
                                }
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
                                label="Greutate (kg)"
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
                                className="h-10 px-3 rounded-xl text-white text-[9px] font-black uppercase tracking-widest shadow-sm disabled:opacity-30 transition-all flex items-center justify-center gap-1.5 self-end"
                                style={{
                                  background: "var(--primary-gradient)",
                                }}
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
                </div>

                {/* TOTALS */}
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 space-y-2">
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
                  <div className="pt-2 mt-2 border-t border-zinc-200 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--dark-amethyst)]">
                      Total final
                    </span>
                    <span className="heading-serif text-2xl italic text-[var(--dark-amethyst)]">
                      {Number(order.total_amount || 0).toLocaleString("ro-RO")}{" "}
                      RON
                    </span>
                  </div>
                </div>

                {/* REJECT FORM */}
                <AnimatePresence>
                  {showRejectForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
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

          {/* FOOTER ACTIONS */}
          {order && (
            <footer className="p-5 sm:p-6 border-t border-zinc-100 bg-zinc-50/40 shrink-0 flex flex-col sm:flex-row gap-3">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={!!busy || !isActionable}
                    className="sm:flex-1 h-12 rounded-xl border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <XCircle size={14} /> Respinge
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={!!busy || !validation.ok || !isActionable}
                    className="sm:flex-1 h-12 rounded-xl bg-white border-2 border-[var(--royal-violet)] text-[var(--royal-violet)] text-[10px] font-black uppercase tracking-[0.3em] shadow-sm transition-all flex items-center justify-center gap-2 hover:bg-[var(--royal-violet)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="sm:flex-[2] h-12 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99]"
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
                    className="sm:flex-1 h-12 rounded-xl bg-white border border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 transition-all"
                  >
                    Anulează
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!!busy || !rejectReason.trim()}
                    className="sm:flex-[2] h-12 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all disabled:opacity-30 flex items-center justify-center gap-2 hover:bg-rose-700"
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const InfoBlock = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-zinc-100 bg-white p-5 h-full">
    <div className="flex items-center gap-2 mb-3">
      <div
        className="size-7 rounded-lg text-white flex items-center justify-center shrink-0"
        style={{ background: "var(--primary-gradient)" }}
      >
        {icon}
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
        {title}
      </h4>
    </div>
    <div className="space-y-1.5">{children}</div>
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
  <div className="flex items-start justify-between gap-3 text-xs">
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
  <div className="flex justify-between items-center text-xs">
    <span className="text-zinc-500">{label}</span>
    <span className={`font-bold ${accent || "text-zinc-800"}`}>
      {value} {accent?.includes("emerald") ? "RON" : "RON"}
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
      className={`w-full h-10 rounded-xl px-3 text-xs font-bold outline-none transition-all ${
        missing
          ? "bg-amber-50 border-2 border-amber-200 focus:border-amber-400"
          : "bg-white border-2 border-zinc-100 focus:border-[var(--royal-violet)]"
      }`}
    />
  </div>
);

export default OrderReviewModal;
