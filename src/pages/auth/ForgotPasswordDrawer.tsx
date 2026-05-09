import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  ShieldCheck,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ForgotPasswordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordDrawer = ({
  isOpen,
  onClose,
  onBackToLogin,
}: ForgotPasswordDrawerProps) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // Stare nouă pentru 2FA
  const [requires2FA, setRequires2FA] = useState(false); // Flag pentru UI

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Resetăm tot când se deschide
      setSent(false);
      setRequires2FA(false);
      setEmail("");
      setCode("");
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (requires2FA && !code.trim()) return;

    setLoading(true);
    try {
      // Trimitem cererea (cu tot cu cod dacă suntem în pasul 2FA)
      const result = await resetPassword(
        email.trim(),
        requires2FA ? code.trim() : undefined,
      );

      if (result.requires2FA) {
        // Trecem la pasul 2FA
        setRequires2FA(true);
        toast.info("Acest cont este protejat de 2FA. Introdu codul.");
      } else if (result.error) {
        toast.error(
          result.error.message ||
            "Adresa de email nu a fost găsită sau codul este incorect.",
        );
      } else {
        // Succes final
        setSent(true);
        toast.success("Verifică inbox-ul pentru instrucțiuni.");
      }
    } catch {
      toast.error("Eroare de conexiune la server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[800] flex justify-end">
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
            className="relative z-[801] flex h-full w-full sm:max-w-[480px] flex-col bg-white shadow-luxe"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 size-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-[var(--dark-amethyst)] hover:text-white transition-all duration-500 z-50"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex flex-col justify-center px-8 sm:px-16">
              {!sent ? (
                <div className="w-full">
                  <header className="mb-12 space-y-3">
                    <button
                      onClick={() => {
                        if (requires2FA) {
                          setRequires2FA(false); // Dacă e la pasul 2FA, revine la pasul de email
                          setCode("");
                        } else {
                          onBackToLogin(); // Altfel revine la login
                        }
                      }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[var(--dark-amethyst)] mb-6 transition-colors"
                    >
                      <ArrowLeft size={14} />{" "}
                      {requires2FA ? "Înapoi la Email" : "Revenire la logare"}
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--dark-amethyst)]">
                      {requires2FA ? "Securitate Cont" : "Recuperare Acces"}
                    </span>
                    <h2 className="heading-serif text-5xl italic text-[var(--dark-amethyst)] leading-tight">
                      {requires2FA ? "Cod 2FA" : "Resetare"}
                    </h2>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-[280px]">
                      {requires2FA
                        ? "Introdu codul din aplicația Authenticator pentru a autoriza resetarea."
                        : "Introdu email-ul pentru a primi un link securizat."}
                    </p>
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-10">
                    {!requires2FA ? (
                      <div className="space-y-2 group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nume@casa.com"
                          className="w-full py-4 border-b-2 border-zinc-100 bg-transparent text-lg outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 font-light"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          Cod Autentificare
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="000000"
                          className="w-full py-4 border-b-2 border-zinc-100 bg-transparent text-3xl tracking-[0.5em] text-center outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 font-black"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || (!requires2FA ? !email : !code)}
                      className="relative w-full h-16 rounded-full text-white overflow-hidden group/btn shadow-2xl transition-all"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                        {loading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            {requires2FA
                              ? "Confirmă & Trimite Link"
                              : "Trimite Link"}{" "}
                            <ArrowRight size={16} />
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="w-full text-center space-y-8">
                  <div className="size-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500 shadow-sm border border-emerald-100">
                    <CheckCircle2 size={40} strokeWidth={1} />
                  </div>
                  <h2 className="heading-serif text-4xl italic text-[var(--dark-amethyst)]">
                    Email Trimis
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                    Instrucțiunile au fost trimise la:
                    <br />
                    <span className="text-zinc-900">{email}</span>
                  </p>
                  <button
                    onClick={onBackToLogin}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--dark-amethyst)] border-b-2 border-[var(--dark-amethyst)] pb-1"
                  >
                    Revino la logare
                  </button>
                </div>
              )}
            </div>

            <footer className="p-10 border-t border-zinc-50 bg-zinc-50/30 flex justify-center opacity-40">
              <ShieldCheck
                size={14}
                className="mr-2 text-[var(--french-blue)]"
              />
              <span className="text-[8px] uppercase tracking-[0.4em] font-black text-[var(--dark-amethyst)]">
                Securitate SSL & 2FA Ready
              </span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordDrawer;
