/**
 * AdminLayout.tsx
 * Layout-ul Principal de Administrare - Design Futuristic (Glassmorphism & Fluid Navigation)
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// ─── STRUCTURA MENIULUI (Extrasă pentru performanță) ───
const MENU_GROUPS = [
  {
    group: "Administrare",
    items: [{ name: "Overview", icon: LayoutDashboard, path: "/admin" }],
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
    group: "Logistică & Flux",
    items: [
      { name: "Comenzi", icon: ShoppingCart, path: "/admin/orders" },
      { name: "Import DB", icon: UploadCloud, path: "/admin/import" },
      { name: "Export DB", icon: DownloadCloud, path: "/admin/export" },
    ],
  },
  {
    group: "Marketing Engine",
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
    group: "Sistem & Setări",
    items: [
      { name: "Utilizatori", icon: Users, path: "/admin/users" },
      { name: "Theme Studio", icon: Palette, path: "/admin/theme" },
      { name: "Email Engine", icon: FileCode, path: "/admin/email-templates" },
    ],
  },
];

// ─── SIDEBAR COMPONENT (Memoizat) ───
const SidebarContent = memo(
  ({ isSidebarOpen, mobile, user, navigate }: any) => {
    const location = useLocation();
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    // Helper pentru inițiale profil
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
      <div className="flex flex-col h-full bg-white/40 backdrop-blur-2xl relative z-10">
        {/* ── LOGO AREA ── */}
        <div className="h-20 flex items-center shrink-0 px-6 mb-2 border-b border-white/20">
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div
              className="size-10 rounded-xl flex items-center justify-center bg-black shadow-lg shrink-0 transition-transform hover:scale-105"
              style={{ background: "var(--primary-gradient)" }}
            >
              <img
                src="/LINEA-1.svg"
                className="h-3 brightness-200 invert"
                alt="Evem"
              />
            </div>
            {(isSidebarOpen || mobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--dark-amethyst)]">
                  Atelier Suite
                </span>
                <span
                  className="text-[8px] font-bold uppercase tracking-widest"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  Admin Portal
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── MENIU NAVIGAȚIE ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8 py-6">
          {MENU_GROUPS.map((group: any, idx: number) => (
            <div key={idx} className="relative">
              {(isSidebarOpen || mobile) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[8px] font-black uppercase tracking-[0.35em] mb-3 px-2"
                  style={{
                    color: "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                  }}
                >
                  {group.group}
                </motion.p>
              )}
              <div className="flex flex-col space-y-1 relative">
                {group.items.map((item: any) => {
                  const isActive =
                    item.path === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.path);
                  const isHovered = hoveredPath === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onMouseEnter={() => setHoveredPath(item.path)}
                      onMouseLeave={() => setHoveredPath(null)}
                      className="group relative flex items-center h-[42px] rounded-xl outline-none"
                    >
                      {/* Fundal Activ Glassmorphism */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-xl shadow-sm border border-white/50"
                          style={{
                            background:
                              "color-mix(in srgb, var(--royal-violet) 8%, white)",
                          }}
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Fundal Hover Subtil */}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="sidebar-hover-bg"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background:
                              "color-mix(in srgb, var(--royal-violet) 4%, transparent)",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}

                      {/* Indicator Vertical Neon */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full z-20 shadow-[0_0_8px_var(--royal-violet)]"
                          style={{ background: "var(--royal-violet)" }}
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Conținut Element Meniu */}
                      <div className="relative z-10 flex items-center w-full">
                        <div className="w-[48px] lg:w-[60px] flex items-center justify-center shrink-0">
                          <Icon
                            size={16}
                            strokeWidth={isActive ? 2.5 : 2}
                            className="transition-colors duration-300"
                            style={{
                              color: isActive
                                ? "var(--royal-violet)"
                                : isHovered
                                  ? "var(--dark-amethyst)"
                                  : "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                            }}
                          />
                        </div>

                        {(isSidebarOpen || mobile) && (
                          <motion.span
                            animate={{
                              x: isHovered && !isActive ? 4 : 0,
                              color: isActive
                                ? "var(--royal-violet)"
                                : isHovered
                                  ? "var(--dark-amethyst)"
                                  : "#71717a",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                            className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── PROFIL UTILIZATOR FOOTER ── */}
        <div className="mt-auto p-4 border-t border-white/30 bg-white/20 shrink-0">
          <button
            onClick={() => navigate("/")}
            className="group w-full flex items-center p-2 rounded-2xl relative overflow-hidden transition-all duration-300 hover:bg-white shadow-sm border border-transparent hover:border-white/50"
          >
            <div className="relative z-10 flex items-center gap-3 w-full">
              <div className="size-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:border-rose-100 transition-colors">
                {getInitials(user?.name)}
              </div>

              {(isSidebarOpen || mobile) && (
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-[11px] font-bold text-[var(--dark-amethyst)] truncate">
                    {user?.name || "Administrator"}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 truncate flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                    <LogOut size={10} /> Ieșire Cont
                  </span>
                </div>
              )}
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
        className="hidden lg:flex flex-col bg-white/40 border-r border-zinc-200/50 h-full shrink-0 relative z-50 transition-all duration-500 ease-in-out shadow-[4px_0_24px_-10px_rgba(0,0,0,0.02)] backdrop-blur-xl"
        style={{ width: isSidebarOpen ? 260 : 80 }}
      >
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          user={user}
          navigate={navigate}
        />

        {/* Buton Collapse/Expand Sidebar plasat pe margine */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-10 size-7 bg-white border border-zinc-200 rounded-full flex items-center justify-center z-[60] shadow-md hover:shadow-lg hover:scale-110 transition-all text-zinc-400 hover:text-[var(--royal-violet)]"
        >
          {isSidebarOpen ? (
            <X size={12} strokeWidth={3} />
          ) : (
            <Menu size={12} strokeWidth={3} />
          )}
        </button>
      </aside>

      {/* ── SIDEBAR MOBIL ── */}
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
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white/90 backdrop-blur-2xl border-r border-zinc-200/50 z-[80] shadow-2xl"
            >
              <SidebarContent
                isSidebarOpen={true}
                mobile
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
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">
        {/* Header Mobil (Apare doar pe ecrane mici) */}
        <header className="lg:hidden h-16 flex items-center justify-between px-5 border-b border-zinc-200/50 bg-white/60 backdrop-blur-xl shrink-0 relative z-20 shadow-sm">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="size-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all text-[var(--dark-amethyst)] bg-white"
          >
            <Menu size={16} />
          </button>
          <img src="/LINEA-1.svg" className="h-3.5 brightness-0" alt="Evem" />
          <div className="size-10" /> {/* Spacer pentru centrare logo */}
        </header>

        <RouteProgress key={location.pathname} />

        {/* Zona de Outlet (Rutele copiilor) */}
        <main className="flex-1 overflow-y-auto w-full overflow-x-hidden relative z-10 luxury-scrollbar">
          {/* Subtle Background Pattern */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 sm:p-6 lg:p-8 xl:p-10 will-change-transform min-h-full relative z-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// ─── BARĂ DE PROGRES RUTE ───
const RouteProgress = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="absolute top-0 lg:top-0 left-0 right-0 h-[3px] z-[100] overflow-hidden pointer-events-none">
      <motion.div
        initial={{ x: "-100%", width: "50%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="h-full rounded-r-full shadow-[0_0_12px_var(--royal-violet)]"
        style={{ background: "var(--primary-gradient)" }}
      />
    </div>
  );
};

export default AdminLayout;
