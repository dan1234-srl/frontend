import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  ShoppingBag as BagIcon,
  Menu,
  LogOut,
  ShieldCheck,
  Heart,
  X,
  ChevronRight,
  ChevronLeft,
  Package,
  ChevronDown,
  ArrowRight,
  MapPin,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ShoppingBag from "../cart/ShoppingBag";
import WishlistDrawer from "../cart/WishlistDrawer";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { toast } from "sonner";
import ForgotPasswordDrawer from "@/pages/auth/ForgotPasswordDrawer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  subcategories: Category[];
}

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<{ parent: Category | null }>({
    parent: null,
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =========================
  // SCROLL ANIMATIONS (Performance optimized)
  // =========================
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5rem", "4rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.98)"],
  );

  // =========================
  // IMAGE HELPER
  // =========================
  const getValidImageUrl = (imageSource: string | null) => {
    if (!imageSource)
      return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";
    if (imageSource.startsWith("http")) return imageSource;
    try {
      const parsed = JSON.parse(imageSource);
      return parsed?.main?.large || parsed?.url || "";
    } catch {
      return imageSource.startsWith("/")
        ? `${API_BASE_URL}${imageSource}`
        : imageSource;
    }
  };

  // =========================
  // FETCH MENU
  // =========================
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed categories fetch");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) setActiveParent(data[0]);
      }
    } catch (error) {
      console.error("Menu fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // =========================
  // CLOSE ON ROUTE CHANGE
  // =========================
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMobileView({ parent: null });
  }, [location.pathname]);

  // =========================
  // CLICK OUTSIDE MENU
  // =========================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesiune încheiată.");
      setUserMenuOpen(false);
      navigate("/");
    } catch (error) {
      toast.error("Eroare la deconectare.");
    }
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col">
        {/* TOP BAR */}
        <div
          className="z-30 flex h-8 items-center justify-center px-4 text-center text-white"
          style={{ background: "var(--primary-gradient)" }}
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex items-center gap-2"
          >
            <Sparkles size={10} className="text-cyan-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
              Design Premium — Calitate Impecabilă
            </p>
          </motion.div>
        </div>

        {/* MAIN NAV */}
        <motion.nav
          style={{ height: navHeight, backgroundColor: navBg }}
          className="relative flex items-center border-b border-zinc-100 backdrop-blur-md px-4 sm:px-6 lg:px-12 transform-gpu shadow-sm"
          onMouseLeave={() => {
            megaMenuTimeoutRef.current = setTimeout(
              () => setMegaOpen(false),
              250,
            );
          }}
        >
          {/* LEFT: PRODUCTS TRIGGER */}
          <div className="z-20 flex flex-1 items-center gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
                setMegaOpen(true);
              }}
              className="group flex items-center gap-3 rounded-full bg-zinc-50 px-5 py-2.5 transition-all hover:bg-zinc-100 hover:shadow-sm"
            >
              <Menu size={20} className="text-[var(--deep-twilight)]" />
              <span className="hidden text-[11px] font-black uppercase tracking-widest text-[var(--deep-twilight)] lg:block">
                Meniu
              </span>
              <ChevronDown
                size={14}
                className={`hidden transition-transform duration-500 lg:block ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* LOGO */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Link to="/" className="pointer-events-auto group">
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="text-3xl font-black uppercase tracking-tighter text-[var(--deep-twilight)] sm:text-4xl"
              >
                Evem<span className="text-[var(--french-blue)]">.</span>
              </motion.span>
            </Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="z-20 flex flex-1 items-center justify-end gap-1 sm:gap-4">
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setWishOpen(true)}
              className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
            >
              <Heart size={20} />
            </motion.button>

            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${
                  userMenuOpen ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
              >
                <User size={20} className="text-zinc-700" />
              </motion.button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    key="user-menu-dropdown"
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="absolute right-0 mt-4 w-64 overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                  >
                    <div className="bg-zinc-50 p-5">
                      <p className="text-[9px] font-black uppercase text-[var(--french-blue)] tracking-widest">
                        Cont Premium
                      </p>
                      <p className="truncate text-xs font-bold text-[var(--deep-twilight)]">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex flex-col p-2">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-zinc-50 transition-colors"
                        >
                          <ShieldCheck size={16} className="text-blue-600" />{" "}
                          Administrare
                        </Link>
                      )}
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <Package size={16} /> Comenzile mele
                      </Link>
                      <Link
                        to="/account/addresses"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <MapPin size={16} /> Adresele mele
                      </Link>
                      <Link
                        to="/account/settings"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <Settings size={16} /> Setări cont
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Ieșire
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBagOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transform-gpu"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="cart-badge"
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

        {/* ========================= */}
        {/* MEGA MENU DESKTOP */}
        {/* ========================= */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              key="mega-menu"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] lg:block transform-gpu"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(
                  () => setMegaOpen(false),
                  250,
                );
              }}
            >
              <div className="mx-auto flex h-[650px] max-w-[1600px] overflow-hidden">
                {/* LEFT PANEL: COLECȚII */}
                <div className="relative w-[340px] border-r border-zinc-100 bg-zinc-50/50 p-12 flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-14"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--french-blue)]">
                      Curated Collections
                    </p>
                  </motion.div>

                  <div className="relative space-y-2">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.id}
                        onMouseEnter={() => setActiveParent(cat)}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          setMegaOpen(false);
                        }}
                        className={`relative group flex w-full items-center justify-between rounded-2xl py-4 px-6 text-left transition-all duration-500 ${
                          activeParent?.id === cat.id
                            ? "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-black"
                            : "text-zinc-400 hover:text-zinc-600"
                        }`}
                      >
                        {activeParent?.id === cat.id && (
                          <motion.div
                            layoutId="luxuryIndicator"
                            className="absolute left-0 w-1.5 h-6 bg-[var(--french-blue)] rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 40,
                            }}
                          />
                        )}
                        <span
                          className={`text-[15px] uppercase tracking-tighter transition-all duration-300 ${
                            activeParent?.id === cat.id
                              ? "font-black"
                              : "font-semibold"
                          }`}
                        >
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={16}
                          className={`transition-all duration-500 ${
                            activeParent?.id === cat.id
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-4 opacity-0"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-auto border-t border-zinc-200 pt-8">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        In Stock & Ready to Ship
                      </p>
                    </div>
                  </div>
                </div>

                {/* CENTER PANEL: CATEGORII */}
                <div className="flex-1 overflow-y-auto bg-white p-20 scrollbar-hide">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeParent?.id || "empty-center"}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      className="grid grid-cols-2 gap-x-24 gap-y-20"
                    >
                      {activeParent?.subcategories?.map((sub) => (
                        <div
                          key={sub.id}
                          className="group/section space-y-8 text-left"
                        >
                          <Link
                            to={`/category/${sub.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="block"
                          >
                            <h3 className="text-[18px] font-black uppercase tracking-tighter text-[var(--deep-twilight)] group-hover/section:text-[var(--french-blue)] transition-all duration-300">
                              {sub.name}
                            </h3>
                            <motion.div className="h-0.5 w-8 bg-[var(--french-blue)] mt-2 group-hover/section:w-full transition-all duration-500" />
                          </Link>
                          <div className="flex flex-col gap-5">
                            {sub.subcategories?.map((child) => (
                              <Link
                                key={child.id}
                                to={`/category/${child.slug}`}
                                onClick={() => setMegaOpen(false)}
                                className="text-[14px] font-medium text-zinc-400 hover:text-black hover:translate-x-3 transition-all duration-500 flex items-center gap-2 group/link"
                              >
                                <span className="h-px w-0 bg-zinc-200 group-hover/link:w-4 transition-all duration-500" />
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* RIGHT PANEL: VISUAL SHOWCASE */}
                <div className="w-[480px] p-12 bg-zinc-50/10">
                  <motion.div
                    className="group relative h-full w-full overflow-hidden rounded-[3rem] bg-zinc-100 shadow-[0_30px_60px_rgba(0,0,0,0.15)] transform-gpu"
                    whileHover={{ scale: 0.99 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id || "empty-img"}
                        src={getValidImageUrl(activeParent?.image_url || null)}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute inset-0 h-full w-full object-cover will-change-transform"
                      />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-twilight)] via-[var(--deep-twilight)]/20 to-transparent" />

                    <div className="absolute bottom-14 left-14 right-14 z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`info-${activeParent?.id || "empty"}`}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-px w-10 bg-cyan-400" />
                          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-cyan-400">
                            Essential
                          </p>
                        </div>
                        <h4 className="mb-10 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white">
                          {activeParent?.name}
                        </h4>
                        <button
                          onClick={() => {
                            navigate(`/category/${activeParent?.slug}`);
                            setMegaOpen(false);
                          }}
                          className="group/btn relative flex items-center justify-between overflow-hidden rounded-full bg-white px-10 py-5 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-100 w-full"
                        >
                          <span>Explore Collection</span>
                          <ArrowRight
                            size={20}
                            className="transition-transform duration-500 group-hover/btn:translate-x-2"
                          />
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[300] flex flex-col bg-white lg:hidden"
          >
            <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-8">
              <span className="text-xl font-black uppercase tracking-tighter text-[var(--deep-twilight)]">
                Meniu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-zinc-50 p-3"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!mobileView.parent ? (
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (cat.subcategories?.length) {
                          setMobileView({ parent: cat });
                        } else {
                          navigate(`/category/${cat.slug}`);
                          setMobileOpen(false);
                        }
                      }}
                      className="flex items-center justify-between rounded-2xl bg-zinc-50/50 p-6 text-left active:bg-zinc-100 transition-colors"
                    >
                      <span className="text-[16px] font-black uppercase tracking-tighter text-[var(--deep-twilight)]">
                        {cat.name}
                      </span>
                      {cat.subcategories?.length > 0 && (
                        <ChevronRight size={20} className="text-zinc-300" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--french-blue)]"
                  >
                    <ChevronLeft size={16} /> Înapoi
                  </button>
                  {mobileView.parent.subcategories?.map((sub) => (
                    <div key={sub.id} className="space-y-4">
                      <div className="text-[14px] font-black uppercase tracking-widest text-[var(--deep-twilight)]">
                        {sub.name}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sub.subcategories?.map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full bg-zinc-100 px-5 py-2.5 text-[13px] font-bold text-zinc-500"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under the fixed navbar */}
      <div className="h-[5rem] w-full" />

      {/* DRAWERS & MODALS */}
      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />
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
