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
  const [searchQuery, setSearchTerm] = useState("");
  const [mobileView, setMobileView] = useState<{ parent: Category | null }>({
    parent: null,
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- SCROLL ANIMATIONS ---
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5.5rem", "4.5rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.98)"],
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
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setActiveParent(data[0]);
        }
      }
    } catch (error) {
      console.error("Menu fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (categories.length > 0 && !activeParent) setActiveParent(categories[0]);
  }, [categories, activeParent]);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMobileView({ parent: null });
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesiune încheiată.");
    setUserMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileOpen(false);
    }
  };

  const springTransition = { type: "spring", stiffness: 350, damping: 30 };
  const fadeTransition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

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
          {/* LEFT: MENU & SEARCH */}
          <div className="z-20 flex flex-1 items-center gap-2 sm:gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
                setMegaOpen(true);
              }}
              className="group flex items-center gap-2 rounded-full bg-zinc-50 px-4 py-2 sm:px-5 sm:py-2.5 transition-all hover:bg-zinc-100"
            >
              <Menu size={18} className="text-[var(--deep-twilight)]" />
              <span className="hidden text-[11px] font-black uppercase tracking-widest text-[var(--deep-twilight)] lg:block">
                Meniu
              </span>
              <ChevronDown
                size={14}
                className={`hidden transition-transform duration-500 lg:block ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* BARĂ CĂUTARE DESKTOP */}
            <form
              onSubmit={handleSearch}
              className="relative hidden xl:block w-64"
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Caută produse..."
                value={searchQuery}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-full py-2.5 pl-11 pr-4 text-[12px] font-medium focus:ring-2 focus:ring-zinc-200 transition-all outline-none"
              />
            </form>
          </div>

          {/* CENTER: LOGO (IMAGINE UNICĂ) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link
              to="/"
              className="pointer-events-auto group flex items-center justify-center px-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center"
              >
                <img
                  src="/Copilot_20260512_191942.png"
                  alt="Evem Luxury"
                  className="h-10 sm:h-12 lg:h-16 w-auto object-contain transition-all duration-500"
                  style={{
                    imageRendering: "auto",
                    filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.05))", // Oferă profunzime fără a fi pixelat
                  }}
                />
              </motion.div>
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
                    className="absolute right-0 mt-4 w-64 overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-2xl p-2"
                  >
                    <div className="bg-zinc-50 p-4 rounded-xl mb-1">
                      <p className="text-[9px] font-black uppercase text-[var(--french-blue)] tracking-widest">
                        Cont Premium
                      </p>
                      <p className="truncate text-xs font-bold text-[var(--deep-twilight)]">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-zinc-50"
                      >
                        <ShieldCheck size={16} className="text-blue-600" />{" "}
                        Administrare
                      </Link>
                    )}
                    <Link
                      to="/account/orders"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold hover:bg-zinc-50"
                    >
                      <Package size={16} /> Comenzile mele
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Ieșire
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBagOpen(true)}
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[9px] font-black">
                  {totalItems}
                </span>
              )}
            </motion.button>
          </div>
        </motion.nav>

        {/* MEGA MENU DESKTOP */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              key="mega-menu-container"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={fadeTransition}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white shadow-2xl lg:block transform-gpu"
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
              <div className="mx-auto flex h-[600px] max-w-[1600px] overflow-hidden">
                {/* 1. LEFT PANEL: COLECtII */}
                <div className="w-[340px] flex flex-col border-r border-zinc-100 bg-zinc-50/30 h-full">
                  <div className="px-10 pt-12 pb-6 shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--french-blue)]">
                      Curated Collections
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar">
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onMouseEnter={() => setActiveParent(cat)}
                          onClick={() => {
                            navigate(`/category/${cat.slug}`);
                            setMegaOpen(false);
                          }}
                          className={`group relative flex w-full items-center justify-between rounded-2xl py-4 px-6 text-left transition-all duration-300 ${activeParent?.id === cat.id ? "bg-white shadow-md text-black" : "text-zinc-400 hover:text-zinc-700 hover:bg-white/50"}`}
                        >
                          {activeParent?.id === cat.id && (
                            <motion.div
                              layoutId="luxuryIndicator"
                              className="absolute left-0 w-1.5 h-6 bg-[var(--french-blue)] rounded-full"
                              transition={springTransition}
                            />
                          )}
                          <span
                            className={`text-[14px] uppercase tracking-tighter transition-all duration-300 ${activeParent?.id === cat.id ? "font-black" : "font-semibold"}`}
                          >
                            {cat.name}
                          </span>
                          <ChevronRight
                            size={16}
                            className={`transition-all duration-500 ${activeParent?.id === cat.id ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. CENTER PANEL: CATEGORII */}
                <div className="flex-1 flex flex-col h-full bg-white">
                  <div className="flex-1 overflow-y-auto p-16 custom-scrollbar">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeParent?.id || "empty-content"}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.05 },
                          },
                        }}
                        className="grid grid-cols-2 gap-x-20 gap-y-16 pb-8"
                      >
                        {activeParent?.subcategories?.map((sub: Category) => (
                          <motion.div
                            key={sub.id}
                            variants={{
                              hidden: { opacity: 0, y: 15 },
                              show: {
                                opacity: 1,
                                y: 0,
                                transition: springTransition,
                              },
                            }}
                            className="group/section space-y-6 text-left"
                          >
                            <Link
                              to={`/category/${sub.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className="inline-block"
                            >
                              <h3 className="text-[16px] font-black uppercase tracking-tighter text-[var(--deep-twilight)] group-hover/section:text-[var(--french-blue)] transition-colors duration-300">
                                {sub.name}
                              </h3>
                              <div className="h-0.5 w-6 bg-[var(--french-blue)] mt-2 group-hover/section:w-full transition-all duration-500" />
                            </Link>
                            <div className="flex flex-col gap-4">
                              {sub.subcategories?.map((child) => (
                                <Link
                                  key={child.id}
                                  to={`/category/${child.slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="text-[13px] font-medium text-zinc-500 hover:text-black hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group/link"
                                >
                                  <span className="h-px w-0 bg-zinc-300 group-hover/link:w-3 transition-all duration-300" />{" "}
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* 3. RIGHT PANEL: VISUAL SHOWCASE */}
                <div className="w-[480px] p-10 bg-zinc-50/30">
                  <motion.div className="group/card relative h-full w-full overflow-hidden rounded-[2.5rem] bg-zinc-100 shadow-[0_30px_60px_rgba(0,0,0,0.1)] transform-gpu">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id || "showcase"}
                        src={getValidImageUrl(activeParent?.image_url)}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-10 left-10 right-10 z-10 text-left">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-8 bg-white/60" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
                          Highlight
                        </p>
                      </div>
                      <h4 className="mb-8 text-4xl font-black uppercase leading-[1.1] tracking-tighter text-white">
                        {activeParent?.name}
                      </h4>
                      <button
                        onClick={() => {
                          navigate(`/category/${activeParent?.slug}`);
                          setMegaOpen(false);
                        }}
                        className="group/btn flex w-full items-center justify-between overflow-hidden rounded-full bg-white px-8 py-4 text-[11px] font-black uppercase text-black hover:bg-zinc-100 transition-all"
                      >
                        <span>Explorează</span>{" "}
                        <ArrowRight
                          size={18}
                          className="transition-transform duration-500 group-hover/btn:translate-x-1"
                        />
                      </button>
                    </div>
                  </motion.div>
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
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed inset-0 z-[300] flex flex-col bg-white lg:hidden"
          >
            <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-6">
              {/* LOGO IN MOBILE MENU */}
              <img
                src="/Copilot_20260512_191942.png"
                alt="Evem Luxury"
                className="h-6 w-auto object-contain"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-zinc-50 p-3"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
              {/* CĂUTARE MOBIL */}
              {!mobileView.parent && (
                <form onSubmit={handleSearch} className="relative mb-8">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Ce cauți astăzi?"
                    value={searchQuery}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-zinc-100 transition-all outline-none"
                  />
                </form>
              )}

              {!mobileView.parent ? (
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                  className="flex flex-col gap-3"
                >
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        show: {
                          opacity: 1,
                          x: 0,
                          transition: springTransition,
                        },
                      }}
                      onClick={() =>
                        cat.subcategories?.length
                          ? setMobileView({ parent: cat })
                          : (navigate(`/category/${cat.slug}`),
                            setMobileOpen(false))
                      }
                      className="flex items-center justify-between rounded-[1.5rem] bg-zinc-50/80 p-6 active:bg-zinc-100 transition-colors"
                    >
                      <span className="text-[18px] font-black uppercase tracking-tighter text-[var(--deep-twilight)]">
                        {cat.name}
                      </span>
                      {cat.subcategories?.length > 0 && (
                        <ChevronRight size={20} className="text-zinc-400" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springTransition}
                  className="flex flex-col gap-8 pb-10"
                >
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[var(--french-blue)] w-fit"
                  >
                    <ChevronLeft size={18} /> Înapoi
                  </button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter px-2 text-[var(--deep-twilight)]">
                    {mobileView.parent.name}
                  </h2>
                  <div className="flex flex-col gap-8 px-2">
                    {mobileView.parent.subcategories?.map((sub: Category) => (
                      <div key={sub.id} className="space-y-4">
                        <div className="text-[15px] font-black uppercase tracking-widest text-[var(--deep-twilight)] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--french-blue)]" />
                          {sub.name}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {sub.subcategories?.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="rounded-full bg-zinc-100 px-5 py-2.5 text-[13px] font-bold text-zinc-600 active:scale-95 transition-all"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[5.5rem] w-full" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #d4d4d8; }
      `,
        }}
      />

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
