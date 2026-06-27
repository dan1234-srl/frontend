/**
 * AdminLayout.tsx
 * Layout-ul Principal de Administrare - Design Enterprise Clean (Stabil, 100% Responsiv)
 */

import { useState, memo, useEffect } from "react";
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
      { name: "Import DB", icon: UploadCloud, path: "/admin/import" },
      { name: "Export DB", icon: DownloadCloud, path: "/admin/export" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { name: "Cupoane Promo", icon: Ticket, path: "/admin/coupons" },
      { name: "Recenzii Clienți", icon: Star, path: "/admin/reviews" },
      {
        name: "Wishlist Trends",
        icon: Heart,
        path: "/admin/wishlist-analytics",
      },
      { name: "Newsletter", icon: Mail, path: "/admin/newsletter" },
    ],
  },
  {
    group: "Sistem",
    items: [
      { name: "Utilizatori", icon: Users, path: "/admin/users" },
      { name: "Theme Studio", icon: Palette, path: "/admin/theme" },
      { name: "Email Engine", icon: FileCode, path: "/admin/email-templates" },
    ],
  },
];

// ─── COMPONENTĂ MENIU LATERAL (SIDEBAR) ───
const SidebarContent = memo(
  ({ isSidebarOpen, mobile, user, navigate }: any) => {
    const location = useLocation();

    // Determină dacă suntem în starea restrânsă (pe desktop)
    const isCollapsed = !isSidebarOpen && !mobile;

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
      <div className="flex flex-col h-full bg-white relative z-10 w-full">
        {/* ── HEADER LOGO ── */}
        <div
          className={`h-20 shrink-0 flex items-center border-b border-zinc-100 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-6"}`}
        >
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap w-full">
            <div
              className={`rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${isCollapsed ? "size-12 mx-auto" : "size-10"}`}
              style={{ background: "var(--primary-gradient)" }}
            >
              <span className="text-white font-black text-lg leading-none">
                L
              </span>
            </div>

            <div
              className={`flex flex-col min-w-0 transition-all duration-300 overflow-hidden ${isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-1"}`}
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--dark-amethyst)] leading-tight">
                Atelier Suite
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
                Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* ── MENIU LINKURI ── */}
        <div className="flex-1 overflow-y-auto luxury-scrollbar py-6 space-y-8 overflow-x-hidden">
          {MENU_GROUPS.map((group: any, idx: number) => (
            <div key={idx} className="relative">
              {/* Titlu Grup */}
              <div
                className={`px-6 mb-3 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "opacity-0 h-0 mb-0" : "opacity-100 h-auto"}`}
              >
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 truncate">
                  {group.group}
                </p>
              </div>

              {/* Divider subtil când e colapsat */}
              {isCollapsed && idx !== 0 && (
                <div className="w-6 h-[1px] bg-zinc-100 mx-auto mb-4 rounded-full" />
              )}

              <div className="flex flex-col space-y-1.5 px-3">
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
                      className={`group relative flex items-center h-[46px] rounded-xl outline-none transition-all duration-200 overflow-hidden
                      ${isCollapsed ? "mx-2 justify-center px-0" : "mx-1 px-2.5"}
                      ${isActive ? "bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-zinc-100" : "hover:bg-zinc-50 border border-transparent"}
                    `}
                    >
                      {/* Indicator Vertical Stânga */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-[20%] bottom-[20%] w-1 rounded-r-full"
                          style={{ background: "var(--royal-violet)" }}
                        />
                      )}

                      <div className="relative z-10 flex items-center w-full">
                        {/* Icon Container */}
                        <div
                          className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isCollapsed ? "w-full" : "w-[40px]"}`}
                        >
                          <div
                            className={`flex items-center justify-center size-8 rounded-[10px] transition-all duration-300 ${isActive ? "shadow-md" : "group-hover:scale-110"}`}
                            style={{
                              background: isActive
                                ? "var(--primary-gradient)"
                                : "transparent",
                              backgroundColor: !isActive
                                ? "rgba(0,0,0,0.03)"
                                : undefined,
                              color: isActive
                                ? "#ffffff"
                                : "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                            }}
                          >
                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                          </div>
                        </div>

                        {/* Text */}
                        <div
                          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"}`}
                        >
                          <span
                            className={`text-[10px] uppercase tracking-[0.15em] transition-colors duration-200 ${isActive ? "font-black text-[var(--dark-amethyst)]" : "font-bold text-zinc-500 group-hover:text-[var(--royal-violet)]"}`}
                          >
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER LOGOUT ── */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
          <button
            onClick={() => navigate("/")}
            title={isCollapsed ? "Ieșire" : undefined}
            className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 border border-transparent hover:bg-white hover:border-zinc-200 hover:shadow-sm group overflow-hidden whitespace-nowrap ${isCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="size-9 rounded-[10px] bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-black uppercase text-zinc-500 shrink-0 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:border-rose-100 transition-colors duration-300">
              {isCollapsed ? (
                <LogOut size={14} className="ml-1" />
              ) : (
                getInitials(user?.name)
              )}
            </div>

            <div
              className={`flex flex-col min-w-0 flex-1 text-left transition-all duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
            >
              <span className="text-[11px] font-bold text-[var(--dark-amethyst)] truncate">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[9px] font-semibold text-rose-500 truncate flex items-center gap-1 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <LogOut size={10} /> Ieșire Cont
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  },
);

SidebarContent.displayName = "SidebarContent";

// ─── COMPONENTA PRINCIPALĂ LAYOUT ───
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Închide sidebar-ul pe mobil la schimbarea rutei
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex bg-[#fbfbfd] font-sans overflow-hidden w-full h-screen selection:bg-[var(--royal-violet)] selection:text-white">
      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className="hidden lg:flex flex-col bg-white border-r border-zinc-200/60 h-full shrink-0 relative z-50 transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[4px_0_24px_-10px_rgba(0,0,0,0.02)]"
        style={{ width: isSidebarOpen ? 260 : 88 }} // 88px pentru collapse, 260px deschis
      >
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          user={user}
          navigate={navigate}
          mobile={false}
        />

        {/* Buton Collapse/Expand Sidebar plasat pe margine */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-[3.25rem] size-7 bg-white border border-zinc-200 rounded-full flex items-center justify-center z-[60] shadow-sm hover:shadow-md hover:scale-110 transition-all text-zinc-400 hover:text-[var(--royal-violet)]"
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
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-zinc-200 z-[80] shadow-2xl flex flex-col"
            >
              <SidebarContent
                isSidebarOpen={true}
                mobile={true}
                user={user}
                navigate={navigate}
              />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 right-4 size-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white text-zinc-500 hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── ZONA DE CONȚINUT PRINCIPALĂ ── */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent min-w-0">
        {/* Header Mobil */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-zinc-200/60 bg-white shrink-0 relative z-20 shadow-sm">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="size-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all text-[var(--dark-amethyst)] bg-white"
          >
            <Menu size={16} />
          </button>
          <img src="" className="h-3.5 brightness-0" alt="EVEM" />
          <div className="size-10" /> {/* Spacer pentru centrare logo */}
        </header>

        <RouteProgress key={location.pathname} />

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto w-full overflow-x-hidden relative z-10 luxury-scrollbar bg-[#fbfbfd]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.99, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-4 sm:p-6 lg:p-8 xl:p-10 min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// ─── BARĂ DE PROGRES PENTRU RUTARE ───
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
        className="h-full rounded-r-full shadow-[0_0_12px_var(--royal-violet)]"
        style={{ background: "var(--primary-gradient)" }}
      />
    </div>
  );
};

export default AdminLayout;
