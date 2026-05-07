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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  // IMAGE HELPER (Pregătit pentru CloudFront/S3)
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
  // FETCH MENU (Adăugat headere pentru a evita 401 pe rute publice)
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

  // Close menus on route change
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMobileView({ parent: null });
  }, [location.pathname]);

  // Click outside user menu
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
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col bg-white shadow-sm">
        <div
          className="z-30 flex h-8 items-center justify-center px-4 text-center text-white"
          style={{ background: "var(--primary-gradient)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Design Premium — Calitate Impecabilă
          </p>
        </div>

        <nav
          className="relative flex h-16 items-center border-b border-zinc-100 px-4 sm:px-6 lg:h-20 lg:px-12"
          onMouseLeave={() => {
            megaMenuTimeoutRef.current = setTimeout(
              () => setMegaOpen(false),
              180,
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
              className="group flex items-center gap-3 text-[var(--deep-twilight)]"
            >
              <div className="rounded-md p-2 transition-colors group-hover:bg-zinc-100">
                <Menu size={26} />
              </div>
              <span className="hidden text-[13px] font-black uppercase tracking-tight lg:block">
                Produse
              </span>
              <ChevronDown
                size={14}
                className={`hidden transition-transform duration-300 lg:block ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* CENTER: LOGO */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Link to="/" className="pointer-events-auto group">
              <span className="text-3xl font-black uppercase tracking-tighter text-[var(--deep-twilight)] sm:text-4xl">
                Evem<span className="text-[var(--french-blue)]">.</span>
              </span>
            </Link>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="z-20 flex flex-1 items-center justify-end gap-1 sm:gap-3">
            <button
              onClick={() => setWishOpen(true)}
              className="rounded-full p-2 text-zinc-700 transition-all hover:bg-zinc-50"
            >
              <Heart size={22} />
            </button>

            {/* USER MENU */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                className={`rounded-full p-2 transition-all ${userMenuOpen ? "bg-zinc-100" : "hover:bg-zinc-50"}`}
              >
                <User size={22} className="text-zinc-700" />
              </button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-64 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
                  >
                    <div className="border-b bg-zinc-50 p-4 text-left">
                      <p className="mb-1 text-[10px] font-black uppercase text-[var(--french-blue)]">
                        Contul meu
                      </p>
                      <p className="truncate text-xs font-bold text-[var(--deep-twilight)]">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex flex-col p-2">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold text-[var(--deep-twilight)] transition-colors hover:bg-zinc-50"
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
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold text-[var(--deep-twilight)] transition-colors hover:bg-zinc-50"
                      >
                        <Package size={16} /> Comenzile mele
                      </Link>
                      {/* PAGINI NOI ADAUGATE */}
                      <Link
                        to="/account/addresses"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold text-[var(--deep-twilight)] transition-colors hover:bg-zinc-50"
                      >
                        <MapPin size={16} /> Adresele mele
                      </Link>
                      <Link
                        to="/account/settings"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold text-[var(--deep-twilight)] transition-colors hover:bg-zinc-50"
                      >
                        <Settings size={16} /> Setări cont
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} /> Ieșire
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CART ICON */}
            <button
              onClick={() => setBagOpen(true)}
              className="relative ml-1 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-black text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* MEGA MENU DESKTOP */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white shadow-2xl lg:block"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(
                  () => setMegaOpen(false),
                  180,
                );
              }}
            >
              <div className="mx-auto flex h-[550px] max-w-[1600px]">
                <div className="w-1/4 overflow-y-auto border-r border-zinc-100 bg-zinc-50 p-8">
                  <p className="mb-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
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
                        className={`flex items-center justify-between rounded-xl px-5 py-4 text-left transition-all ${activeParent?.id === cat.id ? "translate-x-2 bg-white font-black text-[var(--french-blue)] shadow-md" : "font-bold text-[var(--deep-twilight)] hover:bg-white/60"}`}
                      >
                        <span className="text-[13px] uppercase tracking-tight">
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={18}
                          className={
                            activeParent?.id === cat.id
                              ? "opacity-100"
                              : "opacity-0"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white p-12">
                  <p className="mb-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Categorii
                  </p>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                    {activeParent?.subcategories?.map((sub) => (
                      <div key={sub.id} className="space-y-5 text-left">
                        <Link
                          to={`/category/${sub.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="block border-b border-zinc-100 pb-2 text-[15px] font-black uppercase tracking-tight text-[var(--deep-twilight)] hover:text-[var(--french-blue)]"
                        >
                          {sub.name}
                        </Link>
                        <div className="flex flex-col gap-3">
                          {sub.subcategories?.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className="text-[14px] font-bold text-zinc-500 hover:translate-x-1 hover:text-[var(--deep-twilight)]"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* MEGA MENU RIGHT IMAGE */}
                <div className="flex w-1/3 flex-col bg-zinc-50/50 p-10">
                  <div className="group relative flex-1 overflow-hidden rounded-3xl bg-zinc-200 shadow-xl">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id}
                        src={getValidImageUrl(activeParent?.image_url || null)}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 z-10 text-left text-white">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--light-cyan)]">
                        Descoperă acum
                      </p>
                      <h4 className="mb-6 text-3xl font-black uppercase leading-none tracking-tighter">
                        {activeParent?.name}
                      </h4>
                      <button
                        onClick={() => {
                          navigate(`/category/${activeParent?.slug}`);
                          setMegaOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-full bg-white px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-[var(--light-cyan)]"
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

      {/* MOBILE MENU CONTENT */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[300] flex flex-col bg-white lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-6">
              <span className="text-[var(--deep-twilight)] text-lg font-black uppercase tracking-tight">
                Meniu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-50"
              >
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!mobileView.parent ? (
                <div className="flex flex-col">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        cat.subcategories?.length
                          ? setMobileView({ parent: cat })
                          : (navigate(`/category/${cat.slug}`),
                            setMobileOpen(false))
                      }
                      className="group flex items-center justify-between border-b border-zinc-50 px-6 py-6 text-left active:bg-zinc-50"
                    >
                      <span className="text-[18px] font-black uppercase tracking-tight text-[var(--deep-twilight)]">
                        {cat.name}
                      </span>
                      {cat.subcategories?.length > 0 && (
                        <ChevronRight size={22} className="text-zinc-300" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col">
                  <button
                    onClick={() => setMobileView({ parent: null })}
                    className="flex items-center gap-2 bg-zinc-50 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[var(--french-blue)]"
                  >
                    <ChevronLeft size={16} /> Înapoi
                  </button>
                  {mobileView.parent.subcategories?.map((sub) => (
                    <div key={sub.id} className="flex flex-col">
                      <div className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-5 text-[15px] font-black uppercase text-[var(--deep-twilight)]">
                        {sub.name}
                      </div>
                      {sub.subcategories?.map((child) => (
                        <Link
                          key={child.id}
                          to={`/category/${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="border-b border-zinc-50 px-12 py-4 text-[14px] font-bold text-zinc-500 active:text-[var(--french-blue)]"
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

      <div className="h-[96px] w-full lg:h-[112px]" />

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
