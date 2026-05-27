import {
  Home,
  Briefcase,
  Gift,
  Heart,
  User,
  Users,
  X,
  Truck,
  Package,
  MapPin,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const ADDRESS_TYPES = [
  { id: "Acasă", icon: Home },
  { id: "Birou", icon: Briefcase },
  { id: "Familie", icon: Users },
  { id: "Prieteni", icon: Heart },
  { id: "Cadou", icon: Gift },
  { id: "Altul", icon: User },
];

type Locker = {
  Matchcode?: string;
  matchcode?: string;
  Name?: string;
  name?: string;
  ContactName?: string;
  Address?: string;
  address?: string;
  City?: string;
  city?: string;
  ZipCode?: string;
  zip_code?: string;
};

const normalizeLocker = (l: Locker) => ({
  matchcode: l.Matchcode || l.matchcode || "",
  name: l.Name || l.name || l.ContactName || "Locker GLS",
  address: l.Address || l.address || "",
  city: l.City || l.city || "",
  zip: l.ZipCode || l.zip_code || "",
});

export const AddressModal = ({ isOpen, onClose, onSave, initialData }: any) => {
  const [selectedType, setSelectedType] = useState("Acasă");
  const [deliveryType, setDeliveryType] = useState<"courier" | "locker">(
    "courier",
  );

  // Locker state
  const [lockers, setLockers] = useState<any[]>([]);
  const [lockersLoading, setLockersLoading] = useState(false);
  const [lockerSearch, setLockerSearch] = useState("");
  const [selectedLocker, setSelectedLocker] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedType(initialData?.address_type || "Acasă");
    setDeliveryType(initialData?.delivery_type === "locker" ? "locker" : "courier");
    setSelectedLocker(
      initialData?.locker_id
        ? {
            matchcode: initialData.locker_id,
            address: initialData.locker_address || "",
            name: initialData.locker_name || "Locker selectat",
            city: initialData.city || "",
            zip: initialData.postal_code || "",
          }
        : null,
    );
    setLockerSearch("");
  }, [initialData, isOpen]);

  // Lazy-load lockers when switching to locker mode
  useEffect(() => {
    if (!isOpen || deliveryType !== "locker" || lockers.length > 0) return;
    let cancel = false;
    (async () => {
      setLockersLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/delivery/lockers`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.items || [];
          if (!cancel) setLockers(list.map(normalizeLocker));
        }
      } catch {
        /* silent — UI shows empty state */
      } finally {
        if (!cancel) setLockersLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isOpen, deliveryType, lockers.length]);

  const filteredLockers = useMemo(() => {
    if (!lockerSearch.trim()) return lockers.slice(0, 50);
    const q = lockerSearch.toLowerCase();
    return lockers
      .filter(
        (l) =>
          l.city?.toLowerCase().includes(q) ||
          l.address?.toLowerCase().includes(q) ||
          l.name?.toLowerCase().includes(q) ||
          l.zip?.includes(q),
      )
      .slice(0, 50);
  }, [lockers, lockerSearch]);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data: any = Object.fromEntries(formData);

    if (deliveryType === "locker") {
      if (!selectedLocker) {
        alert("Selectează un locker.");
        return;
      }
      data.delivery_type = "locker";
      data.locker_id = selectedLocker.matchcode;
      data.locker_address = `${selectedLocker.name} — ${selectedLocker.address}`;
      // map for invoice
      data.street = selectedLocker.address || data.street || "Locker GLS";
      data.city = selectedLocker.city || data.city;
      data.postal_code = selectedLocker.zip || data.postal_code;
      data.house_number = data.house_number || "—";
    } else {
      data.delivery_type = "courier";
      data.locker_id = null;
      data.locker_address = null;
    }

    onSave({ ...data, address_type: selectedType });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        <header className="flex justify-between items-start p-6 sm:p-10 pb-4 sm:pb-6 border-b border-zinc-100 shrink-0">
          <div className="space-y-1 text-left">
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em]"
              style={{ color: "var(--royal-violet)" }}
            >
              Configurare Livrare
            </span>
            <h2 className="heading-serif text-2xl sm:text-4xl italic text-[var(--dark-amethyst)]">
              {initialData ? "Actualizare" : "Adresă"} <em>nouă</em>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="size-10 sm:size-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8"
        >
          {/* Delivery type toggle */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">
              Metodă de livrare
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "courier", label: "Curier", icon: Truck, sub: "Acasă" },
                { id: "locker", label: "Locker GLS", icon: Package, sub: "EasyBox" },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSel = deliveryType === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setDeliveryType(opt.id as any)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSel
                        ? "border-[var(--royal-violet)] bg-[var(--royal-violet)]/5"
                        : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                    }`}
                  >
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center ${
                        isSel
                          ? "text-white"
                          : "bg-white text-zinc-400 border border-zinc-100"
                      }`}
                      style={
                        isSel
                          ? { background: "var(--primary-gradient)" }
                          : undefined
                      }
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
                        {opt.label}
                      </p>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                        {opt.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address label */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">
              Etichetă adresă
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {ADDRESS_TYPES.map((type) => {
                const Icon = type.icon;
                const isSel = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all gap-1.5 ${
                      isSel
                        ? "border-[var(--dark-amethyst)] text-white shadow-lg"
                        : "border-zinc-100 bg-zinc-50 hover:border-zinc-200 text-zinc-400"
                    }`}
                    style={
                      isSel
                        ? { background: "var(--primary-gradient)" }
                        : undefined
                    }
                  >
                    <Icon size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {type.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact (always shown) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-6">
            <LuxField
              name="first_name"
              label="Prenume"
              defaultValue={initialData?.first_name}
              placeholder="ex. Alexandra"
            />
            <LuxField
              name="last_name"
              label="Nume"
              defaultValue={initialData?.last_name}
              placeholder="ex. Popescu"
            />
            <LuxField
              name="phone"
              label="Telefon"
              defaultValue={initialData?.phone}
              className="sm:col-span-2"
              placeholder="07xx xxx xxx"
            />
          </div>

          {/* Locker picker */}
          <AnimatePresence mode="wait">
            {deliveryType === "locker" ? (
              <motion.div
                key="locker"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">
                    Caută locker
                  </label>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
                    />
                    <input
                      value={lockerSearch}
                      onChange={(e) => setLockerSearch(e.target.value)}
                      placeholder="Oraș, stradă sau cod poștal..."
                      className="w-full h-12 bg-zinc-50 border-2 border-transparent rounded-2xl pl-11 pr-4 text-sm font-medium outline-none focus:border-[var(--royal-violet)] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="border border-zinc-100 rounded-2xl max-h-64 overflow-y-auto bg-zinc-50/40">
                  {lockersLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        Sincronizare lockere GLS...
                      </span>
                    </div>
                  ) : filteredLockers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-300 gap-2">
                      <MapPin size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        Niciun locker găsit
                      </span>
                    </div>
                  ) : (
                    <ul className="divide-y divide-zinc-100">
                      {filteredLockers.map((l) => {
                        const sel =
                          selectedLocker?.matchcode === l.matchcode;
                        return (
                          <li key={l.matchcode}>
                            <button
                              type="button"
                              onClick={() => setSelectedLocker(l)}
                              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                                sel
                                  ? "bg-[var(--royal-violet)]/5"
                                  : "hover:bg-white"
                              }`}
                            >
                              <div
                                className={`size-8 rounded-lg shrink-0 flex items-center justify-center ${
                                  sel
                                    ? "text-white"
                                    : "bg-white border border-zinc-100 text-zinc-400"
                                }`}
                                style={
                                  sel
                                    ? { background: "var(--primary-gradient)" }
                                    : undefined
                                }
                              >
                                {sel ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  <Package size={14} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[var(--dark-amethyst)] truncate">
                                  {l.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 truncate">
                                  {l.address}
                                </p>
                                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mt-0.5">
                                  {l.city} {l.zip ? `· ${l.zip}` : ""}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {selectedLocker && (
                  <div className="p-4 rounded-2xl border border-[var(--royal-violet)]/20 bg-[var(--royal-violet)]/5">
                    <p className="text-[9px] uppercase tracking-widest font-black text-[var(--royal-violet)] mb-1">
                      Locker selectat
                    </p>
                    <p className="text-sm font-bold text-[var(--dark-amethyst)]">
                      {selectedLocker.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {selectedLocker.address}, {selectedLocker.city}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="courier"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-x-6 sm:gap-y-6 overflow-hidden"
              >
                <LuxField
                  name="street"
                  label="Stradă"
                  defaultValue={initialData?.street}
                  className="sm:col-span-4"
                  placeholder="ex. Bd. Unirii"
                />
                <LuxField
                  name="house_number"
                  label="Nr."
                  defaultValue={initialData?.house_number}
                  className="sm:col-span-2"
                  placeholder="12A"
                />
                <LuxField
                  name="city"
                  label="Oraș"
                  defaultValue={initialData?.city}
                  className="sm:col-span-3"
                  placeholder="București"
                />
                <LuxField
                  name="county"
                  label="Județ / Sector"
                  defaultValue={initialData?.county}
                  className="sm:col-span-3"
                  placeholder="ex. Sector 3"
                />
                <LuxField
                  name="postal_code"
                  label="Cod poștal"
                  defaultValue={initialData?.postal_code}
                  className="sm:col-span-2"
                  placeholder="010101"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="sm:flex-1 h-14 bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-100 transition-all"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="sm:flex-[2] h-14 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: "var(--primary-gradient)" }}
            >
              Salvează adresa
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const LuxField = ({
  name,
  label,
  defaultValue,
  className = "",
  placeholder,
  required = true,
}: any) => (
  <div className={`space-y-2 text-left ${className}`}>
    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">
      {label}
    </label>
    <input
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      className="w-full h-12 bg-zinc-50 border-2 border-transparent rounded-xl focus:border-[var(--royal-violet)] focus:bg-white outline-none px-4 text-sm font-medium text-zinc-900 transition-all placeholder:text-zinc-300"
    />
  </div>
);
