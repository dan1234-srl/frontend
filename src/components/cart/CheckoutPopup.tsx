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
  Plus,
  MapPin,
  ShieldCheck,
  Package,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const GLSLockerMap = lazy(() => import("./GLSLockerMap"));

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

      if (typeof data === "string") {
        data = JSON.parse(data);
      }
    } catch {
      if (data.startsWith("http")) {
        return data;
      }

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
              <AlertCircle size={10} />
              {error}
            </motion.span>
          )}

          {!error && isValid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1"
            >
              <Check size={10} strokeWidth={3} />
              Valid
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
        className={`h-12 w-full bg-zinc-50/50 border rounded-xl px-4 text-sm font-medium transition-all duration-300 outline-none
        ${
          error
            ? "border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
            : isValid
              ? "border-emerald-200 bg-emerald-50/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50"
              : "border-zinc-150 focus:border-[var(--royal-violet)] focus:bg-white focus:ring-4 focus:ring-purple-50"
        }`}
      />

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

  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  const [shippingMethod, setShippingMethod] = useState<"courier" | "locker">(
    "courier",
  );

  const [deliveryPoints, setDeliveryPoints] = useState<any[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<any | null>(null);

  const [shippingConfig, setShippingConfig] = useState({
    courier_fee: 0,
    locker_fee: 0,
    free_threshold: 0,
  });

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
    const loadShippingConfig = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/shipping/config`);

        const data = await res.json();

        setShippingConfig(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (isOpen) {
      loadShippingConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    const loadLockers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/gls/delivery-points`);

        const data = await res.json();

        setDeliveryPoints(data.filter((x: any) => x.is_locker));
      } catch (err) {
        console.error(err);
      }
    };

    if (shippingMethod === "locker") {
      loadLockers();
    }
  }, [shippingMethod]);

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

        if (user.addresses?.length > 0) {
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
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };

        delete next[field];

        return next;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    const val = formData[field as keyof typeof formData]?.trim() || "";

    let errMessage = "";

    if (!val) {
      errMessage = "Câmp obligatoriu";
    } else {
      if (field === "email" && !val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errMessage = "Format email invalid";
      }

      if (field === "phone" && !val.match(/^(07|\+407|407)[0-9]{8}$/)) {
        errMessage = "Format: 07xxxxxxxx";
      }

      if ((field === "firstName" || field === "lastName") && val.length < 2) {
        errMessage = "Min. 2 caractere";
      }

      if (field === "street" && val.length < 6) {
        errMessage = "Introduceți adresa detaliată";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: errMessage,
    }));
  };

  const shippingPrice = useMemo(() => {
    const subtotal =
      cartItems.reduce(
        (acc: number, item: any) =>
          acc + parseFloat(item.price) * (item.quantity || 1),
        0,
      ) ||
      parseFloat(propSubtotal as any) ||
      0;

    if (subtotal >= shippingConfig.free_threshold) {
      return 0;
    }

    return shippingMethod === "locker"
      ? shippingConfig.locker_fee
      : shippingConfig.courier_fee;
  }, [cartItems, propSubtotal, shippingMethod, shippingConfig]);

  const totals = useMemo(() => {
    const itemsSum = cartItems.reduce(
      (acc: number, item: any) =>
        acc + parseFloat(item.price) * (item.quantity || 1),
      0,
    );

    const base = itemsSum > 0 ? itemsSum : parseFloat(propSubtotal as any) || 0;

    const disc = appliedVoucher?.amount || 0;

    return {
      subtotal: base,
      discount: disc,
      shipping: shippingPrice,
      total: Math.max(base - disc, 0) + shippingPrice,
    };
  }, [cartItems, propSubtotal, appliedVoucher, shippingPrice]);

  const validateAll = () => {
    const e: Record<string, string> = {};

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      e.email = "Email invalid";
    }

    if (formData.firstName.length < 2) {
      e.firstName = "Min. 2 caractere";
    }

    if (formData.lastName.length < 2) {
      e.lastName = "Min. 2 caractere";
    }

    if (!formData.phone.match(/^(07|\+407|407)[0-9]{8}$/)) {
      e.phone = "Format invalid";
    }

    if (shippingMethod === "courier" && formData.street.length < 6) {
      e.street = "Adresă prea scurtă";
    }

    if (!formData.city) {
      e.city = "Oraș obligatoriu";
    }

    if (!formData.county) {
      e.county = "Județ obligatoriu";
    }

    if (shippingMethod === "locker" && !selectedLocker) {
      toast({
        variant: "destructive",
        title: "Locker necesar",
        description: "Selectați un locker GLS de pe hartă.",
      });

      return false;
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleCompleteOrder = async () => {
    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((i: any) => ({
          sku: (i.sku || i.product_sku).toUpperCase().trim(),
          quantity: parseInt(i.quantity),
        })),

        shipping_method: shippingMethod,

        delivery_point_id:
          shippingMethod === "locker" ? selectedLocker?.id : null,

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
          headers,
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 38,
              stiffness: 240,
            }}
            className="relative z-[1001] w-full max-w-[1300px] bg-white flex flex-col lg:flex-row shadow-2xl h-full"
          >
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-16 lg:py-14 text-left bg-white order-2 lg:order-1 custom-scrollbar">
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingMethod("courier")}
                    className={`p-5 border-2 rounded-2xl transition-all ${
                      shippingMethod === "courier"
                        ? "border-[var(--royal-violet)] bg-purple-50/10"
                        : "border-zinc-100"
                    }`}
                  >
                    <Truck size={18} />

                    <p className="mt-3 text-xs font-black uppercase">Curier</p>

                    <p className="text-[10px] text-zinc-500 mt-1">
                      {shippingPrice === 0
                        ? "Gratuit"
                        : formatCurrency(shippingConfig.courier_fee)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod("locker")}
                    className={`p-5 border-2 rounded-2xl transition-all ${
                      shippingMethod === "locker"
                        ? "border-[var(--royal-violet)] bg-purple-50/10"
                        : "border-zinc-100"
                    }`}
                  >
                    <Package size={18} />

                    <p className="mt-3 text-xs font-black uppercase">
                      GLS Locker
                    </p>

                    <p className="text-[10px] text-zinc-500 mt-1">
                      {shippingPrice === 0
                        ? "Gratuit"
                        : formatCurrency(shippingConfig.locker_fee)}
                    </p>
                  </button>
                </div>

                {shippingMethod === "locker" && (
                  <div className="space-y-5">
                    <div className="h-[500px] overflow-hidden rounded-3xl border border-zinc-200">
                      <Suspense
                        fallback={
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin" />
                          </div>
                        }
                      >
                        <GLSLockerMap
                          deliveryPoints={deliveryPoints}
                          setSelectedLocker={setSelectedLocker}
                        />
                      </Suspense>
                    </div>

                    {selectedLocker && (
                      <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                          Locker selectat
                        </p>

                        <p className="font-bold mt-2">{selectedLocker.name}</p>

                        <p className="text-sm text-zinc-500">
                          {selectedLocker.street} {selectedLocker.house_number}
                        </p>

                        <p className="text-sm text-zinc-500">
                          {selectedLocker.city}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PremiumInput
                    label="Adresă Email"
                    value={formData.email}
                    error={errors.email}
                    placeholder="nume@exemplu.com"
                    onChange={(e: any) =>
                      handleInputChange("email", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("email")}
                  />

                  <PremiumInput
                    label="Telefon"
                    value={formData.phone}
                    error={errors.phone}
                    placeholder="07xxxxxxxx"
                    onChange={(e: any) =>
                      handleInputChange("phone", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("phone")}
                  />

                  <PremiumInput
                    label="Prenume"
                    value={formData.firstName}
                    error={errors.firstName}
                    placeholder="Andrei"
                    onChange={(e: any) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("firstName")}
                  />

                  <PremiumInput
                    label="Nume"
                    value={formData.lastName}
                    error={errors.lastName}
                    placeholder="Popescu"
                    onChange={(e: any) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("lastName")}
                  />

                  {shippingMethod === "courier" && (
                    <>
                      <div className="md:col-span-2">
                        <PremiumInput
                          label="Adresă"
                          value={formData.street}
                          error={errors.street}
                          placeholder="Strada..."
                          onChange={(e: any) =>
                            handleInputChange("street", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("street")}
                        />
                      </div>

                      <PremiumInput
                        label="Oraș"
                        value={formData.city}
                        error={errors.city}
                        placeholder="Suceava"
                        onChange={(e: any) =>
                          handleInputChange("city", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("city")}
                      />

                      <PremiumInput
                        label="Județ"
                        value={formData.county}
                        error={errors.county}
                        placeholder="Suceava"
                        onChange={(e: any) =>
                          handleInputChange("county", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("county")}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="grid gap-3">
                    {[
                      {
                        id: "card",
                        title: "Card Bancar",
                        icon: CreditCard,
                      },
                      {
                        id: "cod",
                        title: "Plată Ramburs",
                        icon: Truck,
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as "card" | "cod")}
                        className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all ${
                          paymentMethod === m.id
                            ? "border-[var(--royal-violet)] bg-purple-50/5"
                            : "border-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <m.icon size={18} />

                          <p className="text-xs font-black uppercase">
                            {m.title}
                          </p>
                        </div>

                        {paymentMethod === m.id && (
                          <CheckCircle2
                            size={18}
                            className="text-[var(--royal-violet)]"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleCompleteOrder}
                    disabled={loading}
                    className="w-full h-14"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Finalizează Comanda"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[440px] bg-zinc-50/50 border-l border-zinc-100 p-10 flex flex-col">
              <div className="space-y-4 flex-1 overflow-y-auto">
                {cartItems.map((item: any) => (
                  <div
                    key={item.sku}
                    className="flex gap-4 bg-white p-3 rounded-2xl border"
                  >
                    <img
                      src={getImageUrl(item.image_url)}
                      className="w-14 h-20 object-cover rounded-xl"
                    />

                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.name}</p>

                      <p className="text-xs text-zinc-500 mt-1">
                        Cantitate: {item.quantity}
                      </p>

                      <p className="text-sm font-bold mt-2">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t mt-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>

                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-rose-500">
                    <span>Discount</span>

                    <span>-{formatCurrency(totals.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Livrare</span>

                  <span>
                    {totals.shipping === 0
                      ? "Gratuit"
                      : formatCurrency(totals.shipping)}
                  </span>
                </div>

                <div className="flex justify-between pt-4 border-t text-xl font-black">
                  <span>Total</span>

                  <span>{formatCurrency(totals.total)}</span>
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
