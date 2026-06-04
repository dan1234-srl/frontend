import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Contact = () => {
  // Preia tema backend
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
      .catch((err) => console.warn("Eroare încărcare temă Contact:", err));

    window.scrollTo(0, 0);
  }, []);

  // Variante pentru animația cardurilor (Cascadă)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-[#fcfbfe] flex flex-col relative overflow-hidden">
      {/* Glow-uri ambientale */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[var(--royal-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none -mt-40 -mr-40" />
      <div className="absolute bottom-1/3 left-0 w-[600px] h-[600px] bg-[var(--dark-amethyst)] opacity-[0.02] rounded-full blur-[100px] pointer-events-none -ml-40" />

      <Header />

      <main className="flex-1 w-full relative pt-36 pb-20">
        <div className="w-[90%] max-w-[1400px] mx-auto flex flex-col gap-16">
          {/* TITLU PAGINĂ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <span
                className="w-8 h-[2px]"
                style={{ background: "var(--primary-gradient)" }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                Contact
              </span>
              <span
                className="w-8 h-[2px]"
                style={{ background: "var(--primary-gradient)" }}
              />
            </div>
            <h1 className="heading-serif text-4xl md:text-6xl font-medium tracking-tighter text-[var(--dark-amethyst)]">
              Suntem <span className="italic">Aici</span>
            </h1>
            <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto leading-relaxed pt-2">
              Ai o întrebare sau vrei să afli mai multe? Echipa noastră este
              pregătită să îți ofere suportul necesar.
            </p>
          </motion.div>

          {/* GRID INFORMAȚII DE CONTACT (3 Coloane) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Card 1: Locație */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.03)] hover:border-[var(--royal-violet)]/10 transition-colors group flex flex-col items-center text-center gap-4"
            >
              <div className="size-14 rounded-2xl bg-[var(--royal-violet)]/5 flex items-center justify-center text-[var(--royal-violet)] group-hover:scale-110 transition-transform duration-500">
                <MapPin size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--dark-amethyst)] mb-2">
                  Adresă Sediu
                </h3>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  Prelungirea Ghencea 124D
                  <br />
                  Sector 6, București, România
                </p>
                <p className="text-xs font-semibold text-zinc-400 mt-2">
                  Tufan Logistic Expert SRL
                </p>
              </div>
            </motion.div>

            {/* Card 2: Contact Direct */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.03)] hover:border-[var(--royal-violet)]/10 transition-colors group flex flex-col items-center text-center gap-4"
            >
              <div className="size-14 rounded-2xl bg-[var(--royal-violet)]/5 flex items-center justify-center text-[var(--royal-violet)] group-hover:scale-110 transition-transform duration-500">
                <Mail size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--dark-amethyst)] mb-2">
                  Contact Direct
                </h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="mailto:daniel.tufan@consultant.com"
                    className="text-sm font-medium text-zinc-500 hover:text-[var(--royal-violet)] transition-colors"
                  >
                    daniel.tufan@consultant.com
                  </a>
                  <a
                    href="tel:+40735928664"
                    className="text-sm font-medium text-zinc-500 hover:text-[var(--royal-violet)] transition-colors"
                  >
                    +40 735 928 664
                  </a>
                </div>
              </div>
              {/* Socials */}
              <div className="flex gap-3 mt-auto pt-2">
                <a
                  href="https://www.instagram.com/evem.ro?igsh=NGE5aTN2dWVvanho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[var(--royal-violet)] hover:bg-[var(--royal-violet)]/10 transition-all"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.facebook.com/people/Evemro/100069947145940/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[var(--royal-violet)] hover:bg-[var(--royal-violet)]/10 transition-all"
                >
                  <Facebook size={16} />
                </a>
              </div>
            </motion.div>

            {/* Card 3: Program */}
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.03)] hover:border-[var(--royal-violet)]/10 transition-colors group flex flex-col items-center text-center gap-4"
            >
              <div className="size-14 rounded-2xl bg-[var(--royal-violet)]/5 flex items-center justify-center text-[var(--royal-violet)] group-hover:scale-110 transition-transform duration-500">
                <Clock size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.1em] text-[var(--dark-amethyst)] mb-2">
                  Program
                </h3>
                <ul className="text-sm font-medium text-zinc-500 space-y-2">
                  <li className="flex justify-between gap-6 border-b border-zinc-100 pb-2">
                    <span>Luni - Vineri:</span>
                    <span className="text-[var(--dark-amethyst)] font-semibold">
                      09:00 - 18:00
                    </span>
                  </li>
                  <li className="flex justify-between gap-6 border-b border-zinc-100 pb-2">
                    <span>Sâmbătă:</span>
                    <span className="text-zinc-400">Închis</span>
                  </li>
                  <li className="flex justify-between gap-6">
                    <span>Duminică:</span>
                    <span className="text-zinc-400">Închis</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* SECȚIUNE HARTĂ THEMED CU PIN PERSONALIZAT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full pt-4"
          >
            <div className="relative w-full h-[550px] rounded-[3rem] overflow-hidden shadow-lg shadow-[var(--royal-violet)]/5 border border-zinc-200/50 group bg-zinc-100">
              {/* Overlays pentru culoarea hărții */}
              <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-color"
                style={{ backgroundColor: "var(--royal-violet)", opacity: 0.2 }}
              />
              <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundColor: "var(--dark-amethyst)",
                  opacity: 0.3,
                }}
              />

              {/* PIN PERSONALIZAT ANIMAT (În centrul hărții) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
                {/* Indicatorul plutitor */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-zinc-100"
                >
                  <div
                    className="size-2 rounded-full animate-pulse"
                    style={{ background: "var(--primary-gradient)" }}
                  />
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                    EVEM
                  </span>
                </motion.div>
                {/* Vârful pin-ului */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white drop-shadow-md"
                />
                {/* Umbra pe sol */}
                <motion.div
                  animate={{ scale: [1, 0.8, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-4 h-1.5 bg-[var(--dark-amethyst)] rounded-[100%] blur-[2px] mt-2"
                />
              </div>

              {/* Harta Iframe (Am folosit q=... pentru a centra perfect coordonatele) */}
              <iframe
                title="Locație EVEM"
                src="https://maps.google.com/maps?q=Prelungirea%20Ghencea%20124D,%20Bucure%C8%99ti&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: "grayscale(100%) contrast(1.1) brightness(1.05)",
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full transition-transform duration-[20s] ease-linear group-hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
