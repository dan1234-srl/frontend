import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag as BagIcon,
  LogOut,
  ShieldCheck,
  Heart,
  Package,
  Sparkles,
  Search,
  MapPin,
  Settings,
  X,
  SlidersHorizontal,
  Loader2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useFilters } from "@/contexts/FiltersContext";
import ShoppingBag from "../cart/ShoppingBag";
import WishlistDrawer from "../cart/WishlistDrawer";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { toast } from "sonner";
import ForgotPasswordDrawer from "@/pages/auth/ForgotPasswordDrawer";
import SearchModal from "./SearchModal";
import { FilterSidebar } from "../shop/FilterSidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

/* ─────────────────────────────────────────────────────────────
   FILTER DRAWER — Modern, Luminous Glassmorphism
───────────────────────────────────────────────────────────── */
const FilterDrawer = () => {
  const { filtersOpen, filtersData, closeFilters, onReset } = useFilters();

  // Lock scroll când drawer-ul e deschis
  useEffect(() => {
    if (filtersOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [filtersOpen]);

  return (
    <AnimatePresence>
      {filtersOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end font-sans">
          {/* Luminous Colorful Blur Backdrop */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={closeFilters}
            className="absolute inset-0 bg-white/20 backdrop-blur-2xl overflow-hidden"
          >
            {/* Ambient Colorful Orbs */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--royal-violet)] rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.12 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px] pointer-events-none"
            />
          </motion.div>

          {/* Filter Panel (Micuț și elegant) */}
          <motion.div
            key="filter-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[400px] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-6 border-b border-zinc-100 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--primary-gradient)" }}
                  />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Selecția ta
                  </p>
                </div>
                <h2 className="heading-serif text-2xl tracking-tighter text-[var(--dark-amethyst)]">
                  Filtrare Produse
                </h2>
              </div>
              <button
                onClick={closeFilters}
                aria-label="Închide filtrele"
                className="h-9 w-9 flex items-center justify-center rounded-full border border-zinc-100 hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900 group"
              >
                <X
                  size={16}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filtersData &&
              filtersData.brands !== undefined &&
              filtersData.attributes !== undefined ? (
                <div className="px-6 py-6">
                  <FilterSidebar filtersData={filtersData} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center z-10">
                      <Loader2
                        size={20}
                        className="animate-spin text-[var(--royal-violet)]"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-[var(--royal-violet)]/10 animate-ping" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Se procesează parametrii...
                  </span>
                </div>
              )}
            </div>

            {/* Footer CTA - Design Modern */}
            <div className="shrink-0 px-6 py-6 border-t border-zinc-100 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onReset?.()}
                  className="h-14 px-6 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={closeFilters}
                  className="flex-1 relative h-14 w-full text-white rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group active:scale-[0.98]"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <div className="relative flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em]">
                    Aplică Filtrele
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1.5 transition-transform duration-300"
                    />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────
   NAVBAR PRINCIPAL
───────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5.5rem", "4.5rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.98)"],
  );
  const navShadow = useTransform(
    scrollY,
    [0, 50],
    [
      "0 1px 0 0 rgba(0,0,0,0.06)",
      "0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 0 0 rgba(0,0,0,0.04)",
    ],
  );

  // Fetch Theme Variables
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
          "Could not load dynamic theme, falling back to CSS defaults:",
          err,
        );
      });
  }, []);

  // Închide user menu la click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesiune încheiată.");
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col w-full bg-white">
        {/* TOP BAR — PROMO */}
        <div
          className="z-30 flex h-8 w-full items-center justify-center px-4 text-center text-white shrink-0"
          style={{ background: "var(--primary-gradient)" }}
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <Sparkles size={10} className="text-cyan-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
              Design Premium — Calitate Impecabilă
            </p>
          </motion.div>
        </div>

        {/* NAV */}
        <motion.nav
          style={{
            height: navHeight,
            backgroundColor: navBg,
            boxShadow: navShadow,
          }}
          className="relative flex w-full items-center justify-between px-4 sm:px-6 lg:px-12 transform-gpu"
        >
          {/* LEFT — SEARCH */}
          <div className="flex flex-1 items-center justify-start">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full py-2 px-5 group hover:bg-zinc-100 transition-all duration-300"
            >
              <Search
                size={15}
                className="text-zinc-400 group-hover:text-black transition-colors"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-black transition-colors">
                Caută în colecție
              </span>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-zinc-50 transition-colors"
            >
              <Search size={20} className="text-black" />
            </button>
          </div>

          {/* CENTER — LOGO */}
          <div className="flex-shrink-0 flex items-center justify-center px-4">
            <Link to="/" className="group">
              <motion.img
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                src="/Copilot_20260512_191942.png"
                alt="Evem Luxury"
                className="h-6 sm:h-7 lg:h-9 w-auto object-contain transition-all"
              />
            </Link>
          </div>

          {/* RIGHT — ACTIONS */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 lg:gap-4">
            {/* Wishlist */}
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setWishOpen(true)}
              aria-label="Lista de dorințe"
              className="flex items-center justify-center h-10 w-10 rounded-full text-zinc-700 hover:text-red-500 hover:bg-zinc-50 transition-all"
            >
              <Heart size={20} />
            </motion.button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                aria-label="Contul meu"
                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                  userMenuOpen
                    ? "bg-zinc-100"
                    : "hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <User size={20} />
              </motion.button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute right-0 mt-4 w-64 overflow-hidden rounded-[1.2rem] border border-zinc-100 bg-white shadow-2xl p-2 z-50"
                  >
                    <div className="bg-zinc-50 p-4 rounded-xl mb-1">
                      <p className="text-[9px] font-black uppercase text-[var(--french-blue)] tracking-widest">
                        Contul tău
                      </p>
                      <p className="truncate text-xs font-bold text-zinc-900 mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <ShieldCheck size={16} className="text-blue-600" />
                        Administrare
                      </Link>
                    )}
                    <Link
                      to="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                    >
                      <Package size={16} /> Comenzile mele
                    </Link>
                    <Link
                      to="/account/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                    >
                      <MapPin size={16} /> Adresele mele
                    </Link>
                    <Link
                      to="/account/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                    >
                      <Settings size={16} /> Setări cont
                    </Link>
                    <div className="h-px bg-zinc-100 my-1 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Ieșire
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBagOpen(true)}
              aria-label="Coș de cumpărături"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={18} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[9px] font-black"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </header>

      {/* ── MODALS & OVERLAYS ── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />

      {/* FILTER DRAWER — montat global în Navbar, citește din FiltersContext */}
      <FilterDrawer />

      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setTimeout(() => setRegisterOpen(true), 150);
        }}
        onOpenForgot={() => {
          setLoginOpen(false);
          setTimeout(() => setForgotOpen(true), 150);
        }}
      />
      <Register
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setTimeout(() => setLoginOpen(true), 150);
        }}
      />
      <ForgotPasswordDrawer
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);
          setTimeout(() => setLoginOpen(true), 150);
        }}
      />
    </>
  );
};

export default Navbar;
