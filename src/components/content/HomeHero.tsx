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

const HomeHero = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeParent, setActiveParent] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories/tree`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full px-4 md:px-6 pt-0 pb-0 md:pb-6 text-left">
      {/* 🚀 CORECȚIE CRITICĂ: Am schimbat 'items-stretch' în 'items-start lg:items-stretch'.
         Acest lucru oprește calculul eronat de înălțime pe mobil, strânge tot spațiul alb 
         și lipește meniul de categorii direct sub imaginea de banner!
      */}
      <div className="mx-auto max-w-[1750px] flex flex-col-reverse lg:flex-row gap-4 items-start lg:items-stretch h-auto lg:h-[460px]">
        {/* SIDEBAR CATEGORII (LIPIT SUB IMAGINE PE MOBIL) */}
        <aside className="w-full lg:w-[300px] flex flex-col shrink-0 mt-2 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-[300px] lg:h-full rounded-[2rem] border border-zinc-100 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden"
          >
            <div className="p-5 pb-3 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid size={12} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Navigare
                </span>
              </div>
              <AnimatePresence mode="wait">
                {!activeParent ? (
                  <motion.h3
                    key="t1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-black uppercase tracking-wider text-left text-zinc-800"
                  >
                    Categorii
                  </motion.h3>
                ) : (
                  <motion.button
                    key="t2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setActiveParent(null)}
                    className="flex items-center gap-2 text-zinc-900 font-bold"
                  >
                    <ChevronLeft size={16} />{" "}
                    <span className="truncate text-sm">
                      {activeParent.name}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-9 bg-zinc-50 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
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
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 transition-all text-left"
                        >
                          <span className="text-xs font-bold text-zinc-600">
                            {cat.name}
                          </span>
                          <ChevronRight size={12} className="text-zinc-300" />
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
                        className="flex items-center justify-between p-3 mb-2 rounded-xl bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest"
                      >
                        Toate produsele <ArrowUpRight size={12} />
                      </Link>
                      {activeParent.subcategories?.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          className="block p-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 rounded-xl"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            <Link
              to="/shop"
              className="p-4 bg-zinc-50/50 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-between text-zinc-400 border-t border-zinc-100 shrink-0"
            >
              Catalog Complet <ChevronRight size={12} />
            </Link>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL (URCĂ DEASUPRA ACUM CU ÎNĂLȚIME CORECTĂ PE MOBIL) */}
        <div className="w-full flex-1 min-h-[180px] sm:min-h-[260px] lg:min-h-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[220px] sm:h-[280px] lg:h-full w-full rounded-[2rem] overflow-hidden group shadow-sm bg-zinc-900"
          >
            <img
              src={heroBanner}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
            <div className="relative h-full flex flex-col justify-center p-6 sm:p-10 md:p-16 text-white items-start">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tighter mb-3 text-left">
                STILUL TĂU, <br />
                <span className="font-light italic opacity-60 text-lg sm:text-2xl md:text-4xl">
                  REDEFINIT.
                </span>
              </h1>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 bg-white text-zinc-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-xl"
              >
                <ShoppingBag size={14} /> Cumpără acum
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
