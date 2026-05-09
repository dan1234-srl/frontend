import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const Register = ({ isOpen, onClose, onSwitchToLogin }: RegisterProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "unspecified",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const { signUp, syncWishlist } = useAuth(); // Am adus syncWishlist din context

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        birthday: "",
        gender: "unspecified",
        phone: "",
      });
    }
  }, [isOpen]);

  const validateAll = () => {
    const { firstName, lastName, password, confirmPassword, birthday } =
      formData;

    if (
      !/^[a-zA-ZĂÂÎȘȚăâîșț\s\-]{2,50}$/.test(firstName) ||
      !/^[a-zA-ZĂÂÎȘȚăâîșț\s\-]{2,50}$/.test(lastName)
    ) {
      toast.error("Numele trebuie să conțină doar litere.");
      return false;
    }
    if (!birthday) {
      toast.error("Data nașterii este obligatorie.");
      return false;
    }
    if (password.length < 8) {
      toast.error("Parola trebuie să aibă minim 8 caractere.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Parolele nu coincid.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);

    let finalPhone = formData.phone.replace(/[^0-9+]/g, "");
    if (finalPhone.startsWith("0"))
      finalPhone = "+40" + finalPhone.substring(1);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.birthday,
        formData.gender,
        finalPhone,
      );

      if (error) {
        toast.error(error.message);
      } else {
        // După înregistrare, sincronizăm wishlist-ul local cu baza de date
        await syncWishlist();
        toast.success("Bine ai venit în universul Evem!");
        onClose();
      }
    } catch (err) {
      toast.error("Eroare de conexiune la server.");
    } finally {
      setLoading(false);
    }
  };

  const update = (k: keyof typeof formData, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const inputClass =
    "w-full py-3 border-b-2 border-zinc-100 bg-transparent text-base outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 placeholder:text-zinc-200 font-light";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[12px]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="relative z-[701] flex h-full w-full sm:max-w-[520px] flex-col bg-white shadow-luxe"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 size-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-[var(--dark-amethyst)] hover:text-white transition-all duration-500 z-50 shadow-sm"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 overflow-y-auto no-scrollbar">
              <div className="w-full py-10">
                <header className="mb-10 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    Membru Nou
                  </span>
                  <h2 className="heading-serif text-5xl italic text-[var(--dark-amethyst)] leading-tight">
                    CREARE PROFIL
                  </h2>
                  <div className="h-1 w-12 bg-[var(--french-blue)] rounded-full opacity-60" />
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                        Prenume
                      </label>
                      <input
                        required
                        value={formData.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className={inputClass}
                        placeholder="Alexandru"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                        Nume
                      </label>
                      <input
                        required
                        value={formData.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className={inputClass}
                        placeholder="Popescu"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                      Adresă Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass}
                      placeholder="nume@casa.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className={inputClass}
                        placeholder="07xx xxx xxx"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                        Data Nașterii
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.birthday}
                        onChange={(e) => update("birthday", e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                        Parolă
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => update("password", e.target.value)}
                        className={inputClass}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)]">
                        Confirmare
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          update("confirmPassword", e.target.value)
                        }
                        className={`${inputClass} ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-200" : ""}`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-16 rounded-full text-white overflow-hidden group/btn shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          Finalizare Profil <ArrowRight size={16} />
                        </>
                      )}
                    </span>
                  </button>

                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-[var(--dark-amethyst)] transition-colors"
                    >
                      Ai deja cont? Autentifică-te
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <footer className="p-10 flex items-center justify-center border-t border-zinc-50 bg-zinc-50/30">
              <div className="flex items-center gap-3 opacity-40">
                <ShieldCheck size={14} className="text-[var(--french-blue)]" />
                <span className="text-[8px] uppercase tracking-[0.4em] font-black text-[var(--dark-amethyst)]">
                  SSL Secure Connection 256-Bit
                </span>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Register;
