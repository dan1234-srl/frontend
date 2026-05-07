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

  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5rem", "4rem"]);
  const navBgOpacity = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.9)"],
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
        {/* TOP BAR - Glassmorphism Light */}
        <div
          className="z-30 flex h-8 items-center justify-center px-4 text-center text-white"
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
            <Sparkles size={10} className="text-cyan-200" />
          </motion.div>
        </div>

        {/* NAVBAR */}
        <motion.nav
          style={{ height: navHeight, backgroundColor: navBgOpacity }}
          className="relative flex items-center border-b border-zinc-100/50 backdrop-blur-md px-4 sm:px-6 lg:px-12 transition-all duration-300"
          onMouseLeave={() => {
            megaMenuTimeoutRef.current = setTimeout(
              () => setMegaOpen(false),
              250,
            );
          }}
        >
          {/* LEFT: PRODUSE */}
          <div className="z-20 flex flex-1 items-center gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
                setMegaOpen(true);
              }}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-zinc-50 px-5 py-2 transition-all hover:bg-zinc-100 hover:shadow-inner"
            >
              <Menu
                size={20}
                className="text-[var(--deep-twilight)] transition-transform group-hover:scale-110"
              />
              <span className="hidden text-[11px] font-black uppercase tracking-widest text-[var(--deep-twilight)] lg:block">
                Meniu
              </span>
              <ChevronDown
                size={14}
                className={`hidden transition-transform duration-500 lg:block ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* CENTER: LOGO */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Link
              to="/"
              className="pointer-events-auto group flex items-center gap-1"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-black uppercase tracking-tighter text-[var(--deep-twilight)] sm:text-4xl"
              >
                Evem
                <span className="text-[var(--french-blue)] animate-pulse">
                  .
                </span>
              </motion.span>
            </Link>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="z-20 flex flex-1 items-center justify-end gap-1 sm:gap-4">
            {/* WISHLIST ICON WITH HOVER EFFECT */}
            <motion.button
              whileHover={{ y: -3 }}
              onClick={() => setWishOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-red-500"
            >
              <Heart size={20} />
            </motion.button>

            {/* USER MENU */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ y: -3 }}
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${userMenuOpen ? "bg-zinc-100 shadow-inner" : "hover:bg-zinc-100"}`}
              >
                <User size={20} className="text-zinc-700" />
              </motion.button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 overflow-hidden rounded-[2rem] border border-zinc-100 bg-white/95 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.12)]"
                  >
                    <div className="bg-gradient-to-br from-zinc-50 to-white p-6 text-left">
                      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[var(--french-blue)]">
                        Premium Member
                      </p>
                      <p className="truncate text-sm font-bold text-[var(--deep-twilight)]">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 p-3">
                      {[
                        {
                          to: "/admin",
                          icon: ShieldCheck,
                          label: "Administrare",
                          adminOnly: true,
                          color: "text-blue-600",
                        },
                        {
                          to: "/account/orders",
                          icon: Package,
                          label: "Comenzile mele",
                        },
                        {
                          to: "/account/addresses",
                          icon: MapPin,
                          label: "Adresele mele",
                        },
                        {
                          to: "/account/settings",
                          icon: Settings,
                          label: "Setări cont",
                        },
                      ].map(
                        (link, idx) =>
                          (link.adminOnly ? isAdmin : true) && (
                            <Link
                              key={idx}
                              to={link.to}
                              className="flex items-center gap-4 rounded-2xl px-4 py-3 text-left text-[13px] font-bold text-[var(--deep-twilight)] transition-all hover:bg-zinc-100 hover:translate-x-1"
                            >
                              <link.icon
                                size={18}
                                className={link.color || "text-zinc-400"}
                              />
                              {link.label}
                            </Link>
                          ),
                      )}
                      <button
                        onClick={handleLogout}
                        className="mt-2 flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[11px] font-black uppercase text-red-500 transition-all hover:bg-red-50"
                      >
                        <LogOut size={18} /> Ieșire
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CART ICON - Animated Bounce */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBagOpen(true)}
              className="relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={22} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white bg-black text-[10px] font-black text-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        {/* MEGA MENU DESKTOP - Premium Redesign */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white/95 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.1)] lg:block"
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
              <div className="mx-auto flex h-[600px] max-w-[1600px]">
                {/* COLECtII PANEL */}
                <div className="w-1/4 overflow-y-auto border-r border-zinc-100 bg-zinc-50/50 p-10">
                  <p className="mb-10 text-left text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Suntem Evem
                  </p>
                  <div className="flex flex-col gap-3">
                    {categories.map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onMouseEnter={() => setActiveParent(cat)}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          setMegaOpen(false);
                        }}
                        className={`group flex items-center justify-between rounded-[1.5rem] px-6 py-5 text-left transition-all ${
                          activeParent?.id === cat.id
                            ? "bg-white text-[var(--french-blue)] shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
                            : "text-zinc-500 hover:bg-white/50"
                        }`}
                      >
                        <span
                          className={`text-[14px] uppercase tracking-tighter transition-all ${activeParent?.id === cat.id ? "font-black" : "font-bold"}`}
                        >
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`transition-all duration-300 ${activeParent?.id === cat.id ? "translate-x-1 opacity-100" : "opacity-0"}`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* CATEGORII PANEL - Minimalist & Clean */}
                <div className="flex-1 overflow-y-auto bg-white p-16">
                  <div className="grid grid-cols-2 gap-x-20 gap-y-16">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeParent?.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="contents"
                      >
                        {activeParent?.subcategories?.map((sub) => (
                          <div
                            key={sub.id}
                            className="group/item space-y-6 text-left"
                          >
                            <Link
                              to={`/category/${sub.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className="inline-flex items-center gap-2 border-b-2 border-transparent pb-1 text-[16px] font-black uppercase tracking-tighter text-[var(--deep-twilight)] transition-all hover:border-[var(--french-blue)] hover:text-[var(--french-blue)]"
                            >
                              {sub.name}
                              <ArrowRight
                                size={14}
                                className="opacity-0 transition-all group-hover/item:translate-x-1 group-hover/item:opacity-100"
                              />
                            </Link>
                            <div className="flex flex-col gap-4">
                              {sub.subcategories?.map((child) => (
                                <Link
                                  key={child.id}
                                  to={`/category/${child.slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="text-[14px] font-medium text-zinc-400 transition-all hover:translate-x-2 hover:text-[var(--deep-twilight)]"
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
                </div>

                {/* VISUAL SHOWCASE - Right side */}
                <div className="flex w-1/3 flex-col p-10">
                  <div className="group relative flex-1 overflow-hidden rounded-[2.5rem] bg-zinc-100 shadow-2xl">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id}
                        src={getValidImageUrl(activeParent?.image_url || null)}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-twilight)]/90 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10 z-10 text-left text-white">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`text-${activeParent?.id}`}
                      >
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300">
                          New Perspective
                        </p>
                        <h4 className="mb-8 text-4xl font-black uppercase leading-none tracking-tighter">
                          {activeParent?.name}
                        </h4>
                        <button
                          onClick={() => {
                            navigate(`/category/${activeParent?.slug}`);
                            setMegaOpen(false);
                          }}
                          className="group/btn relative flex items-center gap-4 overflow-hidden rounded-full bg-white px-10 py-4 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-cyan-50"
                        >
                          <span className="relative z-10">Explorează</span>
                          <ArrowRight
                            size={16}
                            className="relative z-10 transition-transform group-hover/btn:translate-x-2"
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

      {/* MOBILE MENU - Redesigned with animations */}
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
              <span className="text-2xl font-black uppercase tracking-tighter text-[var(--deep-twilight)]">
                Meniu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-zinc-50 p-3"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!mobileView.parent ? (
                <div className="flex flex-col gap-2">
                  {categories.map((cat, i) => (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() =>
                        cat.subcategories?.length
                          ? setMobileView({ parent: cat })
                          : (navigate(`/category/${cat.slug}`),
                            setMobileOpen(false))
                      }
                      className="flex items-center justify-between rounded-3xl border border-zinc-50 bg-white p-6 text-left shadow-sm active:bg-zinc-50"
                    >
                      <span className="text-[17px] font-black uppercase tracking-tighter text-[var(--deep-twilight)]">
                        {cat.name}
                      </span>
                      {cat.subcategories?.length > 0 && (
                        <ChevronRight size={20} className="text-zinc-300" />
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4"
                >
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="mb-4 flex items-center gap-3 rounded-2xl bg-zinc-50 px-6 py-4 text-[12px] font-black uppercase tracking-widest text-[var(--french-blue)]"
                  >
                    <ChevronLeft size={18} /> Înapoi la Colecții
                  </button>
                  {mobileView.parent.subcategories?.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-[2rem] bg-zinc-50/50 p-6"
                    >
                      <div className="mb-4 text-[14px] font-black uppercase tracking-widest text-[var(--deep-twilight)]">
                        {sub.name}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sub.subcategories?.map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full bg-white px-5 py-3 text-[13px] font-bold text-zinc-500 shadow-sm active:text-[var(--french-blue)]"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[5rem] w-full" />

      {/* MODALS */}
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
