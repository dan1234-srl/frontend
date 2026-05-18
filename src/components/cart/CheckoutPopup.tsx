import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

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
  return rawUrl
    ? `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}&w=200&h=260&fit=cover&output=webp`
    : "/placeholder.png";
};

// --- COMPONENTA INPUT PREMIUM CONTROLATĂ CU VALIDARE INLINE ---
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
}: any) => {
  const isValid = value && !error;

  return (
    <div className="flex flex-col gap-1.5 w-full text-left font-sans">
      <div className="flex justify-between items-end px-1">
        <label
          className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
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
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1"
            >
              <AlertCircle size={10} /> {error}
            </motion.span>
          )}
          {!error && isValid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1"
            >
              <Check size={10} strokeWidth={3} /> Valid
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-full">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`h-12 w-full bg-zinc-50/50 border rounded-xl px-4 text-sm font-medium transition-all duration-300 outline-none
            ${
              error
                ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                : isValid
                  ? "border-emerald-200 bg-emerald-50/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50"
                  : "border-zinc-150 focus:border-[var(--royal-violet)] focus:bg-white focus:ring-4 focus:ring-purple-50"
            }`}
        />
      </div>
      {helperText && !error && (
        <p className="text-[10px] text-zinc-400/80 font-medium px-1 italic">
          {helperText}
        </p>
      )}
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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [addressMode, setAddressMode] = useState<"select" | "new">("select");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    county: "",
  });

  const idempotencyKey = useMemo(() => crypto.randomUUID(), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setAppliedVoucher(initialDiscount);
      setStep(1);
      setErrors({});

      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          phone: (user.phone || "").replace(/\s+/g, ""),
        }));

        if (user.addresses && user.addresses.length > 0) {
          const def =
            user.addresses.find((a: any) => a.is_default) || user.addresses[0];
          handleSelectAddress(def);
        } else {
          setAddressMode("new");
        }
      }
    }
  }, [isOpen, user, initialDiscount]);

  const handleSelectAddress = (addr: any) => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validare inline asincronă / asertivă pe evenimentul de Blur (Premium Flow)
  const handleFieldBlur = (field: string) => {
    const val = formData[field as keyof typeof formData]?.trim() || "";
    let errMessage = "";

    if (!val) {
      errMessage = "Câmp obligatoriu";
    } else {
      if (field === "email" && !val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errMessage = "Format email invalid";
      if (field === "phone" && !val.match(/^(07|\+407|407)[0-9]{8}$/))
        errMessage = "Format: 07xxxxxxxx";
      if ((field === "firstName" || field === "lastName") && val.length < 2)
        errMessage = "Min. 2 caractere";
      if (field === "street" && val.length < 6)
        errMessage = "Introduceți adresa detaliată";
    }

    setErrors((prev) => ({ ...prev, [field]: errMessage }));
  };

  const totals = useMemo(() => {
    const itemsSum = cartItems.reduce(
      (acc: number, item: any) =>
        acc + parseFloat(item.price) * (item.quantity || 1),
      0,
    );
    const base = itemsSum > 0 ? itemsSum : parseFloat(propSubtotal as any) || 0;
    const disc = appliedVoucher?.amount || 0;
    return { subtotal: base, discount: disc, total: Math.max(base - disc, 0) };
  }, [cartItems, propSubtotal, appliedVoucher]);

  const validateAll = () => {
    const e: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Email invalid";
    if (formData.firstName.length < 2) e.firstName = "Min. 2 caractere";
    if (formData.lastName.length < 2) e.lastName = "Min. 2 caractere";
    if (!formData.phone.match(/^(07|\+407|407)[0-9]{8}$/))
      e.phone = "Format invalid";
    if (formData.street.length < 6) e.street = "Adresă prea scurtă";
    if (!formData.city) e.city = "Oraș obligatoriu";
    if (!formData.county) e.county = "Județ obligatoriu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCompleteOrder = async () => {
    if (!validateAll()) {
      toast({
        variant: "destructive",
        title: "Eroare validare",
        description: "Vă rugăm să corectați câmpurile marcate cu roșu.",
      });
      return;
    }
    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((i: any) => ({
          sku: (i.sku || i.product_sku).toUpperCase().trim(),
          quantity: parseInt(i.quantity),
        })),
        shipping_details: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.replace(/\s+/g, ""),
          email: formData.email.toLowerCase().trim(),
          address: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            county: formData.county.trim(),
          },
        },
        payment_method: paymentMethod,
        voucher_code: appliedVoucher?.code || null,
        save_address: shouldSaveAddress && addressMode === "new",
      };

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/create-checkout-session`,
        {
          method: "POST",
          headers: headers,
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.detail)
          ? data.detail.map((d: any) => d.msg).join(", ")
          : data.detail;
        throw new Error(errorMsg || "Eroare server");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Eroare procesare",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end items-stretch overflow-hidden font-sans">
          {/* Overlay Fluid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Corpul Principal Complet Responsive Grid-Flex */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 38, stiffness: 240 }}
            className="relative z-[1001] w-full max-w-[1300px] bg-white flex flex-col lg:flex-row shadow-2xl h-full"
          >
            {/* --- COLOANA STÂNGA: FORMULARE LIVE --- */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-16 lg:py-14 text-left bg-white order-2 lg:order-1 custom-scrollbar">
              <header className="flex justify-between items-center mb-10 border-b border-zinc-50 pb-6">
                <div className="space-y-1">
                  <h2 className="heading-serif text-4xl font-black italic tracking-tighter text-[var(--dark-amethyst)]">
                    Checkout Secure
                  </h2>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                    <span
                      className={step === 1 ? "text-[var(--royal-violet)]" : ""}
                    >
                      01 Expediere
                    </span>
                    <div className="w-4 h-[1px] bg-zinc-200" />
                    <span
                      className={step === 2 ? "text-[var(--royal-violet)]" : ""}
                    >
                      02 Rezumat Plată
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="size-11 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-black transition-all"
                >
                  <X size={18} />
                </button>
              </header>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-delivery"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-10"
                  >
                    {/* ADRESE DISPONIBILE */}
                    {user?.addresses && user.addresses.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                          <MapPin size={12} /> Selectează o adresă salvată
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {user.addresses.map((addr: any) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectAddress(addr)}
                              className={`p-5 text-left border-2 rounded-2xl transition-all relative group ${
                                selectedAddressId === addr.id &&
                                addressMode === "select"
                                  ? "border-[var(--royal-violet)] bg-purple-50/10 shadow-sm"
                                  : "border-zinc-100 bg-zinc-50/30 hover:border-zinc-200"
                              }`}
                            >
                              <span className="text-[8px] font-black uppercase tracking-wider text-[var(--royal-violet)] block mb-1">
                                {addr.address_type || "Adresă Salvare"}
                              </span>
                              <p className="text-xs font-bold text-[var(--dark-amethyst)] truncate pr-4">
                                {addr.street}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                                {addr.city}, {addr.county}
                              </p>
                              {selectedAddressId === addr.id &&
                                addressMode === "select" && (
                                  <CheckCircle2
                                    size={14}
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
                                city: "",
                                county: "",
                              }));
                            }}
                            className={`p-5 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${
                              addressMode === "new"
                                ? "border-[var(--royal-violet)] text-[var(--royal-violet)] bg-purple-50/10"
                                : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                            }`}
                          >
                            <Plus size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Adresă Nouă
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LIVE VALIDATION GRID FORM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <PremiumInput
                        label="Adresă Email"
                        value={formData.email}
                        error={errors.email}
                        placeholder="nume@exemplu.com"
                        helperText="Folosită pentru confirmarea comenzii și factură."
                        onChange={(e: any) =>
                          handleInputChange("email", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("email")}
                      />
                      <PremiumInput
                        label="Număr Telefon"
                        value={formData.phone}
                        error={errors.phone}
                        placeholder="07xxxxxxxx"
                        helperText="Necesar curierului pentru predarea coletului."
                        onChange={(e: any) =>
                          handleInputChange("phone", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("phone")}
                      />
                      <PremiumInput
                        label="Prenume Destinatar"
                        value={formData.firstName}
                        error={errors.firstName}
                        placeholder="Ex: Andrei"
                        onChange={(e: any) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("firstName")}
                      />
                      <PremiumInput
                        label="Nume Destinatar"
                        value={formData.lastName}
                        error={errors.lastName}
                        placeholder="Ex: Popescu"
                        onChange={(e: any) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("lastName")}
                      />
                      <div className="md:col-span-2">
                        <PremiumInput
                          label="Adresă Livrare (Strada, Număr, Bloc)"
                          value={formData.street}
                          error={errors.street}
                          placeholder="Ex: Str. Mihai Viteazul, Nr. 12, Bl. A, Ap. 4"
                          helperText="Includeți detalii precum interfon sau repere dacă este cazul."
                          onChange={(e: any) =>
                            handleInputChange("street", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("street")}
                        />
                      </div>
                      <PremiumInput
                        label="Oraș / Localitate"
                        value={formData.city}
                        error={errors.city}
                        placeholder="Ex: Suceava"
                        onChange={(e: any) =>
                          handleInputChange("city", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("city")}
                      />
                      <PremiumInput
                        label="Județ"
                        value={formData.county}
                        error={errors.county}
                        placeholder="Ex: Suceava"
                        helperText="Introduceți numele complet al județului."
                        onChange={(e: any) =>
                          handleInputChange("county", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("county")}
                      />
                    </div>

                    {addressMode === "new" && user && (
                      <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                        <Checkbox
                          id="save-address"
                          checked={shouldSaveAddress}
                          onCheckedChange={(val: any) =>
                            setShouldSaveAddress(val)
                          }
                        />
                        <label
                          htmlFor="save-address"
                          className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 cursor-pointer select-none"
                        >
                          Salvează automat această adresă în contul meu
                        </label>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        if (validateAll()) setStep(2);
                        else {
                          toast({
                            variant: "destructive",
                            title: "Câmpuri nevalidate",
                            description:
                              "Vă rugăm să verificați corectitudinea datelor completate.",
                          });
                        }
                      }}
                      className="w-full h-14 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:brightness-110 transition-all duration-300"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      Continuă spre plată{" "}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-payment"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Selectează Modalitatea de Plată
                      </p>
                      <div className="grid gap-3">
                        {[
                          {
                            id: "card",
                            title: "Card Bancar (Online)",
                            icon: CreditCard,
                            desc: "Tranzacție securizată criptat prin Stripe",
                          },
                          {
                            id: "cod",
                            title: "Plată la Livrare (Ramburs)",
                            icon: Truck,
                            desc: "Achitați cash sau card direct la curier",
                          },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`flex items-center justify-between p-5 border-2 rounded-2xl text-left transition-all ${
                              paymentMethod === m.id
                                ? "border-[var(--royal-violet)] bg-purple-50/5 shadow-sm"
                                : "border-zinc-100 bg-zinc-50/20 hover:border-zinc-200"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-xl transition-colors ${
                                  paymentMethod === m.id
                                    ? "text-white"
                                    : "bg-zinc-100 text-zinc-400"
                                }`}
                                style={{
                                  background:
                                    paymentMethod === m.id
                                      ? "var(--primary-gradient)"
                                      : undefined,
                                }}
                              >
                                <m.icon size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase text-[var(--dark-amethyst)]">
                                  {m.title}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                  {m.desc}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                paymentMethod === m.id
                                  ? "bg-[var(--royal-violet)] border-transparent"
                                  : "border-zinc-200"
                              }`}
                            >
                              {paymentMethod === m.id && (
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

                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <Button
                        onClick={handleCompleteOrder}
                        disabled={loading}
                        className="w-full h-15 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:brightness-110 transition-all duration-300"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Confirmă și Plasează Comanda"
                        )}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black flex items-center justify-center gap-1 w-full py-2 transition-colors"
                      >
                        <ChevronLeft size={14} /> Înapoi la datele de livrare
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- COLOANA DREAPTĂ: SUMAR COȘ FIX --- */}
            <div className="w-full lg:w-[440px] bg-zinc-50/50 border-t lg:border-t-0 lg:border-l border-zinc-100 p-6 md:p-10 lg:p-12 flex flex-col text-left order-1 lg:order-2 h-[35vh] lg:h-full overflow-hidden">
              <header className="flex items-center gap-3 mb-6 shrink-0">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/50">
                  <ShoppingBag size={16} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
                  Coșul tău de cumpărături
                </h3>
              </header>

              {/* Listă produse cu scroll izolat */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar my-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.sku}
                    className="flex gap-4 items-center bg-white p-3 rounded-xl border border-zinc-100 shadow-sm"
                  >
                    <div className="w-12 h-16 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shrink-0">
                      <img
                        src={getImageUrl(item.image_url)}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[var(--dark-amethyst)] truncate">
                        {item.name}
                      </p>
                      <div className="flex justify-between items-center mt-1 text-[10px] font-bold">
                        <span className="text-zinc-400 font-medium">
                          Cantitate: {item.quantity}
                        </span>
                        <span className="text-zinc-800">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Caseta cu totalurile finale */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 shrink-0 bg-transparent mt-auto">
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-700">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-black uppercase text-rose-500">
                    <span>Discount Voucher</span>
                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-black uppercase text-emerald-600">
                  <span>Livrare Express</span>
                  <span className="font-black">Gratuit</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-dashed border-zinc-200 mt-2">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Total de plată
                    </span>
                    <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">
                        TVA inclus
                      </span>
                    </div>
                  </div>
                  <span className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)] leading-none">
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
