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
  Loader2,
  RotateCcw,
  ArrowRight,
  ChevronRight,
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

/* ─────────────────────────────────────────────────────────────
   FILTER DRAWER (Neo-Bento & Glassmorphism)
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
        <div className="fixed inset-0 z-[700] flex justify-end font-sans">
          {/* Backdrop cu efecte atmosferice */}
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={closeFilters}
            className="absolute inset-0 bg-zinc-900/20 overflow-hidden cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.2 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-[var(--royal-violet)] rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
              className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-[var(--mauve-magic)] rounded-full blur-[100px] pointer-events-none"
            />
          </motion.div>

          {/* Panoul principal - Rotunjit și detașat */}
          <motion.div
            key="filter-panel"
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="relative z-[701] flex h-[100dvh] w-full sm:max-w-[420px] flex-col bg-white/95 backdrop-blur-3xl shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] sm:rounded-l-[2.5rem] border-l border-white overflow-hidden"
          >
            <header className="relative flex items-center justify-between px-8 py-8 border-b border-zinc-100/50 shrink-0 bg-white/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-[var(--royal-violet)]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                    Rafinament
                  </p>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-[var(--dark-amethyst)]">
                  Filtrează
                </h2>
              </div>
              <button
                onClick={closeFilters}
                aria-label="Închide filtrele"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200/50 hover:bg-white hover:border-[var(--royal-violet)]/30 hover:text-[var(--royal-violet)] transition-all text-zinc-500 shadow-sm active:scale-95 group"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {filtersData &&
              filtersData.brands !== undefined &&
              filtersData.attributes !== undefined ? (
                <div className="px-8 py-8 pb-32">
                  <FilterSidebar filtersData={filtersData} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center z-10">
                      <Loader2
                        size={20}
                        className="animate-spin text-[var(--royal-violet)]"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-[var(--royal-violet)]/10 animate-ping" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Se procesează parametrii...
                  </span>
                </div>
              )}
            </div>

            {/* Footer flotant (Glass pill inside the drawer) */}
            <div className="absolute bottom-6 left-6 right-6 shrink-0 p-2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReset?.()}
                  className="h-12 w-14 flex items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 text-zinc-500 hover:text-zinc-900 hover:bg-white hover:border-zinc-300 transition-all shadow-sm active:scale-95"
                  title="Resetează"
                >
                  <RotateCcw size={16} strokeWidth={2} />
                </button>
                <button
                  onClick={closeFilters}
                  className="flex-1 relative h-12 w-full text-white rounded-xl overflow-hidden transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group active:scale-[0.98]"
                  style={{ background: "var(--primary-gradient)" }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <div className="relative flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-[0.25em]">
                    Aplică Filtrele
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform duration-300"
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
   NAVBAR PRINCIPAL (Floating Pill Concept)
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

  useEffect(() => {
    const openCart = () => setBagOpen(true);
    window.addEventListener("evem:open-cart", openCart);
    return () => window.removeEventListener("evem:open-cart", openCart);
  }, []);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Framer Motion transforms for the "Floating Pill" effect
  const navMaxWidth = useTransform(scrollY, [0, 60], ["100%", "1200px"]);
  const navMarginTop = useTransform(scrollY, [0, 60], ["0px", "16px"]);
  const navPadding = useTransform(
    scrollY,
    [0, 60],
    ["1.25rem", "0.75rem 1.5rem"],
  );
  const navBorderRadius = useTransform(scrollY, [0, 60], ["0px", "100px"]);
  const navBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.75)"],
  );
  const navBorder = useTransform(
    scrollY,
    [0, 60],
    ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.8)"],
  );
  const navShadow = useTransform(
    scrollY,
    [0, 60],
    [
      "0 1px 2px 0 rgba(0,0,0,0.02)",
      "0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(123,44,191,0.05)",
    ],
  );
  const navBackdrop = useTransform(
    scrollY,
    [0, 60],
    ["blur(0px)", "blur(20px)"],
  );

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
    toast.success("Sesiune încheiată cu succes.");
    setUserMenuOpen(false);
    navigate("/");
  };

  const navButtonClass =
    "flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full text-zinc-600 bg-transparent hover:bg-white hover:text-[var(--royal-violet)] hover:shadow-md border border-transparent hover:border-[var(--royal-violet)]/10 transition-all duration-300";

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col w-full pointer-events-none">
        {/* TOP BAR — PROMO (Ultra subțire și minimalist) */}
        <div
          className="z-30 flex h-8 w-full items-center justify-center px-4 text-center text-white shrink-0 shadow-sm pointer-events-auto relative overflow-hidden"
          style={{ background: "var(--primary-gradient)" }}
        >
          {/* Glass glare effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20" />
          <motion.div
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-2 relative z-10"
          >
            <Sparkles size={11} className="text-white/80" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] drop-shadow-sm">
              Standardul Evem • Eleganță & Performanță
            </p>
          </motion.div>
        </div>

        {/* NAV CONTAINER */}
        <div className="w-full flex justify-center px-4 sm:px-6 pointer-events-auto">
          <motion.nav
            style={{
              maxWidth: navMaxWidth,
              marginTop: navMarginTop,
              borderRadius: navBorderRadius,
              backgroundColor: navBg,
              boxShadow: navShadow,
              border: navBorder,
              backdropFilter: navBackdrop,
              padding: navPadding,
            }}
            className="relative flex w-full items-center justify-between transform-gpu transition-all"
          >
            {/* LEFT — SEARCH */}
            <div className="flex flex-1 items-center justify-start">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                aria-label="Caută"
                aria-hidden={searchOpen}
                tabIndex={searchOpen ? -1 : 0}
                animate={{
                  opacity: searchOpen ? 0 : 1,
                  scale: searchOpen ? 0.85 : 1,
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ pointerEvents: searchOpen ? "none" : "auto" }}
                className={`${navButtonClass} bg-zinc-100/50`}
              >
                <Search size={18} strokeWidth={2} />
              </motion.button>
            </div>

            {/* CENTER — LOGO */}
            <div className="flex-shrink-0 flex items-center justify-center px-4">
              <Link to="/" className="group relative">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  src="/Copilot_20260512_191942.png"
                  alt="Evem Luxury"
                  className="h-6 sm:h-7 lg:h-8 w-auto object-contain transition-all drop-shadow-sm"
                />
              </Link>
            </div>

            {/* RIGHT — ACTIONS */}
            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
              {/* Wishlist */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setWishOpen(true)}
                aria-label="Lista de dorințe"
                className={navButtonClass}
              >
                <Heart size={18} strokeWidth={2} />
              </motion.button>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                  }
                  aria-label="Contul meu"
                  className={`${navButtonClass} ${
                    userMenuOpen
                      ? "bg-white text-[var(--royal-violet)] shadow-md border-[var(--royal-violet)]/20"
                      : ""
                  }`}
                >
                  <User size={18} strokeWidth={2} />
                </motion.button>

                {/* Dropdown Menu (Glassmorphism Bento) */}
                <AnimatePresence>
                  {user && userMenuOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 20,
                        scale: 0.95,
                        filter: "blur(10px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: 15,
                        scale: 0.95,
                        filter: "blur(10px)",
                      }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="absolute right-0 mt-4 w-72 overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(123,44,191,0.2)] p-2 z-50"
                    >
                      <div className="bg-zinc-50/80 backdrop-blur-sm p-5 rounded-[1.5rem] mb-2 border border-zinc-100">
                        <p className="text-[9px] font-black uppercase text-[var(--royal-violet)] tracking-[0.3em] mb-1">
                          Conectat ca
                        </p>
                        <p className="truncate text-sm font-bold text-zinc-900">
                          {user.email}
                        </p>
                      </div>

                      <div className="space-y-1 p-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold hover:bg-white hover:shadow-sm transition-all"
                          >
                            <span className="flex items-center gap-3">
                              <ShieldCheck
                                size={16}
                                className="text-blue-500"
                              />
                              Panou Administrare
                            </span>
                            <ChevronRight
                              size={14}
                              className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                            />
                          </Link>
                        )}
                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold hover:bg-white hover:shadow-sm transition-all"
                        >
                          <span className="flex items-center gap-3">
                            <Package
                              size={16}
                              className="text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors"
                            />
                            Comenzile mele
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                        <Link
                          to="/account/addresses"
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold hover:bg-white hover:shadow-sm transition-all"
                        >
                          <span className="flex items-center gap-3">
                            <MapPin
                              size={16}
                              className="text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors"
                            />
                            Adresele mele
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                        <Link
                          to="/account/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold hover:bg-white hover:shadow-sm transition-all"
                        >
                          <span className="flex items-center gap-3">
                            <Settings
                              size={16}
                              className="text-zinc-400 group-hover:text-[var(--royal-violet)] transition-colors"
                            />
                            Setări cont
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent my-2" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:shadow-inner transition-all active:scale-95"
                      >
                        <LogOut size={14} strokeWidth={2.5} /> Ieșire din cont
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Bag Button (Gradient) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBagOpen(true)}
                aria-label="Coș de cumpărături"
                className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-white shadow-[0_8px_20px_-5px_rgba(123,44,191,0.4)] ml-1"
                style={{ background: "var(--primary-gradient)" }}
              >
                <BagIcon size={18} strokeWidth={2} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-[9px] font-black shadow-md"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.nav>
        </div>
      </header>

      {/* ── MODALS & OVERLAYS ── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />

      {/* FILTER DRAWER */}
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
