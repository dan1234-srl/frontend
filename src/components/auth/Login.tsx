import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  ShieldCheck,
  Loader2,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onOpenForgot: () => void;
}

const Login = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onOpenForgot,
}: AuthDrawerProps) => {
  const [view, setView] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(true);
  const { signIn, verify2FA, syncWishlist } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    isMounted.current = true;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setView("login");
    } else {
      document.body.style.overflow = "unset";
      setEmail("");
      setPassword("");
      setShowPwd(false);
      setOtpCode("");
      setTempToken("");
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Câmpuri incomplete",
        description: "Completează toate câmpurile.",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      if (!isMounted.current) return;

      if (result.requires2FA) {
        setTempToken(result.tempToken || "");
        setView("2fa");
        toast({
          title: "Securitate 2FA",
          description: "Introdu codul de verificare din aplicație.",
        });
        setLoading(false);
        return;
      }

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Autentificare eșuată",
          description: "Date de acces incorecte.",
        });
        setLoading(false);
        return;
      }

      await syncWishlist();
      toast({
        title: "Succes",
        description: "Bine ați revenit!",
      });
      onClose();
    } catch (error) {
      console.error(error);
      if (isMounted.current) {
        toast({
          variant: "destructive",
          title: "Eroare rețea",
          description: "Nu s-a putut stabili conexiunea cu serverul.",
        });
        setLoading(false);
      }
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast({
        variant: "destructive",
        title: "Câmp incomplet",
        description: "Introdu codul 2FA.",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await verify2FA(otpCode, tempToken);

      if (!isMounted.current) return;

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Cod incorect",
          description: "Codul 2FA introdus este invalid.",
        });
        setLoading(false);
        return;
      }

      await syncWishlist();
      toast({
        title: "Succes",
        description: "Autentificare reușită!",
      });
      onClose();
    } catch (error) {
      console.error(error);
      if (isMounted.current) {
        toast({
          variant: "destructive",
          title: "Eroare verificare",
          description: "A apărut o problemă la procesarea codului.",
        });
        setLoading(false);
      }
    }
  };

  // Stiluri identice cu Register pentru consistență tematică
  const fieldWrap = "relative";
  const inputBase =
    "peer w-full bg-transparent pl-10 pr-4 py-3.5 text-[15px] font-light text-zinc-800 outline-none transition-all border-b-[1.5px] placeholder:text-transparent border-zinc-150 focus:border-[var(--dark-amethyst)]";
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
              <AnimatePresence mode="wait" initial={false}>
                {view === "login" ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-full flex-1 flex flex-col justify-center"
                  >
                    <header className="mb-8 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                        Membru Evem
                      </span>
                      <h2 className="heading-serif text-4xl sm:text-5xl italic text-[var(--dark-amethyst)] leading-tight">
                        Autentificare
                      </h2>
                      <div className="h-[2px] w-12 bg-[var(--french-blue)] rounded-full opacity-60" />
                      <p className="text-sm text-zinc-500 font-light pt-1">
                        Bine ai revenit. Accesează contul tău.
                      </p>
                    </header>

                    <form
                      onSubmit={handleLogin}
                      className="space-y-6"
                      noValidate
                    >
                      {/* Email */}
                      <div className={fieldWrap}>
                        <Mail size={16} className={iconBase} />
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputBase}
                        />
                        <label htmlFor="email" className={labelBase}>
                          Adresă email
                        </label>
                      </div>

                      {/* Parolă */}
                      <div className={fieldWrap}>
                        <Lock size={16} className={iconBase} />
                        <input
                          id="password"
                          type={showPwd ? "text" : "password"}
                          required
                          placeholder="Parolă"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${inputBase} pr-10`}
                        />
                        <label htmlFor="password" className={labelBase}>
                          Parolă
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPwd((s) => !s)}
                          className="absolute right-0 top-3.5 text-zinc-400 hover:text-[var(--dark-amethyst)]"
                          tabIndex={-1}
                          aria-label="Afișează parola"
                        >
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={onOpenForgot}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[var(--dark-amethyst)] transition-colors"
                        >
                          Ai uitat parola?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full h-14 sm:h-16 rounded-full text-white overflow-hidden group/btn shadow-xl transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              Acces cont <ArrowRight size={16} />
                            </>
                          )}
                        </span>
                      </button>
                    </form>

                    <div className="mt-10 text-center">
                      <p className="text-xs font-light text-zinc-400">
                        Nu ești încă membru?
                      </p>
                      <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="mt-2 border-b border-[var(--dark-amethyst)]/20 text-sm font-black italic text-[var(--dark-amethyst)] hover:border-[var(--dark-amethyst)] transition-colors"
                      >
                        Creează un profil
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="2fa-form"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-full flex-1 flex flex-col justify-center"
                  >
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--dark-amethyst)] transition-colors"
                    >
                      <ArrowLeft size={14} /> Înapoi
                    </button>
                    <div className="mb-10 space-y-5 text-center">
                      <div className="mx-auto flex size-24 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50">
                        <Fingerprint
                          size={40}
                          className="text-[var(--dark-amethyst)]"
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                          Securitate
                        </span>
                        <h2 className="heading-serif text-4xl italic text-[var(--dark-amethyst)]">
                          Verificare 2FA
                        </h2>
                        <div className="h-[2px] w-12 bg-[var(--french-blue)] rounded-full opacity-60 mx-auto" />
                        <p className="mx-auto max-w-[280px] text-sm font-light text-zinc-500">
                          Introdu codul de autentificare din aplicația ta de
                          securitate.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerify2FA} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Cod verificare
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          placeholder="000000"
                          className="w-full border-b-[1.5px] border-zinc-150 bg-transparent py-4 text-center text-3xl font-light tracking-[0.5em] text-zinc-800 outline-none transition-all focus:border-[var(--dark-amethyst)]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="relative w-full h-14 sm:h-16 rounded-full text-white overflow-hidden group/btn shadow-xl transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              Verificare <ArrowRight size={16} />
                            </>
                          )}
                        </span>
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
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

export default Login;
