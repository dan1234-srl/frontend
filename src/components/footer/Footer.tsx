import { useEffect } from "react";
import { ArrowRight, Instagram, Mail, ArrowUpRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

// --- FUNCȚIA DE UTILITATE PENTRU IMAGINI ---
// Plasată în afara componentei pentru a fi disponibilă fără erori de referință
const getValidImageUrl = (imageSource: string | null | undefined): string => {
  if (!imageSource)
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";

  if (typeof imageSource === "string" && imageSource.startsWith("http")) {
    return imageSource;
  }

  try {
    // Verificăm dacă este un string JSON (format specific bazei tale de date)
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

  const t = (ro: string, en: string) => (language === "en" ? en : ro);

  // Preia și aplică tema activă independent, util dacă Navbar-ul nu este randat
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
    <footer className="w-full mt-20 relative overflow-hidden bg-[var(--background)]">
      {/* 1. NEWSLETTER SECTION */}
      <div className="bg-white pt-20 pb-24 md:pb-32 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl text-center md:text-left space-y-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--royal-violet)]">
              Evem Journal
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
              className="w-full bg-transparent border-b-2 border-zinc-100 py-4 pr-12 text-sm md:text-base outline-none focus:border-[var(--royal-violet)] transition-all duration-500 placeholder:text-zinc-300 font-medium text-zinc-900"
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

      {/* 2. CURVE */}
      <div
        className="relative h-16 md:h-24 w-full bg-white"
        style={{ color: "var(--dark-amethyst)" }}
      >
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      {/* 3. MAIN FOOTER */}
      <div
        className="text-white pt-12 pb-10 px-6"
        style={{ backgroundColor: "var(--dark-amethyst)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
            {/* BRAND BOX */}
            <div className="lg:col-span-4 space-y-8">
              <Link to="/" className="inline-block group">
                <img
                  src="/Copilot_20260512_191942.png"
                  alt="Evem Luxury"
                  className="h-10 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    // Fallback în cazul în care imaginea custom nu se încarcă
                    (e.target as HTMLImageElement).src = getValidImageUrl(null);
                  }}
                />
              </Link>
              <p className="text-[11px] opacity-40 leading-relaxed max-w-xs font-bold uppercase tracking-widest">
                {t(
                  "Atelier de creație unde viziunea atemporală întâlnește materia nobilă.",
                  "Creative atelier where timeless vision meets noble matter.",
                )}
              </p>
              <div className="flex gap-4">
                {socialLinks.map(({ id, Icon, href, label }) => (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="size-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-500"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            {/* LINKS BOX 1 */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4
                  className="text-[10px] font-black uppercase tracking-[0.4em]"
                  style={{ color: "var(--lavender-purple)" }}
                >
                  {t("Categorii", "Categories")}
                </h4>
                <ul className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-widest text-white/50">
                  {collectionLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {link.name}
                        <ArrowUpRight
                          size={10}
                          className="opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"
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
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* LINKS BOX 2 */}
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
                  hello@evem-boutique.ro
                </p>
                <div
                  className="flex items-center gap-2 lg:justify-end pt-2"
                  style={{ color: "var(--lavender-purple)" }}
                >
                  <Globe size={12} /> <span>Ships Worldwide</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: "var(--royal-violet)" }}
              />
              <p className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-30">
                © {new Date().getFullYear()} Evem Studio. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              {legalLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.name}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity"
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
