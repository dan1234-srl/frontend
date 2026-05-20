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
    { name: t("Ghid Mărimi", "Size Guide"), path: "/size-guide" },
    { name: t("Livrare", "Shipping"), path: "/shipping" },
    { name: t("Retur", "Returns"), path: "/returns" },
    { name: t("Termeni", "Terms"), path: "/terms" },
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
      href: "mailto:hello@evem-boutique.ro",
      label: "Email",
    },
  ];

  const legalLinks = [
    { name: "Privacy", path: "/privacy" },
    { name: "Cookies", path: "/cookies" },
    { name: "ANPC", path: "https://anpc.ro", external: true },
  ];

  return (
    <footer className="w-full mt-32 relative overflow-hidden bg-white selection:bg-zinc-900 selection:text-white">
      {/* 1. HIGH-END NEWSLETTER (Minimal & Architectural) */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-24 border-b border-zinc-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                Newsletter Collective
              </span>
            </div>
            <h2 className="heading-serif text-4xl md:text-6xl font-medium tracking-tighter text-zinc-900 leading-[0.95]">
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
                className="w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl py-5 pl-6 pr-16 text-sm outline-none transition-all duration-500 font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-11 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md active:scale-95"
                style={{ background: "var(--primary-gradient)" }}
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              {inputFocused && (
                <motion.div
                  layoutId="input-glow"
                  className="absolute -inset-px rounded-2xl pointer-events-none border border-zinc-900 z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.form>
          </div>
        </div>
      </div>

      {/* 2. THE CHASM (Premium Architectural Split Line) */}
      <div
        className="h-2 w-full opacity-60"
        style={{ background: "var(--primary-gradient)" }}
      />

      {/* 3. CORE DEEP FOOTER */}
      <div
        className="text-white pt-24 pb-12 px-6 md:px-12 relative z-10"
        style={{ backgroundColor: "var(--dark-amethyst)" }}
      >
        {/* Subtle mesh background distortion for immersive atmosphere */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen overflow-hidden">
          <div
            className="absolute -top-40 -right-40 size-[500px] rounded-full blur-[140px]"
            style={{ background: "var(--royal-violet)" }}
          />
          <div
            className="absolute -bottom-40 -left-40 size-[500px] rounded-full blur-[140px]"
            style={{ background: "var(--lavender-purple)" }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-28">
            {/* BRANDING LOGO & MANIFESTO */}
            <div className="lg:col-span-5 space-y-8">
              <Link to="/" className="inline-block group">
                <motion.img
                  whileHover={{ scale: 1.01 }}
                  src="/Copilot_20260512_191942.png"
                  alt="Evem Luxury"
                  className="h-8 w-auto brightness-0 invert opacity-90 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getValidImageUrl(null);
                  }}
                />
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm font-medium tracking-wide">
                {t(
                  "Platformă digitală unde viziunea atemporală întâlnește arhitectura codului și materia nobilă a designului global.",
                  "Digital platform where timeless vision meets code architecture and the noble matter of global design.",
                )}
              </p>

              {/* Ultra modern micro-borders for icons */}
              <div className="flex gap-3">
                {socialLinks.map(({ id, Icon, href, label }) => (
                  <motion.a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{
                      y: -3,
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                    className="size-11 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white backdrop-blur-md transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* NAVIGATION LINK MATRICES */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] block opacity-40">
                  {t("Navigare", "Explore")}
                </span>
                <ul className="flex flex-col gap-3.5 text-xs font-semibold tracking-wide text-white/60">
                  {collectionLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="hover:text-white transition-colors flex items-center gap-1 group w-max"
                      >
                        {link.name}
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] block opacity-40">
                  {t("Asistență", "Support")}
                </span>
                <ul className="flex flex-col gap-3.5 text-xs font-semibold tracking-wide text-white/60">
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

            {/* THE STUDIO CONTACT INFO */}
            <div className="lg:col-span-3 space-y-6 lg:text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] block opacity-40">
                {t("Contact", "Hub")}
              </span>
              <div className="space-y-3 text-xs font-medium tracking-wide text-white/70 leading-relaxed">
                <p className="opacity-80">Calea Dorobanți 123, RO</p>
                <a
                  href="mailto:hello@evem-boutique.ro"
                  className="block font-bold hover:underline bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
                  style={{
                    backgroundImage: "var(--primary-gradient)",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  hello@evem-boutique.ro
                </a>
                <div className="flex items-center gap-2 lg:justify-end pt-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
                  <Globe size={12} className="opacity-70" />{" "}
                  <span>Ships Worldwide</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER META BAR (Copyright & Legals) */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-3">
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--primary-gradient)" }}
              />
              <p className="text-[10px] font-medium tracking-wider text-white/40 uppercase">
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
                    className="text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-white/80 transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-white/80 transition-colors"
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
