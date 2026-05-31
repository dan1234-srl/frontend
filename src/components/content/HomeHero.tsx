import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  ShoppingBag,
  Search,
} from "lucide-react";
import heroBanner from "@/assets/evem-hero-banner.jpg";
import Fuse from "fuse.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const HomeHero = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeParent, setActiveParent] = useState<any>(null);
  const navigate = useNavigate();

  // Logica de filtrare și sortare
  const filteredCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    if (!searchQuery) return sorted;

    const fuse = new Fuse(sorted, {
      keys: ["name"],
      threshold: 0.3,
      shouldSort: true,
    });

    return fuse.search(searchQuery).map((result) => result.item);
  }, [categories, searchQuery]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleScrollToProducts = () => {
    const productsSection = document.getElementById("products-grid");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="w-full text-left">
      <div className="w-full flex flex-col-reverse lg:flex-row gap-5 items-start lg:items-stretch h-auto lg:h-[460px]">
        {/* ── SIDEBAR MODERN PENTRU NAVIGARE ── */}
        <aside className="w-full lg:w-[320px] flex flex-col shrink-0 lg:h-[460px] mt-2 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-[350px] lg:h-full rounded-[2rem] bg-white border border-zinc-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* Header Sidebar */}
            <div className="p-6 pb-4 border-b border-zinc-50 shrink-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-zinc-900 rounded-[0.7rem] text-white">
                  <LayoutGrid size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-900">
                  Navigare
                </span>
              </div>

              {/* Bara de Căutare */}
              {!activeParent && (
                <div className="relative group">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[var(--royal-violet)] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Caută în categorii..."
                    className="w-full h-11 pl-10 pr-4 text-[12px] font-medium bg-zinc-50 rounded-xl outline-none border border-zinc-100 focus:bg-white focus:border-[var(--royal-violet)] focus:ring-4 focus:ring-[var(--royal-violet)]/10 transition-all placeholder:text-zinc-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Lista Scrollabilă de Categorii */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-zinc-50 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {!activeParent ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() =>
                            cat.subcategories?.length
                              ? setActiveParent(cat)
                              : navigate(`/category/${cat.slug}`)
                          }
                          className="w-full group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-zinc-50 hover:shadow-sm transition-all text-left"
                        >
                          <span className="text-[12px] font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors truncate pr-2">
                            {cat.name}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-zinc-300 group-hover:text-[var(--royal-violet)] group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sub"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5 flex flex-col h-full"
                    >
                      <button
                        onClick={() => setActiveParent(null)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--royal-violet)] mb-3 px-3 hover:opacity-70 transition-opacity w-fit"
                      >
                        <ChevronLeft size={14} /> Înapoi
                      </button>

                      <Link
                        to={`/category/${activeParent.slug}`}
                        className="group flex items-center justify-between p-3.5 mb-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">
                          Toate în {activeParent.name}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </Link>

                      {activeParent.subcategories?.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          className="block px-4 py-3 text-[12px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </aside>

        {/* ── BANNER PRINCIPAL ── */}
        <div className="w-full flex-1 h-[240px] sm:h-[320px] lg:h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full rounded-[2rem] overflow-hidden group shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-zinc-900"
          >
            <img
              src={heroBanner}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Gradient Overlay pentru lizibilitate */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

            <div className="relative h-full flex flex-col justify-center p-8 sm:p-12 md:p-16 text-white items-start">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tighter mb-4 text-left drop-shadow-md">
                STILUL TĂU, <br />
                <span className="font-light italic opacity-80 text-2xl sm:text-4xl md:text-5xl">
                  REDEFINIT.
                </span>
              </h1>
              <button
                onClick={handleScrollToProducts}
                className="group inline-flex items-center gap-3 bg-white text-zinc-900 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-[10px] font-black uppercase tracking-[0.25em] w-fit shadow-xl hover:bg-zinc-100 hover:scale-105 transition-all duration-300"
              >
                <ShoppingBag size={14} className="text-[var(--royal-violet)]" />
                Descoperă Colecția
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
