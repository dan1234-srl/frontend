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
      <div className="mx-auto max-w-[1600px] flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDEBAR CATEGORII - LATIME SI INALTIME FIXATA PENTRU COMPACTNESS */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col rounded-[2rem] border border-zinc-100 bg-white shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            {/* Header Meniu */}
            <div className="p-6 pb-4 bg-zinc-50/50">
              <div className="flex items-center gap-3 mb-3">
                <LayoutGrid size={14} className="text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Categorii
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!activeParent ? (
                  <motion.h3
                    key="t1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-black tracking-tight text-zinc-900"
                  >
                    Colecții <span className="text-zinc-400">EVEM</span>
                  </motion.h3>
                ) : (
                  <motion.button
                    key="t2"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setActiveParent(null)}
                    className="flex items-center gap-2 group text-zinc-900"
                  >
                    <ChevronLeft
                      size={18}
                      className="group-hover:-translate-x-1 transition-transform"
                    />
                    <span className="text-lg font-bold truncate">
                      {activeParent.name}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* LISTA CU INALTIME LIMITATA SI SCROLL */}
            <div className="max-h-[320px] overflow-y-auto px-2 py-2 luxury-scrollbar">
              <div className="flex flex-col gap-1">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-11 w-full rounded-xl bg-zinc-50 animate-pulse"
                    />
                  ))
                ) : (
                  <AnimatePresence mode="wait">
                    {!activeParent ? (
                      <motion.div
                        key="m"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-0.5"
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() =>
                              cat.subcategories?.length
                                ? setActiveParent(cat)
                                : navigate(`/category/${cat.slug}`)
                            }
                            className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-zinc-50 transition-all group text-left"
                          >
                            <span className="text-[13px] font-semibold text-zinc-600 group-hover:text-zinc-900">
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
                        className="space-y-0.5"
                      >
                        <Link
                          to={`/category/${activeParent.slug}`}
                          className="flex items-center justify-between p-3.5 mb-2 rounded-xl bg-zinc-900 text-white font-bold text-[11px] uppercase tracking-widest"
                        >
                          Toate produsele
                          <ArrowUpRight size={14} />
                        </Link>
                        {activeParent.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className="block p-3.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all"
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

            {/* Catalog Button */}
            <Link
              to="/shop"
              className="mt-auto p-5 border-t border-zinc-50 bg-zinc-50/30 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between text-zinc-400 hover:text-zinc-900 transition-colors group"
            >
              Vezi catalogul complet
              <ChevronRight
                size={12}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL - INALTIMEA ESTE ACUM INDEPENDENTA */}
        <div className="flex-1 w-full">
          <div className="relative w-full h-[400px] lg:h-[480px] rounded-[2.5rem] overflow-hidden bg-zinc-100 group shadow-2xl shadow-zinc-200">
            <img
              src={heroBanner}
              alt="EVEM Premium"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Overlay subtil */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            <div className="relative h-full flex flex-col justify-center p-8 md:p-16 text-white">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-6xl font-black leading-[1] tracking-tighter mb-6"
              >
                STILUL TĂU, <br />
                <span className="font-light italic opacity-70 text-3xl md:text-5xl">
                  REDEFINIT.
                </span>
              </motion.h1>

              <Link
                to="/shop"
                className="inline-flex items-center gap-3 bg-white text-zinc-900 w-fit px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-xl"
              >
                <ShoppingBag size={14} />
                Cumpără acum
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 4px; }
        .luxury-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
        .luxury-scrollbar:hover::-webkit-scrollbar-thumb { background: #e2e2e2; }
      `,
        }}
      />
    </section>
  );
};

export default HomeHero;
