/**
 * CheckoutPopup.tsx
 * Design Premium "Atelier Suite" - Experiență de plată modernă și fluidă
 */

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useRef,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  CreditCard,
  Truck,
  Check,
  ChevronLeft,
  Loader2,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Plus,
  MapPin,
  ShieldCheck,
  Package,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const GLSLockerMap = lazy(() => import("@/pages/gls/GLSLockerMap"));

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";
const MAX_MAP_POINTS = 80;

function useDebounce(value: string, delay = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(val) + " RON";

const getImageUrl = (imageInput: any) => {
  if (!imageInput) return "/placeholder.png";
  let data = imageInput;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
      if (typeof data === "string") data = JSON.parse(data);
    } catch {
      return data.startsWith("http") ? data : "/placeholder.png";
    }
  }
  const source = data?.main || (Array.isArray(data) ? data[0] : data);
  const rawUrl =
    source?.medium ||
    source?.small ||
    source?.large ||
    (typeof source === "string" ? source : "");
  return rawUrl || "/placeholder.png";
};

// ─── COMPONENTE REUTILIZABILE UI ───

const PremiumInput = ({
  label,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  error,
  helperText,
  type = "text",
  autoComplete,
}: any) => {
  const isValid = value && !error;
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <div className="flex justify-between items-center px-1">
        <label
          className={`text-[8.5px] font-black uppercase tracking-[0.25em] transition-colors ${error ? "text-rose-500" : isValid ? "text-[var(--royal-violet)]" : "text-zinc-400"}`}
        >
          {label}
        </label>
        <AnimatePresence mode="wait">
          {error && (
            <motion.span
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[8.5px] font-bold text-rose-500 flex items-center gap-1"
            >
              <AlertCircle size={9} /> {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`h-11 w-full border rounded-xl px-4 text-[13px] font-bold transition-all outline-none placeholder:text-zinc-300 placeholder:font-medium shadow-sm ${
          error
            ? "border-rose-200 bg-rose-50/30 focus:ring-2 focus:ring-rose-100 focus:border-rose-400 text-rose-900"
            : isValid
              ? "border-violet-200/50 bg-violet-50/10 focus:ring-2 focus:ring-violet-100 focus:border-[var(--royal-violet)] text-[var(--dark-amethyst)]"
              : "border-zinc-200 bg-zinc-50/50 focus:ring-2 focus:ring-violet-100 focus:border-violet-300 focus:bg-white text-zinc-800"
        }`}
      />
      {helperText && !error && (
        <p className="text-[9px] text-zinc-400 px-1">{helperText}</p>
      )}
    </div>
  );
};

const PremiumSelect = ({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  placeholder,
}: any) => {
  const isValid = value && !error && !disabled;
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <div className="flex justify-between items-center px-1">
        <label
          className={`text-[8.5px] font-black uppercase tracking-[0.25em] transition-colors ${error ? "text-rose-500" : isValid ? "text-[var(--royal-violet)]" : "text-zinc-400"}`}
        >
          {label}
        </label>
        {error && (
          <span className="text-[8.5px] font-bold text-rose-500 flex items-center gap-1">
            <AlertCircle size={9} /> {error}
          </span>
        )}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-11 w-full border rounded-xl pl-4 pr-10 text-[13px] font-bold transition-all outline-none appearance-none cursor-pointer shadow-sm ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-zinc-100 border-zinc-200 text-zinc-400"
              : error
                ? "border-rose-200 bg-rose-50/30 focus:ring-2 focus:ring-rose-100 text-rose-900"
                : isValid
                  ? "border-violet-200/50 bg-violet-50/10 focus:ring-2 focus:ring-violet-100 focus:border-[var(--royal-violet)] text-[var(--dark-amethyst)]"
                  : "border-zinc-200 bg-zinc-50/50 focus:ring-2 focus:ring-violet-100 focus:border-violet-300 focus:bg-white text-zinc-800"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt: any) => (
            <option key={opt.id || opt.auto || opt.nume} value={opt.nume}>
              {opt.nume}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isValid ? "text-[var(--royal-violet)]" : "text-zinc-400"}`}
        />
      </div>
    </div>
  );
};

const LockerConfirmCard = ({ locker, onClear }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -5, scale: 0.98 }}
    className="relative p-4 rounded-2xl border bg-white shadow-sm flex items-start gap-4 overflow-hidden"
    style={{
      borderColor: "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--royal-violet)]/5 to-transparent pointer-events-none" />
    <div className="p-2.5 bg-[var(--royal-violet)] text-white rounded-xl shrink-0 shadow-[0_4px_15px_-3px_rgba(123,44,191,0.4)] relative z-10">
      <CheckCircle2 size={16} strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0 relative z-10 py-0.5">
      <p className="text-[8.5px] font-black uppercase tracking-[0.25em] text-[var(--royal-violet)] mb-1 flex items-center gap-1.5">
        <Sparkles size={10} /> Punct de Ridicare
      </p>
      <p className="text-[13px] font-bold text-[var(--dark-amethyst)] truncate leading-tight">
        {locker.name}
      </p>
      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
        {locker.street} {locker.house_number}, {locker.city}
      </p>
    </div>
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClear();
      }}
      className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-colors shrink-0 relative z-10"
    >
      <X size={14} strokeWidth={2.5} />
    </button>
  </motion.div>
);

const OrderSummary = ({ cartItems, totals, compact = false }: any) => (
  <div
    className={`flex flex-col h-full ${compact ? "space-y-4" : "overflow-hidden"}`}
  >
    {!compact && (
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <ShoppingBag size={14} style={{ color: "var(--royal-violet)" }} />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)]">
          Rezumat Comandă
        </p>
      </div>
    )}
    <div
      className={`space-y-3 ${!compact ? "flex-1 overflow-y-auto pr-2 custom-scrollbar" : ""}`}
    >
      {(cartItems || []).map((item: any) => (
        <div
          key={item.sku || item.product_sku}
          className="flex gap-3.5 items-center bg-white rounded-2xl border border-zinc-100 p-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-16 bg-zinc-50 rounded-xl overflow-hidden shrink-0 border border-zinc-50">
            <img
              src={getImageUrl(item.image_url)}
              className="w-full h-full object-cover"
              alt={item.name}
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <p className="text-[11px] font-bold text-[var(--dark-amethyst)] line-clamp-2 leading-tight">
              {item.name}
            </p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md">
                ×{item.quantity}
              </span>
              <span className="text-[12px] font-black text-[var(--dark-amethyst)] tabular-nums">
                {formatCurrency(parseFloat(item.price) * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div
      className={`space-y-2.5 border-t border-zinc-200/60 pt-5 ${!compact ? "mt-6 shrink-0" : ""}`}
    >
      <div className="flex justify-between text-[11px] font-bold text-zinc-500">
        <span>Subtotal produse</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-[11px] font-bold text-emerald-600">
          <span>Reducere aplicată</span>
          <span>−{formatCurrency(totals.discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-[11px] font-bold text-zinc-500">
        <span>Cost livrare</span>
        <span
          className={
            totals.shipping === 0
              ? "text-emerald-600 uppercase tracking-wider text-[9px] font-black"
              : ""
          }
        >
          {totals.shipping === 0 ? "Gratuit" : formatCurrency(totals.shipping)}
        </span>
      </div>
      <div className="flex justify-between items-end pt-4 border-t border-zinc-200/60 mt-2">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Total Final
          </p>
          <p className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
            <ShieldCheck size={10} className="text-[var(--royal-violet)]" /> TVA
            inclus
          </p>
        </div>
        <span className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)] leading-none">
          {formatCurrency(totals.total)}
        </span>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───

const CheckoutPopup = ({
  isOpen,
  onClose,
  cartItems = [],
  subtotal: propSubtotal = 0,
  discount: initialDiscount = null,
}: any) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("courier");
  const [addressMode, setAddressMode] = useState("select");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [counties, setCounties] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [deliveryPoints, setDeliveryPoints] = useState<any[]>([]);
  const [lockerSearch, setLockerSearch] = useState("");
  const [selectedLocker, setSelectedLocker] = useState<any>(null);
  const [showLockerDropdown, setShowLockerDropdown] = useState(false);

  const [formData, setFormData] = useState<Record<string, any>>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    houseNumber: "",
    city: "",
    county: "",
    postalCode: "",
  });

  const debouncedSearch = useDebounce(lockerSearch, 280);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [isOpen]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [shippingConfig, setShippingConfig] = useState({
    courier_fee: 20.0,
    locker_fee: 15.0,
    free_threshold: 250.0,
  });

  useEffect(() => {
    if (!isOpen) return;
    setAppliedVoucher(initialDiscount);
    setStep(1);
    setErrors({});
    setSummaryOpen(false);
    setSelectedLocker(null);
    setLockerSearch("");

    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: (user.phone || "").replace(/\s+/g, ""),
      }));
      if (user.addresses?.length > 0) {
        const def =
          user.addresses.find((a: any) => a.is_default) || user.addresses[0];
        handleSelectAddress(def);
        setLockerSearch(def.city || "");
      } else setAddressMode("new");
    }
  }, [isOpen, user, initialDiscount]);

  useEffect(() => {
    if (shippingMethod === "locker" && paymentMethod === "cod")
      setPaymentMethod("card");
  }, [shippingMethod, paymentMethod]);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${API_BASE_URL}/api/v1/orders/shipping/config`)
      .then((r) => r.json())
      .then((data) => {
        setShippingConfig({
          courier_fee: parseFloat(data.courier_fee) || 20.0,
          locker_fee: parseFloat(data.locker_fee) || 15.0,
          free_threshold: parseFloat(data.free_threshold) || 250.0,
        });
      })
      .catch(console.error);

    const cached = sessionStorage.getItem("judete_cache");
    if (cached) setCounties(JSON.parse(cached));
    else
      fetch(`${API_BASE_URL}/api/v1/orders/utils/judete`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCounties(data);
            sessionStorage.setItem("judete_cache", JSON.stringify(data));
          }
        })
        .catch(console.error);
  }, [isOpen]);

  useEffect(() => {
    if (shippingMethod !== "locker" || deliveryPoints.length > 0) return;
    fetch(`${API_BASE_URL}/api/v1/orders/gls/delivery-points`)
      .then((r) => r.json())
      .then((data) => setDeliveryPoints(data.filter((x: any) => x.is_locker)))
      .catch(console.error);
  }, [shippingMethod, deliveryPoints.length]);

  const filteredLockers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const list = q
      ? deliveryPoints.filter(
          (p) =>
            p.city?.toLowerCase().includes(q) ||
            p.street?.toLowerCase().includes(q) ||
            p.name?.toLowerCase().includes(q),
        )
      : deliveryPoints;
    return list.slice(0, MAX_MAP_POINTS);
  }, [deliveryPoints, debouncedSearch]);

  const handleSelectAddress = useCallback(
    async (addr: any) => {
      setSelectedAddressId(addr.id);
      setFormData((prev) => ({
        ...prev,
        street: addr.street || "",
        houseNumber: addr.house_number || "",
        postalCode: addr.postal_code || addr.zip || "",
        city: addr.city || "",
        county: addr.county || "",
      }));
      setAddressMode("select");
      setErrors({});

      if (addr.county) {
        let countyList = counties;
        if (!countyList.length) {
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/v1/orders/utils/judete`,
            );
            countyList = await res.json();
            if (Array.isArray(countyList)) setCounties(countyList);
          } catch {}
        }
        const county = countyList.find((c: any) => c.nume === addr.county);
        if (!county) return;
        setLoadingCities(true);
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/orders/utils/localitati/${county.auto}`,
          );
          if (res.ok) setCities(await res.json());
        } catch {
        } finally {
          setLoadingCities(false);
        }
      }
    },
    [counties],
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const handleFieldBlur = (field: string) => {
    const val = formData[field]?.trim() || "";
    let msg = "";
    if (!val) msg = "Obligatoriu";
    else if (field === "email" && !val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      msg = "Format invalid";
    else if (field === "phone" && !val.match(/^(07|\+407|407)[0-9]{8}$/))
      msg = "Ex: 07xxxxxxxx";
    else if ((field === "firstName" || field === "lastName") && val.length < 2)
      msg = "Min. 2 litere";
    else if (field === "street" && val.length < 6) msg = "Prea scurt";
    else if (field === "postalCode" && val.length < 4) msg = "Cod invalid";

    setErrors((prev) =>
      msg
        ? { ...prev, [field]: msg }
        : (() => {
            const n = { ...prev };
            delete n[field];
            return n;
          })(),
    );
  };

  const handleCountyChange = async (e: any) => {
    const countyName = e.target.value;
    handleInputChange("county", countyName);
    handleInputChange("city", "");
    const obj = counties.find((c) => c.nume === countyName);
    if (!obj) return;
    setLoadingCities(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/utils/localitati/${obj.auto}`,
      );
      if (!res.ok) throw new Error();
      setCities(await res.json());
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut încărca localitățile.",
      });
    } finally {
      setLoadingCities(false);
    }
  };

  const handleLockerSelect = useCallback((locker: any) => {
    setSelectedLocker(locker);
    setTimeout(() => {
      if (scrollContainerRef.current)
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
    }, 150);
  }, []);

  const totals = useMemo(() => {
    const base =
      (cartItems || []).reduce(
        (acc: number, item: any) =>
          acc + parseFloat(item.price) * (item.quantity || 1),
        0,
      ) ||
      parseFloat(String(propSubtotal || 0)) ||
      0;
    const disc = appliedVoucher?.amount || 0;
    const subtotalAfterDiscount = Math.max(base - disc, 0);
    let shippingCost = 0;
    if (
      subtotalAfterDiscount > 0 &&
      subtotalAfterDiscount < shippingConfig.free_threshold
    ) {
      shippingCost =
        shippingMethod === "locker"
          ? shippingConfig.locker_fee
          : shippingConfig.courier_fee;
    }
    return {
      subtotal: base,
      discount: disc,
      shipping: shippingCost,
      total: subtotalAfterDiscount + shippingCost,
    };
  }, [cartItems, propSubtotal, appliedVoucher, shippingMethod, shippingConfig]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Email invalid";
    if (formData.firstName.trim().length < 2) e.firstName = "Min. 2 caractere";
    if (formData.lastName.trim().length < 2) e.lastName = "Min. 2 caractere";
    if (!formData.phone.match(/^(07|\+407|407)[0-9]{8}$/)) e.phone = "Invalid";
    if (shippingMethod === "courier") {
      if (!formData.county) e.county = "Alege județ";
      if (!formData.city) e.city = "Alege localitate";
      if (formData.street.trim().length < 6) e.street = "Prea scurt";
      if (!formData.houseNumber) e.houseNumber = "Obligatoriu";
      if (formData.postalCode.trim().length < 4) e.postalCode = "Invalid";
    } else if (!selectedLocker) {
      toast({
        variant: "destructive",
        title: "Selectați un locker",
        description: "Alegeți un punct GLS din hartă.",
      });
      return false;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCompleteOrder = async () => {
    if (!validateStep1()) {
      toast({
        variant: "destructive",
        title: "Date Incomplete",
        description: "Verificați câmpurile marcate cu roșu.",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: (cartItems || []).map((i: any) => ({
          sku: (i.sku || i.product_sku).toUpperCase().trim(),
          quantity: parseInt(i.quantity),
        })),
        shipping_details: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.replace(/\s+/g, ""),
          email: formData.email.toLowerCase().trim(),
          delivery_type: shippingMethod,
          address:
            shippingMethod === "courier"
              ? {
                  street: formData.street.trim(),
                  house_number: formData.houseNumber.trim(),
                  city: formData.city.trim(),
                  county: formData.county.trim(),
                  postal_code: formData.postalCode.trim(),
                }
              : {
                  locker_id: selectedLocker?.id,
                  locker_name: selectedLocker?.name,
                  city: selectedLocker?.city,
                  street: selectedLocker?.street || "",
                  house_number: selectedLocker?.house_number || "",
                  postal_code:
                    selectedLocker?.zip || selectedLocker?.postal_code || "",
                  lat: selectedLocker?.lat,
                  lng: selectedLocker?.lng,
                  matchcode: selectedLocker?.matchcode,
                },
          ...(shippingMethod === "locker" && {
            locker_id: selectedLocker?.matchcode || selectedLocker?.id,
            locker_address: `${selectedLocker?.street || ""} ${selectedLocker?.house_number || ""}, ${selectedLocker?.city || ""}`,
          }),
        },
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        voucher_code: appliedVoucher?.code || null,
        save_address: shouldSaveAddress && addressMode === "new",
      };

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      const headers: any = {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/create-checkout-session`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail.map((d: any) => d.msg).join(", ")
            : data.detail || "Eroare procesare",
        );
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Eroare Plată",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-center lg:justify-end items-stretch font-sans">
          {/* BACKDROP BLUR ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* CONTAINER PRINCIPAL ── */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="relative z-[1001] w-full max-w-[1100px] bg-white lg:rounded-l-[2rem] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.2)] flex flex-col lg:flex-row h-full overflow-hidden"
          >
            {/* STÂNGA: FORMULAR (SCROLLABIL) ── */}
            <div
              ref={scrollContainerRef}
              className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto custom-scrollbar"
            >
              <header className="sticky top-0 z-20 px-6 sm:px-10 py-6 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-[8.5px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)] flex items-center gap-1.5">
                      <Sparkles size={10} /> Finalizare Securizată
                    </p>
                    <h2 className="heading-serif text-3xl tracking-tight text-[var(--dark-amethyst)]">
                      Checkout
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200/60 hover:bg-white hover:border-[var(--royal-violet)]/30 hover:text-[var(--royal-violet)] transition-all text-zinc-500 shadow-sm active:scale-95 group"
                  >
                    <X
                      size={16}
                      strokeWidth={2.5}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
                  </button>
                </div>

                {/* STEPS INDICATOR */}
                <div className="flex items-center gap-3">
                  {[
                    { n: 1, label: "Detalii & Livrare" },
                    { n: 2, label: "Plată" },
                  ].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center gap-2">
                      {i > 0 && (
                        <div className="w-6 h-[2px] rounded-full bg-zinc-100" />
                      )}
                      <button
                        onClick={() => n < step && setStep(n)}
                        className={`flex items-center gap-2 transition-all ${step === n ? "opacity-100" : step > n ? "opacity-60 hover:opacity-100 cursor-pointer" : "opacity-30 pointer-events-none"}`}
                      >
                        <span
                          className={`size-5 rounded-full flex items-center justify-center text-[9px] font-black transition-colors ${step >= n ? "bg-[var(--royal-violet)] text-white shadow-md shadow-violet-200" : "bg-zinc-100 text-zinc-400"}`}
                        >
                          {step > n ? <Check size={10} strokeWidth={3.5} /> : n}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${step >= n ? "text-[var(--dark-amethyst)]" : "text-zinc-400"}`}
                        >
                          {label}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </header>

              {/* MOBILE SUMMARY TOGGLE */}
              <div className="lg:hidden px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <button
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)] flex items-center gap-2">
                    <ShoppingBag
                      size={14}
                      className="text-[var(--royal-violet)]"
                    />{" "}
                    Arată Rezumatul ({cartItems.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-black text-[var(--dark-amethyst)]">
                      {formatCurrency(totals.total)}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-400 transition-transform duration-300 ${summaryOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                <AnimatePresence>
                  {summaryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-zinc-200/60"
                    >
                      <OrderSummary
                        cartItems={cartItems}
                        totals={totals}
                        compact
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CONTINUT STEPS */}
              <div className="p-6 sm:p-10 space-y-8 flex-1">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      {/* DATE CONTACT */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-100 pb-2">
                          1. Date de Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <PremiumInput
                            label="Prenume"
                            name="firstName"
                            value={formData.firstName}
                            error={errors.firstName}
                            onChange={(e: any) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("firstName")}
                            placeholder="Ex: Popescu"
                          />
                          <PremiumInput
                            label="Nume Familie"
                            name="lastName"
                            value={formData.lastName}
                            error={errors.lastName}
                            onChange={(e: any) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("lastName")}
                            placeholder="Ex: Andrei"
                          />
                          <PremiumInput
                            label="Adresă Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            error={errors.email}
                            onChange={(e: any) =>
                              handleInputChange("email", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("email")}
                            placeholder="pentru confirmare comandă"
                          />
                          <PremiumInput
                            label="Telefon"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            error={errors.phone}
                            onChange={(e: any) =>
                              handleInputChange("phone", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("phone")}
                            placeholder="07XX XXX XXX"
                          />
                        </div>
                      </div>

                      {/* METODA LIVRARE */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-100 pb-2">
                          2. Metodă Livrare
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              id: "courier",
                              label: "Curier Rapid",
                              Icon: Truck,
                              desc: "La domiciliu",
                            },
                            {
                              id: "locker",
                              label: "GLS Locker",
                              Icon: Package,
                              desc: "Punct ridicare",
                            },
                          ].map(({ id, label, Icon, desc }) => (
                            <button
                              key={id}
                              onClick={() => setShippingMethod(id)}
                              className={`relative p-4 border-2 rounded-2xl text-left transition-all overflow-hidden group ${shippingMethod === id ? "border-[var(--royal-violet)] bg-violet-50/20 shadow-md" : "border-zinc-100 hover:border-violet-200/50 bg-white hover:bg-zinc-50/50"}`}
                            >
                              <Icon
                                size={20}
                                className={`mb-2 transition-colors ${shippingMethod === id ? "text-[var(--royal-violet)]" : "text-zinc-400 group-hover:text-violet-400"}`}
                              />
                              <p
                                className={`text-[12px] font-black uppercase tracking-wide leading-tight ${shippingMethod === id ? "text-[var(--royal-violet)]" : "text-[var(--dark-amethyst)]"}`}
                              >
                                {label}
                              </p>
                              <p className="text-[10px] font-medium text-zinc-400 mt-1">
                                {desc}
                              </p>
                              {shippingMethod === id && (
                                <motion.div
                                  layoutId="ship-badge-new"
                                  className="absolute top-3 right-3 p-1 bg-[var(--royal-violet)] rounded-full shadow-sm text-white"
                                >
                                  <Check size={10} strokeWidth={4} />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ADRESA DYNAMICĂ */}
                      <AnimatePresence mode="wait">
                        {shippingMethod === "courier" ? (
                          <motion.div
                            key="courier-addr"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            {user?.addresses?.length > 0 && (
                              <div className="space-y-3 mb-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                                  <MapPin size={12} /> Adrese Salvate
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {user.addresses.map((addr: any) => (
                                    <button
                                      key={addr.id}
                                      type="button"
                                      onClick={() => handleSelectAddress(addr)}
                                      className={`p-4 text-left border-2 rounded-2xl transition-all relative ${selectedAddressId === addr.id && addressMode === "select" ? "border-[var(--royal-violet)] bg-violet-50/20 shadow-sm" : "border-zinc-100 hover:border-violet-200/50 bg-white hover:bg-zinc-50/50"}`}
                                    >
                                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--royal-violet)] mb-1">
                                        {addr.address_type || "Adresă"}
                                      </p>
                                      <p className="text-[12px] font-bold text-[var(--dark-amethyst)] truncate">
                                        {addr.street} {addr.house_number}
                                      </p>
                                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                                        {addr.city}, {addr.county}
                                      </p>
                                      {selectedAddressId === addr.id &&
                                        addressMode === "select" && (
                                          <CheckCircle2
                                            size={16}
                                            className="absolute top-4 right-4 text-[var(--royal-violet)]"
                                          />
                                        )}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddressMode("new");
                                      setSelectedAddressId(null);
                                      setFormData((p) => ({
                                        ...p,
                                        street: "",
                                        houseNumber: "",
                                        city: "",
                                        county: "",
                                        postalCode: "",
                                      }));
                                    }}
                                    className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${addressMode === "new" ? "border-[var(--royal-violet)] text-[var(--royal-violet)] bg-violet-50/20" : "border-zinc-200 text-zinc-400 hover:border-violet-300 hover:text-violet-500 bg-zinc-50/50"}`}
                                  >
                                    <Plus size={16} />{" "}
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                      Adresă Nouă
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/30 p-5 rounded-3xl border border-zinc-100">
                              <PremiumSelect
                                label="Județ"
                                value={formData.county}
                                onChange={handleCountyChange}
                                options={counties}
                                error={errors.county}
                                placeholder="Selectați județul"
                              />
                              <PremiumSelect
                                label="Localitate"
                                value={formData.city}
                                onChange={(e: any) =>
                                  handleInputChange("city", e.target.value)
                                }
                                options={cities}
                                disabled={!formData.county || loadingCities}
                                error={errors.city}
                                placeholder={
                                  loadingCities
                                    ? "Se încarcă..."
                                    : "Selectați orașul"
                                }
                              />
                              <div className="col-span-2 sm:col-span-2 grid grid-cols-4 gap-4">
                                <div className="col-span-4 sm:col-span-2">
                                  <PremiumInput
                                    label="Nume Stradă"
                                    name="street"
                                    value={formData.street}
                                    error={errors.street}
                                    onChange={(e: any) =>
                                      handleInputChange(
                                        "street",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => handleFieldBlur("street")}
                                    placeholder="Nume stradă"
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <PremiumInput
                                    label="Număr"
                                    name="houseNumber"
                                    value={formData.houseNumber}
                                    error={errors.houseNumber}
                                    onChange={(e: any) =>
                                      handleInputChange(
                                        "houseNumber",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() =>
                                      handleFieldBlur("houseNumber")
                                    }
                                    placeholder="Nr."
                                  />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <PremiumInput
                                    label="Cod Poștal"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    error={errors.postalCode}
                                    onChange={(e: any) =>
                                      handleInputChange(
                                        "postalCode",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => handleFieldBlur("postalCode")}
                                    placeholder="000000"
                                  />
                                </div>
                              </div>
                              {addressMode === "new" && user && (
                                <div className="col-span-2 flex items-center gap-2.5 pt-2">
                                  <Checkbox
                                    id="save-addr-premium"
                                    checked={shouldSaveAddress}
                                    onCheckedChange={(v) =>
                                      setShouldSaveAddress(!!v)
                                    }
                                    className="data-[state=checked]:bg-[var(--royal-violet)] data-[state=checked]:border-[var(--royal-violet)]"
                                  />
                                  <label
                                    htmlFor="save-addr-premium"
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer select-none hover:text-[var(--royal-violet)] transition-colors"
                                  >
                                    Salvează adresa pentru comenzi viitoare
                                  </label>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="locker-section"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="relative">
                              <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                              />
                              <input
                                type="text"
                                value={lockerSearch}
                                onChange={(e) => {
                                  setLockerSearch(e.target.value);
                                  setShowLockerDropdown(true);
                                }}
                                onFocus={() => setShowLockerDropdown(true)}
                                onBlur={() =>
                                  setTimeout(
                                    () => setShowLockerDropdown(false),
                                    200,
                                  )
                                }
                                placeholder="Introduceți orașul sau strada dorită..."
                                className="h-12 w-full bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 text-[13px] font-bold outline-none focus:border-[var(--royal-violet)] focus:ring-4 focus:ring-violet-100 transition-all placeholder:font-medium placeholder:text-zinc-300 shadow-sm"
                              />
                              <AnimatePresence>
                                {showLockerDropdown &&
                                  lockerSearch.trim() &&
                                  filteredLockers.length > 0 && (
                                    <motion.ul
                                      initial={{ opacity: 0, y: 4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 4 }}
                                      className="absolute z-[1050] top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-100 shadow-2xl rounded-2xl max-h-[300px] overflow-y-auto custom-scrollbar p-1"
                                    >
                                      {filteredLockers.map((locker) => (
                                        <li
                                          key={locker.id}
                                          className="p-3 hover:bg-zinc-50 cursor-pointer rounded-xl transition-colors mb-1 last:mb-0"
                                          onClick={() => {
                                            handleLockerSelect(locker);
                                            setLockerSearch(
                                              locker.city || locker.name,
                                            );
                                            setShowLockerDropdown(false);
                                          }}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-violet-50 text-[var(--royal-violet)] rounded-lg shrink-0">
                                              <Package size={14} />
                                            </div>
                                            <div>
                                              <p className="text-[12px] font-bold text-[var(--dark-amethyst)] leading-tight">
                                                {locker.name}
                                              </p>
                                              <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                                                {locker.street}{" "}
                                                {locker.house_number},{" "}
                                                {locker.city}
                                              </p>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </motion.ul>
                                  )}
                              </AnimatePresence>
                            </div>

                            <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm h-[350px] relative z-10">
                              <Suspense
                                fallback={
                                  <div className="h-full flex flex-col items-center justify-center bg-zinc-50 gap-3 text-zinc-400">
                                    <Loader2
                                      className="animate-spin text-[var(--royal-violet)]"
                                      size={24}
                                    />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                      Se încarcă harta...
                                    </span>
                                  </div>
                                }
                              >
                                <GLSLockerMap
                                  deliveryPoints={filteredLockers}
                                  selectedLocker={selectedLocker}
                                  setSelectedLocker={handleLockerSelect}
                                />
                              </Suspense>
                            </div>

                            {deliveryPoints.length > 0 && (
                              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-center">
                                {filteredLockers.length} puncte disponibile{" "}
                                {debouncedSearch
                                  ? "pentru căutarea ta"
                                  : "în rețea"}
                              </p>
                            )}

                            <AnimatePresence mode="wait">
                              {selectedLocker ? (
                                <LockerConfirmCard
                                  key="locker-card"
                                  locker={selectedLocker}
                                  onClear={() => setSelectedLocker(null)}
                                />
                              ) : (
                                <motion.div
                                  key="locker-hint"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50"
                                >
                                  <MapPin size={14} className="text-zinc-300" />
                                  <p className="text-[11px] font-bold text-zinc-500">
                                    Selectați un locker din hartă pentru a
                                    continua
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        onClick={() => {
                          if (validateStep1()) setStep(2);
                          else {
                            toast({
                              variant: "destructive",
                              title: "Date Incomplete",
                              description:
                                "Vă rugăm să verificați informațiile introduse.",
                            });
                            scrollContainerRef.current?.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className="w-full h-14 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.25em] shadow-[0_8px_20px_rgba(123,44,191,0.25)] hover:shadow-[0_12px_25px_rgba(123,44,191,0.35)] hover:scale-[1.01] transition-all"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        Continuă către Plată{" "}
                        <ArrowRight size={15} className="ml-2" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[var(--royal-violet)] transition-colors bg-zinc-50 hover:bg-violet-50 px-3 py-2 rounded-lg border border-zinc-100 hover:border-violet-100 w-fit"
                      >
                        <ChevronLeft size={14} /> Modifică Livrarea
                      </button>

                      {/* SUMMARY LIVRARE */}
                      <div className="p-5 rounded-2xl bg-zinc-50/50 border border-zinc-200/60 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm shrink-0 border border-zinc-100">
                          {shippingMethod === "courier" ? (
                            <Truck
                              size={18}
                              className="text-[var(--royal-violet)]"
                            />
                          ) : (
                            <Package
                              size={18}
                              className="text-[var(--royal-violet)]"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
                            Livrare la{" "}
                            {shippingMethod === "courier"
                              ? "Domiciliu"
                              : "Punct de Ridicare"}
                          </p>
                          <p className="text-[13px] font-bold text-[var(--dark-amethyst)] leading-tight">
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                            {shippingMethod === "courier"
                              ? `${formData.street} ${formData.houseNumber}, ${formData.city}, ${formData.county}`
                              : `${selectedLocker?.name} · ${selectedLocker?.street} ${selectedLocker?.house_number}, ${selectedLocker?.city}`}
                          </p>
                        </div>
                      </div>

                      {/* METODE PLATA */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-100 pb-2">
                          Metodă de Plată
                        </h3>
                        <div className="space-y-3">
                          {[
                            {
                              id: "card",
                              title: "Card Bancar (Recomandat)",
                              Icon: CreditCard,
                              desc: "Plată 100% sigură procesată prin Stripe. Procesare imediată.",
                            },
                            ...(shippingMethod !== "locker"
                              ? [
                                  {
                                    id: "cod",
                                    title: "Plată la Livrare (Ramburs)",
                                    Icon: Truck,
                                    desc: "Plătești cash sau cu cardul direct la curier când primești coletul.",
                                  },
                                ]
                              : []),
                          ].map(({ id, title, Icon, desc }: any) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setPaymentMethod(id)}
                              className={`w-full flex items-start sm:items-center gap-4 p-5 border-2 rounded-2xl text-left transition-all ${paymentMethod === id ? "border-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.15] shadow-md" : "border-zinc-100 hover:border-violet-200/50 bg-white"}`}
                            >
                              <div
                                className={`p-3 rounded-xl transition-all shrink-0 ${paymentMethod === id ? "text-white shadow-lg shadow-violet-400/30" : "bg-zinc-50 border border-zinc-100 text-zinc-400"}`}
                                style={
                                  paymentMethod === id
                                    ? { background: "var(--primary-gradient)" }
                                    : undefined
                                }
                              >
                                <Icon size={20} strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0 py-0.5">
                                <p
                                  className={`text-[12px] font-black uppercase tracking-wide leading-tight ${paymentMethod === id ? "text-[var(--royal-violet)]" : "text-[var(--dark-amethyst)]"}`}
                                >
                                  {title}
                                </p>
                                <p className="text-[10px] font-medium text-zinc-500 mt-1 leading-snug">
                                  {desc}
                                </p>
                              </div>
                              <div
                                className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-1 sm:mt-0 ${paymentMethod === id ? "bg-[var(--royal-violet)] border-transparent" : "border-zinc-200"}`}
                              >
                                {paymentMethod === id && (
                                  <Check
                                    size={12}
                                    className="text-white"
                                    strokeWidth={4}
                                  />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-zinc-100">
                        <Button
                          onClick={handleCompleteOrder}
                          disabled={loading}
                          className="w-full h-14 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.25em] shadow-[0_8px_25px_rgba(123,44,191,0.25)] hover:shadow-[0_12px_30px_rgba(123,44,191,0.35)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:hover:scale-100"
                          style={{ background: "var(--primary-gradient)" }}
                        >
                          {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <>
                              Plasează Comanda Securizat{" "}
                              <ShieldCheck size={16} className="ml-2" />
                            </>
                          )}
                        </Button>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                          <ShieldCheck size={11} className="text-emerald-500" />{" "}
                          Plată criptată 256-bit SSL
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* DREAPTA: ORDER SUMMARY (DESKTOP) ── */}
            <div className="hidden lg:flex w-[420px] xl:w-[460px] bg-zinc-50/80 border-l border-zinc-200 flex-col p-10 overflow-hidden relative">
              {/* Fundal fin pentru sumaary */}
              <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white to-transparent pointer-events-none" />
              <div className="relative z-10 h-full">
                <OrderSummary cartItems={cartItems} totals={totals} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutPopup;
