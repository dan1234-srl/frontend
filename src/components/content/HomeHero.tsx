import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  ShoppingBag,
} from "lucide-react";
import heroBanner from "@/assets/evem-hero-banner.jpg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Category[];
}

const HomeHero = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/v1/categories/tree`);
        const data = await r.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("categories fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="w-full px-4 md:px-8 pt-4 md:pt-6">
      <div className="mx-auto max-w-[1800px] grid grid-cols-12 gap-4">
        {/* SIDEBAR CATEGORII - FLEX & MATCH HEIGHT */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col flex-grow rounded-[2rem] border border-zinc-100 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            {/* Header Meniu */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <LayoutGrid size={14} className="text-zinc-900" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                  Explorare piese
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!activeParent ? (
                  <motion.h3
                    key="t1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-2xl font-black tracking-tighter text-zinc-900"
                  >
                    Colecții <span className="text-zinc-300">EVEM</span>
                  </motion.h3>
                ) : (
                  <motion.button
                    key="t2"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setActiveParent(null)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="p-1.5 rounded-full border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                      <ChevronLeft size={16} />
                    </div>
                    <span className="text-xl font-black tracking-tighter truncate">
                      {activeParent.name}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Listă Dinamică cu Scrollbar Ascuns */}
            <div className="flex-1 overflow-y-auto luxury-scrollbar px-4 pb-4">
              <div className="flex flex-col gap-1.5">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-full rounded-2xl bg-zinc-50 animate-pulse"
                    />
                  ))
                ) : (
                  <AnimatePresence mode="wait">
                    {!activeParent ? (
                      <motion.div
                        key="m"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-1"
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() =>
                              cat.subcategories?.length
                                ? setActiveParent(cat)
                                : navigate(`/category/${cat.slug}`)
                            }
                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all duration-300 group text-left"
                          >
                            <span className="text-sm font-bold text-zinc-600 group-hover:text-zinc-900 group-hover:translate-x-1 transition-transform">
                              {cat.name}
                            </span>
                            {cat.subcategories?.length ? (
                              <ChevronRight
                                size={14}
                                className="text-zinc-300 group-hover:text-zinc-900"
                              />
                            ) : (
                              <ArrowUpRight
                                size={14}
                                className="text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="s"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-1"
                      >
                        <Link
                          to={`/category/${activeParent.slug}`}
                          className="flex items-center justify-between p-4 mb-3 rounded-2xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-zinc-200"
                        >
                          Toate produsele
                          <ArrowUpRight size={14} />
                        </Link>
                        {activeParent.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className="block p-4 text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Catalog Complet */}
            <Link
              to="/shop"
              className="p-6 bg-zinc-50 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between hover:bg-zinc-900 hover:text-white transition-all group"
            >
              Catalog Complet
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL - ASPECT MAI MIC PE VERTICALA */}
        <div className="col-span-12 lg:col-span-9 h-full">
          <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] lg:h-full rounded-[2.5rem] overflow-hidden bg-zinc-100 group">
            <img
              src={heroBanner}
              alt="EVEM Premium"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Overlay modernizat */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

            <div className="relative h-full flex flex-col justify-center p-8 md:p-16 lg:p-20 text-white">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="h-px w-8 bg-white/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
                  New Arrival 2024
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-8"
              >
                STILUL TĂU, <br />
                <span className="font-light italic opacity-60">REDEFINIT.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-4 bg-white text-zinc-900 px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-xl hover:shadow-2xl active:scale-95"
                >
                  <ShoppingBag size={16} />
                  Cumpără acum
                </Link>
              </motion.div>
            </div>

            {/* Element Decorativ de Lux */}
            <div className="absolute bottom-10 right-10 hidden md:block">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 text-right">
                  Livrări
                </p>
                <p className="text-xl font-bold text-white tracking-tighter">
                  Premium în toată țara
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 0px; }
        .luxury-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </section>
  );
};

export default HomeHero;
