import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- DATELE FAQ (Le poți modifica/extinde) ---
const faqData = [
  {
    category: "Comenzi & Plăți",
    items: [
      {
        q: "Cum pot plasa o comandă?",
        a: "Plasarea unei comenzi este simplă și intuitivă. Adaugă produsele dorite în coș, accesează pagina de checkout și urmează pașii pentru completarea detaliilor de livrare și plată. Nu este obligatoriu să creezi un cont, dar acesta îți oferă un control mai bun asupra comenzilor tale.",
      },
      {
        q: "Ce metode de plată acceptați?",
        a: "Acceptăm plăți securizate cu cardul (Visa, Mastercard, Maestro), Apple Pay, Google Pay, precum și plata ramburs la primirea coletului, în funcție de opțiunile disponibile pentru zona ta.",
      },
    ],
  },
  {
    category: "Livrare",
    items: [
      {
        q: "Cât timp durează livrarea?",
        a: "Comenzile standard sunt procesate și livrate în termen de 1-3 zile lucrătoare. Vei primi un e-mail cu numărul de urmărire (AWB) imediat ce coletul este predat curierului.",
      },
      {
        q: "Livrați și internațional?",
        a: "Momentan, ne concentrăm pe livrarea rapidă și sigură pe teritoriul României. Extinderea livrărilor la nivel internațional este în planurile noastre apropiate.",
      },
    ],
  },
  {
    category: "Retur & Garanție",
    items: [
      {
        q: "Care este politica de retur?",
        a: "Ai la dispoziție 14 zile calendaristice de la primirea comenzii pentru a returna orice produs care nu se ridică la așteptările tale. Produsul trebuie să fie în starea originală, nepurtat și cu etichetele intacte.",
      },
      {
        q: "Cum inițiez un retur?",
        a: "Pentru a iniția un retur, accesează pagina noastră de Retur din subsolul site-ului, completează formularul rapid și vei primi instrucțiunile detaliate pe e-mail.",
      },
    ],
  },
];

// --- COMPONENTA INDIVIDUALĂ ACORDEON ---
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
    <div className="border-b border-[var(--royal-violet)]/10 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group transition-colors hover:bg-[var(--royal-violet)]/[0.02] px-4 -mx-4 rounded-xl"
      >
        <h4 className="text-sm md:text-base font-semibold text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors pr-8">
          {q}
        </h4>
        <div className="relative size-5 shrink-0 flex items-center justify-center text-[var(--royal-violet)]/60 group-hover:text-[var(--royal-violet)] transition-colors">
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 0 : 1 }}
            className="absolute"
          >
            <Plus size={18} strokeWidth={2} />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 0 : -180, opacity: isOpen ? 1 : 0 }}
            className="absolute"
          >
            <Minus size={18} strokeWidth={2} />
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
            <div className="pb-8 pr-12 text-sm text-zinc-500 leading-relaxed font-medium px-4 -mx-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- PAGINA PRINCIPALĂ FAQ ---
const Faq = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Preia tema backend pentru a fi siguri că variabilele CSS există
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/themes/active`)
      .then((res) => res.json())
      .then((theme) => {
        if (!theme) return;
        const root = document.documentElement;
        if (theme.dark_amethyst)
          root.style.setProperty("--dark-amethyst", theme.dark_amethyst);
        if (theme.royal_violet)
          root.style.setProperty("--royal-violet", theme.royal_violet);
        if (theme.primary_gradient)
          root.style.setProperty("--primary-gradient", theme.primary_gradient);
      })
      .catch((err) => console.warn("Eroare încărcare temă FAQ:", err));
  }, []);

  // Setează scroll-ul la top la montare
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfbfe] flex flex-col relative overflow-hidden">
      {/* Glow-uri ambientale */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--royal-violet)] opacity-[0.03] rounded-full blur-[100px] pointer-events-none -mt-40 -mr-40" />
      <div className="absolute top-[40%] left-0 w-[500px] h-[500px] bg-[var(--dark-amethyst)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none -ml-60" />

      <Header />

      <main className="flex-1 w-full relative pt-40 pb-24">
        <div className="w-[90%] max-w-[800px] mx-auto flex flex-col gap-12">
          {/* HEADER SECTIUNE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-8"
          >
            <div className="flex items-center justify-center gap-2">
              <span
                className="w-8 h-[2px]"
                style={{ background: "var(--primary-gradient)" }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                Suport Clienți
              </span>
              <span
                className="w-8 h-[2px]"
                style={{ background: "var(--primary-gradient)" }}
              />
            </div>
            <h1 className="heading-serif text-4xl md:text-6xl font-medium tracking-tighter text-[var(--dark-amethyst)]">
              Întrebări <span className="italic">Frecvente</span>
            </h1>
            <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto leading-relaxed pt-2">
              Tot ce trebuie să știi despre comenzi, livrare și experiența EVEM.
            </p>
          </motion.div>

          {/* LISTA FAQ */}
          <div className="space-y-12">
            {faqData.map((section, sectionIndex) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]/60 bg-[var(--royal-violet)]/5 inline-block px-4 py-1.5 rounded-full">
                  {section.category}
                </h3>

                <div className="flex flex-col">
                  {section.items.map((item, itemIndex) => {
                    const id = `${sectionIndex}-${itemIndex}`;
                    const isOpen = openItem === id;

                    return (
                      <FaqItem
                        key={id}
                        q={item.q}
                        a={item.a}
                        isOpen={isOpen}
                        onClick={() => setOpenItem(isOpen ? null : id)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* MESAJ FINAL / CONTACT */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-3xl border border-[var(--royal-violet)]/5 bg-white shadow-sm"
          >
            <p className="text-sm font-semibold text-[var(--dark-amethyst)] mb-2">
              Nu ai găsit răspunsul căutat?
            </p>
            <p className="text-xs text-zinc-500 mb-6">
              Echipa noastră este aici să te ajute cu orice nelămurire.
            </p>
            <a
              href="mailto:daniel.tufan@consultant.com"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-md active:scale-95"
              style={{ background: "var(--primary-gradient)" }}
            >
              Contactează-ne
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Faq;
