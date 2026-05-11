import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  ShoppingBag as BagIcon,
  Menu,
  LogOut,
  Heart,
  X,
  ChevronRight,
  Package,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Search,
  ArrowUpRight,
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
  const { user, signOut } = useAuth();
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
  const [mobileView, setMobileView] = useState<{ parent: any | null }>({
    parent: null,
  });

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SCROLL ANIMATIONS (Ca la inceput)
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5.5rem", "4.5rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.98)"],
  );

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setActiveParent(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setMobileView({ parent: null });
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesiune încheiată.");
    navigate("/");
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col">
        {/* TOP BAR */}
        <div className="z-30 flex h-8 items-center justify-center px-4 text-center text-white bg-black">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Design Premium — Calitate Impecabilă
          </p>
        </div>

        {/* MAIN NAV (Structura ta preferata) */}
        <motion.nav
          style={{ height: navHeight, backgroundColor: navBg }}
          className="relative flex items-center border-b border-zinc-100 px-4 sm:px-12 transform-gpu shadow-sm"
          onMouseLeave={() => {
            megaMenuTimeoutRef.current = setTimeout(
              () => setMegaOpen(false),
              200,
            );
          }}
        >
          {/* LEFT: MENU TRIGGER */}
          <div className="z-20 flex flex-1 items-center gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
                setMegaOpen(true);
              }}
              className="group flex items-center gap-3 rounded-full bg-zinc-50 px-5 py-2.5 transition-all hover:bg-zinc-100"
            >
              <Menu size={18} />
              <span className="hidden text-[11px] font-black uppercase tracking-widest lg:block">
                Produse
              </span>
              <ChevronDown
                size={14}
                className={`hidden transition-transform duration-500 lg:block ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* CENTER: LOGO */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link to="/" className="pointer-events-auto">
              <span className="text-3xl font-black uppercase tracking-tighter text-black">
                Evem<span className="text-[var(--royal-violet)]">.</span>
              </span>
            </Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="z-20 flex flex-1 items-center justify-end gap-2 sm:gap-4">
            <button
              onClick={() => setWishOpen(true)}
              className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
            >
              <Heart size={20} />
            </button>
            <button
              onClick={() =>
                user ? navigate("/account/orders") : setLoginOpen(true)
              }
              className="p-2 text-zinc-700"
            >
              <User size={20} />
            </button>
            <button
              onClick={() => setBagOpen(true)}
              className="relative flex h-10 items-center gap-3 rounded-full bg-black px-5 text-white transition-transform active:scale-95"
            >
              <BagIcon size={18} />
              <span className="hidden text-[11px] font-black uppercase tracking-widest sm:block">
                Coș
              </span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--royal-violet)] text-[9px] font-black border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </motion.nav>

        {/* MEGA MENU - MODERNE / INTERESANTE CATEGORII */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] lg:block"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
              }}
            >
              <div className="mx-auto flex h-[550px] max-w-[1600px]">
                {/* 1. Selectorul de Categorii Principale */}
                <div className="w-[320px] border-r border-zinc-50 bg-zinc-50/50 p-8">
                  <p className="mb-8 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Colecții
                  </p>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveParent(cat)}
                        onClick={() => navigate(`/category/${cat.slug}`)}
                        className={`group relative flex w-full items-center justify-between rounded-xl p-4 text-left transition-all ${
                          activeParent?.id === cat.id
                            ? "bg-white shadow-md text-black"
                            : "text-zinc-400 hover:text-zinc-600"
                        }`}
                      >
                        <span className="text-[13px] font-black uppercase tracking-tight">
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={14}
                          className={`transition-all ${activeParent?.id === cat.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                        />
                        {activeParent?.id === cat.id && (
                          <motion.div
                            layoutId="luxury-bar"
                            className="absolute left-0 h-5 w-1 rounded-full bg-[var(--royal-violet)]"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Subcategorii - Layout Modern cu Grid */}
                <div className="flex-1 overflow-y-auto p-12 bg-white no-scrollbar">
                  <motion.div
                    key={activeParent?.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-3 gap-x-12 gap-y-10"
                  >
                    {activeParent?.subcategories?.map((sub: any) => (
                      <div key={sub.id} className="space-y-5">
                        <Link
                          to={`/category/${sub.slug}`}
                          className="group/title inline-block"
                        >
                          <h4 className="text-[12px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                            {sub.name}{" "}
                            <ArrowUpRight
                              size={12}
                              className="opacity-0 group-hover/title:opacity-100 transition-opacity"
                            />
                          </h4>
                          <div className="h-0.5 w-4 bg-[var(--royal-violet)] mt-1 group-hover/title:w-full transition-all duration-500" />
                        </Link>
                        <ul className="space-y-3">
                          {sub.subcategories?.map((child: any) => (
                            <li key={child.id}>
                              <Link
                                to={`/category/${child.slug}`}
                                className="text-[13px] font-medium text-zinc-400 hover:text-black transition-colors flex items-center gap-2 group/link"
                              >
                                <span className="h-px w-0 bg-zinc-900 group-hover/link:w-3 transition-all" />
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* 3. Visual Feature Panel (Modern, fără poze care să crape) */}
                <div className="w-[400px] p-8">
                  <div className="relative h-full w-full rounded-[2rem] bg-zinc-950 p-10 flex flex-col justify-between overflow-hidden group/feat">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                      <Sparkles size={120} className="text-white" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--mauve-magic)] mb-4">
                        Highlights
                      </p>
                      <h4 className="heading-serif text-3xl italic text-white leading-tight">
                        Explorează universul {activeParent?.name}
                      </h4>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/category/${activeParent?.slug}`)
                      }
                      className="relative z-10 h-14 w-full rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[var(--mauve-magic)] transition-colors"
                    >
                      Descoperă Colecția <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE MENU (Pastrat originalul tau dar curatat) */}
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
              <span className="text-xl font-black uppercase tracking-tighter">
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
                      className="flex items-center justify-between rounded-2xl bg-zinc-50 p-6 text-left"
                    >
                      <span className="text-base font-black uppercase tracking-tight">
                        {cat.name}
                      </span>
                      <ChevronRight size={20} className="text-zinc-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="flex items-center gap-2 font-black text-[var(--royal-violet)]"
                  >
                    <ChevronLeft size={16} /> Înapoi
                  </button>
                  <h2 className="text-3xl font-black uppercase tracking-tighter px-2">
                    {mobileView.parent.name}
                  </h2>
                  {mobileView.parent.subcategories?.map((sub: any) => (
                    <div key={sub.id} className="space-y-4 px-2">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                        {sub.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sub.subcategories?.map((child: any) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-bold"
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

      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />
      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setTimeout(() => setRegisterOpen(true), 200);
        }}
        onOpenForgot={() => {
          setLoginOpen(false);
          setTimeout(() => setForgotOpen(true), 200);
        }}
      />
      <Register
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setTimeout(() => setLoginOpen(true), 200);
        }}
      />
      <ForgotPasswordDrawer
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);
          setTimeout(() => setLoginOpen(true), 200);
        }}
      />

      <div className="h-[5.5rem] w-full" />
    </>
  );
};

export default Navbar;
