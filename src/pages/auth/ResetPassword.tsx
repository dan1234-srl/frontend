import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ArrowRight, Lock } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificăm dacă suntem într-un flux de recovery din URL (hash-ul de la Supabase/Backend)
    const hash = window.location.hash;
    if (
      hash.includes("type=recovery") ||
      window.location.search.includes("token=")
    ) {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Parola trebuie să aibă minim 6 caractere.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Parolele nu coincid.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Parola a fost actualizată.");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-20 relative">
        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-[var(--dark-amethyst)] rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          {!isRecovery ? (
            <div className="text-center space-y-6">
              <h1 className="heading-serif text-3xl text-zinc-300 italic">
                Sesiune expirată
              </h1>
              <p className="text-sm text-zinc-400">
                Link-ul de resetare nu mai este valid.
              </p>
              <button
                onClick={() => navigate("/")}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--dark-amethyst)]"
              >
                Revino la magazin
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <header className="text-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                  Securitate Maximă
                </span>
                <h1 className="heading-serif text-5xl italic text-[var(--dark-amethyst)]">
                  Parolă Nouă
                </h1>
                <div className="h-1 w-12 bg-[var(--french-blue)] rounded-full mx-auto opacity-40" />
              </header>

              <form
                onSubmit={handleSubmit}
                className="space-y-8 bg-white p-8 sm:p-12 shadow-luxe border border-zinc-50 rounded-[40px]"
              >
                <div className="space-y-6">
                  {/* Password 1 */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)] transition-colors">
                      Noua Parolă
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minim 6 caractere"
                        required
                        className="w-full py-4 border-b-2 border-zinc-100 bg-transparent text-lg outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 font-light"
                      />
                      <Lock
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-100"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Password 2 */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-[var(--french-blue)] transition-colors">
                      Confirmă Parola
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetă noua parolă"
                      required
                      className="w-full py-4 border-b-2 border-zinc-100 bg-transparent text-lg outline-none focus:border-[var(--dark-amethyst)] transition-all duration-500 font-light"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-16 rounded-full text-white overflow-hidden group/btn shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em]">
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Salvează Modificările <ArrowRight size={16} />
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
