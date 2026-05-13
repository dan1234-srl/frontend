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
    <section className="w-full px-4 md:px-12 pt-24 md:pt-32 pb-10">
      {/* 
        Containerul are acum items-stretch pentru a forța sidebar-ul și poza 
        să aibă aceeași înălțime, dar am setat o înălțime fixă (500px) pe desktop.
      */}
      <div className="mx-auto max-w-[1700px] flex flex-col lg:flex-row gap-8 items-stretch lg:h-[520px]">
        {/* SIDEBAR CATEGORII - Design Modern & Compact */}
        <aside className="w-full lg:w-[350px] flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full rounded-[2.5rem] border border-zinc-100 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] overflow-hidden"
          >
            {/* Header fix al meniului */}
            <div className="p-8 pb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-50 rounded-xl">
                  <LayoutGrid size={14} className="text-zinc-900" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Explorare
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
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={() => setActiveParent(null)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="p-2 rounded-full border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                      <ChevronLeft size={16} />
                    </div>
                    <span className="text-xl font-black tracking-tighter truncate text-zinc-900">
                      {activeParent.name}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Listă cu Scrollbar invizibil pentru un look Luxury */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
              <div className="flex flex-col gap-1">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 w-full rounded-2xl bg-zinc-50 animate-pulse my-0.5"
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
                            className="w-full flex items-center justify-between p-4 rounded-[1.2rem] hover:bg-zinc-50 transition-all duration-300 group text-left"
                          >
                            <span className="text-[14px] font-bold text-zinc-600 group-hover:text-zinc-900 group-hover:translate-x-1 transition-transform">
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
                                className="text-zinc-200 opacity-0 group-hover:opacity-100"
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
                          className="flex items-center justify-between p-4 mb-3 rounded-[1.2rem] bg-zinc-950 text-white font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-zinc-200"
                        >
                          Toate produsele
                          <ArrowUpRight size={14} />
                        </Link>
                        {activeParent.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${sub.slug}`}
                            className="block p-4 text-[14px] font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-[1.2rem] transition-all"
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

            {/* Link Catalog la baza sidebar-ului */}
            <Link
              to="/shop"
              className="p-6 bg-zinc-50/50 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between hover:bg-zinc-900 hover:text-white transition-all group"
            >
              Vezi catalogul complet
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL - Aspect Ratio Cinematografic */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full w-full rounded-[3rem] overflow-hidden bg-zinc-100 group shadow-[0_30px_70px_-20px_rgba(0,0,0,0.15)]"
          >
            <img
              src={heroBanner}
              alt="EVEM Premium"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Overlay dublu gradient */}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            <div className="relative h-full flex flex-col justify-center p-10 md:p-20 text-white">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="h-px w-10 bg-white/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80">
                  Concept Premium
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-8"
              >
                STILUL TĂU, <br />
                <span className="font-light italic opacity-60 text-4xl md:text-6xl">
                  REDEFINIT.
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-4 bg-white text-zinc-950 px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-xl hover:shadow-2xl"
                >
                  <ShoppingBag size={16} />
                  Cumpără acum
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </section>
  );
};

export default HomeHero;
