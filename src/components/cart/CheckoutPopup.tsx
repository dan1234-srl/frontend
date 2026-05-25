import { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
  Package,
  Search,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const GLSLockerMap = lazy(() => import("@/pages/gls/GLSLockerMap"));

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(val) + " RON";

const getImageUrl = (imageInput: any) => {
  /* ... logica ta existenta ... */ return "/placeholder.png";
};

// --- COMPONENTA PREMIUM INPUT ---
const PremiumInput = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  type = "text",
}: any) => {
  const isValid = value && !error;
  return (
    <div className="flex flex-col gap-1.5 w-full text-left font-sans">
      <div className="flex justify-between items-end px-1">
        <label
          className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${error ? "text-rose-500" : isValid ? "text-emerald-600" : "text-zinc-400"}`}
        >
          {label}
        </label>
        <AnimatePresence mode="wait">
          {error && (
            <motion.span
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1"
            >
              <AlertCircle size={10} /> {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`h-12 w-full bg-zinc-50/50 border rounded-xl px-4 text-sm font-medium transition-all outline-none ${error ? "border-rose-300 bg-rose-50/10 focus:border-rose-500" : isValid ? "border-emerald-200 bg-emerald-50/5 focus:border-emerald-500" : "border-zinc-200 focus:border-[var(--royal-violet)] focus:bg-white focus:ring-4 focus:ring-purple-50"}`}
      />
    </div>
  );
};

// --- COMPONENTA NOUĂ: PREMIUM SELECT (Pentru Dropdown-uri) ---
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
    <div className="flex flex-col gap-1.5 w-full text-left font-sans">
      <div className="flex justify-between items-end px-1">
        <label
          className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${error ? "text-rose-500" : isValid ? "text-emerald-600" : "text-zinc-400"}`}
        >
          {label}
        </label>
        <AnimatePresence mode="wait">
          {error && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] font-bold text-rose-500 uppercase"
            >
              <AlertCircle size={10} className="inline mr-1" /> {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-12 w-full bg-zinc-50/50 border rounded-xl px-4 text-sm font-medium transition-all outline-none cursor-pointer appearance-none ${disabled ? "opacity-50 cursor-not-allowed bg-zinc-100" : ""} ${error ? "border-rose-300 bg-rose-50/10" : isValid ? "border-emerald-200 bg-emerald-50/5" : "border-zinc-200 focus:border-[var(--royal-violet)]"}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundPosition: "right 1rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.2em 1.2em",
          paddingRight: "2.5rem",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt: any) => (
          <option key={opt.id || opt.nume} value={opt.nume}>
            {opt.nume}
          </option>
        ))}
      </select>
    </div>
  );
};

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [shippingMethod, setShippingMethod] = useState<"courier" | "locker">(
    "courier",
  );
  const [shippingConfig, setShippingConfig] = useState({
    courier_fee: 0,
    locker_fee: 0,
    free_threshold: 0,
  });

  // --- STĂRI NOI: Județe, Localități, Search Lockere ---
  const [counties, setCounties] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [deliveryPoints, setDeliveryPoints] = useState<any[]>([]);
  const [lockerSearch, setLockerSearch] = useState("");
  const [selectedLocker, setSelectedLocker] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    county: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [isOpen]);

  // 1. Fetch Județe România la deschidere
  useEffect(() => {
    if (isOpen) {
      fetch("https://roloca.coldfuse.io/api/judete")
        .then((res) => res.json())
        .then((data) => setCounties(data))
        .catch((err) => console.error("Eroare judete:", err));

      // Fetch setări de transport
      fetch(`${API_BASE_URL}/api/v1/orders/shipping/config`)
        .then((r) => r.json())
        .then(setShippingConfig);
    }
  }, [isOpen]);

  // 2. Fetch Lockere GLS când se alege metoda "locker"
  useEffect(() => {
    if (shippingMethod === "locker" && deliveryPoints.length === 0) {
      fetch(`${API_BASE_URL}/api/v1/orders/gls/delivery-points`)
        .then((res) => res.json())
        .then((data) => setDeliveryPoints(data.filter((x: any) => x.is_locker)))
        .catch(console.error);
    }
  }, [shippingMethod]);

  // Căutare inteligentă Lockere
  const filteredLockers = useMemo(() => {
    if (!lockerSearch.trim()) return deliveryPoints;
    const q = lockerSearch.toLowerCase();
    return deliveryPoints.filter(
      (p: any) =>
        p.city?.toLowerCase().includes(q) ||
        p.street?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q),
    );
  }, [deliveryPoints, lockerSearch]);

  // Logica pentru selectarea județului (încarcă orașele)
  const handleCountyChange = async (e: any) => {
    const countyName = e.target.value;
    handleInputChange("county", countyName);
    handleInputChange("city", ""); // Reset oraș la schimbare județ

    const countyObj = counties.find((c) => c.nume === countyName);
    if (countyObj) {
      setLoadingCities(true);
      try {
        const res = await fetch(
          `https://roloca.coldfuse.io/api/localitati/${countyObj.auto}`,
        );
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCities(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
  };

  // Validarea Pasului 1 (Livrare)
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Email invalid";
    if (formData.firstName.length < 2) e.firstName = "Min. 2 caractere";
    if (formData.lastName.length < 2) e.lastName = "Min. 2 caractere";
    if (!formData.phone.match(/^(07|\+407|407)[0-9]{8}$/))
      e.phone = "Format 07xxxxxxxx";

    if (shippingMethod === "courier") {
      if (!formData.county) e.county = "Alegeți județul";
      if (!formData.city) e.city = "Alegeți localitatea";
      if (formData.street.length < 5)
        e.street = "Adresa detaliată e obligatorie";
    } else {
      if (!selectedLocker) {
        toast({
          variant: "destructive",
          title: "Locker nesetat",
          description:
            "Vă rugăm să selectați un locker GLS din hartă sau listă.",
        });
        return false;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const proceedToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  // ... (Păstrează calculele de shippingPrice și totals neschimbate) ...
  const shippingPrice =
    shippingMethod === "locker"
      ? shippingConfig.locker_fee
      : shippingConfig.courier_fee; // Logică simplificată pentru demo
  const totals = {
    total: propSubtotal + shippingPrice,
    shipping: shippingPrice,
    subtotal: propSubtotal,
  };

  const handleCompleteOrder = async () => {
    // Logica ta existentă de fetch către backend...
    setLoading(true);
    // await fetch('/create-checkout-session', ... payload)
    // setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end items-stretch overflow-hidden font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 260 }}
            className="relative z-[1001] w-full max-w-[1200px] bg-white flex flex-col lg:flex-row shadow-2xl h-full"
          >
            {/* COLOANA STÂNGA: FORMULAR (Dinamic în funcție de Pas) */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-16 text-left bg-white custom-scrollbar">
              <header className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)]">
                    Checkout
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                    <span
                      className={step === 1 ? "text-[var(--royal-violet)]" : ""}
                    >
                      01 Adresă
                    </span>
                    <div className="w-4 h-[2px] bg-zinc-200" />
                    <span
                      className={step === 2 ? "text-[var(--royal-violet)]" : ""}
                    >
                      02 Plată
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </header>

              {/* PASUL 1: DATE DE LIVRARE */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* METODA DE LIVRARE */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShippingMethod("courier")}
                        className={`p-6 border-2 rounded-2xl transition-all text-left group ${shippingMethod === "courier" ? "border-[var(--royal-violet)] bg-purple-50/20" : "border-zinc-100 hover:border-zinc-200"}`}
                      >
                        <Truck
                          size={24}
                          className={
                            shippingMethod === "courier"
                              ? "text-[var(--royal-violet)]"
                              : "text-zinc-400"
                          }
                        />
                        <p className="mt-4 text-sm font-black uppercase">
                          Curier Rapid
                        </p>
                      </button>
                      <button
                        onClick={() => setShippingMethod("locker")}
                        className={`p-6 border-2 rounded-2xl transition-all text-left group ${shippingMethod === "locker" ? "border-[var(--royal-violet)] bg-purple-50/20" : "border-zinc-100 hover:border-zinc-200"}`}
                      >
                        <Package
                          size={24}
                          className={
                            shippingMethod === "locker"
                              ? "text-[var(--royal-violet)]"
                              : "text-zinc-400"
                          }
                        />
                        <p className="mt-4 text-sm font-black uppercase">
                          GLS Locker
                        </p>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                      <PremiumInput
                        label="Email"
                        value={formData.email}
                        onChange={(e: any) =>
                          handleInputChange("email", e.target.value)
                        }
                        error={errors.email}
                        placeholder="nume@email.com"
                      />
                      <PremiumInput
                        label="Telefon"
                        value={formData.phone}
                        onChange={(e: any) =>
                          handleInputChange("phone", e.target.value)
                        }
                        error={errors.phone}
                        placeholder="07xxxxxxxx"
                      />
                      <PremiumInput
                        label="Prenume"
                        value={formData.firstName}
                        onChange={(e: any) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        error={errors.firstName}
                        placeholder="Ion"
                      />
                      <PremiumInput
                        label="Nume"
                        value={formData.lastName}
                        onChange={(e: any) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        error={errors.lastName}
                        placeholder="Popescu"
                      />
                    </div>

                    {/* CONDIȚIONAL: Locker vs Adresă */}
                    {shippingMethod === "courier" ? (
                      <div className="space-y-6 pt-4 border-t border-zinc-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <PremiumSelect
                            label="Județ"
                            value={formData.county}
                            onChange={handleCountyChange}
                            options={counties}
                            error={errors.county}
                            placeholder="Alege județul..."
                          />
                          <PremiumSelect
                            label="Localitate / Oraș"
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
                                : "Alege localitatea..."
                            }
                          />
                        </div>
                        <PremiumInput
                          label="Adresă Detaliată (Stradă, Nr, Bloc, Scară)"
                          value={formData.street}
                          onChange={(e: any) =>
                            handleInputChange("street", e.target.value)
                          }
                          error={errors.street}
                          placeholder="Ex: Str. Florilor, Nr. 10, Bl. A, Ap. 5"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4 border-t border-zinc-100">
                        {/* SEARCH BAR INTELIGENT */}
                        <div className="relative">
                          <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                          />
                          <input
                            type="text"
                            placeholder="Caută locker după Oraș sau Stradă (ex: Cluj)"
                            value={lockerSearch}
                            onChange={(e) => setLockerSearch(e.target.value)}
                            className="h-14 w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-zinc-700 outline-none focus:border-[var(--royal-violet)] transition-colors"
                          />
                        </div>

                        <div className="h-[400px] rounded-3xl overflow-hidden border border-zinc-200 relative shadow-inner">
                          <Suspense
                            fallback={
                              <div className="h-full flex items-center justify-center bg-zinc-50">
                                <Loader2 className="animate-spin text-[var(--royal-violet)]" />
                              </div>
                            }
                          >
                            <GLSLockerMap
                              deliveryPoints={filteredLockers}
                              selectedLocker={selectedLocker}
                              setSelectedLocker={setSelectedLocker}
                            />
                          </Suspense>
                        </div>

                        {selectedLocker && (
                          <div className="p-5 rounded-2xl border border-[var(--royal-violet)] bg-purple-50/30 flex items-center gap-4">
                            <div className="p-3 bg-[var(--royal-violet)] text-white rounded-xl shadow-lg shadow-purple-500/30">
                              <MapPin size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-[var(--royal-violet)] tracking-widest">
                                Locker Confirmat
                              </p>
                              <p className="font-bold text-sm text-zinc-800 mt-1">
                                {selectedLocker.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {selectedLocker.street}{" "}
                                {selectedLocker.house_number},{" "}
                                {selectedLocker.city}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={proceedToStep2}
                      className="w-full h-14 bg-black text-white hover:bg-zinc-800 rounded-xl font-black uppercase text-[11px] tracking-[0.2em]"
                    >
                      Continuă spre Plată{" "}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </motion.div>
                ) : (
                  /* PASUL 2: PLATA */
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-black transition-colors mb-6"
                    >
                      <ChevronLeft size={16} /> Înapoi la livrare
                    </button>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Modalitate de Plată
                      </p>
                      {[
                        {
                          id: "card",
                          title: "Card Bancar (Securizat Stripe)",
                          icon: CreditCard,
                          desc: "Plată online instant, procesată 100% în siguranță.",
                        },
                        {
                          id: "cod",
                          title: "Plată la Livrare (Ramburs)",
                          icon: Truck,
                          desc: "Plătești cash sau cu cardul direct la curier / locker.",
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`w-full flex items-center justify-between p-6 border-2 rounded-2xl transition-all text-left ${paymentMethod === m.id ? "border-[var(--royal-violet)] bg-purple-50/10 shadow-sm" : "border-zinc-100 hover:border-zinc-200"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl ${paymentMethod === m.id ? "bg-[var(--royal-violet)] text-white shadow-md shadow-purple-500/20" : "bg-zinc-100 text-zinc-400"}`}
                            >
                              <m.icon size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase text-[var(--dark-amethyst)]">
                                {m.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-1">
                                {m.desc}
                              </p>
                            </div>
                          </div>
                          {paymentMethod === m.id && (
                            <CheckCircle2
                              size={24}
                              className="text-[var(--royal-violet)]"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleCompleteOrder}
                      disabled={loading}
                      className="w-full h-16 bg-[var(--royal-violet)] text-white hover:brightness-110 shadow-xl shadow-purple-500/20 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Finalizează Comanda <ShieldCheck size={18} />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COLOANA DREAPTĂ: REZUMAT COȘ (Static) */}
            <div className="w-full lg:w-[420px] bg-zinc-50 border-l border-zinc-100 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-6">
                  <ShoppingBag size={14} /> Rezumat Comandă
                </h3>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item: any) => (
                    <div
                      key={item.sku}
                      className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-zinc-100/50"
                    >
                      <img
                        src={getImageUrl(item.image_url)}
                        className="w-12 h-16 object-cover rounded-xl bg-zinc-50"
                      />
                      <div>
                        <p className="font-bold text-xs text-[var(--dark-amethyst)] line-clamp-2 leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Cantitate:{" "}
                          <span className="font-bold text-black">
                            {item.quantity}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mt-8 pt-6 border-t border-zinc-200/60">
                <div className="flex justify-between text-xs font-bold text-zinc-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-zinc-500">
                  <span>Transport</span>
                  <span
                    className={
                      totals.shipping === 0
                        ? "text-emerald-600 uppercase tracking-widest text-[10px]"
                        : ""
                    }
                  >
                    {totals.shipping === 0
                      ? "Gratuit"
                      : formatCurrency(totals.shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-dashed border-zinc-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Total de Plată
                  </span>
                  <span className="text-3xl font-black text-[var(--dark-amethyst)] tracking-tight">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutPopup;
