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
  Check,
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
   FILTER DRAWER — standalone, montat în Navbar ca ShoppingBag
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
        <div className="fixed inset-0 z-[700] flex justify-end">
          {/* Backdrop blur */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeFilters}
            className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="filter-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[440px] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <header className="flex items-start justify-between px-8 pt-8 pb-7 border-b border-zinc-100 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-1 rounded-full bg-[var(--royal-violet)]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.45em] text-[var(--royal-violet)]">
                    Selection
                  </p>
                </div>
                <p className="heading-serif text-[2rem] leading-none tracking-tighter text-[var(--dark-amethyst)]">
                  Filtrare
                </p>
                <p className="text-[10px] font-medium text-zinc-400 tracking-wide">
                  Rafinează portofoliul de produse
                </p>
              </div>
              <button
                onClick={closeFilters}
                aria-label="Închide filtrele"
                className="mt-1 h-9 w-9 flex items-center justify-center rounded-full border border-zinc-100 text-zinc-400 hover:bg-[var(--dark-amethyst)] hover:text-white hover:border-transparent transition-all duration-200"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </header>

            {/* Decorative accent line */}
            <div
              className="h-[2px] w-full shrink-0"
              style={{ background: "var(--primary-gradient)" }}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto luxury-scrollbar">
              {filtersData &&
              filtersData.brands !== undefined &&
              filtersData.attributes !== undefined ? (
                <div className="px-6 py-6">
                  <FilterSidebar filtersData={filtersData} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-32">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-[var(--royal-violet)]"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-[var(--royal-violet)]/5 animate-ping" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                    Se încarcă parametrii...
                  </span>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 px-6 pb-8 pt-5 border-t border-zinc-100 bg-white space-y-3">
              {/* Active filters hint */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <SlidersHorizontal
                  size={11}
                  className="text-[var(--royal-violet)]"
                />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  Selectează parametrii și aplică
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onReset?.();
                  }}
                  className="group relative h-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-800 transition-all duration-300 text-[var(--dark-amethyst)]"
                >
                  <span className="absolute inset-0 bg-zinc-950 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <RotateCcw
                    size={11}
                    className="relative z-10 group-hover:text-white transition-colors duration-300"
                  />
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    Resetare
                  </span>
                </button>
                <button
                  onClick={closeFilters}
                  className="group relative h-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] rounded-xl overflow-hidden text-white shadow-lg shadow-indigo-900/20 active:scale-[0.98] transition-transform duration-150"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Check size={12} strokeWidth={3} className="relative z-10" />
                  <span className="relative z-10">Aplică Filtrele</span>
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

        // Mapăm culorile din modelul de backend pe variabilele CSS
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
