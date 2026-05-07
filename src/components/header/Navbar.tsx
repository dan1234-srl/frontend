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

  const [mobileView, setMobileView] = useState<{
    parent: Category | null;
  }>({
    parent: null,
  });

  const userMenuRef = useRef<HTMLDivElement>(null);

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =========================
  // IMAGE HELPER
  // =========================
  const getValidImageUrl = (imageSource: string | null) => {
    if (!imageSource) {
      return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200";
    }

    if (imageSource.startsWith("http")) {
      return imageSource;
    }

    try {
      const parsed = JSON.parse(imageSource);

      return (
        parsed?.main?.large ||
        parsed?.main?.medium ||
        parsed?.main?.small ||
        parsed?.url ||
        ""
      );
    } catch {
      return imageSource.startsWith("/")
        ? `${API_BASE_URL}${imageSource}`
        : imageSource;
    }
  };

  // =========================
  // MEGA MENU
  // =========================
  const handleMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }

    setMegaOpen(true);
  };

  const handleMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaOpen(false);
    }, 180);
  };

  // =========================
  // FETCH MENU
  // =========================
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);

      if (!res.ok) {
        throw new Error("Failed categories fetch");
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setCategories(data);

        if (data.length > 0) {
          setActiveParent(data[0]);
        }
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

    setMobileView({
      parent: null,
    });
  }, [location.pathname]);

  // =========================
  // CLOSE USER MENU CLICK OUTSIDE
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // LOCK BODY
  // =========================
  useEffect(() => {
    const shouldLock =
      mobileOpen ||
      loginOpen ||
      registerOpen ||
      forgotOpen ||
      bagOpen ||
      wishOpen;

    document.body.style.overflow = shouldLock ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen, loginOpen, registerOpen, forgotOpen, bagOpen, wishOpen]);

  // =========================
  // ESC KEY
  // =========================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);

        setLoginOpen(false);
        setRegisterOpen(false);
        setForgotOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
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
      console.error(error);

      toast.error("Eroare la deconectare.");
    }
  };

  return (
    <>
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col bg-white shadow-sm">
        {/* TOP BAR */}

        <div
          className="z-30 flex h-8 items-center justify-center px-4 text-center text-white"
          style={{
            background: "var(--primary-gradient)",
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Design Premium — Calitate Impecabilă
          </p>
        </div>

        {/* NAVBAR */}

        <nav
          className="relative flex h-16 items-center border-b border-zinc-100 px-4 sm:px-6 lg:h-20 lg:px-12"
          onMouseLeave={handleMouseLeave}
        >
          {/* LEFT */}

          <div className="z-20 flex flex-1 items-center gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              onMouseEnter={handleMouseEnter}
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
                className={`hidden transition-transform duration-300 lg:block ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* LOGO */}

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Link to="/" className="pointer-events-auto group">
              <span className="text-3xl font-black uppercase tracking-tighter text-[var(--deep-twilight)] sm:text-4xl">
                Evem
                <span className="text-[var(--french-blue)]">.</span>
              </span>
            </Link>
          </div>

          {/* RIGHT */}

          <div className="z-20 flex flex-1 items-center justify-end gap-1 sm:gap-3">
            {/* WISHLIST */}

            <button
              onClick={() => setWishOpen(true)}
              className="rounded-full p-2 text-zinc-700 transition-all hover:bg-zinc-50"
            >
              <Heart size={22} />
            </button>

            {/* USER */}

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  if (user) {
                    setUserMenuOpen((prev) => !prev);
                  } else {
                    setLoginOpen(true);
                  }
                }}
                className={`rounded-full p-2 transition-all ${
                  userMenuOpen ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
              >
                <User size={22} className="text-zinc-700" />
              </button>

              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
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
                          />
                          Administrare
                        </Link>
                      )}

                      <Link
                        to="/account/orders"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold text-[var(--deep-twilight)] transition-colors hover:bg-zinc-50"
                      >
                        <Package size={16} />
                        Comenzile mele
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-black uppercase text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Ieșire
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CART */}

            <button
              onClick={() => setBagOpen(true)}
              className="relative ml-1 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95"
              style={{
                background: "var(--primary-gradient)",
              }}
            >
              <BagIcon size={20} />

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-black text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* ========================= */}
        {/* DESKTOP MEGA MENU */}
        {/* ========================= */}

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.2,
              }}
              className="absolute left-0 top-full z-[100] hidden w-full border-t border-zinc-100 bg-white shadow-2xl lg:block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="mx-auto flex h-[550px] max-w-[1600px]">
                {/* LEFT */}

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
                        className={`flex items-center justify-between rounded-xl px-5 py-4 text-left transition-all ${
                          activeParent?.id === cat.id
                            ? "translate-x-2 bg-white font-black text-[var(--french-blue)] shadow-md"
                            : "font-bold text-[var(--deep-twilight)] hover:bg-white/60"
                        }`}
                      >
                        <span className="text-[13px] uppercase tracking-tight">
                          {cat.name}
                        </span>

                        <ChevronRight
                          size={18}
                          className={`transition-opacity ${
                            activeParent?.id === cat.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* CENTER */}

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
                          className="block border-b border-zinc-100 pb-2 text-[15px] font-black uppercase tracking-tight text-[var(--deep-twilight)] transition-colors hover:text-[var(--french-blue)]"
                        >
                          {sub.name}
                        </Link>

                        <div className="flex flex-col gap-3">
                          {sub.subcategories?.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className="text-[14px] font-bold text-zinc-500 transition-all hover:translate-x-1 hover:text-[var(--deep-twilight)]"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex w-1/3 flex-col bg-zinc-50/50 p-10">
                  <div className="group relative flex-1 overflow-hidden rounded-3xl bg-zinc-200 shadow-xl">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeParent?.id}
                        initial={{
                          opacity: 0,
                          scale: 1.05,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                        src={getValidImageUrl(activeParent?.image_url || null)}
                        alt={activeParent?.name}
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
                        className="flex items-center gap-3 rounded-full bg-white px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-lg transition-colors hover:bg-[var(--light-cyan)]"
                      >
                        Vezi Tot
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
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
            initial={{
              x: "-100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "-100%",
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed inset-0 z-[300] flex flex-col bg-white lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-6">
              <span className="text-[var(--deep-twilight)] text-lg font-black uppercase tracking-tight">
                Meniu
              </span>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 transition-colors hover:bg-zinc-50"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!mobileView.parent ? (
                <div className="flex flex-col">
                  {categories.map((cat) => {
                    const hasSub =
                      cat.subcategories && cat.subcategories.length > 0;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          if (hasSub) {
                            setMobileView({
                              parent: cat,
                            });
                          } else {
                            navigate(`/category/${cat.slug}`);

                            setMobileOpen(false);
                          }
                        }}
                        className="group flex items-center justify-between border-b border-zinc-50 px-6 py-6 text-left active:bg-zinc-50"
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
                </div>
              ) : (
                <div className="animate-in slide-in-from-right flex flex-col duration-300">
                  <button
                    onClick={() =>
                      setMobileView({
                        parent: null,
                      })
                    }
                    className="flex items-center gap-2 bg-zinc-50 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[var(--french-blue)]"
                  >
                    <ChevronLeft size={16} />
                    Înapoi
                  </button>

                  <button
                    onClick={() => {
                      navigate(`/category/${mobileView.parent!.slug}`);

                      setMobileOpen(false);
                    }}
                    className="mx-6 mt-6 border-2 border-[var(--deep-twilight)] p-4 text-center text-[12px] font-black uppercase tracking-widest transition-all active:bg-[var(--deep-twilight)] active:text-white"
                  >
                    Vezi toate produsele {mobileView.parent!.name}
                  </button>

                  {mobileView.parent!.subcategories?.map((sub) => (
                    <div key={sub.id} className="flex flex-col">
                      <div className="flex items-center justify-between border-b border-zinc-50 bg-zinc-50/30 px-8 py-5 text-left">
                        <span className="text-[15px] font-black uppercase tracking-tight text-[var(--deep-twilight)]">
                          {sub.name}
                        </span>
                      </div>

                      {sub.subcategories?.map((child) => (
                        <Link
                          key={child.id}
                          to={`/category/${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="border-b border-zinc-50 px-12 py-4 text-[14px] font-bold text-zinc-500 transition-colors active:text-[var(--french-blue)]"
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

      {/* SPACER */}

      <div className="h-[96px] w-full lg:h-[112px]" />

      {/* DRAWERS */}

      <ShoppingBag isOpen={bagOpen} onClose={() => setBagOpen(false)} />

      <WishlistDrawer isOpen={wishOpen} onClose={() => setWishOpen(false)} />

      {/* LOGIN */}

      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);

          setTimeout(() => {
            setRegisterOpen(true);
          }, 150);
        }}
        onOpenForgot={() => {
          setLoginOpen(false);

          setTimeout(() => {
            setForgotOpen(true);
          }, 150);
        }}
      />

      {/* REGISTER */}

      <Register
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);

          setTimeout(() => {
            setLoginOpen(true);
          }, 150);
        }}
      />

      {/* FORGOT PASSWORD */}

      <ForgotPasswordDrawer
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onBackToLogin={() => {
          setForgotOpen(false);

          setTimeout(() => {
            setLoginOpen(true);
          }, 150);
        }}
      />
    </>
  );
};

export default Navbar;
