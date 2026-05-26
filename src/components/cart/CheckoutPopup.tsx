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

// Limita markere hartă pentru performanță
const MAX_MAP_POINTS = 80;

// ─── useDebounce ──────────────────────────────────────────────────────────────
function useDebounce(value, delay = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  new Intl.NumberFormat("ro-RO", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(val) + " RON";

const getImageUrl = (imageInput) => {
  if (!imageInput) return "/placeholder.png";
  let data = imageInput;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
      if (typeof data === "string") data = JSON.parse(data);
    } catch {
      if (data.startsWith("http")) return data;
      return "/placeholder.png";
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

// ─── PremiumInput ─────────────────────────────────────────────────────────────
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
}) => {
  const isValid = value && !error;
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <label
          className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
            error
              ? "text-rose-500"
              : isValid
                ? "text-emerald-600"
                : "text-zinc-400"
          }`}
        >
          {label}
        </label>
        <AnimatePresence mode="wait">
          {error && (
            <motion.span
              key="err"
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5"
            >
              <AlertCircle size={9} />
              {error}
            </motion.span>
          )}
          {!error && isValid && (
            <motion.span
              key="ok"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5"
            >
              <Check size={9} strokeWidth={3.5} />
              OK
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
        className={`h-10 w-full border rounded-lg px-3 text-[13px] font-medium
          transition-all outline-none placeholder:text-zinc-300
          ${
            error
              ? "border-rose-300 bg-rose-50/30 focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
              : isValid
                ? "border-emerald-200 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                : "border-zinc-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
          }`}
      />
      {helperText && !error && (
        <p className="text-[9px] text-zinc-400">{helperText}</p>
      )}
    </div>
  );
};

// ─── PremiumSelect ────────────────────────────────────────────────────────────
const PremiumSelect = ({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  placeholder,
}) => {
  const isValid = value && !error && !disabled;
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <label
          className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
            error
              ? "text-rose-500"
              : isValid
                ? "text-emerald-600"
                : "text-zinc-400"
          }`}
        >
          {label}
        </label>
        {error && (
          <span className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5">
            <AlertCircle size={9} />
            {error}
          </span>
        )}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-10 w-full border rounded-lg pl-3 pr-8 text-[13px] font-medium
            transition-all outline-none appearance-none cursor-pointer
            ${
              disabled
                ? "opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-200"
                : error
                  ? "border-rose-300 bg-rose-50/30 focus:ring-2 focus:ring-rose-100"
                  : isValid
                    ? "border-emerald-200 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                    : "border-zinc-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
            }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.id || opt.auto || opt.nume} value={opt.nume}>
              {opt.nume}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
      </div>
    </div>
  );
};

// ─── LockerConfirmCard ────────────────────────────────────────────────────────
const LockerConfirmCard = ({ locker, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -6, scale: 0.97 }}
    transition={{ type: "spring", damping: 22, stiffness: 340 }}
    className="relative p-3.5 rounded-xl border-2 border-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.4] flex items-start gap-3 overflow-hidden"
  >
    {/* Pulse ring animation */}
    <motion.div
      className="absolute inset-0 rounded-xl border-2 border-violet-400"
      initial={{ opacity: 0.8, scale: 1 }}
      animate={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />
    {/* Badge checkmark */}
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", damping: 14, stiffness: 320, delay: 0.05 }}
      className="p-2 bg-[var(--royal-violet)] text-white rounded-lg shrink-0 shadow-md shadow-violet-400/30"
    >
      <CheckCircle2 size={16} />
    </motion.div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--royal-violet)] flex items-center gap-1">
        <Sparkles size={8} /> Locker Confirmat
      </p>
      <p className="text-[12px] font-bold text-zinc-800 mt-0.5 truncate">
        {locker.name}
      </p>
      <p className="text-[10px] text-zinc-500 truncate">
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
      className="p-1 rounded-lg hover:bg-[var(--lavender-purple)] text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 mt-0.5"
    >
      <X size={13} />
    </button>
  </motion.div>
);

// ─── OrderSummary ─────────────────────────────────────────────────────────────
const OrderSummary = ({ cartItems, totals, compact = false }) => (
  <div
    className={compact ? "space-y-3" : "flex flex-col h-full overflow-hidden"}
  >
    {!compact && (
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-4 shrink-0">
        <ShoppingBag size={11} />
        Rezumat Comandă
      </p>
    )}
    <div
      className={`space-y-2 ${!compact ? "flex-1 overflow-y-auto pr-1 custom-scrollbar" : ""}`}
    >
      {cartItems.map((item) => (
        <div
          key={item.sku || item.product_sku}
          className="flex gap-3 items-center bg-white rounded-xl border border-zinc-100/80 p-2.5"
        >
          <div className="w-9 h-12 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shrink-0">
            <img
              src={getImageUrl(item.image_url)}
              className="w-full h-full object-cover"
              alt={item.name}
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-zinc-800 truncate leading-tight">
              {item.name}
            </p>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-[9px] text-zinc-400">×{item.quantity}</span>
              <span className="text-[11px] font-black text-zinc-700">
                {formatCurrency(parseFloat(item.price) * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div
      className={`space-y-1.5 border-t border-zinc-200 pt-3 ${!compact ? "mt-auto shrink-0" : ""}`}
    >
      <div className="flex justify-between text-[10px] font-bold text-zinc-500">
        <span>Subtotal</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-[10px] font-bold text-rose-500">
          <span>Reducere</span>
          <span>−{formatCurrency(totals.discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-[10px] font-bold text-emerald-600">
        <span>Livrare</span>
        <span>
          {totals.shipping === 0 ? "Gratuit" : formatCurrency(totals.shipping)}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-zinc-200 mt-1">
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
            Total de Plată
          </p>
          <p className="text-[8px] text-zinc-400 flex items-center gap-0.5 mt-0.5">
            <ShieldCheck size={8} className="text-emerald-500" />
            TVA inclus
          </p>
        </div>
        <span className="text-2xl font-black tracking-tight text-zinc-900">
          {formatCurrency(totals.total)}
        </span>
      </div>
    </div>
  </div>
);

// ─── Main CheckoutPopup ───────────────────────────────────────────────────────
const CheckoutPopup = ({
  isOpen,
  onClose,
  cartItems = [],
  subtotal: propSubtotal = 0,
  discount: initialDiscount = null,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("courier");
  const [addressMode, setAddressMode] = useState("select");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [errors, setErrors] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Adrese / localități
  const [counties, setCounties] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // GLS Locker
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [lockerSearch, setLockerSearch] = useState("");
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [lockerJustSelected, setLockerJustSelected] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    county: "",
  });

  const debouncedSearch = useDebounce(lockerSearch, 280);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [isOpen]);
  const scrollContainerRef = useRef(null); // Pentru auto-scroll

  // Configurația de livrare preluată de pe backend
  const [shippingConfig, setShippingConfig] = useState({
    courier_fee: 20.0,
    locker_fee: 15.0,
    free_threshold: 250.0,
  });

  // ── Init la deschidere ──────────────────────────────────────────────────────
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
          user.addresses.find((a) => a.is_default) || user.addresses[0];
        handleSelectAddress(def);
      } else {
        setAddressMode("new");
      }
    }
  }, [isOpen]);
  // ── Fetch configurare livrare (costuri din backend) ──
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
  }, [isOpen]);

  // ── Fetch județe ───────────────────────────────────────────────────────────
  // Exemplu în CheckoutPopup
  useEffect(() => {
    if (!isOpen) return;

    const cached = sessionStorage.getItem("judete_cache");
    if (cached) {
      setCounties(JSON.parse(cached));
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/orders/judete`)
      .then((r) => r.json())
      .then((data) => {
        setCounties(data);
        sessionStorage.setItem("judete_cache", JSON.stringify(data));
      })
      .catch(console.error);
  }, [isOpen]);

  // ── Fetch lockere (lazy, o singură dată) ──────────────────────────────────
  useEffect(() => {
    if (shippingMethod !== "locker" || deliveryPoints.length > 0) return;
    fetch(`${API_BASE_URL}/api/v1/orders/gls/delivery-points`)
      .then((r) => r.json())
      .then((data) => setDeliveryPoints(data.filter((x) => x.is_locker)))
      .catch(console.error);
  }, [shippingMethod]);

  // ── Lockere filtrate + cap MAX_MAP_POINTS ──────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      street: addr.street,
      city: addr.city,
      county: addr.county,
    }));
    setAddressMode("select");
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleFieldBlur = (field) => {
    const val = formData[field]?.trim() || "";
    let msg = "";
    if (!val) msg = "Câmp obligatoriu";
    else if (field === "email" && !val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      msg = "Format invalid";
    else if (field === "phone" && !val.match(/^(07|\+407|407)[0-9]{8}$/))
      msg = "Format 07xxxxxxxx";
    else if ((field === "firstName" || field === "lastName") && val.length < 2)
      msg = "Min. 2 caractere";
    else if (field === "street" && val.length < 6) msg = "Prea scurtă";

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

  const handleCountyChange = async (e) => {
    const countyName = e.target.value;
    handleInputChange("county", countyName);
    handleInputChange("city", "");

    console.log("Județ selectat:", countyName); // DEBUG 1

    const obj = counties.find((c) => c.nume === countyName);
    console.log("Obiect județ găsit:", obj); // DEBUG 2

    if (!obj) return;

    setLoadingCities(true);
    try {
      const url = `https://roloca.coldfuse.io/api/localitati/${obj.auto}`;
      console.log("Fetch URL:", url); // DEBUG 3
      const res = await fetch(url);
      const data = await res.json();
      console.log("Date orașe primite:", data); // DEBUG 4
      setCities(data);
    } catch (err) {
      console.error("Eroare fetch orașe:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  // Locker select cu animație flash
  // Locker select cu animație flash și auto-scroll
  const handleLockerSelect = useCallback((locker) => {
    setSelectedLocker(locker);
    setLockerJustSelected(true);
    setTimeout(() => setLockerJustSelected(false), 900);

    // Auto-scroll în jos pentru a vedea lockerul selectat și butonul Continuă
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 150); // Un mic delay ca să aibă timp componenta card să apară în DOM
  }, []);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const base =
      cartItems.reduce(
        (acc, item) => acc + parseFloat(item.price) * (item.quantity || 1),
        0,
      ) ||
      parseFloat(propSubtotal) ||
      0;

    const disc = appliedVoucher?.amount || 0;
    const subtotalAfterDiscount = Math.max(base - disc, 0);

    // Calculăm costul de livrare pe baza pragului
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

  // ── Validare ───────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Email invalid";
    if (formData.firstName.trim().length < 2) e.firstName = "Min. 2 caractere";
    if (formData.lastName.trim().length < 2) e.lastName = "Min. 2 caractere";
    if (!formData.phone.match(/^(07|\+407|407)[0-9]{8}$/))
      e.phone = "Format 07xxxxxxxx";
    if (shippingMethod === "courier") {
      if (!formData.county) e.county = "Alegeți județul";
      if (!formData.city) e.city = "Alegeți localitatea";
      if (formData.street.trim().length < 6) e.street = "Adresă prea scurtă";
    } else if (!selectedLocker) {
      toast({
        variant: "destructive",
        title: "Selectați un locker",
        description: "Alegeți un locker GLS din hartă.",
      });
      return false;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Finalizare comandă ─────────────────────────────────────────────────────
  const handleCompleteOrder = async () => {
    if (!validateStep1()) {
      toast({
        variant: "destructive",
        title: "Eroare validare",
        description: "Verificați câmpurile marcate.",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: cartItems.map((i) => ({
          sku: (i.sku || i.product_sku).toUpperCase().trim(),
          quantity: parseInt(i.quantity),
        })),
        shipping_details: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.replace(/\s+/g, ""),
          email: formData.email.toLowerCase().trim(),
          address:
            shippingMethod === "courier"
              ? {
                  street: formData.street.trim(),
                  city: formData.city.trim(),
                  county: formData.county.trim(),
                }
              : {
                  locker_id: selectedLocker?.id,
                  locker_name: selectedLocker?.name,
                  city: selectedLocker?.city,
                },
        },
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        voucher_code: appliedVoucher?.code || null,
        save_address: shouldSaveAddress && addressMode === "new",
      };

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      const headers = {
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
            ? data.detail.map((d) => d.msg).join(", ")
            : data.detail || "Eroare server",
        );
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end items-stretch overflow-hidden font-sans">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 36, stiffness: 255 }}
            className="relative z-[1001] w-full max-w-[1160px] bg-white flex flex-col lg:flex-row shadow-2xl h-full overflow-hidden"
          >
            {/* ─────────────── LEFT: Form ─────────────── */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6 md:px-9 lg:px-11 bg-white custom-scrollbar"
            >
              {/* Header */}
              <header className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-100">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                    Checkout{" "}
                    <span className="text-[var(--royal-violet)]">Secure</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {[
                      { n: 1, label: "Livrare" },
                      { n: 2, label: "Plată" },
                    ].map(({ n, label }, i) => (
                      <div key={n} className="flex items-center gap-1.5">
                        {i > 0 && <div className="w-4 h-px bg-zinc-200" />}
                        <button
                          onClick={() => n < step && setStep(n)}
                          className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${
                            step === n
                              ? "text-[var(--royal-violet)]"
                              : step > n
                                ? "text-zinc-400 hover:text-zinc-600 cursor-pointer"
                                : "text-zinc-300"
                          }`}
                        >
                          <span
                            className={`size-4 rounded-full flex items-center justify-center text-[8px] font-black border transition-all ${
                              step === n
                                ? "bg-[var(--royal-violet)] border-[var(--royal-violet)] text-white"
                                : step > n
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-zinc-300 text-zinc-300"
                            }`}
                          >
                            {step > n ? <Check size={8} strokeWidth={3} /> : n}
                          </span>
                          {label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="size-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors"
                >
                  <X size={15} />
                </button>
              </header>

              {/* ─── Mobile: Order Summary Accordion ─── */}
              <div className="lg:hidden mb-4 rounded-xl border border-zinc-200 overflow-hidden">
                <button
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 text-left"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <ShoppingBag size={11} />
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "produs" : "produse"}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] font-black text-[var(--royal-violet)]">
                      {formatCurrency(totals.total)}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-400 transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                <AnimatePresence>
                  {summaryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t border-zinc-100">
                        <OrderSummary
                          cartItems={cartItems}
                          totals={totals}
                          compact
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Steps ─── */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    {/* Shipping method toggle */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          id: "courier",
                          label: "Curier Rapid",
                          Icon: Truck,
                          desc: "Livrare la ușă, 1-2 zile",
                        },
                        {
                          id: "locker",
                          label: "GLS Locker",
                          Icon: Package,
                          desc: "Ridicare din locker",
                        },
                      ].map(({ id, label, Icon, desc }) => (
                        <button
                          key={id}
                          onClick={() => setShippingMethod(id)}
                          className={`relative p-3.5 border-2 rounded-xl text-left transition-all overflow-hidden group ${
                            shippingMethod === id
                              ? "border-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.25] shadow-sm"
                              : "border-zinc-100 hover:border-zinc-200 bg-zinc-50/40"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={`transition-colors ${shippingMethod === id ? "text-[var(--royal-violet)]" : "text-zinc-400"}`}
                          />
                          <p
                            className={`text-[11px] font-black uppercase mt-2 leading-tight ${shippingMethod === id ? "text-[var(--royal-violet)]" : "text-zinc-600"}`}
                          >
                            {label}
                          </p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">
                            {desc}
                          </p>
                          {shippingMethod === id && (
                            <motion.div
                              layoutId="ship-badge"
                              className="absolute top-2 right-2 p-0.5 bg-[var(--royal-violet)] rounded-full"
                            >
                              <Check
                                size={9}
                                className="text-white"
                                strokeWidth={3.5}
                              />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Saved addresses */}
                    {user?.addresses?.length > 0 &&
                      shippingMethod === "courier" && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                            <MapPin size={9} />
                            Adrese Salvate
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {user.addresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => handleSelectAddress(addr)}
                                className={`p-3 text-left border-2 rounded-xl transition-all relative ${
                                  selectedAddressId === addr.id &&
                                  addressMode === "select"
                                    ? "border-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.20]"
                                    : "border-zinc-100 hover:border-zinc-200 bg-zinc-50/30"
                                }`}
                              >
                                <p className="text-[8px] font-black uppercase text-[var(--royal-violet)]">
                                  {addr.address_type || "Adresă"}
                                </p>
                                <p className="text-[11px] font-bold text-zinc-800 truncate mt-0.5">
                                  {addr.street}
                                </p>
                                <p className="text-[9px] text-zinc-400">
                                  {addr.city}, {addr.county}
                                </p>
                                {selectedAddressId === addr.id &&
                                  addressMode === "select" && (
                                    <CheckCircle2
                                      size={12}
                                      className="absolute top-2.5 right-2.5 text-[var(--royal-violet)]"
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
                                  city: "",
                                  county: "",
                                }));
                              }}
                              className={`p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                                addressMode === "new"
                                  ? "border-[var(--royal-violet)] text-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.20]"
                                  : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                              }`}
                            >
                              <Plus size={11} />
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                Adresă Nouă
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Contact fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PremiumInput
                        label="Email"
                        value={formData.email}
                        error={errors.email}
                        placeholder="nume@exemplu.com"
                        autoComplete="email"
                        helperText="Confirmare comandă și factură"
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("email")}
                      />
                      <PremiumInput
                        label="Telefon"
                        value={formData.phone}
                        error={errors.phone}
                        placeholder="07xxxxxxxx"
                        autoComplete="tel"
                        helperText="Necesar curierului"
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("phone")}
                      />
                      <PremiumInput
                        label="Prenume"
                        value={formData.firstName}
                        error={errors.firstName}
                        placeholder="Ex: Andrei"
                        autoComplete="given-name"
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("firstName")}
                      />
                      <PremiumInput
                        label="Nume"
                        value={formData.lastName}
                        error={errors.lastName}
                        placeholder="Ex: Popescu"
                        autoComplete="family-name"
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("lastName")}
                      />
                    </div>

                    {/* Delivery address section */}
                    <AnimatePresence mode="wait">
                      {shippingMethod === "courier" ? (
                        <motion.div
                          key="courier-addr"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3 pt-3 border-t border-zinc-100"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <PremiumSelect
                              label="Județ"
                              value={formData.county}
                              onChange={handleCountyChange}
                              options={counties}
                              error={errors.county}
                              placeholder="Alege județul..."
                            />
                            <PremiumSelect
                              label="Localitate"
                              value={formData.city}
                              onChange={(e) =>
                                handleInputChange("city", e.target.value)
                              }
                              options={cities}
                              disabled={!formData.county || loadingCities}
                              error={errors.city}
                              placeholder={
                                loadingCities
                                  ? "Se încarcă..."
                                  : "Alege localitatea..."
                              }
                            />
                          </div>
                          <PremiumInput
                            label="Stradă, Număr, Bloc, Ap."
                            value={formData.street}
                            error={errors.street}
                            autoComplete="street-address"
                            placeholder="Ex: Str. Mihai Viteazul, Nr. 12, Bl. A, Ap. 4"
                            onChange={(e) =>
                              handleInputChange("street", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("street")}
                          />
                          {addressMode === "new" && user && (
                            <div className="flex items-center gap-2.5 bg-zinc-50 px-3 py-2.5 rounded-lg border border-zinc-100">
                              <Checkbox
                                id="save-addr"
                                checked={shouldSaveAddress}
                                onCheckedChange={setShouldSaveAddress}
                              />
                              <label
                                htmlFor="save-addr"
                                className="text-[9px] font-bold text-zinc-500 cursor-pointer select-none"
                              >
                                Salvează adresa în contul meu
                              </label>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="locker-section"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-3 pt-3 border-t border-zinc-100"
                        >
                          {/* Search input */}
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                            />
                            <input
                              type="text"
                              value={lockerSearch}
                              onChange={(e) => setLockerSearch(e.target.value)}
                              placeholder="Caută locker după oraș sau stradă..."
                              className="h-10 w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 text-[13px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all placeholder:text-zinc-300"
                            />
                          </div>

                          {/* Map container */}
                          <div
                            className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                              lockerJustSelected
                                ? "border-[var(--royal-violet)] ring-2 ring-violet-300 ring-offset-1 shadow-lg shadow-violet-200"
                                : "border-zinc-200"
                            }`}
                            style={{ height: "300px" }}
                          >
                            <Suspense
                              fallback={
                                <div className="h-full flex items-center justify-center bg-zinc-50 gap-2 text-[11px] text-zinc-400">
                                  <Loader2
                                    className="animate-spin text-[var(--royal-violet)]"
                                    size={18}
                                  />
                                  Se încarcă harta...
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

                          {/* Points count hint */}
                          {deliveryPoints.length > 0 && (
                            <p className="text-[9px] text-zinc-400 text-center">
                              {filteredLockers.length < deliveryPoints.length
                                ? `${filteredLockers.length} din ${deliveryPoints.length} lockere`
                                : `${filteredLockers.length} lockere disponibile`}
                              {!debouncedSearch &&
                                deliveryPoints.length > MAX_MAP_POINTS &&
                                " · Caută pentru a filtra"}
                            </p>
                          )}

                          {/* Selected locker card / hint */}
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
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50"
                              >
                                <MapPin size={11} className="text-zinc-300" />
                                <p className="text-[10px] text-zinc-400">
                                  Selectați un locker din hartă
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Continue button */}
                    <Button
                      onClick={() => {
                        if (validateStep1()) setStep(2);
                        else
                          toast({
                            variant: "destructive",
                            title: "Câmpuri nevalidate",
                            description: "Verificați datele completate.",
                          });
                      }}
                      className="w-full h-11 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.25em] shadow-md hover:brightness-110 transition-all"
                      style={{
                        background:
                          "var(--primary-gradient, linear-gradient(135deg,#7c3aed,#6d28d9))",
                      }}
                    >
                      Continuă spre Plată{" "}
                      <ArrowRight size={13} className="ml-1.5" />
                    </Button>
                  </motion.div>
                ) : (
                  /* ─── Step 2: Payment ─── */
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      <ChevronLeft size={13} />
                      Înapoi la livrare
                    </button>

                    {/* Delivery recap card */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 flex items-center gap-1">
                        {shippingMethod === "courier" ? (
                          <>
                            <Truck size={9} /> Livrare Curier
                          </>
                        ) : (
                          <>
                            <Package size={9} /> GLS Locker
                          </>
                        )}
                      </p>
                      <p className="text-[12px] font-bold text-zinc-800">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {shippingMethod === "courier"
                          ? `${formData.street}, ${formData.city}, ${formData.county}`
                          : `${selectedLocker?.name} · ${selectedLocker?.street} ${selectedLocker?.house_number}, ${selectedLocker?.city}`}
                      </p>
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-2.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Modalitate de Plată
                      </p>
                      {[
                        {
                          id: "card",
                          title: "Card Bancar",
                          Icon: CreditCard,
                          desc: "Securizat prin Stripe · procesare instant",
                        },
                        {
                          id: "cod",
                          title: "Plată la Livrare",
                          Icon: Truck,
                          desc: "Cash sau card direct la curier",
                        },
                      ].map(({ id, title, Icon, desc }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`w-full flex items-center gap-3.5 p-4 border-2 rounded-xl text-left transition-all ${
                            paymentMethod === id
                              ? "border-[var(--royal-violet)] bg-[var(--lavender-purple)]/[0.20] shadow-sm"
                              : "border-zinc-100 hover:border-zinc-200"
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl transition-all ${paymentMethod === id ? "text-white shadow-md shadow-violet-400/25" : "bg-zinc-100 text-zinc-400"}`}
                            style={
                              paymentMethod === id
                                ? {
                                    background:
                                      "var(--primary-gradient, linear-gradient(135deg,#7c3aed,#6d28d9))",
                                  }
                                : undefined
                            }
                          >
                            <Icon size={15} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-black uppercase text-zinc-800">
                              {title}
                            </p>
                            <p className="text-[9px] text-zinc-400 mt-0.5">
                              {desc}
                            </p>
                          </div>
                          <div
                            className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              paymentMethod === id
                                ? "bg-[var(--royal-violet)] border-transparent"
                                : "border-zinc-200"
                            }`}
                          >
                            {paymentMethod === id && (
                              <Check
                                size={9}
                                className="text-white"
                                strokeWidth={4}
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-3 border-t border-zinc-100">
                      <Button
                        onClick={handleCompleteOrder}
                        disabled={loading}
                        className="w-full h-12 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.25em] shadow-lg hover:brightness-110 transition-all disabled:opacity-70"
                        style={{
                          background:
                            "var(--primary-gradient, linear-gradient(135deg,#7c3aed,#6d28d9))",
                        }}
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={17} />
                        ) : (
                          <>
                            Confirmă & Plasează Comanda{" "}
                            <ShieldCheck size={13} className="ml-1.5" />
                          </>
                        )}
                      </Button>
                      <p className="text-[9px] text-zinc-400 text-center flex items-center justify-center gap-1">
                        <ShieldCheck size={9} className="text-emerald-500" />
                        Plată securizată · SSL · date criptate
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─────────────── RIGHT: Order Summary (desktop only) ─────────────── */}
            <div className="hidden lg:flex w-[360px] xl:w-[400px] bg-zinc-50/60 border-l border-zinc-100 flex-col p-7 xl:p-9 overflow-hidden">
              <OrderSummary cartItems={cartItems} totals={totals} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutPopup;
