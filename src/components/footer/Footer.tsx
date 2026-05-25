import { useEffect, useState } from "react";
import { ArrowRight, Instagram, Mail, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

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

  const t = (ro: string, en: string) => (language === "en" ? en : ro);

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
          root.style.setProperty("--text-primary", theme.text_primary);
        if (theme.surface_bg)
          root.style.setProperty("--surface-bg", theme.surface_bg);
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

  const collectionLinks = [
    { name: "Archive", path: "/category/archive" },
    { name: "New In", path: "/category/new-in" },
    { name: "Limited", path: "/category/limited" },
    { name: "Bespoke", path: "/category/bespoke" },
  ];

  const supportLinks = [
    { name: t("Ghid Mărimi", "Size Guide"), path: "/about/size-guide" },
    { name: t("Customer Care", "Customer Care"), path: "/about/customer-care" },
    { name: t("Retur", "Returns"), path: "/return-policy" },
    { name: t("Termeni", "Terms"), path: "/terms-of-service" },
  ];

  const socialLinks = [
    {
      id: "ig",
      Icon: Instagram,
      href: "https://instagram.com/evem",
      label: "Instagram",
    },
    {
      id: "mail",
      Icon: Mail,
      href: "mailto:contact@evem.ro",
      label: "Email",
    },
  ];

  const legalLinks = [
    { name: t("Confidențialitate", "Privacy"), path: "/privacy-policy" },
    { name: "Cookies", path: "/cookie-policy" },
    { name: "Retur", path: "/return-policy" },
    { name: "Termeni", path: "/terms-of-service" },
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

  return (
    <footer className="w-full mt-40 relative bg-transparent selection:bg-zinc-900 selection:text-white">
      {/* 1. HIGH-END NEWSLETTER (Minimal & Floating Above) */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-20 mb-[-4rem]">
        <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 md:p-16 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
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
              {t(
                "Rămâi în avangarda designului.",
                "Stay ahead of the design vanguard.",
              )}
            </h2>
          </div>

          <div className="lg:col-span-5 w-full flex justify-start lg:justify-end">
            <motion.form
              className="w-full max-w-md relative"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={t("Adresa ta de email", "Your email address")}
                className="w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl py-4.5 pl-6 pr-16 text-xs font-semibold outline-none transition-all duration-500 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-11 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md active:scale-95"
                style={{ background: "var(--primary-gradient)" }}
              >
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </motion.form>
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
        {/* Decorative thin structural outline mapping the asymmetric slope */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70 z-20 pointer-events-none"
          style={{
            background: "var(--primary-gradient)",
            clipPath: "polygon(0 6rem, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Ambient mesh space distortion */}
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
                  "Arhitectură digitală complet integrată. O viziune atemporală ce reunește materia nobilă a designului contemporan universal sub o singură umbrelă tehnologică.",
                  "Fully integrated digital architecture. A timeless vision joining the noble matter of global contemporary design under a single technological ecosystem.",
                )}
              </p>

              {/* Monolithic micro-brackets for icons */}
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
                  {collectionLinks.map((link) => (
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
                  {t("Asistență", "Support")}
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
                <p className="opacity-70">EVEM Boutique SRL</p>
                <p className="opacity-50 text-[10px]">
                  CUI: RO12345678 · Reg. Com.: J40/0000/2026
                </p>
                <p className="opacity-70">Calea Dorobanți 123, București</p>
                <a
                  href="mailto:contact@evem.ro"
                  className="inline-block font-bold hover:underline bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "var(--primary-gradient)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  contact@evem.ro
                </a>
                <p className="opacity-50 text-[10px]">+40 770 000 000</p>
                <div className="flex items-center gap-2 lg:justify-end pt-1 text-[10px] font-black uppercase tracking-widest opacity-40">
                  <Globe size={11} /> <span>Ships Worldwide</span>
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
                © {new Date().getFullYear()} Evem Studio. Project Zero Node.
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
