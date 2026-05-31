import { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressModal } from "@/components/account/AddressModal";
import {
  Plus,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";
const MAX_ADDRESSES = 5;

// --- VARIANTE DE ANIMAȚIE ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const Addresses = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/addresses/?_t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAddresses(Array.isArray(data) ? data : data.items || []);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (data: any) => {
    const isEditing = !!editingAddress;

    let cleanPhone = data.phone.trim().replace(/\s+/g, "");
    if (cleanPhone.startsWith("07")) {
      cleanPhone = "+40" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("7")) {
      cleanPhone = "+40" + cleanPhone;
    }

    if (!cleanPhone.match(/^\+407[0-9]{8}$/)) {
      return toast.error("Format telefon invalid. Folosiți 07xxxxxxxx.");
    }

    const payload = { ...data, phone: cleanPhone };
    const url = isEditing
      ? `${API_BASE_URL}/api/v1/addresses/${editingAddress.id}`
      : `${API_BASE_URL}/api/v1/addresses/`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          isEditing ? "Adresa a fost actualizată" : "Adresa a fost adăugată",
        );
        fetchAddresses();
        setIsModalOpen(false);
      } else {
        toast.error(result.detail || "Eroare la validarea datelor.");
      }
    } catch {
      toast.error("Eroare de comunicare cu serverul.");
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Adresă eliminată din cont.");
      }
    } catch {
      toast.error("Ștergerea a eșuat.");
    }
  };

  const setDefault = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/addresses/${id}/set-default`,
        { method: "PATCH", credentials: "include" },
      );
      if (response.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, is_default: a.id === id })),
        );
        toast.success("Adresă principală actualizată.");
      }
    } catch {
      toast.error("Eroare la actualizarea priorității.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[var(--dark-amethyst)] font-sans flex flex-col relative overflow-hidden">
      {/* Decorative Ambient Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--royal-violet)] opacity-[0.03] rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-[var(--mauve-magic)] opacity-[0.02] rounded-full blur-[100px] -ml-40 pointer-events-none" />

      <Header />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-8 md:px-12 lg:px-24 text-left relative z-10">
        <div className="max-w-[1400px] mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/account/profile")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-all mb-10 group bg-white/50 backdrop-blur-sm border border-zinc-200/50 px-4 py-2.5 rounded-full w-max shadow-sm"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Înapoi la Profil
          </button>

          {/* Header Section */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 relative">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-[2px]"
                  style={{ background: "var(--primary-gradient)" }}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                  Gestiune Livrare
                </span>
              </div>
              <h1 className="heading-serif text-4xl sm:text-5xl md:text-6xl tracking-tighter italic text-[var(--dark-amethyst)] leading-[1.1]">
                Adresele <em>mele</em>
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                Gestionează locațiile tale de livrare pentru o experiență de
                checkout rapidă, securizată și fără efort.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (addresses.length >= MAX_ADDRESSES) {
                  toast.info(
                    `Limita de ${MAX_ADDRESSES} adrese a fost atinsă.`,
                  );
                  return;
                }
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              disabled={addresses.length >= MAX_ADDRESSES}
              className="h-14 sm:h-16 px-8 sm:px-10 text-white flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl sm:rounded-[1.25rem] shadow-xl shadow-[var(--royal-violet)]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none w-full lg:w-auto shrink-0"
              style={{
                background:
                  addresses.length >= MAX_ADDRESSES
                    ? "#a1a1aa"
                    : "var(--primary-gradient)",
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Adăugare Adresă
            </motion.button>
          </header>

          {/* Main Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-8 border border-zinc-100 rounded-[2rem] space-y-6 bg-white/60 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <div className="flex gap-3 pt-4 border-t border-zinc-100">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="py-24 sm:py-32 px-6 text-center rounded-[2.5rem] border border-zinc-200/60 bg-white/40 backdrop-blur-sm shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/50 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="size-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-200/50 border border-zinc-100 relative group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--royal-violet)]/20 animate-[spin_20s_linear_infinite]" />
                  <MapPin
                    size={28}
                    className="text-[var(--royal-violet)]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="heading-serif text-3xl mb-3 italic text-[var(--dark-amethyst)]">
                  Nicio adresă salvată
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
                  Adaugă o locație pentru a accelera procesul de comandă. Poți
                  salva până la {MAX_ADDRESSES} adrese diferite.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--royal-violet)] bg-[var(--royal-violet)]/5 px-6 py-3 rounded-xl hover:bg-[var(--royal-violet)] hover:text-white transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={14} /> Configurează Acum
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {addresses.map((addr) => (
                  <motion.div
                    variants={itemVariants}
                    key={addr.id}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                    layout
                  >
                    <AddressCard
                      address={addr}
                      onDelete={() => deleteAddress(addr.id)}
                      onSetDefault={() => setDefault(addr.id)}
                      onEdit={() => {
                        setEditingAddress(addr);
                        setIsModalOpen(true);
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Premium Security Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 relative overflow-hidden bg-zinc-950 text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center gap-8 justify-between border border-zinc-800"
          >
            {/* Inner Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[150%] bg-[var(--royal-violet)] opacity-20 blur-[120px] pointer-events-none" />

            <div className="relative z-10 space-y-3 text-center lg:text-left max-w-xl">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <ShieldCheck size={18} className="text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                  Securitate Enterprise
                </p>
              </div>
              <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                Toate adresele tale sunt stocate utilizând protocoale de
                criptare avansate. EVEM nu partajează aceste date cu terți,
                fiind utilizate exclusiv pentru generarea AWB-urilor și livrare.
              </p>
            </div>

            <div className="relative z-10 flex gap-6 items-center opacity-40 grayscale pointer-events-none">
              <div className="hidden lg:block h-12 w-px bg-zinc-700" />
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Lock size={24} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    AES-256
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Sparkles size={24} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Privacy
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AddressModal
        isOpen={isModalOpen}
        initialData={editingAddress}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <Footer />
    </div>
  );
};

export default Addresses;
