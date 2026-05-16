import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag as BagIcon,
  LogOut,
  ShieldCheck,
  Heart,
  Package,
  Sparkles,
  Search,
  MapPin,
  Settings,
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
import SearchModal from "./SearchModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 50], ["5.5rem", "4.5rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.98)"],
  );

  // Preluăm voucherele direct aici pentru a le include nativ în fluxul fix de sus
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/vouchers/active-ticker`)
      .then((res) => res.json())
      .then(setVouchers)
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesiune încheiată.");
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[200] flex flex-col w-full bg-white shadow-sm border-b border-zinc-100">
        {/* 1. TOP BAR - MESAJ PROMO */}
        <div
          className="z-30 flex h-8 w-full items-center justify-center px-4 text-center text-white shrink-0"
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

        {/* 2. NAVBAR NAVIGATION */}
        <motion.nav
          style={{ height: navHeight, backgroundColor: navBg }}
          className="relative flex w-full items-center justify-between px-4 sm:px-6 lg:px-12 transform-gpu transition-all"
        >
          {/* LEFT SECTION: MODERN SEARCH */}
          <div className="flex flex-1 items-center justify-start">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full py-2 px-5 group hover:bg-zinc-100 transition-all duration-300"
            >
              <Search
                size={15}
                className="text-zinc-400 group-hover:text-black transition-colors"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-black transition-colors">
                Caută în colecție
              </span>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-zinc-50 transition-colors"
            >
              <Search size={20} className="text-black" />
            </button>
          </div>

          {/* CENTER SECTION: LOGO */}
          <div className="flex-shrink-0 flex items-center justify-center px-4">
            <Link to="/" className="group">
              <motion.img
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                src="/Copilot_20260512_191942.png"
                alt="Evem Luxury"
                className="h-6 sm:h-7 lg:h-9 w-auto object-contain transition-all"
              />
            </Link>
          </div>

          {/* RIGHT SECTION: ACTIONS */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 lg:gap-4">
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setWishOpen(true)}
              className="flex items-center justify-center h-10 w-10 rounded-full text-zinc-700 hover:text-red-500 hover:bg-zinc-50 transition-all"
            >
              <Heart size={20} />
            </motion.button>

            {/* USER MENU */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() =>
                  user ? setUserMenuOpen(!userMenuOpen) : setLoginOpen(true)
                }
                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${userMenuOpen ? "bg-zinc-100" : "hover:bg-zinc-50 text-zinc-700"}`}
              >
                <User size={20} />
              </motion.button>
              <AnimatePresence>
                {user && userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 overflow-hidden rounded-[1.2rem] border border-zinc-100 bg-white shadow-2xl p-2"
                  >
                    <div className="bg-zinc-50 p-4 rounded-xl mb-1">
                      <p className="text-[9px] font-black uppercase text-[var(--french-blue)] tracking-widest">
                        Contul tău
                      </p>
                      <p className="truncate text-xs font-bold text-zinc-900">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                      >
                        <ShieldCheck size={16} className="text-blue-600" />{" "}
                        Administrare
                      </Link>
                    )}
                    <Link
                      to="/account/orders"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                    >
                      <Package size={16} /> Comenzile mele
                    </Link>
                    <Link
                      to="/account/addresses"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                    >
                      <MapPin size={16} /> Adresele mele
                    </Link>
                    <Link
                      to="/account/settings"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold hover:bg-zinc-50 transition-colors"
                    >
                      <Settings size={16} /> Setări cont
                    </Link>
                    <div className="h-px bg-zinc-100 my-1 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Ieșire
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SHOPPING BAG */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBagOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md"
              style={{ background: "var(--primary-gradient)" }}
            >
              <BagIcon size={18} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[9px] font-black">
                  {totalItems}
                </span>
              )}
            </motion.button>
          </div>
        </motion.nav>

        {/* 3. VOUCHERS TICKER - INTEGRAT NATIV ÎN INVELIȘUL FIXED */}
        <AnimatePresence>
          {vouchers.length > 0 && (
            <section className="w-full bg-zinc-950 py-3 border-t border-zinc-900 relative overflow-hidden shrink-0">
              <div className="flex whitespace-nowrap">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex gap-24 items-center px-10"
                >
                  {[...vouchers, ...vouchers].map((v, idx) => (
                    <div
                      key={`${v.id}-${idx}`}
                      className="flex items-center gap-6"
                    >
                      <span className="text-[#9bdda2] text-sm font-black tracking-wide">
                        {v.discount_value}
                      </span>
                      <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">
                        {v.code}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>
          )}
        </AnimatePresence>
      </header>

      {/* SEARCH MODAL */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* OVERLAYS & MODALS */}
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
