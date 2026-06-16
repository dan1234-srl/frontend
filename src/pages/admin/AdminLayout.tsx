/**
 * AdminLayout.tsx
 * Layout-ul Principal de Administrare - Design Futuristic (Floating Bento & Glassmorphism)
 */

import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Tag,
  ListTree,
  UploadCloud,
  DownloadCloud,
  ShoppingCart,
  Star,
  Menu,
  X,
  Ticket,
  Palette,
  FileCode,
  LogOut,
  Mail,
  Heart,
  Users,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// ─── STRUCTURA MENIULUI ───
const MENU_GROUPS = [
  {
    group: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/admin" }],
  },
  {
    group: "Catalog Evem",
    items: [
      { name: "Produse", icon: ShoppingBag, path: "/admin/products" },
      { name: "Categorii", icon: Layers, path: "/admin/categories" },
      { name: "Colecții", icon: FolderTree, path: "/admin/collections" },
      { name: "Branduri", icon: Tag, path: "/admin/brands" },
      { name: "Atribute", icon: ListTree, path: "/admin/attributes" },
    ],
  },
  {
    group: "Logistică",
    items: [
      { name: "Comenzi", icon: ShoppingCart, path: "/admin/orders" },
      { name: "Import", icon: UploadCloud, path: "/admin/import" },
      { name: "Export", icon: DownloadCloud, path: "/admin/export" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { name: "Cupoane", icon: Ticket, path: "/admin/coupons" },
      { name: "Recenzii", icon: Star, path: "/admin/reviews" },
      { name: "Wishlist", icon: Heart, path: "/admin/wishlist-analytics" },
      { name: "Newsletter", icon: Mail, path: "/admin/newsletter" },
    ],
  },
  {
    group: "Sistem",
    items: [
      { name: "Utilizatori", icon: Users, path: "/admin/users" },
      { name: "Theme Studio", icon: Palette, path: "/admin/theme" },
      { name: "Email", icon: FileCode, path: "/admin/email-templates" },
    ],
  },
];

// ─── SIDEBAR CONTENT (Desktop & Mobile) ───
const SidebarContent = ({ isCollapsed, isMobile, user, navigate }: any) => {
  const location = useLocation();

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-2xl rounded-none lg:rounded-[2rem] lg:shadow-2xl lg:shadow-zinc-200/50 border-r lg:border border-zinc-100 overflow-hidden transition-all duration-300">
      {/* HEADER LOGO */}
      <div
        className={`h-20 shrink-0 flex items-center border-b border-zinc-100 transition-all ${isCollapsed ? "justify-center px-0" : "px-6"}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="size-10 rounded-xl flex items-center justify-center bg-black shadow-md shrink-0"
            style={{ background: "var(--primary-gradient)" }}
          >
            {isCollapsed ? (
              <span className="text-white font-black text-lg">L</span>
            ) : (
              <img
                src="/LINEA-1.svg"
                className="h-3 brightness-200 invert"
                alt="Evem"
              />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-300">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--dark-amethyst)]">
                Atelier Suite
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                Admin Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION SCROLL AREA */}
      <div className="flex-1 overflow-y-auto luxury-scrollbar py-6 space-y-8">
        {MENU_GROUPS.map((group: any, idx: number) => (
          <div key={idx} className="relative">
            {!isCollapsed && (
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-3 px-6 truncate transition-opacity duration-300">
                {group.group}
              </p>
            )}
            {isCollapsed && (
              <div className="w-6 h-[1px] bg-zinc-100 mx-auto mb-3 rounded-full" />
            )}

            <div className="flex flex-col space-y-1">
              {group.items.map((item: any) => {
                const isActive =
                  item.path === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`group flex items-center h-12 transition-all duration-200 relative overflow-hidden
                      ${isCollapsed ? "mx-3 justify-center rounded-xl" : "mx-4 px-4 rounded-xl"}
                      ${isActive ? "bg-[var(--royal-violet)]/10" : "hover:bg-zinc-50"}
                    `}
                  >
                    {/* Active Indicator Line */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full"
                        style={{ background: "var(--royal-violet)" }}
                      />
                    )}

                    <div className="relative z-10 flex items-center w-full">
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-colors shrink-0 ${isCollapsed ? "mx-auto" : "mr-4"}`}
                        style={{
                          color: isActive
                            ? "var(--royal-violet)"
                            : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                        }}
                      />
                      {!isCollapsed && (
                        <span
                          className={`text-[11px] uppercase tracking-wider truncate transition-colors ${isActive ? "font-black text-[var(--royal-violet)]" : "font-bold text-zinc-500 group-hover:text-zinc-800"}`}
                        >
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* USER PROFILE FOOTER */}
      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
        <button
          onClick={() => navigate("/")}
          title={isCollapsed ? "Ieșire Cont" : undefined}
          className={`w-full flex items-center p-2 rounded-xl transition-all border border-transparent hover:bg-white hover:border-zinc-200 hover:shadow-sm ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="size-9 rounded-[10px] bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-black uppercase text-[var(--dark-amethyst)] shrink-0">
            {getInitials(user?.name)}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1 text-left">
              <span className="text-[11px] font-bold text-[var(--dark-amethyst)] truncate">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[9px] font-semibold text-rose-500 truncate flex items-center gap-1 mt-0.5">
                <LogOut size={10} /> Ieșire
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN LAYOUT COMPONENT ───
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Resetare mobile drawer la navigare
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex bg-[#f4f4f5] font-sans overflow-hidden w-full h-screen selection:bg-[var(--royal-violet)] selection:text-white">
      {/* ── SIDEBAR DESKTOP (Floating Bento) ── */}
      <aside
        className="hidden lg:flex flex-col h-full shrink-0 relative z-50 py-4 pl-4 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: isSidebarOpen ? 280 : 100 }}
      >
        <SidebarContent
          isCollapsed={!isSidebarOpen}
          isMobile={false}
          user={user}
          navigate={navigate}
        />

        {/* Toggle Button (Floating pe margine) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 size-7 bg-white border border-zinc-200 rounded-full flex items-center justify-center z-[60] shadow-md hover:shadow-lg hover:scale-110 hover:text-[var(--royal-violet)] transition-all text-zinc-400"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={14} strokeWidth={3} />
          ) : (
            <ChevronRight size={14} strokeWidth={3} />
          )}
        </button>
      </aside>

      {/* ── SIDEBAR MOBIL (Slide-out Drawer) ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[70]"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[80] shadow-2xl"
            >
              <SidebarContent
                isCollapsed={false}
                isMobile={true}
                user={user}
                navigate={navigate}
              />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 right-4 size-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── ZONA PRINCIPALĂ DE CONȚINUT ── */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">
        {/* Header Mobil Glassmorphism */}
        <header className="lg:hidden h-16 flex items-center justify-between px-5 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 shrink-0 relative z-20 shadow-sm">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="size-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all text-[var(--dark-amethyst)] bg-white"
          >
            <Menu size={16} />
          </button>
          <img src="/LINEA-1.svg" className="h-3.5 brightness-0" alt="Evem" />
          <div className="size-10" /> {/* Spacer pentru echilibru vizual */}
        </header>

        <RouteProgress key={location.pathname} />

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto w-full overflow-x-hidden relative z-10 luxury-scrollbar pt-2 lg:pt-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.99, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-4 sm:p-6 lg:p-8 xl:p-10 will-change-transform min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// ─── BARĂ DE PROGRES PENTRU RUTARE (Feedback vizual instant) ───
const RouteProgress = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="absolute top-0 lg:top-0 left-0 right-0 h-[2px] z-[100] overflow-hidden pointer-events-none">
      <motion.div
        initial={{ x: "-100%", width: "40%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="h-full shadow-[0_0_10px_var(--royal-violet)]"
        style={{ background: "var(--primary-gradient)" }}
      />
    </div>
  );
};

export default AdminLayout;
