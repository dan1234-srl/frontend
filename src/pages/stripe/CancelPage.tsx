import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft, RefreshCcw, HelpCircle } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full text-center space-y-12"
        >
          {/* Iconiță Anulare */}
          <div className="flex justify-center">
            <div className="size-20 border-2 border-zinc-100 rounded-full flex items-center justify-center text-zinc-300 relative">
              <X size={32} strokeWidth={1} />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="heading-serif text-4xl md:text-5xl italic tracking-tight">
              Plata a fost întreruptă.
            </h1>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">
                Tranzacția nu a putut fi finalizată
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Nu s-a retras nicio sumă din contul dumneavoastră. Este posibil
                ca sesiunea să fi expirat sau datele cardului să fi fost
                introduse greșit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto pt-6">
            <button
              onClick={() => navigate("/cart")}
              className="h-14 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all group"
            >
              <RefreshCcw
                size={14}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
              Reîncearcă Plata
            </button>
            <button
              onClick={() => navigate("/")}
              className="h-14 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
            >
              <ArrowLeft size={14} />
              Acasă
            </button>
          </div>

          <div className="pt-10 flex flex-col items-center gap-4 border-t border-zinc-50">
            <div className="flex items-center gap-2 text-zinc-400">
              <HelpCircle size={14} />
              <span className="text-[9px] uppercase font-bold tracking-widest italic">
                Ai nevoie de ajutor?
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium underline underline-offset-4 cursor-pointer hover:text-black transition-colors">
              contact@Evem-boutique.ro
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CancelPage;
