import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  ShieldCheck,
  Loader2,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  const [otpCode, setOtpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(true);
  const { signIn, verify2FA, syncWishlist } = useAuth();

  useEffect(() => {
    isMounted.current = true;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setView("login");
    } else {
      document.body.style.overflow = "unset";
      setEmail("");
      setPassword("");
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
      toast.error("Completează toate câmpurile.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      if (!isMounted.current) return;

      if (result.requires2FA) {
        setTempToken(result.tempToken || "");
        setView("2fa");
        toast.success("Introdu codul de verificare.");
        setLoading(false);
        return;
      }

      if (result.error) {
        toast.error("Date de acces incorecte.");
        setLoading(false);
        return;
      }

      await syncWishlist();
      toast.success("Bine ați revenit!");
      onClose();
    } catch (error) {
      console.error(error);
      if (isMounted.current) toast.error("Eroare de conexiune.");
      if (isMounted.current) setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error("Introdu codul 2FA.");
      return;
    }

    setLoading(true);

    try {
      const result = await verify2FA(otpCode, tempToken);

      if (!isMounted.current) return;

      if (result?.error) {
        toast.error("Cod invalid.");
        setLoading(false);
        return;
      }

      await syncWishlist();
      toast.success("Autentificare reușită!");
      onClose();
    } catch (error) {
      console.error(error);
      if (isMounted.current) {
        toast.error("Eroare de verificare.");
        setLoading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
          {/* Overlay fundal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-[8px]"
          />

          {/* Corpul Sertarului (Drawer Container) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 250 }}
            className="relative z-[701] flex h-full w-full sm:max-w-[480px] flex-col overflow-hidden bg-white shadow-[0_10px_60px_rgba(0,0,0,0.08)]"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 z-50 flex size-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-700 transition-all duration-500 hover:bg-[var(--dark-amethyst)] hover:text-white"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="flex flex-1 flex-col justify-center px-8 sm:px-16">
              {/* Schimbare instanță internă cu izolare completă la layout shift */}
              <AnimatePresence mode="wait" initial={false}>
                {view === "login" ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <header className="mb-12 space-y-4 text-left">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                        Membru Linea
                      </span>
                      <h2 className="heading-serif text-5xl italic leading-tight text-[var(--dark-amethyst)]">
                        Autentificare
                      </h2>
                      <div className="h-1 w-12 rounded-full bg-[var(--french-blue)] opacity-60" />
                    </header>

                    <form
                      onSubmit={handleLogin}
                      className="space-y-8 text-left"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nume@casa.com"
                          className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-lg font-light outline-none transition-all focus:border-[var(--dark-amethyst)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Parolă
                          </label>
                          <button
                            type="button"
                            onClick={onOpenForgot}
                            className="text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-[var(--dark-amethyst)]"
                          >
                            Ai uitat?
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-lg font-light outline-none transition-all focus:border-[var(--dark-amethyst)]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group/btn relative h-16 w-full overflow-hidden rounded-full text-white shadow-2xl transition-all disabled:opacity-70"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        <div className="absolute inset-0 translate-y-full bg-black/10 transition-transform duration-500 group-hover/btn:translate-y-0" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                          {loading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <>
                              Acces Cont <ArrowRight size={16} />
                            </>
                          )}
                        </span>
                      </button>
                    </form>

                    <div className="mt-12 text-center">
                      <p className="text-xs font-medium text-zinc-400">
                        Nu sunteți membru?
                      </p>
                      <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="mt-2 border-b border-[var(--dark-amethyst)]/20 text-sm font-black italic text-[var(--dark-amethyst)] hover:border-[var(--dark-amethyst)]"
                      >
                        Creați un profil
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
                    className="w-full"
                  >
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--dark-amethyst)]"
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
                        <h2 className="heading-serif text-4xl italic text-[var(--dark-amethyst)]">
                          Verificare 2FA
                        </h2>
                        <p className="mx-auto max-w-[280px] text-sm font-medium text-zinc-400">
                          Introdu codul de autentificare din aplicația ta de
                          securitate.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleVerify2FA}
                      className="space-y-8 text-left"
                    >
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
                          placeholder="123456"
                          className="w-full border-b-2 border-zinc-100 bg-transparent py-4 text-center text-3xl tracking-[0.5em] outline-none focus:border-[var(--dark-amethyst)]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="group/btn relative h-16 w-full overflow-hidden rounded-full text-white shadow-2xl transition-all disabled:opacity-70"
                        style={{ background: "var(--primary-gradient)" }}
                      >
                        <div className="absolute inset-0 translate-y-full bg-black/10 transition-transform duration-500 group-hover/btn:translate-y-0" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                          {loading ? (
                            <Loader2 className="animate-spin" />
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

            <footer className="flex justify-center border-t border-zinc-50 bg-zinc-50/30 p-10">
              <div className="flex items-center gap-3 opacity-40">
                <ShieldCheck size={14} className="text-[var(--french-blue)]" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--dark-amethyst)]">
                  Securitate SSL
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
