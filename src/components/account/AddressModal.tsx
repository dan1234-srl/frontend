import { Home, Briefcase, Gift, Heart, User, Users, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADDRESS_TYPES = [
  { id: "Acasă", icon: Home },
  { id: "Birou", icon: Briefcase },
  { id: "Familie", icon: Users },
  { id: "Prieteni", icon: Heart },
  { id: "Cadou", icon: Gift },
  { id: "Altul", icon: User },
];

export const AddressModal = ({ isOpen, onClose, onSave, initialData }: any) => {
  const [selectedType, setSelectedType] = useState("Acasă");

  useEffect(() => {
    if (initialData?.address_type) setSelectedType(initialData.address_type);
    else setSelectedType("Acasă");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-10 md:p-14">
          <header className="flex justify-between items-start mb-12">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">
                Configurare Livrare
              </span>
              <h2 className="heading-serif text-4xl italic">
                {initialData ? "Actualizare" : "Adresă"} <em>nouă</em>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="size-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
            >
              <X size={20} />
            </button>
          </header>

          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData);
              onSave({ ...data, address_type: selectedType });
            }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block text-left">
                Etichetă Adresă
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {ADDRESS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSel = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group ${
                        isSel
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                          : "border-zinc-50 bg-zinc-50 hover:border-zinc-200 text-zinc-400"
                      }`}
                    >
                      <Icon size={16} strokeWidth={isSel ? 2 : 1.5} />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {type.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <LuxuryField
                name="first_name"
                label="Prenume"
                defaultValue={initialData?.first_name}
                placeholder="ex. Alexandra"
              />
              <LuxuryField
                name="last_name"
                label="Nume"
                defaultValue={initialData?.last_name}
                placeholder="ex. Popescu"
              />
              <LuxuryField
                name="phone"
                label="Telefon Contact"
                defaultValue={initialData?.phone}
                className="md:col-span-2"
                placeholder="07xx xxx xxx"
              />
              <LuxuryField
                name="street"
                label="Adresă Completă"
                defaultValue={initialData?.street}
                className="md:col-span-2"
                placeholder="Strada, Număr, Bloc, Apartament"
              />
              <LuxuryField
                name="city"
                label="Oraș"
                defaultValue={initialData?.city}
                placeholder="ex. București"
              />
              <LuxuryField
                name="county"
                label="Județ"
                defaultValue={initialData?.county}
                placeholder="ex. Sector 1"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-[2] h-16 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black shadow-xl transition-all"
              >
                Salvează Adresa
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-16 bg-zinc-50 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-100 transition-all"
              >
                Anulează
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const LuxuryField = ({
  name,
  label,
  defaultValue,
  className = "",
  placeholder,
}: any) => (
  <div className={`space-y-3 text-left ${className}`}>
    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">
      {label}
    </label>
    <input
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required
      className="w-full h-14 bg-zinc-50 border-transparent border-b-zinc-200 border-2 rounded-2xl focus:border-brand focus:bg-white outline-none px-5 text-sm font-medium text-zinc-900 transition-all placeholder:text-zinc-300"
    />
  </div>
);
