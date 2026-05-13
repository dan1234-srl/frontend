import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, ChevronRight } from "lucide-react";
import heroBanner from "@/assets/evem-hero-banner.jpg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

const HomeHero = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/v1/categories/?limit=8`);
        const data = await r.json();
        const list = Array.isArray(data) ? data : data.items || [];
        setCategories(list.slice(0, 8));
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
        {/* SIDEBAR CATEGORII */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="h-full rounded-3xl border border-border/60 bg-white/70 backdrop-blur-md p-6 md:p-7 shadow-[0_4px_30px_-12px_rgba(16,0,43,0.12)]"
          >
            <div className="flex items-center gap-2 mb-6">
              <span
                className="size-2 rounded-full"
                style={{ background: "var(--royal-violet)" }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/60">
                Categorii EVEM
              </span>
            </div>

            <h3
              className="heading-serif text-2xl md:text-[26px] leading-tight mb-6"
              style={{ color: "var(--dark-amethyst)" }}
            >
              Descoperă <span className="italic font-light">universul</span> nostru
            </h3>

            <nav className="flex flex-col">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-11 my-1 rounded-xl bg-foreground/5 animate-pulse"
                    />
                  ))
                : categories.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * i }}
                    >
                      <Link
                        to={`/category/${cat.slug}`}
                        className="group flex items-center justify-between py-3 px-3 -mx-3 rounded-xl hover:bg-foreground/5 transition-all duration-300"
                      >
                        <span className="text-sm font-medium text-foreground/85 group-hover:text-foreground transition-colors">
                          {cat.name}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all"
                        />
                      </Link>
                    </motion.div>
                  ))}
            </nav>

            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
            >
              Vezi tot magazinul
              <ArrowUpRight size={12} />
            </Link>
          </motion.div>
        </aside>

        {/* BANNER PRINCIPAL */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-9">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[16/9] lg:aspect-[16/8] rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(16,0,43,0.35)]"
          >
            <img
              src={heroBanner}
              alt="EVEM - Concept store premium"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
            />
            {/* Gradient overlay folosind tokens dinamice */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(110deg, color-mix(in srgb, var(--dark-amethyst) 78%, transparent) 0%, color-mix(in srgb, var(--dark-amethyst) 35%, transparent) 45%, transparent 75%)",
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
                  <Link
                    to="/about/our-story"
                    className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/40 pb-1 hover:border-white transition-colors"
                  >
                    Despre EVEM
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
