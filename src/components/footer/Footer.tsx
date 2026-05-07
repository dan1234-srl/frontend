import { ArrowRight, Instagram, Mail, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Footer = () => {
  const { language } = useLanguage();
  const t = (ro: string, en: string) => (language === "en" ? en : ro);

  return (
    <footer className="w-full mt-20 relative overflow-hidden bg-[var(--background)]">
      {/* 1. NEWSLETTER SECTION (Light & Clean) */}
      <div className="bg-white pt-20 pb-24 md:pb-32 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl text-center md:text-left space-y-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--royal-violet)]">
              Linea Journal
            </span>
            <h2 className="heading-serif text-4xl md:text-6xl italic tracking-tighter text-zinc-900 leading-[0.9]">
              {t(
                "Esența designului în inbox.",
                "Design essence in your inbox.",
              )}
            </h2>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-sm relative group"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder={t("Adresa ta de email", "Your email address")}
              className="w-full bg-transparent border-b-2 border-zinc-100 py-4 pr-12 text-sm md:text-base outline-none focus:border-[var(--royal-violet)] transition-all duration-500 placeholder:text-zinc-300 font-medium"
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 size-10 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
              style={{ background: "var(--primary-gradient)" }}
            >
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </motion.form>
        </div>
      </div>

      {/* 2. ARCHITECTURAL CURVE (Transiția Dinamică) */}
      <div
        className="relative h-16 md:h-24 w-full bg-white transition-colors duration-700"
        style={{ color: "var(--dark-amethyst)" }}
      >
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z"
          ></path>
        </svg>
      </div>

      {/* 3. MAIN FOOTER (Deep Amethyst / Dynamic Theme) */}
      <div
        className="text-white pt-12 pb-10 px-6 transition-colors duration-700"
        style={{ backgroundColor: "var(--dark-amethyst)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-8">
              <Link
                to="/"
                className="heading-serif text-4xl italic tracking-tighter inline-block"
              >
                Linea.
              </Link>
              <p className="text-[11px] opacity-40 leading-relaxed max-w-xs font-bold uppercase tracking-widest">
                {t(
                  "Atelier de creație unde viziunea atemporală întâlnește materia nobilă.",
                  "Creative atelier where timeless vision meets noble matter.",
                )}
              </p>
              <div className="flex gap-4">
                {[Instagram, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="size-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-500"
                    style={{ backgroundColor: "var(--dark-amethyst-2)" }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.4em]"
                  style={{ color: "var(--lavender-purple)" }}
                >
                  {t("Colecții", "Collections")}
                </h4>
                <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-white/50">
                  {["Archive", "New In", "Limited", "Bespoke"].map((item) => (
                    <li key={item}>
                      <Link
                        to="#"
                        className="hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {item}{" "}
                        <ArrowUpRight
                          size={10}
                          className="opacity-0 group-hover:opacity-100 transition-all"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.4em]"
                  style={{ color: "var(--lavender-purple)" }}
                >
                  {t("Asistență", "Support")}
                </h4>
                <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-white/50">
                  {["Size Guide", "Shipping", "Returns", "Terms"].map(
                    (item) => (
                      <li key={item}>
                        <Link
                          to="#"
                          className="hover:text-white transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-3 space-y-6 text-left lg:text-right">
              <h4
                className="text-[10px] font-black uppercase tracking-[0.4em]"
                style={{ color: "var(--lavender-purple)" }}
              >
                {t("Atelier", "Atelier")}
              </h4>
              <div className="space-y-2 text-[11px] font-bold uppercase tracking-widest text-white/70 leading-loose">
                <p>Calea Dorobanți 123, RO</p>
                <p
                  className="font-black"
                  style={{ color: "var(--mauve-magic)" }}
                >
                  hello@linea-boutique.ro
                </p>
                <div
                  className="flex items-center gap-2 lg:justify-end pt-2"
                  style={{ color: "var(--lavender-purple)" }}
                >
                  <Globe size={12} />
                  <span>Ships Worldwide</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. BOTTOM BAR */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: "var(--royal-violet)" }}
              />
              <p className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-30">
                © {new Date().getFullYear()} Linea Studio. All rights reserved.
              </p>
            </div>

            <div className="flex gap-8">
              {["Privacy", "Cookies", "ANPC"].map((item) => (
                <Link
                  key={item}
                  to="#"
                  className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
