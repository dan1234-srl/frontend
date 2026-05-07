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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ShoppingBag from "../cart/ShoppingBag";
import WishlistDrawer from "../cart/WishlistDrawer";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { toast } from "sonner";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [mobileView, setMobileView] = useState<{ parent: Category | null }>({
    parent: null,
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- HELPER PARSARE IMAGINI (Structura Mic/Mediu/Mare) ---
  const getValidImageUrl = (imageSource: string | null) => {
    if (!imageSource)
      return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600";
    if (imageSource.startsWith("http")) return imageSource;

    try {
      const parsed = JSON.parse(imageSource);
      // Prioritizăm varianta LARGE pentru Mega Menu
      return (
        parsed.main?.large ||
        parsed.url ||
        parsed.main?.medium ||
        parsed.main?.small ||
        null
      );
    } catch (e) {
      return imageSource.startsWith("/")
        ? `${API_BASE_URL}${imageSource}`
        : imageSource;
    }
  };

  const handleMouseEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaOpen(true);
  };

  const handleMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaOpen(false);
    }, 200);
  };

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) setActiveParent(data[0]);
      }
    } catch (err) {
      console.error("Menu fetch error", err);
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

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesiune încheiată.");
      navigate("/");
    } catch {
      toast.error("Eroare la deconectare.");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[200] flex flex-col shadow-sm bg-white font-sans">
        {/* 1. TOP BAR */}
        <div
          className="h-8 text-white flex items-center justify-center px-4 text-center z-30"
          style={{
            background: "var(--primary-gradient)",
            backgroundColor: "var(--deep-twilight)",
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Design Premium — Calitate Impecabilă
          </p>
        </div>

        {/* 2. MAIN NAV */}
        <nav
          className="w-full border-b border-zinc-100 h-16 lg:h-20 relative flex items-center px-4 sm:px-6 lg:px-12"
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-6 z-20 flex-1 text-left">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={handleMouseEnter}
              className="flex items-center gap-3 group text-[var(--deep-twilight)]"
            >
              <div className="p-2 rounded-md group-hover:bg-zinc-100 transition-colors">
                <Menu size={26} />
              </div>
              <span className="hidden lg:block text-[13px] font-black uppercase tracking-tighter">
                Produse
              </span>
              <ChevronDown
                size={14}
                className={`hidden lg:block transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link to="/products" className="pointer-events-auto group">
              <span className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-[var(--deep-twilight)]">
                Linea<span className="text-[var(--french-blue)]">.</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-3 z-20 flex-1">
            <button
              onClick={() => setWishOpen(true)}
              className="p-2 text-zinc-700 hover:bg-zinc-50 rounded-full transition-all"
            >
              <Heart size={22} />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                className={`p-2 rounded-full transition-all ${userMenuOpen ? "bg-zinc-100" : "hover:bg-zinc-50"}`}
              >
                <User size={22} className="text-zinc-700" />
              </button>
              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-64 bg-white border border-zinc-100 shadow-2xl rounded-xl overflow-hidden"
                  >
                    <div className="p-4 border-b bg-zinc-50 text-left">
                      <p className="text-[10px] font-black uppercase text-[var(--french-blue)] mb-1">
                        Contul meu
                      </p>
                      <p className="text-xs font-bold truncate text-[var(--deep-twilight)]">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2 flex flex-col">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-lg text-xs font-bold text-[var(--deep-twilight)] text-left"
                        >
                          <ShieldCheck
                            size={16}
                            className="text-[var(--french-blue)]"
                          />{" "}
                          Administrare
                        </Link>
                      )}
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 rounded-lg text-xs font-bold text-[var(--deep-twilight)] text-left"
                      >
                        <Package size={16} /> Comenzile mele
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 rounded-lg text-xs font-black uppercase"
                      >
                        <LogOut size={16} /> Ieșire
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setBagOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-full text-white shadow-lg active:scale-95 transition-all relative ml-1"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* 3. MEGA MENU - 3 COLOANE (Desktop) */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="hidden lg:block absolute top-full left-0 w-full bg-white shadow-2xl border-t border-zinc-100 z-[100]"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-[1600px] mx-auto flex h-[550px]">
                {/* COLOANA 1: Categorii Părinte */}
                <div className="w-1/4 bg-zinc-50 border-r border-zinc-100 p-8 overflow-y-auto no-scrollbar">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 text-left">
                    Colecții
                  </p>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveParent(cat)}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          setMegaOpen(false);
                        }}
                        className={`flex items-center justify-between text-left px-5 py-4 rounded-xl transition-all ${activeParent?.id === cat.id ? "bg-white shadow-md text-[var(--french-blue)] font-black translate-x-2" : "text-[var(--deep-twilight)] font-bold hover:bg-white/60"}`}
                      >
                        <span className="text-[13px] uppercase tracking-tight">
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`transition-opacity ${activeParent?.id === cat.id ? "opacity-100" : "opacity-0"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLOANA 2: Subcategorii (Modern Grid) */}
                <div className="flex-1 p-12 overflow-y-auto no-scrollbar bg-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 text-left">
                    Categorii
                  </p>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                    {activeParent?.subcategories?.map((sub) => (
                      <div key={sub.id} className="space-y-5 text-left">
                        <Link
                          to={`/category/${sub.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="text-[15px] font-black uppercase tracking-tight text-[var(--deep-twilight)] hover:text-[var(--french-blue)] block border-b border-zinc-100 pb-2"
                        >
                          {sub.name}
                        </Link>
                        <div className="flex flex-col gap-3">
                          {sub.subcategories?.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className="text-[14px] text-zinc-500 hover:text-[var(--deep-twilight)] font-bold transition-all hover:translate-x-1"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLOANA 3: Imagine Categorie (Promo Dinamic) */}
                <div className="w-1/3 p-10 bg-zinc-50/50 flex flex-col">
                  <div className="relative flex-1 rounded-3xl overflow-hidden group shadow-xl bg-zinc-200">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={getValidImageUrl(activeParent?.image_url || null)}
                        alt={activeParent?.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white text-left z-10">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--light-cyan)] mb-2">
                        Descoperă acum
                      </p>
                      <h4 className="text-3xl font-black uppercase tracking-tighter mb-6 leading-none">
                        {activeParent?.name}
                      </h4>
                      <button
                        onClick={() => {
                          navigate(`/category/${activeParent?.slug}`);
                          setMegaOpen(false);
                        }}
                        className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[var(--light-cyan)] transition-colors shadow-lg"
                      >
                        Vezi Tot <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[300] bg-white flex flex-col lg:hidden"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100">
              <span className="font-black uppercase tracking-tight text-[var(--deep-twilight)] text-left">
                Meniu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-[var(--deep-twilight)] hover:bg-zinc-50 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {!mobileView.parent ? (
                <div className="flex flex-col">
                  {categories.map((cat) => {
                    const hasSub =
                      cat.subcategories && cat.subcategories.length > 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          hasSub
                            ? setMobileView({ parent: cat })
                            : (navigate(`/category/${cat.slug}`),
                              setMobileOpen(false))
                        }
                        className="flex items-center justify-between px-6 py-6 border-b border-zinc-50 text-left group active:bg-zinc-50"
                      >
                        <span className="text-[18px] font-black uppercase tracking-tight text-[var(--deep-twilight)]">
                          {cat.name}
                        </span>
                        {hasSub && (
                          <ChevronRight size={22} className="text-zinc-300" />
                        )}
                      </button>
                    );
                  })}
                  <Link
                    to="/about/our-story"
                    onClick={() => setMobileOpen(false)}
                    className="px-6 py-6 border-b border-zinc-50 text-[18px] font-black uppercase tracking-tight text-zinc-400 text-left"
                  >
                    Conceptul Linea
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col animate-in slide-in-from-right duration-300">
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="flex items-center gap-2 px-6 py-4 bg-zinc-50 text-[11px] font-black uppercase tracking-widest text-[var(--french-blue)]"
                  >
                    <ChevronLeft size={16} /> Înapoi
                  </button>
                  <button
                    onClick={() => {
                      navigate(`/category/${mobileView.parent!.slug}`);
                      setMobileOpen(false);
                    }}
                    className="mx-6 mt-6 p-4 border-2 border-[var(--deep-twilight)] text-[12px] font-black uppercase tracking-widest text-center active:bg-[var(--deep-twilight)] active:text-white transition-all"
                  >
                    Vezi toate produsele {mobileView.parent!.name}
                  </button>
                  {mobileView.parent!.subcategories?.map((sub) => (
                    <div key={sub.id} className="flex flex-col">
                      <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-50 bg-zinc-50/30 text-left">
                        <span className="text-[15px] font-black uppercase tracking-tight text-[var(--deep-twilight)] text-left">
                          {sub.name}
                        </span>
                      </div>
                      {sub.subcategories?.map((child) => (
                        <Link
                          key={child.id}
                          to={`/category/${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="px-12 py-4 border-b border-zinc-50 text-[14px] font-bold text-zinc-500 active:text-[var(--french-blue)] text-left"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[96px] lg:h-[112px] w-full" />
      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />
      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />
      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <Register
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
};

export default Navbar;
