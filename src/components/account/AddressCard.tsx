import {
  Home,
  Briefcase,
  Gift,
  Heart,
  User,
  Users,
  Edit3,
  Trash2,
  Phone,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { useConfirm } from "@/components/ui/confirm-dialog";

const getAddressIcon = (type: string) => {
  switch (type) {
    case "Acasă":
      return Home;
    case "Birou":
      return Briefcase;
    case "Familie":
      return Users;
    case "Prieteni":
      return Heart;
    case "Cadou":
      return Gift;
    default:
      return User;
  }
};

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: any) => {
  const Icon = getAddressIcon(address.address_type);
  const isDefault = address.is_default;
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Ștergi această adresă?",
      description: `Această acțiune este ireversibilă. Adresa din "${address.city}" va fi eliminată.`,
      confirmLabel: "Șterge",
      cancelLabel: "Anulează",
      tone: "destructive",
    });
    if (ok) onDelete();
  };

  return (
    <motion.div
      layout
      className={`relative p-8 rounded-[2.5rem] transition-all duration-500 group overflow-hidden ${
        isDefault
          ? "text-white shadow-[0_12px_40px_rgba(123,44,191,0.25)]"
          : "bg-white text-[var(--dark-amethyst)] border border-zinc-100 hover:shadow-lg"
      }`}
      style={
        isDefault
          ? {
              background:
                "var(--primary-gradient, linear-gradient(135deg, #7B2CBF, #9D4EDD))",
            }
          : undefined
      }
    >
      {/* Iconiță de fundal uriașă pentru efect luxury */}
      <div
        className={`absolute -right-4 -top-4 opacity-[0.08] group-hover:scale-110 transition-transform duration-700 ${
          isDefault ? "text-white" : "text-[var(--dark-amethyst)]"
        }`}
      >
        <Icon size={140} strokeWidth={1} />
      </div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex items-center gap-4 text-left">
          <div
            className={`size-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
              isDefault
                ? "bg-white/10 text-white border border-white/20 backdrop-blur-md"
                : "bg-zinc-50 border border-zinc-100 text-[var(--royal-violet)] group-hover:bg-zinc-100/80"
            }`}
          >
            <Icon size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                isDefault
                  ? "text-white/90 drop-shadow-sm"
                  : "text-[var(--royal-violet)]"
              }`}
            >
              {address.address_type}
            </p>
          </div>
        </div>

        {isDefault && (
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
            <CheckCircle2 size={12} className="text-white" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white drop-shadow-sm">
              Principală
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-10 relative z-10 text-left">
        <div>
          <h3 className="heading-serif text-2xl italic drop-shadow-sm">
            {address.first_name} {address.last_name}
          </h3>
          <p
            className={`text-sm mt-2 font-medium leading-relaxed ${
              isDefault ? "text-white/90 drop-shadow-sm" : "text-zinc-500"
            }`}
          >
            {address.street}
          </p>
          <div className="flex items-center gap-2 mt-2 opacity-80">
            <MapPin
              size={14}
              className={isDefault ? "text-white" : "text-zinc-400"}
            />
            <p className="text-[11px] font-bold uppercase tracking-widest drop-shadow-sm">
              {address.city}, {address.county}
            </p>
          </div>
        </div>

        {address.phone && (
          <div
            className={`flex items-center gap-3 py-2 px-4 rounded-xl w-fit border transition-colors ${
              isDefault
                ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
                : "bg-zinc-50 border-zinc-100 text-zinc-500 group-hover:bg-zinc-100/50"
            }`}
          >
            <Phone size={10} />
            <span className="text-[10px] font-black tracking-widest">
              {address.phone}
            </span>
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between pt-6 border-t relative z-10 ${
          isDefault ? "border-white/20" : "border-zinc-100"
        }`}
      >
        <div className="flex gap-6">
          <button
            onClick={onEdit}
            className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors ${
              isDefault
                ? "text-white/70 hover:text-white"
                : "text-zinc-400 hover:text-[var(--dark-amethyst)]"
            }`}
          >
            <Edit3 size={12} /> Editează
          </button>

          {!isDefault && (
            <button
              onClick={onSetDefault}
              className="text-[9px] font-black uppercase tracking-[0.2em] transition-colors text-[var(--royal-violet)] hover:text-[var(--dark-amethyst)]"
            >
              Setează principală
            </button>
          )}
        </div>

        <button
          onClick={handleDelete}
          className={`size-10 rounded-xl flex items-center justify-center transition-all ${
            isDefault
              ? "bg-white/10 hover:bg-red-500/80 text-white backdrop-blur-sm"
              : "bg-zinc-50 hover:bg-red-50 text-zinc-400 hover:text-red-500 border border-zinc-100"
          }`}
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>
      {ConfirmDialog}
    </motion.div>
  );
};
