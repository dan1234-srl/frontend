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

  // State pentru navigare: null înseamnă lista principală, altfel reține categoria părinte selectată
  const [activeParent, setActiveParent] = useState<Category | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Folosim endpoint-ul de tree pentru a vedea ierarhia completă
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
      <div className="mx-auto max-w-[1800px] grid grid-cols-12 gap-4 md:gap-6">
        {/* SIDEBAR NAVIGABIL */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-[500px] lg:h-full min-h-[500px] rounded-3xl border border-border/60 bg-white/70 backdrop-blur-md shadow-[0_4px_30px_-12px_rgba(16,0,43,0.12)] overflow-hidden"
          >
            {/* Header Sidebar */}
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid size={14} className="text-[var(--royal-violet)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/60">
                  Explorare piese
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!activeParent ? (
                  <motion.h3
                    key="main-title"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="heading-serif text-2xl leading-tight"
                    style={{ color: "var(--dark-amethyst)" }}
                  >
                    Colecții <span className="italic font-light">EVEM</span>
                  </motion.h3>
                ) : (
                  <motion.button
                    key="back-button"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => setActiveParent(null)}
                    className="flex items-center gap-2 text-[var(--royal-violet)] hover:gap-3 transition-all"
                  >
                    <ChevronLeft size={18} />
                    <span className="text-lg font-medium leading-tight truncate">
                      {activeParent.name}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Listă Categorii/Subcategorii cu Scrollbar Custom */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 custom-scrollbar">
              <div className="flex flex-col gap-1">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-full rounded-xl bg-foreground/5 animate-pulse my-1"
                    />
                  ))
                ) : (
                  <AnimatePresence mode="wait">
                    {!activeParent ? (
                      // LISTA PRINCIPALĂ
                      <motion.div
                        key="main-list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {categories.map((cat) => (
                          <div key={cat.id} className="group relative">
                            {cat.subcategories &&
                            cat.subcategories.length > 0 ? (
                              <button
                                onClick={() => setActiveParent(cat)}
                                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl hover:bg-foreground/5 transition-all text-left"
                              >
                                <span className="text-[13px] font-semibold text-foreground/80 group-hover:text-foreground">
                                  {cat.name}
                                </span>
                                <ChevronRight
                                  size={14}
                                  className="text-foreground/30 group-hover:translate-x-1 transition-all"
                                />
                              </button>
                            ) : (
                              <Link
                                to={`/category/${cat.slug}`}
                                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl hover:bg-foreground/5 transition-all"
                              >
                                <span className="text-[13px] font-semibold text-foreground/80 group-hover:text-foreground">
                                  {cat.name}
                                </span>
                                <ArrowUpRight
                                  size={14}
                                  className="opacity-0 group-hover:opacity-100 transition-all text-[var(--royal-violet)]"
                                />
                              </Link>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      // LISTA SUBCATEGORII
                      <motion.div
                        key="sub-list"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Opțiune "Vezi tot din categoria mamă" */}
                        <Link
                          to={`/category/${activeParent.slug}`}
                          className="flex items-center justify-between py-3.5 px-4 mb-2 rounded-2xl bg-[var(--royal-violet)]/5 text-[var(--royal-violet)] font-bold group"
                        >
                          <span className="text-[13px]">Toate produsele</span>
                          <ArrowUpRight size={14} />
                        </Link>

                        {activeParent.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className="group flex items-center justify-between py-3.5 px-4 rounded-2xl hover:bg-foreground/5 transition-all"
                          >
                            <span className="text-[13px] font-medium text-foreground/70 group-hover:text-foreground">
                              {sub.name}
                            </span>
                            <ChevronRight
                              size={14}
                              className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                            />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Footer Sidebar */}
            <div className="p-6 border-t border-border/40 bg-white/50">
              <Link
                to="/shop"
                className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-foreground/50 hover:text-[var(--royal-violet)] transition-colors"
              >
                Catalog Complet
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL (Neschimbat la structură, doar aspect ratio fixat pentru sidebar) */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-9">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-[16/9] lg:h-full lg:aspect-auto rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(16,0,43,0.35)]"
          >
            <img
              src={heroBanner}
              alt="EVEM - Concept store premium"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(110deg, color-mix(in srgb, var(--dark-amethyst) 85%, transparent) 0%, color-mix(in srgb, var(--dark-amethyst) 30%, transparent) 50%, transparent 80%)",
              }}
            />

            <div className="relative h-full w-full flex flex-col justify-between p-6 md:p-12 lg:p-16 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="opacity-80" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-90">
                  Colecția Sezonului
                </span>
              </div>

              <div className="max-w-2xl">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  className="heading-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-5"
                >
                  Stilul tău,{" "}
                  <span className="italic font-light opacity-90">
                    redefinit.
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.4 }}
                  className="text-sm md:text-base font-light opacity-85 max-w-xl mb-8 leading-relaxed"
                >
                  De la vestimentație și bijuterii la accesorii pentru telefon —
                  EVEM aduce împreună piesele care fac diferența.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <Link
                    to="/shop"
                    className="group inline-flex items-center gap-3 bg-white text-foreground px-7 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white/90 transition-all hover:shadow-2xl"
                  >
                    Cumpără acum
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:rotate-45"
                    />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stiluri CSS extra pentru scrollbar discret */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(123, 44, 191, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(123, 44, 191, 0.3);
        }
      `,
        }}
      />
    </section>
  );
};

export default HomeHero;
