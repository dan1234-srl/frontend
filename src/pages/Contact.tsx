/**
 * Contact.tsx
 * Design "Atelier Suite" - Layout modular (Bento Grid)
 */

import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Sparkles, Send } from "lucide-react";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact · EVEM";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfbfe] flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--royal-violet)] opacity-[0.04] rounded-full blur-[120px] pointer-events-none -mt-40 -mr-40" />
      
      <Header />

      <main className="flex-1 w-full relative pt-32 pb-24">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          
          {/* HEADER SECTIUNE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles size={12} className="text-[var(--royal-violet)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">Contact</span>
            </div>
            <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter text-[var(--dark-amethyst)]">
              Suntem <span className="italic">Aici</span>
            </h1>
          </motion.div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Contact Info */}
            <div className="space-y-6">
              <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="size-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-[var(--royal-violet)] mb-6">
                    <Mail size={20} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Email Contact</h3>
                <a href="mailto:daniel.tufan@consultant.com" className="text-sm font-bold text-[var(--dark-amethyst)] hover:text-[var(--royal-violet)] transition-colors">
                  daniel.tufan@consultant.com
                </a>
              </div>

              <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="size-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-[var(--royal-violet)] mb-6">
                    <Phone size={20} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Telefon Suport</h3>
                <a href="tel:+40735928664" className="text-sm font-bold text-[var(--dark-amethyst)] hover:text-[var(--royal-violet)] transition-colors">
                  +40 735 928 664
                </a>
              </div>

              <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                <div className="size-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-[var(--royal-violet)] mb-6">
                    <Clock size={20} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Program</h3>
                <p className="text-[12px] font-bold text-[var(--dark-amethyst)]">Luni - Vineri: 09:00 - 18:00</p>
                <p className="text-[12px] font-medium text-zinc-400">Sâmbătă - Duminică: Închis</p>
              </div>
            </div>

            {/* COLUMN 2 & 3: Location & Map (Spanned) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-zinc-50 rounded-2xl text-[var(--royal-violet)]">
                            <MapPin size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[var(--dark-amethyst)] mb-1">Tufan Logistic Expert SRL</h3>
                            <p className="text-sm font-medium text-zinc-600 mb-4">Prelungirea Ghencea 124D, Sector 6, București</p>
                            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <span>CUI: RO51574431</span>
                                <span>REG. COM: J2025024172009</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HARTA */}
                <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border border-zinc-100 shadow-lg relative">
                    <iframe
                        title="Locație"
                        src="https://maps.google.com/maps?q=Prelungirea%20Ghencea%20124D,%20Bucure%C8%99ti&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-full grayscale-[1] contrast-[1.1] brightness-[1.05]"
                    />
                </div>
            </div>

          </motion.div>

          {/* FOOTER FORMULARE (Call to action) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-[var(--dark-amethyst)] rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-[var(--royal-violet)] to-transparent opacity-40" />
             <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                 <h2 className="text-3xl heading-serif italic">Ai nevoie de ajutor urgent?</h2>
                 <p className="text-zinc-300 text-sm">Echipa noastră de suport îți răspunde în cel mai scurt timp posibil. Trimite-ne un mesaj și vom reveni cu un răspuns.</p>
                 <button className="h-14 px-10 bg-white text-[var(--dark-amethyst)] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-100 transition-all flex items-center gap-2 mx-auto">
                    <Send size={14} /> Trimite un Mesaj
                 </button>
             </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;