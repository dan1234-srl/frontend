import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  Chrome,
  Facebook,
  Apple,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Fingerprint,
  Mail,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Login = ({ isOpen, onClose, onSwitchToRegister }: AuthDrawerProps) => {
  const [view, setView] = useState<"login" | "forgot" | "forgot-sent" | "2fa">(
    "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Extragem syncWishlist din AuthContext pentru a muta datele Guest -> Account
  const { signIn, verify2FA, syncWishlist } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.dataset.scrollLocked = "true";
      setView("login");
    } else {
      delete document.body.dataset.scrollLocked;
      setEmail("");
      setPassword("");
      setOtpCode("");
    }
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);

    if (result.requires2FA) {
      setTempToken(result.tempToken || "");
      setView("2fa");
      toast.info("Verificare suplimentară necesară");
    } else if (result.error) {
      toast.error("Date de acces incorecte");
    } else {
      // SUCCESS: Sincronizăm wishlist-ul înainte de închidere
      await syncWishlist();
      toast.success("Bine ai revenit");
      onClose();
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    setLoading(true);
    const { error } = await verify2FA(otpCode, tempToken);
    if (!error) {
      // SUCCESS: Sincronizăm wishlist-ul și aici (pentru cei cu 2FA activ)
      await syncWishlist();
      toast.success("Identitate confirmată");
      onClose();
    } else {
      toast.error("Cod invalid");
      setOtpCode("");
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      if (res.ok || res.status === 404 || res.status === 400) {
        setView("forgot-sent");
      } else {
        toast.error("Nu am putut trimite emailul. Încearcă din nou.");
      }
    } catch {
      toast.error("Eroare de conexiune. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

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
            transition={{
              type: "tween",
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[460px] flex-col bg-card shadow-luxe"
          >
            <header className="flex items-end justify-between px-6 sm:px-10 pt-10 pb-6 border-b border-border">
              <div className="space-y-1.5">
                <p className="label-luxury">
                  {view === "2fa"
                    ? "Verificare"
                    : view === "forgot" || view === "forgot-sent"
                      ? "Recuperare"
                      : "Membri Linea"}
                </p>
                <h2 className="heading-serif text-3xl">
                  {view === "login" && "Acces cont"}
                  {view === "2fa" && "Cod de verificare"}
                  {view === "forgot" && "Resetare parolă"}
                  {view === "forgot-sent" && "Email trimis"}
                </h2>
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

            <div className="flex-1 overflow-y-auto luxury-scrollbar px-6 sm:px-10 py-10">
              <AnimatePresence mode="wait">
                {view === "2fa" && (
                  <motion.div
                    key="2fa"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-10"
                  >
                    <div className="text-center space-y-5">
                      <div className="w-16 h-16 mx-auto bg-surface border border-border grid place-items-center rounded-full">
                        <Fingerprint size={28} strokeWidth={1} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                        Introdu codul de 6 cifre din aplicația ta de
                        autentificare.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-8">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="000000"
                        autoFocus
                        className="h-20 w-full text-center text-4xl tracking-[0.4em] font-light border-b border-foreground bg-transparent outline-none placeholder:text-muted-foreground/30"
                      />
                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="group h-14 w-full bg-foreground text-background flex items-center justify-center gap-3 hover:bg-primary-hover transition-colors disabled:opacity-30"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                            Verifică
                          </span>
                        )}
                      </button>
                    </form>

                    <button
                      onClick={() => setView("login")}
                      className="w-full text-center label-micro text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Înapoi
                    </button>
                  </motion.div>
                )}

                {view === "forgot" && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-10"
                  >
                    <div className="text-center space-y-5">
                      <div className="w-16 h-16 mx-auto bg-surface border border-border grid place-items-center rounded-full">
                        <Mail size={26} strokeWidth={1.2} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                        Îți trimitem un link securizat pentru resetarea parolei
                        la adresa indicată.
                      </p>
                    </div>

                    <form onSubmit={handleForgot} className="space-y-7">
                      <div className="space-y-2">
                        <label className="label-luxury block">Email</label>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="nume@exemplu.com"
                          className="h-12 w-full border-b border-border bg-transparent text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !forgotEmail}
                        className="group h-14 w-full bg-foreground text-background flex items-center justify-center gap-3 hover:bg-primary-hover transition-colors disabled:opacity-30"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                              Trimite link
                            </span>
                            <ArrowRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </form>

                    <button
                      onClick={() => setView("login")}
                      className="w-full flex items-center justify-center gap-2 label-micro text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={11} /> Înapoi la autentificare
                    </button>
                  </motion.div>
                )}

                {view === "forgot-sent" && (
                  <motion.div
                    key="forgot-sent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-10 text-center"
                  >
                    <div className="w-20 h-20 mx-auto bg-surface border border-border grid place-items-center rounded-full">
                      <CheckCircle2 size={32} strokeWidth={1.2} />
                    </div>
                    <div className="space-y-3 max-w-xs mx-auto">
                      <h3 className="heading-serif text-2xl">
                        Verifică-ți emailul
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Dacă{" "}
                        <strong className="text-foreground">
                          {forgotEmail}
                        </strong>{" "}
                        este înregistrat, vei primi un link de resetare în
                        câteva minute.
                      </p>
                      <p className="text-xs text-muted-foreground/70 pt-2">
                        Verifică și folderul Spam.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setView("login");
                        setForgotEmail("");
                      }}
                      className="w-full flex items-center justify-center gap-2 label-micro text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft size={11} /> Înapoi la autentificare
                    </button>
                  </motion.div>
                )}

                {view === "login" && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <form onSubmit={handleLogin} className="space-y-7">
                      <div className="space-y-2">
                        <label className="label-luxury block">Email</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nume@exemplu.com"
                          className="h-12 w-full border-b border-border bg-transparent text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="label-luxury">Parolă</label>
                          <button
                            type="button"
                            onClick={() => setView("forgot")}
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:opacity-70 transition-opacity"
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
                          className="h-12 w-full border-b border-border bg-transparent text-sm outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group h-14 w-full bg-foreground text-background flex items-center justify-center gap-3 hover:bg-primary-hover transition-colors disabled:opacity-30"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                              Autentificare
                            </span>
                            <ArrowRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="space-y-6 pt-2">
                      <div className="relative flex items-center">
                        <div className="h-px w-full bg-border" />
                        <span className="absolute bg-card px-4 left-1/2 -translate-x-1/2 label-micro text-muted-foreground">
                          Sau
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[Chrome, Facebook, Apple].map((Icon, i) => (
                          <button
                            key={i}
                            type="button"
                            className="h-12 grid place-items-center border border-border hover:bg-foreground hover:text-background transition-colors"
                          >
                            <Icon size={16} strokeWidth={1.4} />
                          </button>
                        ))}
                      </div>

                      <div className="text-center pt-2">
                        <button
                          onClick={onSwitchToRegister}
                          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Nu ai cont?{" "}
                          <span className="text-foreground border-b border-foreground/30 hover:border-foreground transition-colors">
                            Creează unul
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="px-6 sm:px-10 py-5 border-t border-border bg-surface/40 flex items-center justify-between text-muted-foreground/70">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} strokeWidth={1.4} />
                <span className="text-[9px] font-medium uppercase tracking-[0.3em]">
                  Conexiune securizată
                </span>
              </div>
              <span className="text-[9px] font-medium uppercase tracking-[0.3em]">
                AES-256
              </span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Login;
