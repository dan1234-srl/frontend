import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- COMPONENTE REUTILIZABILE (Aceleași ca în Checkout) ---
const PremiumInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: any) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-10 w-full border border-zinc-200 rounded-lg px-3 text-[13px] font-medium transition-all outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 placeholder:text-zinc-300"
    />
  </div>
);

const PremiumSelect = ({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: any) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-10 w-full border rounded-lg pl-3 pr-8 text-[13px] font-medium transition-all outline-none appearance-none cursor-pointer ${
          disabled
            ? "opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-200"
            : "border-zinc-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
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
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
      />
    </div>
  </div>
);

// --- COMPONENTA PRINCIPALĂ ---
export const AddressModal = ({ isOpen, initialData, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    address_type: "Acasă",
    first_name: "",
    last_name: "",
    phone: "",
    county: "",
    city: "",
    street: "",
    house_number: "",
    postal_code: "",
    is_default: false,
  });

  const [counties, setCounties] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1. Resetăm form-ul când modalul se deschide
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          house_number: initialData.house_number || "",
          postal_code: initialData.postal_code || "",
        });
        loadCitiesForCounty(initialData.county);
      } else {
        setFormData({
          address_type: "Acasă",
          first_name: "",
          last_name: "",
          phone: "",
          county: "",
          city: "",
          street: "",
          house_number: "",
          postal_code: "",
          is_default: false,
        });
        setCities([]);
      }
    }
  }, [isOpen, initialData]);

  // 2. Fetch Județe (cu cache local)
  useEffect(() => {
    if (!isOpen) return;
    const cached = sessionStorage.getItem("judete_cache");
    if (cached) {
      setCounties(JSON.parse(cached));
      return;
    }
    fetch(`${API_BASE_URL}/api/v1/orders/utils/judete`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCounties(data);
          sessionStorage.setItem("judete_cache", JSON.stringify(data));
        }
      })
      .catch((err) => console.error("Eroare fetch judete:", err));
  }, [isOpen]);

  // 3. Funcție pentru fetch Localități pe baza județului
  const loadCitiesForCounty = async (countyName: string) => {
    if (!countyName) return;

    let countyList = counties;
    if (countyList.length === 0) {
      const cached = sessionStorage.getItem("judete_cache");
      if (cached) countyList = JSON.parse(cached);
    }

    const obj = countyList.find((c) => c.nume === countyName);
    if (!obj) return;

    setLoadingCities(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/utils/localitati/${obj.auto}`,
      );
      if (res.ok) setCities(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountyChange = async (e: any) => {
    const countyName = e.target.value;
    setFormData((prev) => ({ ...prev, county: countyName, city: "" }));
    loadCitiesForCounty(countyName);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <header className="flex justify-between items-center p-6 border-b border-zinc-100">
            <h2 className="text-xl font-black tracking-tight text-zinc-900">
              {initialData ? "Editare Adresă" : "Adresă Nouă"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-zinc-50 rounded-full hover:bg-zinc-200 transition-colors text-zinc-500"
            >
              <X size={16} />
            </button>
          </header>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Tip Adresa */}
            <div className="flex gap-2">
              {["Acasă", "Birou", "Altele"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, address_type: type })
                  }
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    formData.address_type === type
                      ? "border-[var(--royal-violet)] bg-[var(--lavender-purple)]/20 text-[var(--royal-violet)]"
                      : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PremiumInput
                label="Prenume"
                value={formData.first_name}
                onChange={(e: any) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="Ex: Andrei"
              />
              <PremiumInput
                label="Nume"
                value={formData.last_name}
                onChange={(e: any) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Ex: Popescu"
              />
            </div>

            <PremiumInput
              label="Telefon"
              value={formData.phone}
              onChange={(e: any) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="07xxxxxxxx"
            />

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
              <PremiumSelect
                label="Județ"
                value={formData.county}
                onChange={handleCountyChange}
                options={counties}
                placeholder="Alege județul..."
              />
              <PremiumSelect
                label="Localitate"
                value={formData.city}
                onChange={(e: any) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                options={cities}
                disabled={!formData.county || loadingCities}
                placeholder={
                  loadingCities ? "Se încarcă..." : "Alege localitatea..."
                }
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <PremiumInput
                  label="Stradă (fără număr)"
                  value={formData.street}
                  onChange={(e: any) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Ex: Mihai Viteazul"
                />
              </div>
              <div className="col-span-1">
                <PremiumInput
                  label="Nr."
                  value={formData.house_number}
                  onChange={(e: any) =>
                    setFormData({ ...formData, house_number: e.target.value })
                  }
                  placeholder="12"
                />
              </div>
              <div className="col-span-1">
                <PremiumInput
                  label="Cod Poștal"
                  value={formData.postal_code}
                  onChange={(e: any) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  placeholder="012345"
                />
              </div>
            </div>

            {!initialData?.is_default && (
              <label className="flex items-center gap-2.5 cursor-pointer pt-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) =>
                    setFormData({ ...formData, is_default: e.target.checked })
                  }
                  className="rounded border-zinc-300 w-4 h-4 text-[var(--royal-violet)] focus:ring-[var(--royal-violet)]"
                />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                  Setează ca adresă principală
                </span>
              </label>
            )}
          </div>

          <footer className="p-6 border-t border-zinc-100 bg-zinc-50/50">
            <button
              onClick={() => onSave(formData)}
              disabled={
                !formData.first_name ||
                !formData.last_name ||
                !formData.phone ||
                !formData.county ||
                !formData.city ||
                !formData.street
              }
              className="w-full h-12 text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 transition-all hover:brightness-110 flex justify-center items-center"
              style={{ background: "var(--primary-gradient)" }}
            >
              Salvează Adresa
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
