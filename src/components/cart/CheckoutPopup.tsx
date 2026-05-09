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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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

// --- COMPONENTA INPUT PREMIUM ---
const PremiumInput = ({
  label,
  value,
  onChange,
  name,
  placeholder,
  error,
  type = "text",
}: any) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <div className="flex justify-between items-end px-1">
      <label
        className={`text-[10px] font-black uppercase tracking-widest ${error ? "text-rose-500" : "text-zinc-400"}`}
      >
        {label}
      </label>
      {error && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1"
        >
          <AlertCircle size={10} /> {error}
        </motion.span>
      )}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`h-12 w-full bg-zinc-50 border rounded-xl px-4 text-sm transition-all duration-300 outline-none
        ${error ? "border-rose-500 ring-2 ring-rose-100" : "border-zinc-100 focus:border-[var(--royal-violet)] focus:bg-white"}`}
    />
  </div>
);

const CheckoutPopup = ({
  isOpen,
  onClose,
  cartItems = [],
  subtotal: propSubtotal = 0,
  discount: initialDiscount = null,
}: any) => {
  const { user } = useAuth();
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

  // Idempotency key generată per sesiune de deschidere popup
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [isOpen]);

  // Sincronizare inițială date user și voucher
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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Email invalid";
    if (formData.firstName.length < 2) e.firstName = "Min. 2 caractere";
    if (formData.lastName.length < 2) e.lastName = "Min. 2 caractere";
    if (!formData.phone.match(/^(07|\+407|407)[0-9]{8}$/))
      e.phone = "Format: 07xxxxxxxx";
    if (formData.street.length < 5) e.street = "Adresă prea scurtă";
    if (!formData.city) e.city = "Oraș obligatoriu";
    if (!formData.county) e.county = "Județ obligatoriu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCompleteOrder = async () => {
    if (!validate()) return toast.error("Verifică datele de livrare");
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

      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.detail)
          ? data.detail.map((d: any) => d.msg).join(", ")
          : data.detail;
        throw new Error(errorMsg || "Eroare la procesarea comenzii.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[800] flex justify-end items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 250 }}
            className="relative z-[801] w-full max-w-[1250px] h-[100dvh] lg:h-full bg-white flex flex-col lg:flex-row shadow-2xl overflow-hidden"
          >
            {/* --- SECTIUNEA STANGA: FORMULARE --- */}
            <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-16 lg:py-12 custom-scrollbar text-left bg-white order-2 lg:order-1">
              <header className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="heading-serif text-4xl lg:text-5xl mb-2 tracking-tighter italic text-[var(--dark-amethyst)]">
                    Checkout
                  </h2>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                    <span
                      className={step === 1 ? "text-[var(--royal-violet)]" : ""}
                    >
                      01 Livrare
                    </span>
                    <div className="w-6 h-[2px] bg-zinc-100" />
                    <span
                      className={step === 2 ? "text-[var(--royal-violet)]" : ""}
                    >
                      02 Plată
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="lg:hidden size-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400"
                >
                  <X size={20} />
                </button>
              </header>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    {/* ADRESE SALVATE */}
                    {user?.addresses && user.addresses.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                          <MapPin size={12} /> Adresele tale salvate
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {user.addresses.map((addr: any) => (
                            <button
                              key={addr.id}
                              onClick={() => handleSelectAddress(addr)}
                              className={`p-4 text-left border-2 rounded-2xl transition-all relative ${
                                selectedAddressId === addr.id &&
                                addressMode === "select"
                                  ? "border-[var(--royal-violet)] bg-[var(--light-cyan)]"
                                  : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-200"
                              }`}
                            >
                              <p className="text-[9px] font-black uppercase mb-1 text-[var(--royal-violet)]">
                                {addr.address_type || "Adresă"}
                              </p>
                              <p className="text-xs font-bold text-[var(--dark-amethyst)] truncate">
                                {addr.street}
                              </p>
                              {selectedAddressId === addr.id &&
                                addressMode === "select" && (
                                  <CheckCircle2
                                    size={16}
                                    className="absolute top-3 right-3 text-[var(--royal-violet)]"
                                  />
                                )}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setAddressMode("new");
                              setSelectedAddressId(null);
                              setFormData({
                                ...formData,
                                street: "",
                                city: "",
                                county: "",
                              });
                            }}
                            className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${
                              addressMode === "new"
                                ? "border-[var(--royal-violet)] text-[var(--royal-violet)] bg-[var(--light-cyan)]"
                                : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                            }`}
                          >
                            <Plus size={16} />{" "}
                            <span className="text-[10px] font-black uppercase">
                              Adresă Nouă
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FORMULAR DATE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PremiumInput
                        label="Email"
                        value={formData.email}
                        error={errors.email}
                        onChange={(e: any) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                      <PremiumInput
                        label="Telefon"
                        value={formData.phone}
                        error={errors.phone}
                        onChange={(e: any) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                      <PremiumInput
                        label="Prenume"
                        value={formData.firstName}
                        error={errors.firstName}
                        onChange={(e: any) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                      <PremiumInput
                        label="Nume"
                        value={formData.lastName}
                        error={errors.lastName}
                        onChange={(e: any) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                      <div className="md:col-span-2">
                        <PremiumInput
                          label="Adresă Completă"
                          value={formData.street}
                          error={errors.street}
                          onChange={(e: any) =>
                            setFormData({ ...formData, street: e.target.value })
                          }
                        />
                      </div>
                      <PremiumInput
                        label="Oraș"
                        value={formData.city}
                        error={errors.city}
                        onChange={(e: any) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                      <PremiumInput
                        label="Județ"
                        value={formData.county}
                        error={errors.county}
                        onChange={(e: any) =>
                          setFormData({ ...formData, county: e.target.value })
                        }
                      />
                    </div>

                    {addressMode === "new" && user && (
                      <div className="flex items-center gap-3 px-1">
                        <Checkbox
                          id="save-address"
                          checked={shouldSaveAddress}
                          onCheckedChange={(val: any) =>
                            setShouldSaveAddress(val)
                          }
                        />
                        <label
                          htmlFor="save-address"
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer"
                        >
                          Salvează adresa în cont
                        </label>
                      </div>
                    )}

                    <Button
                      onClick={() =>
                        validate() ? setStep(2) : toast.error("Verifică datele")
                      }
                      className="w-full h-16 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-xl transition-all hover:scale-[1.01]"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      Continuă spre plată{" "}
                      <ArrowRight size={18} className="ml-3" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Metodă de Plată
                      </p>
                      <div className="grid gap-4">
                        {[
                          {
                            id: "card",
                            title: "Card Online",
                            icon: CreditCard,
                            desc: "Securizat prin Stripe",
                          },
                          {
                            id: "cod",
                            title: "Ramburs",
                            icon: Truck,
                            desc: "Plată la livrare",
                          },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`flex items-center justify-between p-6 border-2 rounded-2xl transition-all ${paymentMethod === m.id ? "border-[var(--royal-violet)] bg-[var(--light-cyan)]" : "border-zinc-100 bg-zinc-50/50"}`}
                          >
                            <div className="flex items-center gap-5 text-left">
                              <div
                                className={`p-3 rounded-xl ${paymentMethod === m.id ? "text-white" : "bg-white text-zinc-300"}`}
                                style={{
                                  background:
                                    paymentMethod === m.id
                                      ? "var(--primary-gradient)"
                                      : undefined,
                                }}
                              >
                                <m.icon size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-black uppercase text-[var(--dark-amethyst)]">
                                  {m.title}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  {m.desc}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`size-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? "bg-[var(--royal-violet)] border-transparent" : "border-zinc-200"}`}
                            >
                              {paymentMethod === m.id && (
                                <Check
                                  size={14}
                                  className="text-white"
                                  strokeWidth={4}
                                />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Button
                        onClick={handleCompleteOrder}
                        disabled={loading}
                        className="w-full h-16 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Plasează Comanda"
                        )}
                      </Button>
                      <button
                        onClick={() => setStep(1)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--royal-violet)] flex items-center justify-center gap-2 w-full"
                      >
                        <ChevronLeft size={16} /> Înapoi la livrare
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- SECTIUNEA DREAPTA: SUMAR --- */}
            <div className="w-full lg:w-[480px] bg-zinc-50 border-b lg:border-b-0 lg:border-l border-zinc-100 p-6 lg:p-12 flex flex-col text-left order-1 lg:order-2">
              <header className="flex items-center justify-between lg:justify-start gap-3 mb-8 lg:mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <ShoppingBag size={18} className="text-indigo-600" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--dark-amethyst)]">
                    Sumar Comandă
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="hidden lg:flex size-10 rounded-full bg-white border border-zinc-100 items-center justify-center text-zinc-400 hover:text-black transition-all"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="max-h-[220px] lg:max-h-none overflow-y-auto space-y-6 luxury-scrollbar pr-2 mb-8">
                {cartItems.map((item: any) => (
                  <div key={item.sku} className="flex gap-5">
                    <div className="w-16 h-22 bg-white rounded-xl overflow-hidden border border-zinc-100 shrink-0 shadow-sm">
                      <img
                        src={getImageUrl(item.image_url)}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-0.5">
                      <p className="text-[10px] font-black uppercase text-[var(--dark-amethyst)] line-clamp-2">
                        {item.name}
                      </p>
                      <div className="flex justify-between mt-1 text-[10px] font-bold">
                        <span className="text-zinc-400 font-medium">
                          QTY: {item.quantity}
                        </span>
                        <span className="text-[var(--dark-amethyst)]">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-zinc-200 mt-auto">
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-[var(--dark-amethyst)]">
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
                  <span>Transport</span>
                  <span>GRATUIT</span>
                </div>
                <div className="flex justify-between items-end pt-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 pb-1">
                    Total
                  </span>
                  <span className="text-4xl font-black tracking-tighter text-[var(--dark-amethyst)]">
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
