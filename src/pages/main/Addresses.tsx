import { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressModal } from "@/components/account/AddressModal";
import { Plus, MapPin, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { readCache, swrFetch, invalidateCache } from "@/lib/swr-cache";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";
const MAX_ADDRESSES = 5;
const ADDR_KEY = "addresses:me";
const ADDR_TTL_MS = 60_000;

const Addresses = () => {
  const [addresses, setAddresses] = useState<any[]>(() => {
    const { data } = readCache<any[]>(ADDR_KEY, ADDR_TTL_MS);
    return Array.isArray(data) ? data : [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    const { data } = readCache<any[]>(ADDR_KEY, ADDR_TTL_MS);
    return !Array.isArray(data);
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const navigate = useNavigate();

  const fetchAddresses = async (forceRefresh = false) => {
    const { data: cached, fresh } = readCache<any[]>(ADDR_KEY, ADDR_TTL_MS);
    if (!forceRefresh && Array.isArray(cached)) {
      setAddresses(cached);
      setIsLoading(false);
      if (fresh) return;
    } else if (!Array.isArray(cached)) {
      setIsLoading(true);
    }

    if (forceRefresh) invalidateCache(ADDR_KEY);

    try {
      const data = await swrFetch<any[]>(ADDR_KEY, async () => {
        const response = await fetch(`${API_BASE_URL}/api/v1/addresses/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      });
      setAddresses(Array.isArray(data) ? data : []);
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
        fetchAddresses(true);
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
        setAddresses((prev) => {
          const next = prev.filter((a) => a.id !== id);
          invalidateCache(ADDR_KEY);
          return next;
        });
        toast.success("Adresă eliminată.");
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
        setAddresses((prev) => {
          const next = prev.map((a) => ({ ...a, is_default: a.id === id }));
          invalidateCache(ADDR_KEY);
          return next;
        });
        toast.success("Adresă principală setată.");
      }
    } catch {
      toast.error("Eroare la actualizarea priorității.");
    }
  };


  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--deep-twilight)] font-sans flex flex-col transition-colors duration-700">
      <Header />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24 text-left">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div className="space-y-4 text-left">
              <span
                className="inline-block px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-sm"
                style={{
                  backgroundColor: "var(--light-cyan)",
                  color: "var(--french-blue)",
                }}
              >
                Gestiune Livrare
              </span>
              <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter italic text-[var(--deep-twilight)]">
                Adresele <em>mele</em>
              </h1>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed font-medium">
                Gestionează locațiile de livrare pentru o experiență de checkout
                rapidă și fără efort.
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
              className="h-16 px-10 text-white flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all disabled:opacity-20"
              style={{
                background:
                  addresses.length >= MAX_ADDRESSES
                    ? "#d4d4d8"
                    : "var(--primary-gradient)",
              }}
            >
              <Plus size={16} strokeWidth={3} />
              Adăugare Adresă
            </motion.button>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-10 border border-zinc-100 rounded-[2.5rem] space-y-6 bg-white shadow-sm"
                >
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <div className="flex gap-4 pt-4">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center rounded-[3rem] border border-dashed border-zinc-200 bg-white/50 shadow-inner"
            >
              <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-zinc-100">
                <MapPin
                  size={24}
                  style={{ color: "var(--french-blue)" }}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="heading-serif text-2xl mb-2 italic text-[var(--deep-twilight)]">
                Nicio adresă salvată
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold mb-8">
                Începe prin a adăuga prima ta locație de livrare.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest underline underline-offset-8 transition-colors"
                style={{ color: "var(--french-blue)" }}
              >
                Configurează acum
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              <AnimatePresence mode="popLayout">
                {addresses.map((addr, index) => (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
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
            </div>
          )}

          <div className="mt-24 p-12 bg-white rounded-[3rem] border border-zinc-100 flex flex-col md:flex-row items-center gap-8 justify-between shadow-sm">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <ShieldCheck
                  size={16}
                  style={{ color: "var(--french-blue)" }}
                />
                <p
                  className="text-[10px] font-black uppercase tracking-[0.3em]"
                  style={{ color: "var(--french-blue)" }}
                >
                  Securitate Date
                </p>
              </div>
              <p className="text-sm text-zinc-500 font-medium max-w-sm leading-relaxed">
                Adresele tale sunt criptate și utilizate exclusiv pentru
                procesarea livrărilor Evem. Nu partajăm datele tale cu terți.
              </p>
            </div>
            <div className="flex gap-8 items-center opacity-10 grayscale pointer-events-none">
              <div className="h-6 w-px bg-zinc-200" />
              <div className="flex gap-4">
                <div className="size-8 rounded-full border border-zinc-200" />
                <div className="size-8 rounded-full border border-zinc-200" />
              </div>
            </div>
          </div>
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
