import { useState, memo, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Truck,
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
  Settings,
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

const SidebarContent = memo(
  ({ isSidebarOpen, mobile, user, menuGroups, navigate }: any) => {
    const location = useLocation();
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);

    return (
      <div className="flex flex-col h-full py-4 bg-zinc-50/30">
        <div className="h-16 flex items-center shrink-0 px-6 mb-4">
          <img src="/LINEA-1.svg" className="h-3 brightness-0" alt="Evem" />
          {(isSidebarOpen || mobile) && (
            <div className="ml-3 border-l border-zinc-200 pl-3">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--royal-violet)]">
                Atelier Suite
              </p>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto luxury-scrollbar px-3 space-y-6 relative z-10">
          {menuGroups.map((group: any, idx: number) => (
            <div key={idx}>
              {(isSidebarOpen || mobile) && (
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2 px-4">
                  {group.group}
                </p>
              )}
              <div className="flex flex-col relative">
                {group.items.map((item: any) => {
                  // Fix pentru root path ("/admin") sa nu fie activ peste tot
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
                      className="group relative flex items-center h-12 my-0.5 rounded-xl outline-none"
                    >
                      {/* --- FUNDAL ACTIV (Glisează animat între tab-uri) --- */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-zinc-100"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* --- FUNDAL HOVER (Subtil) --- */}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="sidebar-hover-bg"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background:
                              "color-mix(in srgb, var(--royal-violet) 6%, transparent)",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      {/* --- INDICATOR VERTICAL (Bară stânga pe elementul activ) --- */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full z-20"
                          style={{ background: "var(--royal-violet)" }}
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <div className="relative z-10 flex items-center w-full">
                        {/* --- ICONIȚA ANIMATĂ --- */}
                        <div className="w-[54px] lg:w-[80px] flex items-center justify-center shrink-0">
                          <motion.div
                            className="flex items-center justify-center size-8 rounded-[10px] relative overflow-hidden"
                            animate={{
                              backgroundColor: isActive
                                ? "var(--primary-gradient)" // Fallback if gradients aren't supported directly in bg
                                : isHovered
                                  ? "color-mix(in srgb, var(--royal-violet) 15%, transparent)"
                                  : "rgba(0,0,0,0.03)",
                              color: isActive
                                ? "#ffffff"
                                : isHovered
                                  ? "var(--royal-violet)"
                                  : "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                              scale: isHovered && !isActive ? 1.15 : 1,
                              rotate:
                                isHovered && !isActive ? [0, -5, 5, 0] : 0, // Mic efect de wobble
                            }}
                            style={{
                              background: isActive
                                ? "var(--primary-gradient)"
                                : undefined,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                          >
                            <Icon
                              size={16}
                              strokeWidth={isActive ? 2.5 : 2}
                              className="relative z-10"
                            />
                          </motion.div>
                        </div>

                        {/* --- TEXTUL ANIMAT --- */}
                        {(isSidebarOpen || mobile) && (
                          <motion.span
                            animate={{
                              x: isHovered && !isActive ? 6 : 0, // Slide la dreapta
                              color: isActive
                                ? "var(--dark-amethyst)"
                                : isHovered
                                  ? "var(--royal-violet)"
                                  : "#71717a", // zinc-500
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                            className="text-[10px] font-black uppercase tracking-[0.2em]"
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

        {/* LOGOUT BUTTON (Cu hover styling modern) */}
        <div className="mt-auto pt-4 px-3 border-t border-zinc-100 z-10">
          <button
            onClick={() => navigate("/")}
            className="group w-full flex items-center h-12 rounded-xl relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center w-full">
              <motion.div
                className="w-[54px] lg:w-[80px] flex items-center justify-center text-zinc-400 group-hover:text-rose-500 transition-colors"
                whileHover={{ scale: 1.1, x: -2 }}
              >
                <LogOut size={16} />
              </motion.div>
              {(isSidebarOpen || mobile) && (
                <motion.span
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-rose-600 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  Ieșire Site
                </motion.span>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  },
);

SidebarContent.displayName = "SidebarContent";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const menuGroups = [
    {
      group: "Administrare",
      color: "var(--royal-violet)",
      items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/admin" }],
    },
    {
      group: "Catalog Evem",
      color: "var(--royal-violet)",
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
      color: "var(--royal-violet)",
      items: [
        { name: "Comenzi", icon: ShoppingCart, path: "/admin/orders" },
        { name: "Import", icon: UploadCloud, path: "/admin/import" },
        { name: "Export", icon: DownloadCloud, path: "/admin/export" },
      ],
    },
    {
      group: "Marketing",
      color: "var(--royal-violet)",
      items: [
        { name: "Cupoane", icon: Ticket, path: "/admin/coupons" },
        { name: "Recenzii", icon: Star, path: "/admin/reviews" },
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
      color: "var(--royal-violet)",
      items: [
        { name: "Utilizatori", icon: Users, path: "/admin/users" },
        { name: "Theme Studio", icon: Palette, path: "/admin/theme" },
        { name: "Email", icon: FileCode, path: "/admin/email-templates" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 flex bg-white font-sans overflow-hidden w-full h-screen selection:bg-[var(--royal-violet)] selection:text-white">
      <aside
        className="hidden lg:flex flex-col bg-white border-r border-zinc-100 h-full shrink-0 relative z-50 transition-all duration-300 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.02)]"
        style={{ width: isSidebarOpen ? 240 : 80 }}
      >
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          menuGroups={menuGroups}
          user={user}
          navigate={navigate}
        />
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-1/2 size-6 bg-white border border-zinc-100 rounded-full flex items-center justify-center z-[60] shadow-sm hover:shadow-md hover:scale-110 transition-all text-zinc-400 hover:text-[var(--royal-violet)]"
        >
          {isSidebarOpen ? (
            <X size={10} strokeWidth={3} />
          ) : (
            <Menu size={10} strokeWidth={3} />
          )}
        </button>
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-zinc-950/30 backdrop-blur-sm z-[70]"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[260px] bg-white border-r border-zinc-100 z-[80] shadow-2xl"
            >
              <SidebarContent
                isSidebarOpen={true}
                mobile
                menuGroups={menuGroups}
                user={user}
                navigate={navigate}
              />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 size-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
              >
                <X size={14} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full bg-[var(--background)] overflow-hidden relative">
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-zinc-100 bg-white shrink-0 relative z-20">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="size-10 rounded-xl border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-all text-[var(--dark-amethyst)]"
          >
            <Menu size={16} />
          </button>
          <img src="/LINEA-1.svg" className="h-3 brightness-0" alt="Evem" />
          <div className="size-10" />
        </header>

        {/* Premium top progress bar */}
        <RouteProgress key={location.pathname} />

        <main className="flex-1 overflow-y-auto w-full overflow-x-hidden relative z-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="p-4 sm:p-6 lg:p-10 will-change-transform"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const RouteProgress = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] overflow-hidden pointer-events-none">
      <motion.div
        initial={{ x: "-40%", width: "40%" }}
        animate={{ x: "120%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="h-full shadow-[0_0_10px_var(--royal-violet)]"
        style={{ background: "var(--primary-gradient)" }}
      />
    </div>
  );
};

export default AdminLayout;
