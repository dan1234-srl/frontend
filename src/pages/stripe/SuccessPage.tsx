import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ShoppingBag,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/navbar/Navbar"; // Folosim Navbar-ul tau actualizat
import Footer from "@/components/footer/Footer";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id") || "N/A";
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    } else {
      navigate("/");
    }
  }, [isSuccess, clearCart, navigate]);

  if (!isSuccess) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[var(--deep-twilight)] font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Background Decor de lux */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--french-blue)] opacity-[0.03] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--deep-twilight)] opacity-[0.03] blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl w-full border border-zinc-100 p-10 md:p-20 bg-white/80 backdrop-blur-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.04)] rounded-[3rem] text-center"
        >
          {/* Badge succes cu tematica Navbar */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                className="size-24 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
                style={{ background: "var(--primary-gradient)" }}
              >
                <Check size={40} strokeWidth={2} />
              </motion.div>

              {/* Inele animate tip "Luxury Pulse" */}
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 rounded-full border-2 border-[var(--french-blue)]"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -top-2 -right-2 text-[var(--french-blue)]"
              >
                <Sparkles size={24} />
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none"
            >
              Comandă{" "}
              <span className="text-[var(--french-blue)]">Confirmată</span>
            </motion.h1>

            <p className="text-[11px] uppercase tracking-[0.6em] text-zinc-400 font-bold">
              Vă mulțumim pentru încredere
            </p>
          </div>

          <div className="my-12 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-100" />
            <div className="size-2 rounded-full bg-zinc-200" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-zinc-50/50 border border-zinc-100">
              <div className="p-3 rounded-full bg-white shadow-sm text-[var(--french-blue)]">
                <ShoppingBag size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                  Număr Comandă
                </p>
                <p className="text-sm font-black text-[var(--deep-twilight)]">
                  #{orderId.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-zinc-50/50 border border-zinc-100">
              <div className="p-3 rounded-full bg-white shadow-sm text-[var(--french-blue)]">
                <Mail size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                  Status Confirmare
                </p>
                <p className="text-sm font-black text-[var(--deep-twilight)]">
                  Email Trimis
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto font-medium italic">
              "Fiecare bijuterie Evem este o poveste. Vom începe pregătirea
              coletului dumneavoastră cu cea mai mare atenție la detalii."
            </p>

            <div className="flex flex-col gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/")}
                className="h-16 w-full text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
                style={{ background: "var(--primary-gradient)" }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Continuă Cumpărăturile
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-2 transition-transform duration-500"
                  />
                </span>
                <motion.div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <Link
                to="/account/orders"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--french-blue)] transition-colors py-2"
              >
                Urmărește statusul comenzii
              </Link>
            </div>
          </div>

          {/* Footer Card */}
          <div className="mt-16 flex items-center justify-center gap-2 text-zinc-300">
            <div className="h-px w-8 bg-zinc-100" />
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold">
              Evem Jewelry Ecosystem
            </p>
            <div className="h-px w-8 bg-zinc-100" />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessPage;
