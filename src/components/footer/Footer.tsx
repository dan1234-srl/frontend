import { useState } from "react";
import {
  ArrowRight,
  Instagram,
  Mail,
  ArrowUpRight,
  Globe,
  Loader2,
  Facebook,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- FUNCȚIA DE UTILITATE PENTRU IMAGINI ---
const getValidImageUrl = (imageSource: string | null | undefined): string => {
  if (!imageSource)
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";

  if (typeof imageSource === "string" && imageSource.startsWith("http")) {
    return imageSource;
  }

  try {
    const parsed = JSON.parse(imageSource as string);
    return parsed?.main?.large || parsed?.url || "";
  } catch {
    return (imageSource as string).startsWith("/")
      ? `${API_BASE_URL}${imageSource}`
      : (imageSource as string);
  }
};

const Footer = () => {
  const langContext = useLanguage();
  const language = langContext?.language || "ro";

  const [inputFocused, setInputFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const t = (ro: string, en: string) => (language === "en" ? en : ro);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
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
        setIsSubscribed(true);
        toast.success(
          t("Te-ai abonat cu succes!", "Subscribed successfully!"),
          {
            description: t(
              "Bun venit în comunitatea Evem.",
              "Welcome to the Evem community.",
            ),
          },
        );
      } else {
        toast.error(
          t(
            "Ceva nu a funcționat. Reîncearcă.",
            "Something went wrong. Try again.",
          ),
        );
      }
    } catch {
      toast.error(t("Eroare de rețea.", "Network error."));
    } finally {
      setLoading(false);
    }
  };

  const exploreLinks = [
    { name: t("Acasă", "Home"), path: "/" },
    { name: t("FAQ", "FAQ"), path: "/faq" },
    { name: t("Contact", "Contact Us"), path: "/contact" },
  ];

  const supportLinks = [
    { name: "Confidențialitate", path: "/privacy-policy" },
    { name: t("Politica Cookies", "Cookie Policy"), path: "/cookie-policy" },
    { name: t("Politica de Retur", "Returns"), path: "/return-policy" },
    {
      name: t("Termeni & Condiții", "Terms & Conditions"),
      path: "/terms-of-service",
    },
  ];

  const legalLinks = [
    { name: "ANPC", path: "https://anpc.ro/ce-este-sal/", external: true },
    { name: "SOL", path: "https://ec.europa.eu/consumers/odr", external: true },
  ];

  const socialLinks = [
    {
      id: "ig",
      Icon: Instagram,
      href: "https://www.instagram.com/evem.ro?igsh=NGE5aTN2dWVvanho",
      label: "Instagram",
    },
    {
      id: "fb",
      Icon: Facebook,
      href: "https://www.facebook.com/people/Evemro/100069947145940/",
      label: "Facebook",
    },
    {
      id: "mail",
      Icon: Mail,
      href: "mailto:daniel.tufan@consultant.com",
      label: "Email",
    },
  ];

  // Variante de animație Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <footer className="w-full mt-32 relative bg-transparent selection:bg-white selection:text-[var(--dark-amethyst)]">
      {/* ── 1. NEWSLETTER (Floating Glass Pill) ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-30 mb-[-4.5rem]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-full border border-white/60 p-6 md:p-8 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12"
        >
          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Sparkles size={12} className="text-[var(--royal-violet)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                Exclusive Updates
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--dark-amethyst)]">
              {isSubscribed
                ? t("Mulțumim pentru încredere.", "Thank you for joining.")
                : t("Fii cu un pas înainte.", "Stay ahead of the curve.")}
            </h2>
          </div>

          <div className="w-full md:w-auto md:min-w-[400px]">
            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleNewsletterSubmit}
                  className="relative flex items-center w-full"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={t(
                      "Introdu adresa ta de email...",
                      "Enter your email address...",
                    )}
                    className="w-full h-14 bg-zinc-100/50 border border-transparent rounded-full pl-6 pr-16 text-sm font-medium outline-none transition-all duration-300 text-[var(--dark-amethyst)] focus:bg-white focus:border-[var(--royal-violet)]/30 focus:shadow-[0_0_0_4px_rgba(123,44,191,0.05)] placeholder:text-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 size-10 rounded-full text-white flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ArrowRight size={16} strokeWidth={2.5} />
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 h-14 rounded-full bg-emerald-50 border border-emerald-100 px-6 text-emerald-700 font-bold text-xs uppercase tracking-widest w-full"
                >
                  <span className="flex items-center justify-center size-5 rounded-full bg-emerald-500 text-white">
                    ✓
                  </span>
                  {t("Abonare Reușită", "Successfully Subscribed")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── 2. THE DEEP FOOTER BASE ── */}
      <div
        className="relative z-10 pt-36 pb-8 px-6 md:px-12 rounded-t-[3rem] sm:rounded-t-[5vw] overflow-hidden"
        style={{ background: "var(--primary-gradient)" }}
      >
        {/* Ambient Glowing Orbs */}
        <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-color-dodge overflow-hidden">
          <div className="absolute -top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] bg-[var(--royal-violet)] opacity-60" />
          <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] bg-[var(--mauve-magic)] opacity-40" />
        </div>

        {/* Massive Background Typography Watermark */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none flex justify-center translate-y-1/4 opacity-[0.03]">
          <span className="text-[25vw] font-black tracking-tighter leading-none text-white whitespace-nowrap select-none">
            EVEM
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-[1400px] mx-auto relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
            {/* ── BRAND MANIFESTO ── */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 flex flex-col items-start text-left"
            >
              <Link
                to="/"
                className="mb-8 block transition-transform hover:scale-105 origin-left"
              >
                <img
                  src="/Copilot_20260512_191942.png"
                  alt="Evem"
                  className="h-8 w-auto brightness-0 invert opacity-95"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getValidImageUrl(null);
                  }}
                />
              </Link>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm font-medium tracking-wide mb-8">
                {t(
                  "Ecosistem digital integrat. Produse selectate inteligent, livrate într-o experiență modernă și impecabilă.",
                  "Fully integrated digital architecture. A seamless experience joining contemporary design and technology.",
                )}
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ id, Icon, href, label }) => (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group relative size-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-white/30 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <Icon
                      size={16}
                      strokeWidth={2}
                      className="relative z-10 text-white/70 group-hover:text-white transition-colors"
                    />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* ── LINKS GRID ── */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-5 grid grid-cols-2 gap-8 text-left"
            >
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                  {t("Navigare", "Explore")}
                </h4>
                <ul className="flex flex-col gap-4 text-sm font-medium text-white/70">
                  {exploreLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="group flex items-center gap-2 hover:text-white transition-colors w-max"
                      >
                        {link.name}
                        <ArrowUpRight
                          size={12}
                          className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-[var(--mauve-magic)]"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                  {t("Legalitate", "Legal")}
                </h4>
                <ul className="flex flex-col gap-4 text-sm font-medium text-white/70">
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="hover:text-white transition-colors block w-max relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* ── CONTACT HUB ── */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 space-y-6 lg:text-right text-left"
            >
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                {t("Contact", "Hub")}
              </h4>
              <div className="space-y-4 text-sm font-medium text-white/80">
                <div>
                  <p className="text-white font-bold mb-1">
                    Tufan Logistic Expert SRL
                  </p>
                  <p className="text-xs text-white/50">
                    CUI: RO51574431 <br /> Reg. Com.: J2025024172009
                  </p>
                </div>
                <p className="text-white/60">
                  Prelungirea Ghencea 124D,
                  <br /> Sector 6, București
                </p>
                <div className="pt-2 flex flex-col lg:items-end gap-1">
                  <a
                    href="mailto:daniel.tufan@consultant.com"
                    className="text-white hover:text-[var(--mauve-magic)] transition-colors inline-flex items-center gap-2"
                  >
                    <Mail size={12} className="opacity-50" />{" "}
                    daniel.tufan@consultant.com
                  </a>
                  <p className="text-white/60 text-xs">+40 735 928 664</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── LOWER META BAR ── */}
          <motion.div
            variants={itemVariants}
            className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <Globe size={10} className="text-white/50" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
                  RO
                </span>
              </div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                © {new Date().getFullYear()} EVEM.{" "}
                {t("Toate drepturile rezervate.", "All rights reserved.")}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
