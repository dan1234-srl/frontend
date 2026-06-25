/**
 * Faq.tsx
 * Design Premium - Centru de Suport Modern
 */

import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles, Mail, Phone, ShieldCheck } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const faqData = [
  {
    category: "Comenzi & Plăți",
    items: [
      {
        q: "Cum pot plasa o comandă?",
        a: "Adaugă produsele dorite în coș, accesează pagina de checkout și introdu datele de livrare. După finalizare, vei primi o confirmare automată prin e-mail. Contractul se consideră încheiat în momentul în care îți trimitem confirmarea de expediere (AWB).",
      },
      {
        q: "Ce metode de plată acceptați?",
        a: "Acceptăm plăți securizate cu cardul (Visa, Mastercard, Maestro) procesate prin Stripe, Apple Pay și Google Pay. De asemenea, pentru livrările prin curier, este disponibilă plata ramburs (cash sau card la curier).",
      },
      {
        q: "Pot modifica o comandă după ce am plasat-o?",
        a: "Dacă dorești să modifici adresa de livrare sau să anulezi comanda, te rugăm să ne contactezi cât mai rapid la daniel.tufan@consultant.com. Dacă coletul a fost deja predat curierului, modificarea nu mai este posibilă.",
      },
      {
        q: "Cum primesc factura fiscală?",
        a: "Factura fiscală este generată automat în format electronic și o poți descărca din contul tău de client sau o vei primi pe e-mail imediat după procesarea comenzii.",
      },
    ],
  },
  {
    category: "Livrare",
    items: [
      {
        q: "Cât timp durează livrarea?",
        a: "Comenzile sunt procesate în 24-48 ore. Termenul standard de livrare pe teritoriul României este de 1-3 zile lucrătoare prin curierul partener GLS.",
      },
      {
        q: "Cum urmăresc coletul?",
        a: "Imediat ce coletul pleacă din depozitul nostru, vei primi un e-mail cu numărul de AWB și un link de tracking pentru a monitoriza statusul livrării în timp real pe site-ul GLS.",
      },
      {
        q: "Ce se întâmplă dacă aleg GLS Locker?",
        a: "După ce coletul ajunge în Locker-ul selectat, vei primi un cod PIN prin e-mail/SMS. Ai la dispoziție o fereastră de timp stabilită de curier pentru a ridica coletul.",
      },
    ],
  },
  {
    category: "Retur & Garanție",
    items: [
      {
        q: "Care este politica de retur?",
        a: "Conform O.U.G. 34/2014, ai 14 zile calendaristice la dispoziție pentru a returna produsele. Acestea trebuie să fie în starea originală, nefolosite și cu etichetele intacte.",
      },
      {
        q: "Cum îmi primesc banii înapoi?",
        a: "Dacă ai plătit prin card, banii se returnează direct în contul cardului în 14 zile. Dacă ai plătit ramburs, te rugăm să ne furnizezi un cod IBAN în formularul de retur.",
      },
    ],
  },
  {
    category: "GDPR & Confidențialitate",
    items: [
      {
        q: "Cum îmi șterg datele cu caracter personal?",
        a: "Conform GDPR, poți solicita oricând ștergerea datelor tale trimițând o solicitare la privacy@evem.ro. Vom șterge contul și datele asociate, cu excepția celor pe care suntem obligați legal să le păstrăm (ex: facturi contabile).",
      },
    ],
  },
];

const FaqItem = ({
  q,
  a,
  isOpen,
  onClick,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-zinc-200/60 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
      >
        <h4 className="text-[13px] md:text-[15px] font-bold text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors pr-8">
          {q}
        </h4>
        <div className="relative size-5 shrink-0 flex items-center justify-center text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors">
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 0 : 1 }}
            className="absolute"
          >
            <Plus size={16} strokeWidth={2.5} />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 0 : -180, opacity: isOpen ? 1 : 0 }}
            className="absolute"
          >
            <Minus size={16} strokeWidth={2.5} />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="pb-8 pr-12 text-[13px] text-zinc-500 leading-relaxed font-medium">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Întrebări Frecvente · EVEM";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfbfe] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--royal-violet)] opacity-[0.03] rounded-full blur-[100px] pointer-events-none -mt-40 -mr-40" />
      <Header />

      <main className="flex-1 w-full relative pt-40 pb-24">
        <div className="w-[90%] max-w-[800px] mx-auto flex flex-col gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={12} className="text-[var(--royal-violet)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                Suport Clienți
              </span>
            </div>
            <h1 className="heading-serif text-4xl md:text-6xl tracking-tighter text-[var(--dark-amethyst)]">
              Întrebări <span className="italic">Frecvente</span>
            </h1>
          </motion.div>

          <div className="space-y-12">
            {faqData.map((section, sectionIndex) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 border-b border-zinc-200 pb-2">
                  {section.category}
                </h3>
                <div className="flex flex-col">
                  {section.items.map((item, itemIndex) => {
                    const id = `${sectionIndex}-${itemIndex}`;
                    return (
                      <FaqItem
                        key={id}
                        q={item.q}
                        a={item.a}
                        isOpen={openItem === id}
                        onClick={() => setOpenItem(openItem === id ? null : id)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 p-8 md:p-12 rounded-[2.5rem] border border-[var(--royal-violet)]/10 bg-white shadow-sm text-center"
          >
            <p className="text-sm font-bold text-[var(--dark-amethyst)] mb-2">
              Nu ai găsit răspunsul căutat?
            </p>
            <p className="text-[11px] text-zinc-500 mb-8 max-w-sm mx-auto">
              Echipa Tufan Logistic Expert SRL este gata să te ajute. Ne poți
              contacta direct.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:daniel.tufan@consultant.com"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all"
              >
                <Mail size={14} /> Trimite Email
              </a>
              <a
                href="tel:+40735928664"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl border border-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-[var(--royal-violet)] transition-all"
              >
                <Phone size={14} /> +40 735 928 664
              </a>
            </div>

            <div className="mt-12 text-[10px] text-zinc-400 border-t border-zinc-100 pt-8">
              <p className="font-bold text-zinc-600">
                Tufan Logistic Expert SRL | CUI: RO51574431
              </p>
              <p>Sediu: Prelungirea Ghencea 124D, Sector 6, București</p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Faq;
