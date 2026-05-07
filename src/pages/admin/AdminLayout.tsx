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
  Users,
  Menu,
  X,
  Ticket,
  Settings,
  Palette,
  FileCode,
  LogOut,
  Mail,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

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
        // --- NOU: Wishlist Analytics ---
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
        { name: "Setări", icon: Settings, path: "/admin/settings" },
        { name: "Theme Studio", icon: Palette, path: "/admin/theme" },
        { name: "Email", icon: FileCode, path: "/admin/email-templates" },
      ],
    },
  ];
  
  const SidebarItem = ({ item, groupColor, mobile = false }: any) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(item.path);
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        className={`group relative flex items-center h-11 my-0.5 rounded-xl transition-all duration-200 ${
          isActive ? "bg-zinc-100" : "hover:bg-zinc-50"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="active-highlight"
            className="absolute left-0 w-1 h-5 rounded-r-full z-20"
            style={{ backgroundColor: groupColor }}
          />
        )}

        <div className="w-[54px] lg:w-[80px] flex items-center justify-center shrink-0 z-10">
          <div
            className="flex items-center justify-center size-8 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: isActive ? groupColor : "rgba(0,0,0,0.05)",
              color: isActive ? "#ffffff" : groupColor,
            }}
          >
            <Icon size={16} />
          </div>
        </div>

        {(isSidebarOpen || mobile) && (
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isActive ? "text-zinc-950" : "text-zinc-500"
            }`}
          >
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full py-4">
      <div className="h-16 flex items-center shrink-0 px-6 mb-4">
        <img src="/LINEA-1.svg" className="h-3 brightness-0" alt="Evem" />
        {(isSidebarOpen || mobile) && (
          <div className="ml-3 border-l border-zinc-100 pl-3">
            <p
              className="text-[8px] font-black uppercase tracking-[0.3em]"
              style={{ color: "var(--royal-violet)" }}
            >
              Atelier Suite
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto luxury-scrollbar px-3 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {(isSidebarOpen || mobile) && (
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-2 px-4">
                {group.group}
              </p>
            )}
            <div className="flex flex-col">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.name}
                  item={item}
                  groupColor={group.color}
                  mobile={mobile}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Area with Avatar Fix */}
      <div className="mt-auto pt-4 px-3 space-y-2 border-t border-zinc-50">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* REPARAT: Avatar-ul are acum stilul de gradient forțat */}
          <div
            className="size-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0"
            style={{ background: "var(--primary-gradient)", border: "none" }}
          >
            {user?.first_name?.[0] || "A"}
          </div>
          {(isSidebarOpen || mobile) && (
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-black text-zinc-900 truncate uppercase tracking-tighter">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">
                Administrator
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center h-11 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <div
            className={`${isSidebarOpen || mobile ? "w-[54px]" : "w-[80px]"} flex items-center justify-center shrink-0`}
          >
            <LogOut size={16} />
          </div>
          {(isSidebarOpen || mobile) && (
            <span className="text-[10px] font-black uppercase tracking-widest">
              Ieșire Site
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex bg-white font-sans overflow-hidden w-full h-screen">
      <LayoutGroup id="admin-sidebar-group">
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 240 : 80 }}
          className="hidden lg:flex flex-col bg-white border-r border-zinc-100 h-full shrink-0 relative z-50 shadow-[2px_0_12px_rgba(0,0,0,0.01)]"
        >
          <SidebarContent />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 size-6 bg-white border border-zinc-100 rounded-full flex items-center justify-center text-zinc-300 hover:text-zinc-900 shadow-sm z-[60] transition-colors"
          >
            {isSidebarOpen ? <X size={10} /> : <Menu size={10} />}
          </button>
        </motion.aside>

        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[260px] bg-white z-[101] lg:hidden flex flex-col shadow-2xl"
              >
                <SidebarContent mobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col h-full bg-[var(--background)] relative overflow-hidden transition-colors duration-700">
          {/* MOBILE HEADER - Avatar fix aici de asemenea */}
          <header className="lg:hidden h-14 border-b border-zinc-100 bg-white flex items-center justify-between px-4 shrink-0 z-40">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-zinc-900"
            >
              <Menu size={20} />
            </button>
            <img
              src="/LINEA-1.svg"
              className="h-2.5 brightness-0"
              alt="Linea"
            />
            <div
              className="size-7 rounded-full flex items-center justify-center text-white text-[9px] font-black"
              style={{ background: "var(--primary-gradient)" }}
            >
              {user?.first_name?.[0] || "A"}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto relative h-full custom-scrollbar">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-4 sm:p-6 lg:p-10 min-h-full"
              >
                <div className="max-w-[1600px] mx-auto w-full">
                  <Outlet />
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default AdminLayout;
