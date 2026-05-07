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

  // Scroll Animations for performance
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5rem", "4rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.95)"],
  );

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

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMobileView({ parent: null });
  }, [location.pathname]);

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
          className="relative flex items-center border-b border-zinc-100 backdrop-blur-md px-4 sm:px-6 lg:px-12 transform-gpu"
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
                className={`hidden transition-transform duration-500 lg:block ${megaOpen ? "rotate-180" : ""}`}
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
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${userMenuOpen ? "bg-zinc-100" : "hover:bg-zinc-50"}`}
              >
                <User size={20} className="text-zinc-700" />
              </motion.button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
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
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[9px] font-black"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </motion.nav>

        {/* MEGA MENU - REBUILT FOR LIQUID PERFORMANCE */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white/98 backdrop-blur-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] lg:block transform-gpu"
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
              <div className="mx-auto flex h-[620px] max-w-[1600px]">
                {/* LEFT: MAGNETIC CATEGORIES */}
                <div className="relative w-[320px] border-r border-zinc-100 bg-zinc-50/40 p-10 flex flex-col">
                  <p className="mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Colecții
                  </p>

                  <div className="relative flex flex-col gap-1">
                    {categories.map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        onMouseEnter={() => setActiveParent(cat)}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          setMegaOpen(false);
                        }}
                        className={`relative z-10 flex items-center justify-between rounded-xl py-3.5 px-6 text-left transition-all duration-300 ${
                          activeParent?.id === cat.id
                            ? "text-[var(--french-blue)]"
                            : "text-zinc-500 hover:text-black"
                        }`}
                      >
                        <span
                          className={`text-[14px] uppercase tracking-tighter transition-all duration-300 ${activeParent?.id === cat.id ? "font-black" : "font-medium"}`}
                        >
                          {cat.name}
                        </span>
                        {activeParent?.id === cat.id && (
                          <motion.div
                            layoutId="navIndicator"
                            className="absolute left-0 w-1 h-6 bg-[var(--french-blue)] rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <ChevronRight
                          size={16}
                          className={`transition-all duration-300 ${activeParent?.id === cat.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* CENTER: FLUID SUB-CATEGORIES */}
                <div className="flex-1 overflow-y-auto bg-white p-16 scrollbar-hide">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeParent?.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="grid grid-cols-2 gap-x-20 gap-y-16"
                    >
                      {activeParent?.subcategories?.map((sub) => (
                        <div key={sub.id} className="space-y-6">
                          <Link
                            to={`/category/${sub.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="group/link inline-block"
                          >
                            <h3 className="text-[16px] font-black uppercase tracking-tighter text-[var(--deep-twilight)] group-hover/link:text-[var(--french-blue)] transition-colors">
                              {sub.name}
                            </h3>
                            <div className="h-0.5 w-0 bg-[var(--french-blue)] group-hover/link:w-full transition-all duration-300" />
                          </Link>
                          <div className="flex flex-col gap-4">
                            {sub.subcategories?.map((child) => (
                              <Link
                                key={child.id}
                                to={`/category/${child.slug}`}
                                onClick={() => setMegaOpen(false)}
                                className="text-[14px] font-medium text-zinc-400 hover:text-black hover:translate-x-2 transition-all duration-300"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* RIGHT: PREMIUM SHOWCASE */}
                <div className="w-[420px] p-10 bg-zinc-50/20">
                  <div className="group relative h-full w-full overflow-hidden rounded-[2.5rem] bg-zinc-200 shadow-xl transform-gpu">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id}
                        src={getValidImageUrl(activeParent?.image_url || null)}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-twilight)]/90 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeParent?.id}
                      >
                        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.4em] text-cyan-300">
                          Colecția Nouă
                        </p>
                        <h4 className="mb-8 text-3xl font-black uppercase leading-none tracking-tighter text-white">
                          {activeParent?.name}
                        </h4>
                        <button
                          onClick={() => {
                            navigate(`/category/${activeParent?.slug}`);
                            setMegaOpen(false);
                          }}
                          className="flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-cyan-50 transition-colors group/btn"
                        >
                          Explorează{" "}
                          <ArrowRight
                            size={14}
                            className="group-hover/btn:translate-x-1 transition-transform"
                          />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
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
                      onClick={() =>
                        cat.subcategories?.length
                          ? setMobileView({ parent: cat })
                          : (navigate(`/category/${cat.slug}`),
                            setMobileOpen(false))
                      }
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

      <div className="h-[5rem] w-full" />

      {/* DRAWERS */}
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
