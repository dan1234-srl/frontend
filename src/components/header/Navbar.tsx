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
  Search,
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<any[]>([]);
  const [activeParent, setActiveParent] = useState<any | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<{ parent: any | null }>({
    parent: null,
  });

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SCROLL LOGIC
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 80], ["6rem", "4.5rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.95)"],
  );
  const borderOpacity = useTransform(scrollY, [0, 80], ["0", "1"]);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setActiveParent(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesiune încheiată.");
    navigate("/");
  };

  const menuTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[200]">
        {/* TOP ANNOUNCEMENT */}
        <div
          className="relative z-[201] hidden h-9 items-center justify-center px-4 md:flex"
          style={{ background: "var(--primary-gradient)" }}
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex items-center gap-3 text-white"
          >
            <Sparkles size={12} className="text-yellow-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Livrare Gratuită la comenzi peste 500 RON
            </span>
          </motion.div>
        </div>

        {/* NAVIGATION BAR */}
        <motion.nav
          style={{ height: navHeight, backgroundColor: navBg }}
          className="relative flex items-center justify-between px-6 lg:px-12 backdrop-blur-xl border-b border-zinc-100"
        >
          {/* LEFT: MENU & SEARCH */}
          <div className="flex flex-1 items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
                setMegaOpen(true);
              }}
              className="group flex items-center gap-3 rounded-2xl bg-zinc-50/50 p-2.5 px-4 transition-all hover:bg-zinc-100"
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`h-0.5 w-5 bg-black transition-all ${megaOpen ? "rotate-45 translate-y-1.5" : ""}`}
                />
                <span
                  className={`h-0.5 w-3 bg-black transition-all ${megaOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-0.5 w-5 bg-black transition-all ${megaOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                />
              </div>
              <span className="hidden text-[11px] font-black uppercase tracking-widest lg:block">
                Meniu
              </span>
            </button>
            <button className="hidden p-2 text-zinc-400 transition-colors hover:text-black lg:block">
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* CENTER: LOGO */}
          <Link to="/" className="relative z-10 block group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl font-black uppercase tracking-[-0.05em] text-[var(--dark-amethyst)] md:text-3xl">
                Evem<span className="text-[var(--royal-violet)]">Luxury</span>
              </span>
              <div className="h-[1px] w-0 bg-black transition-all group-hover:w-full" />
            </motion.div>
          </Link>

          {/* RIGHT: ACCOUNT & CART */}
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-5">
            <button
              onClick={() => setWishOpen(true)}
              className="group relative hidden p-2 md:block"
            >
              <Heart
                size={22}
                strokeWidth={1.5}
                className="transition-colors group-hover:text-red-500"
              />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                className="flex items-center gap-2 p-2"
              >
                <User size={22} strokeWidth={1.5} />
                {user && (
                  <span className="hidden text-[10px] font-black uppercase tracking-widest lg:block">
                    Cont
                  </span>
                )}
              </button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={menuTransition}
                    className="absolute right-0 mt-4 w-72 overflow-hidden rounded-[2rem] border border-zinc-100 bg-white p-2 shadow-2xl"
                  >
                    <div className="p-6 pb-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        Bine ai revenit,
                      </p>
                      <p className="truncate text-sm font-bold text-black">
                        {user.first_name || user.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold hover:bg-zinc-50 transition-colors text-blue-600"
                        >
                          <ShieldCheck size={18} /> Administrare
                        </Link>
                      )}
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <Package size={18} /> Comenzile mele
                      </Link>
                      <Link
                        to="/account/settings"
                        className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <Settings size={18} /> Setări Cont
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} /> Deconectare
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setBagOpen(true)}
              className="group relative flex h-11 items-center gap-3 rounded-full bg-black px-5 text-white shadow-xl transition-all hover:bg-zinc-800"
            >
              <BagIcon size={18} />
              <span className="hidden text-[11px] font-black uppercase tracking-widest md:block">
                Coș
              </span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--royal-violet)] text-[9px] font-black shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </motion.nav>

        {/* MEGA MENU DESKTOP */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={menuTransition}
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(
                  () => setMegaOpen(false),
                  300,
                );
              }}
              className="absolute inset-x-0 top-full hidden border-t border-zinc-100 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.1)] lg:block"
            >
              <div className="mx-auto flex h-[580px] max-w-[1600px]">
                {/* CATEGORY SELECTOR */}
                <div className="w-[350px] border-r border-zinc-50 bg-zinc-50/30 p-10">
                  <p className="mb-10 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    Colecții Exclusive
                  </p>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.id}
                        onMouseEnter={() => setActiveParent(cat)}
                        onClick={() => navigate(`/category/${cat.slug}`)}
                        className={`group relative flex w-full items-center justify-between rounded-2xl p-5 text-left transition-all ${
                          activeParent?.id === cat.id
                            ? "bg-white shadow-xl text-black"
                            : "text-zinc-400 hover:text-zinc-600"
                        }`}
                      >
                        <span
                          className={`text-sm font-black uppercase tracking-tight ${activeParent?.id === cat.id ? "scale-105 origin-left transition-transform" : ""}`}
                        >
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={16}
                          className={`transition-all ${activeParent?.id === cat.id ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                        />
                        {activeParent?.id === cat.id && (
                          <motion.div
                            layoutId="nav-pill"
                            className="absolute left-0 h-6 w-1 rounded-full bg-[var(--royal-violet)]"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* SUBCATEGORIES GRID */}
                <div className="flex-1 overflow-y-auto p-16 scrollbar-hide">
                  <motion.div
                    key={activeParent?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={menuTransition}
                    className="grid grid-cols-3 gap-12"
                  >
                    {activeParent?.subcategories?.map((sub: any) => (
                      <div key={sub.id} className="space-y-6">
                        <Link
                          to={`/category/${sub.slug}`}
                          className="group/item inline-block"
                        >
                          <h3 className="text-sm font-black uppercase tracking-widest transition-colors group-hover/item:text-[var(--royal-violet)]">
                            {sub.name}
                          </h3>
                          <div className="mt-1 h-0.5 w-6 bg-[var(--royal-violet)] transition-all group-hover/item:w-full" />
                        </Link>
                        <ul className="space-y-4">
                          {sub.subcategories?.map((child: any) => (
                            <li key={child.id}>
                              <Link
                                to={`/category/${child.slug}`}
                                className="text-xs font-medium text-zinc-500 transition-all hover:translate-x-2 hover:text-black flex items-center gap-2"
                              >
                                <span className="h-px w-0 bg-zinc-200 transition-all group-hover:w-3" />{" "}
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* VISUAL PANEL */}
                <div className="w-[450px] p-8">
                  <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-zinc-100">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id}
                        src={
                          activeParent?.image_url ||
                          "https://images.unsplash.com/photo-1515562141207-7a18b5ce3377?q=80&w=1200"
                        }
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.05, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-2">
                        New Season
                      </p>
                      <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">
                        {activeParent?.name}
                      </h4>
                      <Link
                        to={`/category/${activeParent?.slug}`}
                        className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95"
                      >
                        Vezi Colecția <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white lg:hidden"
          >
            <div className="flex h-24 items-center justify-between px-8 border-b border-zinc-50">
              <span className="text-xl font-black uppercase tracking-tighter">
                Meniu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-zinc-50 p-4"
              >
                <X size={24} />
              </button>
            </div>

            <div className="h-[calc(100vh-6rem)] overflow-y-auto p-6">
              {!mobileView.parent ? (
                <div className="space-y-3">
                  {categories.map((cat, idx) => (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={cat.id}
                      onClick={() =>
                        cat.subcategories?.length
                          ? setMobileView({ parent: cat })
                          : (navigate(`/category/${cat.slug}`),
                            setMobileOpen(false))
                      }
                      className="flex w-full items-center justify-between rounded-[2rem] bg-zinc-50 p-8 transition-all active:scale-[0.98]"
                    >
                      <span className="text-lg font-black uppercase tracking-tight">
                        {cat.name}
                      </span>
                      <ChevronRight size={20} />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="flex items-center gap-2 font-black uppercase tracking-widest text-[var(--royal-violet)]"
                  >
                    <ChevronLeft size={20} /> Înapoi
                  </button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">
                    {mobileView.parent.name}
                  </h2>
                  <div className="grid gap-8">
                    {mobileView.parent.subcategories?.map((sub: any) => (
                      <div key={sub.id} className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                          {sub.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sub.subcategories?.map((child: any) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="rounded-full bg-zinc-100 px-6 py-3 text-sm font-bold"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />
      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setTimeout(() => setRegisterOpen(true), 300);
        }}
        onOpenForgot={() => {
          setLoginOpen(false);
          setTimeout(() => setForgotOpen(true), 300);
        }}
      />
      <Register
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setTimeout(() => setLoginOpen(true), 300);
        }}
      />
      <ForgotPasswordDrawer
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);
          setTimeout(() => setLoginOpen(true), 300);
        }}
      />

      {/* Spacer to prevent content jump */}
      <div className="h-[6rem] md:h-[7.5rem]" />
    </>
  );
};

export default Navbar;
