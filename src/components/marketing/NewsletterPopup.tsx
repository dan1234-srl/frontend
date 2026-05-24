import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Mail } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  "https://linea-backend-production.up.railway.app";

const STORAGE_KEY = "evem_newsletter_dismissed_v1";

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Bun venit în comunitatea EVEM ✨", {
          description: "Vei primi reduceri exclusive direct pe email.",
        });
        dismiss();
      } else {
        toast.error("Nu am putut finaliza abonarea", {
          description: "Te rugăm să încerci din nou.",
        });
      }
    } catch {
      toast.error("Eroare de rețea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-900/30 backdrop-blur-md"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-100"
          >
            <button
              onClick={dismiss}
              aria-label="Închide"
              className="absolute top-4 right-4 z-10 size-9 rounded-full bg-white/80 border border-zinc-100 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all"
            >
              <X size={14} />
            </button>

            <div
              className="px-8 pt-12 pb-8 text-center text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand, #0a0a0a), var(--brand-ink, #2d2d2d))",
              }}
            >
              <Sparkles size={28} className="mx-auto mb-3 opacity-80" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-70 mb-3">
                EVEM Inner Circle
              </p>
              <h2 className="heading-serif text-3xl leading-tight">
                Bun venit în <span className="italic">comunitate</span>
              </h2>
            </div>

            <form onSubmit={submit} className="p-8 space-y-5">
              <p className="text-sm text-zinc-600 leading-relaxed text-center">
                Înscrie-te și primește{" "}
                <span className="font-black text-zinc-900">10% reducere</span>{" "}
                la prima comandă, plus acces în avans la colecțiile noi.
              </p>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adresa@email.ro"
                  className="w-full h-14 pl-11 pr-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-sm font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand, #0a0a0a), var(--brand-ink, #2d2d2d))",
                }}
              >
                {loading ? "Se abonează..." : "Mă abonez"}
              </button>

              <button
                type="button"
                onClick={dismiss}
                className="w-full text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                Poate altă dată
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;
