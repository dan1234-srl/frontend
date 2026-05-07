import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, ShoppingBag, Mail } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/header/Header";
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
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full border border-zinc-100 p-8 md:p-16 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] rounded-[2rem] text-center space-y-10"
        >
          {/* Badge succes animat */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 20, delay: 0.3 }}
                className="size-20 bg-zinc-900 rounded-full flex items-center justify-center text-white"
              >
                <Check size={32} strokeWidth={1.5} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-zinc-900 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="heading-serif text-4xl md:text-5xl tracking-tight italic">
              Vă mulțumim.
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">
              Comanda dumneavoastră a fost plasată
            </p>
          </div>

          <div className="h-px w-12 bg-zinc-200 mx-auto" />

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
                <ShoppingBag size={12} /> Comandă:{" "}
                <span className="text-black">
                  #{orderId.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
                <Mail size={12} /> Confirmare trimisă prin email
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto italic font-medium">
              Vom începe pregătirea produselor Linea imediat. Veți fi notificat
              când coletul pleacă spre dumneavoastră.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button
              onClick={() => navigate("/")}
              className="h-16 w-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group"
            >
              Înapoi la Magazin
              <ArrowRight
                size={14}
                className="group-hover:translate-x-2 transition-transform duration-300"
              />
            </button>
            <p className="text-[9px] text-zinc-300 uppercase tracking-[0.2em] font-medium italic">
              Secured by Linea Ecosystem
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessPage;
