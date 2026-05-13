import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
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
    <section className="w-full px-4 md:px-8 pt-6 md:pt-10">
      <div className="mx-auto max-w-[1800px] grid grid-cols-12 gap-4 md:gap-6 items-start">
        {/* SIDEBAR CATEGORII */}
        <aside className="col-span-12 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/60 bg-white shadow-sm overflow-hidden"
          >
            {/* Header fix */}
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid size={14} className="text-[var(--royal-violet)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50">
                  Meniu Categorii
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!activeParent ? (
                  <motion.h3
                    key="t1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-bold text-[var(--dark-amethyst)]"
                  >
                    Colecții EVEM
                  </motion.h3>
                ) : (
                  <motion.button
                    key="t2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setActiveParent(null)}
                    className="flex items-center gap-2 text-[var(--royal-violet)] font-bold text-lg"
                  >
                    <ChevronLeft size={20} />
                    <span className="truncate">{activeParent.name}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ZONA DE SCROLL - Limitata la 5-6 elemente (cca 280px) */}
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              <div className="p-2 flex flex-col gap-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-full rounded-xl bg-zinc-100 animate-pulse"
                    />
                  ))
                ) : (
                  <AnimatePresence mode="wait">
                    {!activeParent ? (
                      <motion.div
                        key="m"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() =>
                              cat.subcategories?.length
                                ? setActiveParent(cat)
                                : null
                            }
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                          >
                            <span className="text-sm font-medium">
                              {cat.name}
                            </span>
                            {cat.subcategories?.length ? (
                              <ChevronRight
                                size={14}
                                className="text-zinc-400"
                              />
                            ) : (
                              <Link
                                to={`/category/${cat.slug}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ArrowUpRight
                                  size={14}
                                  className="text-zinc-300"
                                />
                              </Link>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="s"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Link
                          to={`/category/${activeParent.slug}`}
                          className="flex items-center justify-between p-3 mb-1 rounded-xl bg-zinc-50 text-[var(--royal-violet)] font-bold text-sm"
                        >
                          Vezi toate produsele
                          <ArrowUpRight size={14} />
                        </Link>
                        {activeParent.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className="block p-3 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
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

            {/* Footer fix */}
            <Link
              to="/shop"
              className="block p-4 bg-zinc-50/50 border-t border-border/40 text-[10px] font-black uppercase tracking-widest text-center text-zinc-400 hover:text-[var(--royal-violet)] transition-colors"
            >
              Catalog Complet
            </Link>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL */}
        <div className="col-span-12 lg:col-span-9">
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl bg-[var(--dark-amethyst)]">
            <img
              src={heroBanner}
              alt="EVEM"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--dark-amethyst)]/80 via-transparent to-transparent" />
            <div className="relative h-full flex flex-col justify-center p-8 md:p-16 text-white max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold leading-tight mb-4"
              >
                Stilul tău, <br />
                <span className="italic font-light opacity-80">redefinit.</span>
              </motion.h1>
              <Link
                to="/shop"
                className="w-fit bg-white text-black px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Cumpără acum
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
