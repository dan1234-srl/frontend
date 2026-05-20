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
   FILTER DRAWER — Standalone Panel
───────────────────────────────────────────────────────────── */
const FilterDrawer = () => {
  const { filtersOpen, filtersData, closeFilters, onReset } = useFilters();

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
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeFilters}
            className="absolute inset-0 bg-zinc-950/30 backdrop-blur-md"
          />

          <motion.div
            key="filter-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[440px] flex-col bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between px-8 pt-8 pb-7 border-b border-zinc-100 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--primary-gradient)" }}
                  />
                  <p
                    className="text-[9px] font-black uppercase tracking-[0.45em]"
                    style={{ color: "var(--royal-violet)" }}
                  >
                    Selection
                  </p>
                </div>
                <p className="heading-serif text-[2rem] leading-none tracking-tighter text-[var(--dark-amethyst)]">
                  Filtrare
                </p>
              </div>
              <button
                onClick={closeFilters}
                aria-label="Închide filtrele"
                className="mt-1 h-9 w-9 flex items-center justify-center rounded-full border border-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-transparent transition-all duration-200"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </header>

            <div
              className="h-[2px] w-full shrink-0"
              style={{ background: "var(--primary-gradient)" }}
            />

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
                        size={18}
                        className="animate-spin"
                        style={{ color: "var(--royal-violet)" }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                    Se încarcă parametrii...
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0 px-6 pb-8 pt-5 border-t border-zinc-100 bg-white space-y-3">
              <div className="flex items-center gap-2 px-1 mb-1">
                <SlidersHorizontal
                  size={11}
                  style={{ color: "var(--royal-violet)" }}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  Selectează parametrii și aplică
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onReset?.()}
                  className="group relative h-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-900 transition-all duration-300 text-[var(--dark-amethyst)]"
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
                  className="group relative h-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] rounded-xl overflow-hidden text-white shadow-lg active:scale-[0.98] transition-transform duration-150"
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
   NAVBAR PRINCIPAL (Floating Architectural Island)
───────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Transformări fluide pentru efectul de insulă plutitoare la scroll
  const navPadding = useTransform(
    scrollY,
    [0, 50],
    ["1.5rem 2.5rem", "0.6rem 1.5rem"],
  );
  const navWidth = useTransform(scrollY, [0, 50], ["100%", "92%"]);
  const navTop = useTransform(scrollY, [0, 50], ["0rem", "1.2rem"]);
  const navRadius = useTransform(scrollY, [0, 50], ["0rem", "2rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.85)"],
  );
  const navShadow = useTransform(
    scrollY,
    [0, 50],
    [
      "0 1px 0 0 rgba(0,0,0,0.03)",
      "0 20px 40px -15px rgba(16, 0, 43, 0.08), 0 0 0 1px rgba(16, 0, 43, 0.02)",
    ],
  );

  // Fetch Active Theme
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

  // Fetch Vouchers
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/vouchers/active-ticker`)
      .then((res) => res.json())
      .then(setVouchers)
      .catch(() => {});
  }, []);

  // Click Outside Closure
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
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col items-center w-full pointer-events-none">
        {/* CONTAINER INSULĂ FLUIDĂ */}
        <motion.nav
          style={{
            padding: navPadding,
            width: navWidth,
            top: navTop,
            borderRadius: navRadius,
            backgroundColor: navBg,
            boxShadow: navShadow,
          }}
          className="relative flex w-full items-center justify-between pointer-events-auto backdrop-blur-xl border border-white/40 transition-all duration-300 ease-out transform-gpu"
        >
          {/* BACKGROUND PATTERN (Micro dot grid architectural overlay) */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none rounded-[inherit]" />

          {/* LEFT — INTUITIVE SEARCH CAPSULE */}
          <div className="flex flex-1 items-center justify-start">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-3 bg-zinc-50/60 border border-zinc-200/40 rounded-xl py-2.5 px-5 group hover:bg-zinc-900/5 transition-all duration-300"
            >
              <Search
                size={13}
                className="text-zinc-400 group-hover:text-zinc-900 transition-colors"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors">
                Caută în colecție
              </span>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <Search size={18} className="text-zinc-900" />
            </button>
          </div>

          {/* CENTER — LOGO ARCHETYPE */}
          <div className="flex-shrink-0 flex items-center justify-center px-4">
            <Link to="/" className="group relative">
              <motion.img
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                src="/Copilot_20260512_191942.png"
                alt="Evem Luxury"
                className="h-6 sm:h-7 lg:h-8.5 w-auto object-contain transition-all"
              />
            </Link>
          </div>

          {/* RIGHT — STRUCTURAL ACTIONS MATRIX */}
          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3 relative">
            {/* Wishlist Icon with Concentric Ring Interface */}
            <motion.button
              whileHover={{ y: -1.5 }}
              onClick={() => setWishOpen(true)}
              aria-label="Lista de dorințe"
              className="flex items-center justify-center h-10 w-10 rounded-xl text-zinc-700 hover:text-red-500 hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100"
            >
              <Heart size={18} />
            </motion.button>

            {/* Account Contextual Panel */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ y: -1.5 }}
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                aria-label="Contul meu"
                className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all border ${
                  userMenuOpen
                    ? "bg-zinc-900 text-white border-transparent"
                    : "hover:bg-zinc-50 text-zinc-700 border-transparent hover:border-zinc-100"
                }`}
              >
                <User size={18} />
              </motion.button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ type: "spring", damping: 24, stiffness: 350 }}
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-zinc-100 bg-white/95 backdrop-blur-xl shadow-2xl p-2 z-50"
                  >
                    <div className="bg-zinc-50/80 p-4 rounded-xl mb-1 border border-zinc-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
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
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <ShieldCheck size={15} className="text-emerald-500" />{" "}
                        Administrare
                      </Link>
                    )}
                    <Link
                      to="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Package size={15} /> Comenzile mele
                    </Link>
                    <Link
                      to="/account/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <MapPin size={15} /> Adresele mele
                    </Link>
                    <Link
                      to="/account/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Settings size={15} /> Setări cont
                    </Link>
                    <div className="h-px bg-zinc-100 my-1.5 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Ieșire
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Bag Monolith Badge */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setBagOpen(true)}
              aria-label="Coș de cumpărături"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg active:scale-98"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={16} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-zinc-950 text-[9px] font-black text-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        {/* INTEGRATED VOUCHERS TICKER (Flowing directly below the matrix) */}
        <div className="w-full max-w-[1400px] px-6 mt-2 pointer-events-auto">
          <AnimatePresence>
            {vouchers.length > 0 && (
              <motion.section
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="w-full bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden shadow-xl"
              >
                <div className="flex whitespace-nowrap py-2">
                  <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                      duration: 35,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex gap-24 items-center px-8"
                  >
                    {[...vouchers, ...vouchers].map((v, idx) => (
                      <div
                        key={`${v.id}-${idx}`}
                        className="flex items-center gap-4"
                      >
                        <span className="text-[#9bdda2] text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={10} className="text-emerald-400" />{" "}
                          {v.discount_value}
                        </span>
                        <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">
                          {v.code}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── OVERLAYS & CONTROLLERS ── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />
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
