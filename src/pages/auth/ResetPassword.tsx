import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Lock, ShieldCheck } from "lucide-react";

/**
 * Definește URL-ul de bază pentru API.
 * Se folosește variabila de mediu din Vercel (api.evem.ro) sau fallback la Railway.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

/**
 * ResetPassword Component
 * Gestionează procesul de setare a unei parole noi folosind un token JWT primit prin email.
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extragem token-ul din URL (?token=...)
  const token = searchParams.get("token");

  // State-uri pentru formular
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Verificăm prezența token-ului la montarea componentei
  useEffect(() => {
    if (!token) {
      toast.error("Link-ul de resetare este invalid sau lipsește.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validări de bază (Client-side)
    if (!token) {
      toast.error(
        "Sesiune invalidă. Vă rugăm să solicitați un link nou de resetare.",
      );
      return;
    }

    if (password.length < 8) {
      toast.error("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Parolele introduse nu coincid.");
      return;
    }

    setLoading(true);

    try {
      /**
       * IMPORTANT: Folosim template literals cu API_BASE_URL pentru flexibilitate.
       * Endpoint-ul este concatenat automat.
       */
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token: token,
            new_password: password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Parola a fost actualizată cu succes! Acum vă puteți autentifica.",
        );
        // Redirecționăm utilizatorul către pagina principală sau modalul de login după 2 secunde
        setTimeout(() => navigate("/"), 2000);
      } else {
        // Gestionăm erorile venite de la server (ex: token expirat)
        toast.error(data.detail || "A apărut o eroare la resetarea parolei.");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      toast.error(
        "Eroare de conexiune la server. Verificați conexiunea la internet.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-20 relative">
        {/* Efect vizual de fundal (Dark Amethyst Blur) */}
        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-[var(--dark-amethyst)] rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          {!token ? (
            <div className="text-center space-y-6">
              <h1 className="heading-serif text-3xl text-zinc-300 italic">
                Link Expirat
              </h1>
              <p className="text-sm text-zinc-400">
                Acest link de resetare nu mai este valid sau a fost deja
                utilizat.
              </p>
              <button
                onClick={() => navigate("/")}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--dark-amethyst)] hover:underline"
              >
                Înapoi la magazin
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <header className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                  <ShieldCheck
                    className="text-[var(--french-blue)] opacity-60"
                    size={32}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                  Securitate Cont
                </span>
                <h1 className="heading-serif text-5xl italic text-[var(--dark-amethyst)]">
                  Parolă Nouă
                </h1>
                <div className="h-1 w-12 bg-[var(--french-blue)] rounded-full mx-auto opacity-40" />
              </header>

              <form
                onSubmit={handleSubmit}
                className="space-y-8 bg-white p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-50 rounded-[40px]"
              >
                <div className="space-y-6 text-left">
                  {/* Câmp Parolă Nouă */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)] transition-colors">
                      Noua Parolă
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minim 8 caractere"
                        required
                        className="w-full py-4 border-b-2 border-zinc-100 bg-transparent text-lg outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 font-light"
                      />
                      <Lock
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-100"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Câmp Confirmare Parolă */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)] transition-colors">
                      Confirmă Parola
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetă parola"
                      required
                      className="w-full py-4 border-b-2 border-zinc-100 bg-transparent text-lg outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 font-light"
                    />
                  </div>
                </div>

                {/* Buton Submit cu gradient Luxury */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-16 rounded-full text-white overflow-hidden group/btn shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Actualizează Parola <ArrowRight size={16} />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
