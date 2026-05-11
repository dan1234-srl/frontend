import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  ShoppingBag as BagIcon,
  Menu,
  Heart,
  X,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search,
  ArrowUpRight,
  HelpCircle,
  Instagram,
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
import ForgotPasswordDrawer from "@/pages/auth/ForgotPasswordDrawer";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const Navbar = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<any[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // States pentru sertare
  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // Gestiune Scroll pentru Navigarea "Sticky-Smart"
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["7rem", "5.5rem"]);
  const navPadding = useTransform(scrollY, [0, 50], ["0rem 4rem", "0rem 3rem"]);
  const shadowOpacity = useTransform(scrollY, [0, 50], ["0", "0.04"]);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Critical Menu Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    setHoveredCategory(null);
    setMobileOpen(false);
  }, [location.pathname]);

  // Image Helper cu Fallback Premium
  const getValidImageUrl = (source: string | null) => {
    if (!source)
      return "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800";
    if (source.startsWith("http")) return source;
    try {
      const parsed = JSON.parse(source);
      return parsed.main?.medium || parsed.url || parsed.medium || source;
    } catch {
      return source;
    }
  };

  const menuTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[200] bg-white pointer-events-none">
        {/* TOP BANNER — Animated News Ticker Style */}
        <div className="h-10 bg-zinc-950 flex items-center justify-center overflow-hidden pointer-events-auto">
          <motion.div
            animate={{ x: [20, 0], opacity: [0, 1] }}
            className="flex items-center gap-6 text-white"
          >
            <div className="flex items-center gap-2">
              <Sparkles
                size={12}
                className="text-[var(--royal-violet)] animate-pulse"
              />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap">
                New SS26 Collection —{" "}
                <span className="text-zinc-400">Shop the Edit</span>
              </p>
            </div>
            <div className="hidden md:block w-px h-3 bg-zinc-800" />
            <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 whitespace-nowrap">
              Livrare Premium Asigurată
            </p>
          </motion.div>
        </div>

        {/* MAIN NAVIGATION */}
        <motion.nav
          style={{
            height: navHeight,
            padding: navPadding,
            boxShadow: `0 20px 40px rgba(0,0,0,${shadowOpacity})`,
          }}
          className="relative flex items-center justify-between border-b border-zinc-50 bg-white pointer-events-auto transition-all"
        >
          {/* STÂNGA: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="group flex items-end">
              <span className="text-3xl font-black uppercase tracking-tighter text-zinc-950 leading-none">
                Evem<span className="text-[var(--royal-violet)]">.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 ml-2 mb-0.5 hidden xl:block">
                Luxury Retail
              </span>
            </Link>
          </div>

          {/* CENTRU: Navigație Categorii Dinamică */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-4 h-full">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="h-full flex items-center group/nav"
              >
                <button
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className={`relative px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                    hoveredCategory === cat.id
                      ? "text-zinc-950 scale-105"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {cat.name}
                  {hoveredCategory === cat.id && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute -bottom-1 left-4 right-4 h-0.5 bg-black rounded-full"
                    />
                  )}
                </button>

                {/* MEGA MENU: Floating Island Style */}
                <AnimatePresence>
                  {hoveredCategory === cat.id &&
                    cat.subcategories?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={menuTransition}
                        className="absolute top-[85%] left-0 right-0 mx-auto max-w-[1200px] bg-white border border-zinc-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] rounded-[2.5rem] p-12 flex gap-12 overflow-hidden"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-12">
                          {cat.subcategories.map((sub: any, idx: number) => (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="space-y-6"
                            >
                              <Link
                                to={`/category/${sub.slug}`}
                                className="inline-flex items-center gap-2 group/title"
                              >
                                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950">
                                  {sub.name}
                                </h4>
                                <ArrowUpRight
                                  size={14}
                                  className="text-zinc-200 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 group-hover/title:text-black transition-all"
                                />
                              </Link>
                              <div className="flex flex-col gap-3">
                                {sub.subcategories?.map((child: any) => (
                                  <Link
                                    key={child.id}
                                    to={`/category/${child.slug}`}
                                    className="text-[13px] font-medium text-zinc-400 hover:text-black transition-colors flex items-center gap-3 group/link"
                                  >
                                    <span className="w-0 h-px bg-zinc-900 group-hover/link:w-4 transition-all duration-300" />
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* VIZUAL: Feature Card */}
                        <div className="w-[320px] bg-zinc-50 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group/card">
                          <img
                            src={getValidImageUrl(cat.image_url)}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover/card:scale-110 transition-transform duration-1000 pointer-events-none"
                            alt=""
                          />
                          <div className="relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)] mb-3">
                              Highlights
                            </p>
                            <h5 className="heading-serif text-2xl italic leading-tight text-zinc-900">
                              Seleția Lunii {cat.name}
                            </h5>
                          </div>
                          <Link
                            to={`/category/${cat.slug}`}
                            className="relative z-10 inline-flex items-center justify-center size-12 bg-white rounded-full shadow-sm hover:bg-black hover:text-white transition-all self-end"
                          >
                            <ArrowRight size={20} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* DREAPTA: Acțiuni Utilitare */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
            <button className="hidden sm:flex size-10 items-center justify-center hover:bg-zinc-50 rounded-full transition-colors">
              <Search size={20} strokeWidth={1.2} />
            </button>
            <button
              onClick={() => setWishOpen(true)}
              className="flex size-10 items-center justify-center hover:bg-zinc-50 rounded-full transition-colors relative group"
            >
              <Heart
                size={20}
                strokeWidth={1.2}
                className="group-hover:text-red-500 transition-colors"
              />
            </button>
            <button
              onClick={() =>
                user ? navigate("/account/orders") : setLoginOpen(true)
              }
              className="flex size-10 items-center justify-center hover:bg-zinc-50 rounded-full transition-colors"
            >
              <User size={20} strokeWidth={1.2} />
            </button>

            {/* CTA principal: Coșul */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBagOpen(true)}
              className="ml-2 flex items-center gap-4 bg-zinc-950 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl shadow-zinc-200"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
                Bag ({totalItems})
              </span>
              <div className="size-9 bg-white/10 rounded-full flex items-center justify-center">
                <BagIcon size={18} strokeWidth={2} />
              </div>
            </motion.button>

            {/* MOBILE MENU TRIGGER */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden ml-2 size-10 flex items-center justify-center"
            >
              <Menu size={24} />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* MOBILE FULL-SCREEN OVERLAY MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[300] bg-white flex flex-col"
          >
            <div className="h-24 flex items-center justify-between px-8 border-b border-zinc-100">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-black tracking-tighter uppercase"
              >
                Evem.
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="size-12 bg-zinc-950 text-white rounded-full flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-12 flex flex-col justify-between">
              <div className="space-y-12">
                {categories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                  >
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="group flex flex-col"
                    >
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">
                        0{idx + 1}
                      </span>
                      <div className="flex items-center justify-between">
                        <h2 className="text-5xl font-black uppercase tracking-tighter">
                          {cat.name}
                        </h2>
                        <ArrowUpRight size={24} className="text-zinc-200" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="pt-12 mt-12 border-t border-zinc-100 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Suport
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link to="/contact" className="text-sm font-bold">
                        Contact Us
                      </Link>
                      <Link to="/shipping" className="text-sm font-bold">
                        Shipping Policy
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Social
                    </p>
                    <div className="flex gap-4">
                      <Instagram size={20} />
                      <HelpCircle size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER DRAWERS & MODALS */}
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

      {/* DYNAMIC SPACER: Previne săritura conținutului sub navbar */}
      <div className="h-[7rem] md:h-[8.5rem]" />
    </>
  );
};

export default Navbar;
