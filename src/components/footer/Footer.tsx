import { useEffect, useState } from "react";
import {
  ArrowRight,
  Instagram,
  Mail,
  ArrowUpRight,
  Globe,
  Loader2,
  Facebook,
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

  // State-uri pentru Newsletter
  const [inputFocused, setInputFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const t = (ro: string, en: string) => (language === "en" ? en : ro);

  // Funcția de abonare
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

  // Preia și aplică tema activă independent
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/themes/active`)
      .then((res) => {
        if (!res.ok) throw new Error("Theme fetch failed");
        return res.json();
      })
      .then((theme) => {
        if (!theme) return;
        const root = document.documentElement;

        if (theme.dark_amethyst)
          root.style.setProperty("--dark-amethyst", theme.dark_amethyst);
        if (theme.dark_amethyst_2)
          root.style.setProperty("--dark-amethyst-2", theme.dark_amethyst_2);
        if (theme.indigo_ink)
          root.style.setProperty("--indigo-ink", theme.indigo_ink);
        if (theme.indigo_velvet)
          root.style.setProperty("--indigo-velvet", theme.indigo_velvet);
        if (theme.royal_violet)
          root.style.setProperty("--royal-violet", theme.royal_violet);
        if (theme.lavender_purple)
          root.style.setProperty("--lavender-purple", theme.lavender_purple);
        if (theme.mauve_magic)
          root.style.setProperty("--mauve-magic", theme.mauve_magic);
        if (theme.mauve) root.style.setProperty("--mauve", theme.mauve);
        if (theme.text_primary)
          root.style.setProperty("--text_primary", theme.text_primary);
        if (theme.surface_bg)
          root.style.setProperty("--surface_bg", theme.surface_bg);
        if (theme.primary_gradient)
          root.style.setProperty("--primary-gradient", theme.primary_gradient);
      })
      .catch((err) => {
        console.warn(
          "Could not load dynamic theme in Footer, falling back to CSS defaults:",
          err,
        );
      });
  }, []);

  // --- SECȚIUNI NAVIGARE ACTUALIZATE ---
  const exploreLinks = [
    { name: t("Acasă", "Home"), path: "/" },
    { name: t("FAQ", "FAQ"), path: "/faq" },
    { name: t("Contact", "Contact Us"), path: "/contact" },
  ];

  const supportLinks = [
    { name: "Confidențialitate", path: "/confidentialitate" },
    { name: t("Politica Cookies", "Cookie Policy"), path: "/cookie-policy" },
    { name: t("Politica de Retur", "Returns"), path: "/return-policy" },
    {
      name: t("Termeni & Condiții", "Terms & Conditions"),
      path: "/terms-of-service",
    },
  ];

  const legalLinks = [
    {
      name: "ANPC",
      path: "https://anpc.ro/ce-este-sal/",
      external: true,
    },
    {
      name: "SOL",
      path: "https://ec.europa.eu/consumers/odr",
      external: true,
    },
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

  return (
    <footer className="w-full mt-8 relative bg-transparent selection:bg-zinc-900 selection:text-white">
      {/* 1. HIGH-END NEWSLETTER (Minimal & Floating Above) */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-20 mb-[-4rem]">
        <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 md:p-16 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--royal-violet)] opacity-[0.03] rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-[2px]"
                  style={{ background: "var(--primary-gradient)" }}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                  Newsletter Collective
                </span>
              </div>
              <h2 className="heading-serif text-3xl md:text-5xl font-medium tracking-tighter text-zinc-900 leading-[1.05]">
                {isSubscribed
                  ? t("Mulțumim pentru încredere.", "Thank you for joining.")
                  : t(
                      "Rămâi în avangarda designului.",
                      "Stay ahead of the design vanguard.",
                    )}
              </h2>
            </div>

            <div className="lg:col-span-5 w-full flex justify-start lg:justify-end">
              <AnimatePresence mode="wait">
                {!isSubscribed ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md relative"
                    onSubmit={handleNewsletterSubmit}
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      placeholder={t(
                        "Adresa ta de email",
                        "Your email address",
                      )}
                      className="w-full h-14 bg-zinc-50 border border-zinc-200/60 rounded-2xl pl-6 pr-16 text-xs font-semibold outline-none transition-all duration-500 text-zinc-900 focus:bg-white focus:border-[var(--royal-violet)] focus:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-10 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 hover:brightness-110"
                      style={{ background: "var(--primary-gradient)" }}
                    >
                      {loading ? (
                        <Loader2
                          className="animate-spin text-white"
                          size={15}
                        />
                      ) : (
                        <ArrowRight size={15} strokeWidth={2.5} />
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className="flex items-center gap-3 text-zinc-900 font-bold text-xs uppercase tracking-widest p-4 px-6 border border-zinc-100 rounded-2xl bg-zinc-50/80 backdrop-blur-sm shadow-sm w-full max-w-md lg:w-max"
                  >
                    <span className="flex items-center justify-center size-6 rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>
                    {t("Te-ai abonat cu succes!", "Successfully subscribed!")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE GEOMETRIC CHASM & MAIN INTERIOR */}
      <div
        className="pt-36 pb-12 px-6 md:px-12 relative z-10"
        style={{
          backgroundColor: "var(--dark-amethyst)",
          clipPath: "polygon(0 6rem, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70 z-20 pointer-events-none"
          style={{
            background: "var(--primary-gradient)",
            clipPath: "polygon(0 6rem, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-screen overflow-hidden">
          <div
            className="absolute -top-20 right-10 size-[600px] rounded-full blur-[150px]"
            style={{ background: "var(--royal-violet)" }}
          />
          <div
            className="absolute bottom-0 left-10 size-[450px] rounded-full blur-[130px]"
            style={{ background: "var(--lavender-purple)" }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-24">
            {/* BRAND MANIFESTO BRAND BOX */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <Link to="/" className="inline-block group">
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src="/Copilot_20260512_191942.png"
                  alt="Evem Luxury"
                  className="h-7 w-auto brightness-0 invert opacity-90 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getValidImageUrl(null);
                  }}
                />
              </Link>
              <p className="text-xs text-white/40 leading-relaxed max-w-sm font-medium tracking-wide">
                {t(
                  "Tot ce ai nevoie, într-un singur loc. Produse selectate inteligent, livrate într-o experiență simplă, rapidă și modernă.",
                  "Fully integrated digital architecture. A timeless vision joining the noble matter of global contemporary design under a single technological ecosystem.",
                )}
              </p>

              <div className="flex gap-2.5">
                {socialLinks.map(({ id, Icon, href, label }) => (
                  <motion.a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{
                      y: -3,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                    className="size-10 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white backdrop-blur-xl transition-all duration-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <Icon size={15} strokeWidth={2.5} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* NAVIGATION LINKS CONTAINER */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] block opacity-30 text-white">
                  {t("Navigare", "Explore")}
                </span>
                <ul className="flex flex-col gap-3 text-xs font-semibold tracking-wide text-white/50">
                  {exploreLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="hover:text-white transition-colors flex items-center gap-1 group w-max"
                      >
                        {link.name}
                        <ArrowUpRight
                          size={10}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out text-white/80"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] block opacity-30 text-white">
                  {t("Legalitate", "Legal")}
                </span>
                <ul className="flex flex-col gap-3 text-xs font-semibold tracking-wide text-white/50">
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="hover:text-white transition-colors block w-max"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* METROPOLITAN STUDIO HUB */}
            <div className="lg:col-span-3 space-y-5 lg:text-right text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] block opacity-30 text-white">
                {t("Contact", "Hub")}
              </span>
              <div className="space-y-3 text-xs font-semibold tracking-wide text-white/60 leading-relaxed">
                <p className="opacity-70">Tufan Logistic Expert SRL</p>
                <p className="opacity-50 text-[10px]">
                  CUI: RO51574431 · Reg. Com.: J2025024172009
                </p>
                <p className="opacity-70">
                  Prelungirea Ghencea 124D, Sector 6, București
                </p>
                <a
                  href="mailto:daniel.tufan@consultant.com"
                  className="inline-block font-bold hover:underline bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "var(--primary-gradient)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  daniel.tufan@consultant.com
                </a>
                <p className="opacity-50 text-[10px]">+40 735 928 664</p>
                <div className="flex items-center gap-2 lg:justify-end pt-1 text-[10px] font-black uppercase tracking-widest opacity-40">
                  <Globe size={11} /> <span>România</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER META BAR (Isomorphic Floating Card Layout) */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--primary-gradient)" }}
              />
              <p className="text-[9px] font-bold tracking-widest text-white/30 uppercase">
                © {new Date().getFullYear()} Tufan Logistic Expert SRL.{" "}
                {t("Toate drepturile rezervate.", "All rights reserved.")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {legalLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.name}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-white/70 transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-white/70 transition-colors"
                  >
                    {link.name}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
