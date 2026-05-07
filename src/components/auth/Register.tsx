import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const { signUp } = useAuth();

  useEffect(() => {
    if (isOpen) document.body.dataset.scrollLocked = "true";
    else {
      delete document.body.dataset.scrollLocked;
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
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [isOpen]);

  const validateAll = () => {
    const { firstName, lastName, email, password, confirmPassword, phone, birthday } =
      formData;

    const forbidden = [
      "SELECT",
      "DROP",
      "DELETE",
      "UPDATE",
      "INSERT",
      "--",
      "/*",
      "*/",
      "XP_",
      "<SCRIPT",
      "OR 1=1",
      "WAITFOR DELAY",
    ];
    const publicData = `${firstName}${lastName}${email}${phone}`.toUpperCase();
    if (forbidden.some((p) => publicData.includes(p))) {
      toast.error("Caractere nepermise în formular.");
      return false;
    }

    const nameRegex = /^[a-zA-ZĂÂÎȘȚăâîșț\s\-]{2,50}$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      toast.error("Numele trebuie să conțină doar litere (2–50 caractere).");
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!/^(?:\+?40|0)7\d{8}$/.test(cleanPhone)) {
      toast.error("Număr de telefon invalid.");
      return false;
    }
    if (!birthday) {
      toast.error("Data nașterii este obligatorie.");
      return false;
    }
    const age = Math.floor(
      (Date.now() - new Date(birthday).getTime()) / 31557600000,
    );
    if (age < 18) {
      toast.error("Trebuie să ai 18+ ani.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email invalid.");
      return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
      toast.error("Parolă slabă. Minim 8 caractere, 1 cifră, 1 simbol.");
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
    if (finalPhone.startsWith("0")) finalPhone = "+40" + finalPhone.substring(1);
    else if (finalPhone.startsWith("407") && !finalPhone.startsWith("+"))
      finalPhone = "+" + finalPhone;
    else if (finalPhone.length === 9 && finalPhone.startsWith("7"))
      finalPhone = "+40" + finalPhone;

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
        toast.error(error.message || "Acest email este deja folosit.");
      } else {
        toast.success("Cont creat. Bine ai venit!");
        onSwitchToLogin();
      }
    } catch {
      toast.error("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const update = (k: keyof typeof formData, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const inputBase =
    "h-11 w-full border-b border-border bg-transparent text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[480px] flex-col bg-card shadow-luxe overflow-hidden"
          >
            <header className="flex items-end justify-between px-6 sm:px-10 pt-10 pb-6 border-b border-border">
              <div className="space-y-1.5">
                <p className="label-luxury">Linea Club</p>
                <h2 className="heading-serif text-3xl">Cont nou</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="group h-10 w-10 grid place-items-center border border-border hover:bg-foreground hover:text-background transition-colors"
              >
                <X
                  size={16}
                  strokeWidth={1.4}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto luxury-scrollbar px-6 sm:px-10 py-8">
              <button
                onClick={onSwitchToLogin}
                className="mb-6 flex items-center gap-2 label-micro text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={12} /> Înapoi la autentificare
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-luxury block">Prenume</label>
                    <input
                      required
                      value={formData.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder="Alexandru"
                      className={inputBase}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-luxury block">Nume</label>
                    <input
                      required
                      value={formData.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      placeholder="Popescu"
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-luxury block">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="nume@exemplu.com"
                    className={inputBase}
                  />
                </div>

                <div className="space-y-2">
                  <label className="label-luxury block">Telefon</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="07xx xxx xxx"
                    className={inputBase}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-luxury block">Data nașterii</label>
                    <input
                      type="date"
                      required
                      value={formData.birthday}
                      onChange={(e) => update("birthday", e.target.value)}
                      className={`${inputBase} cursor-pointer`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-luxury block">Gen</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => update("gender", e.target.value)}
                      className={`${inputBase} appearance-none cursor-pointer`}
                    >
                      <option value="unspecified">Selectează</option>
                      <option value="female">Feminin</option>
                      <option value="male">Masculin</option>
                      <option value="other">Altul</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-luxury block">Parolă</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => update("password", e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-luxury block">Confirmare</label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      className={`${inputBase} ${
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 h-14 w-full bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-primary-hover transition-colors disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Creează cont"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Register;
