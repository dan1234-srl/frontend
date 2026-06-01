import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

type Gender = "male" | "female" | "other" | "unspecified";

const NAME_REGEX = /^[a-zA-ZĂÂÎȘȚăâîșț\s\-]+$/;
const PHONE_REGEX = /^(07|\+407|407)[0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  birthday: "",
  gender: "unspecified" as Gender,
  phone: "",
};

const Register = ({ isOpen, onClose, onSwitchToLogin }: RegisterProps) => {
  const [formData, setFormData] = useState(initialState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { signUp } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setFormData(initialState);
      setTouched({});
      setShowPwd(false);
      setShowConfirm(false);
      setAcceptTerms(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Validări per câmp
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const { firstName, lastName, email, password, confirmPassword, birthday, phone } = formData;

    if (firstName && (firstName.length < 3 || firstName.length > 50 || !NAME_REGEX.test(firstName)))
      e.firstName = "Doar litere, între 3 și 50 caractere.";
    if (lastName && (lastName.length < 3 || lastName.length > 50 || !NAME_REGEX.test(lastName)))
      e.lastName = "Doar litere, între 3 și 50 caractere.";
    if (email && !EMAIL_REGEX.test(email)) e.email = "Adresă de email invalidă.";
    if (password && (password.length < 8 || password.length > 20))
      e.password = "Parola trebuie să aibă între 8 și 20 caractere.";
    if (confirmPassword && confirmPassword !== password)
      e.confirmPassword = "Parolele nu coincid.";
    if (birthday) {
      const d = new Date(birthday);
      const now = new Date();
      const age = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (isNaN(d.getTime())) e.birthday = "Dată invalidă.";
      else if (age < 16) e.birthday = "Trebuie să ai cel puțin 16 ani.";
      else if (age > 120) e.birthday = "Dată invalidă.";
    }
    if (phone) {
      const normalized = phone.replace(/\s+/g, "");
      if (!PHONE_REGEX.test(normalized))
        e.phone = "Format invalid. Ex: 07xxxxxxxx sau +407xxxxxxxx.";
    }
    return e;
  }, [formData]);

  // Indicator forță parolă
  const pwdStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  }, [formData.password]);

  const strengthLabel = ["Foarte slabă", "Slabă", "Acceptabilă", "Bună", "Excelentă"][pwdStrength];
  const strengthColor = [
    "bg-zinc-200",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-500",
  ][pwdStrength];

  const isValid =
    formData.firstName.length >= 3 &&
    formData.lastName.length >= 3 &&
    EMAIL_REGEX.test(formData.email) &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    !!formData.birthday &&
    PHONE_REGEX.test(formData.phone.replace(/\s+/g, "")) &&
    Object.keys(errors).length === 0 &&
    acceptTerms;

  const update = (k: keyof typeof formData, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true, lastName: true, email: true, password: true,
      confirmPassword: true, birthday: true, phone: true,
    });

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Verifică datele",
        description: "Te rugăm să corectezi câmpurile evidențiate.",
      });
      return;
    }

    setLoading(true);
    let finalPhone = formData.phone.replace(/\s+/g, "");
    if (finalPhone.startsWith("07")) finalPhone = "+40" + finalPhone.substring(1);
    else if (finalPhone.startsWith("407")) finalPhone = "+" + finalPhone;

    try {
      const { error } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.birthday,
        formData.gender,
        finalPhone,
      );
      if (error) {
        toast({
          variant: "destructive",
          title: "Înregistrare eșuată",
          description: error.message || "A apărut o eroare. Încearcă din nou.",
        });
      } else {
        toast({
          title: "Bine ai venit!",
          description: "Contul tău a fost creat cu succes.",
        });
        onClose();
        setTimeout(() => onSwitchToLogin(), 200);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Eroare de conexiune",
        description: "Nu s-a putut contacta serverul. Te rugăm să reîncerci.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldWrap = "relative";
  const inputBase =
    "peer w-full bg-transparent pl-10 pr-4 py-3.5 text-[15px] font-light text-zinc-800 outline-none transition-all border-b-[1.5px] placeholder:text-transparent";
  const inputState = (key: string) => {
    const hasError = touched[key] && errors[key];
    if (hasError) return "border-red-300 focus:border-red-500";
    if (touched[key] && formData[key as keyof typeof formData])
      return "border-emerald-300/70 focus:border-[var(--dark-amethyst)]";
    return "border-zinc-150 focus:border-[var(--dark-amethyst)]";
  };
  const labelBase =
    "absolute left-10 top-3.5 text-[13px] font-light text-zinc-400 transition-all duration-200 pointer-events-none peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-[var(--dark-amethyst)] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-zinc-500";
  const iconBase =
    "absolute left-0 top-3.5 text-zinc-300 peer-focus:text-[var(--dark-amethyst)] transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-[10px]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 240 }}
            className="relative z-[701] flex h-full w-full sm:max-w-[540px] flex-col bg-white shadow-[0_10px_60px_rgba(0,0,0,0.08)]"
          >
            <button
              onClick={onClose}
              aria-label="Închide"
              className="absolute top-6 right-6 sm:top-8 sm:right-8 size-11 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-[var(--dark-amethyst)] hover:text-white transition-all duration-500 z-50"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex flex-col px-6 sm:px-14 py-10 sm:py-14 overflow-y-auto no-scrollbar">
              <header className="mb-8 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                  Membru nou
                </span>
                <h2 className="heading-serif text-4xl sm:text-5xl italic text-[var(--dark-amethyst)] leading-tight">
                  Creare profil
                </h2>
                <div className="h-[2px] w-12 bg-[var(--french-blue)] rounded-full opacity-60" />
                <p className="text-sm text-zinc-500 font-light pt-1">
                  Completează formularul pentru a-ți crea contul.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Prenume + Nume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className={fieldWrap}>
                    <User size={16} className={iconBase} />
                    <input
                      id="firstName"
                      required
                      placeholder="Prenume"
                      value={formData.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      onBlur={() => blur("firstName")}
                      className={`${inputBase} ${inputState("firstName")}`}
                    />
                    <label htmlFor="firstName" className={labelBase}>Prenume</label>
                    {touched.firstName && errors.firstName && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                        <AlertCircle size={11} /> {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className={fieldWrap}>
                    <User size={16} className={iconBase} />
                    <input
                      id="lastName"
                      required
                      placeholder="Nume"
                      value={formData.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      onBlur={() => blur("lastName")}
                      className={`${inputBase} ${inputState("lastName")}`}
                    />
                    <label htmlFor="lastName" className={labelBase}>Nume</label>
                    {touched.lastName && errors.lastName && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                        <AlertCircle size={11} /> {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className={fieldWrap}>
                  <Mail size={16} className={iconBase} />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => blur("email")}
                    className={`${inputBase} ${inputState("email")}`}
                  />
                  <label htmlFor="email" className={labelBase}>Adresă email</label>
                  {touched.email && errors.email && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                      <AlertCircle size={11} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Telefon + Data nașterii */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className={fieldWrap}>
                    <Phone size={16} className={iconBase} />
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="Telefon"
                      value={formData.phone}
                      onChange={(e) =>
                        update("phone", e.target.value.replace(/[^\d+]/g, ""))
                      }
                      onBlur={() => blur("phone")}
                      className={`${inputBase} ${inputState("phone")}`}
                    />
                    <label htmlFor="phone" className={labelBase}>Telefon</label>
                    {touched.phone && errors.phone && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                        <AlertCircle size={11} /> {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className={fieldWrap}>
                    <CalendarIcon size={16} className={iconBase} />
                    <input
                      id="birthday"
                      type="date"
                      required
                      placeholder="Data nașterii"
                      value={formData.birthday}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => update("birthday", e.target.value)}
                      onBlur={() => blur("birthday")}
                      className={`${inputBase} ${inputState("birthday")} cursor-pointer ${!formData.birthday ? "text-transparent" : ""}`}
                    />
                    <label htmlFor="birthday" className={labelBase}>Data nașterii</label>
                    {touched.birthday && errors.birthday && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                        <AlertCircle size={11} /> {errors.birthday}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gen */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Gen
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { v: "female", l: "Feminin" },
                      { v: "male", l: "Masculin" },
                      { v: "other", l: "Altul" },
                      { v: "unspecified", l: "Neprecizat" },
                    ] as { v: Gender; l: string }[]).map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => update("gender", opt.v)}
                        className={`py-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border transition-all ${
                          formData.gender === opt.v
                            ? "bg-[var(--dark-amethyst)] text-white border-transparent shadow-md"
                            : "bg-white text-zinc-500 border-zinc-150 hover:border-[var(--dark-amethyst)]/40"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parolă */}
                <div className={fieldWrap}>
                  <Lock size={16} className={iconBase} />
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder="Parolă"
                    value={formData.password}
                    onChange={(e) => update("password", e.target.value)}
                    onBlur={() => blur("password")}
                    className={`${inputBase} ${inputState("password")} pr-10`}
                  />
                  <label htmlFor="password" className={labelBase}>Parolă</label>
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-0 top-3.5 text-zinc-400 hover:text-[var(--dark-amethyst)]"
                    tabIndex={-1}
                    aria-label="Afișează parola"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i < pwdStrength ? strengthColor : "bg-zinc-100"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                  {touched.password && errors.password && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                      <AlertCircle size={11} /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmare */}
                <div className={fieldWrap}>
                  <Lock size={16} className={iconBase} />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Confirmare parolă"
                    value={formData.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    onBlur={() => blur("confirmPassword")}
                    className={`${inputBase} ${inputState("confirmPassword")} pr-10`}
                  />
                  <label htmlFor="confirmPassword" className={labelBase}>
                    Confirmare parolă
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-0 top-3.5 text-zinc-400 hover:text-[var(--dark-amethyst)]"
                    tabIndex={-1}
                    aria-label="Afișează parola"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                      <AlertCircle size={11} /> {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword &&
                    !errors.confirmPassword &&
                    formData.confirmPassword === formData.password && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600">
                        <Check size={11} /> Parolele coincid
                      </p>
                    )}
                </div>

                {/* Termeni */}
                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span
                    className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded border transition-all ${
                      acceptTerms
                        ? "bg-[var(--dark-amethyst)] border-[var(--dark-amethyst)]"
                        : "border-zinc-300"
                    }`}
                  >
                    {acceptTerms && <Check size={12} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[12px] font-light text-zinc-500 leading-relaxed">
                    Sunt de acord cu{" "}
                    <a href="/terms" target="_blank" className="underline text-[var(--dark-amethyst)]">
                      Termenii și condițiile
                    </a>{" "}
                    și{" "}
                    <a href="/privacy" target="_blank" className="underline text-[var(--dark-amethyst)]">
                      Politica de confidențialitate
                    </a>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="relative w-full h-14 sm:h-16 rounded-full text-white overflow-hidden group/btn shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Creează cont <ArrowRight size={16} />
                      </>
                    )}
                  </span>
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs font-medium text-zinc-400">
                    Ai deja un cont?
                  </p>
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="mt-2 border-b border-[var(--dark-amethyst)]/20 text-sm font-black italic text-[var(--dark-amethyst)] hover:border-[var(--dark-amethyst)]"
                  >
                    Autentificare
                  </button>
                </div>
              </form>
            </div>

            <footer className="p-6 flex items-center justify-center border-t border-zinc-50 bg-zinc-50/30">
              <div className="flex items-center gap-3 opacity-50">
                <ShieldCheck size={14} className="text-[var(--french-blue)]" />
                <span className="text-[8px] uppercase tracking-[0.4em] font-black text-[var(--dark-amethyst)]">
                  Conexiune securizată SSL
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
