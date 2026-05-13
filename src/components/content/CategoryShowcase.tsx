import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const getCategoryImage = (cat: any) => {
  if (!cat?.image_url) return null;
  if (typeof cat.image_url === "object") {
    return (
      cat.image_url.large ||
      cat.image_url.main?.large ||
      cat.image_url.medium ||
      cat.image_url.main?.medium
    );
  }
  return cat.image_url;
};

const CategoryShowcase = () => {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/v1/categories/?limit=4`);
        const data = await r.json();
        const list = Array.isArray(data) ? data : data.items || [];
        setCats(list.slice(0, 4));
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-4 md:px-8 py-16 md:py-24 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-3xl bg-foreground/5 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (cats.length === 0) return null;

  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-24 max-w-[1800px] mx-auto">
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/50 block mb-3">
            Curated Selection
          </span>
          <h2
            className="heading-serif text-3xl md:text-5xl leading-tight"
            style={{ color: "var(--dark-amethyst)" }}
          >
            Cumpără pe <span className="italic font-light">categorii</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="hidden md:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
        >
          Toate categoriile
          <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cats.map((cat, i) => {
          const img = getCategoryImage(cat);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group block relative aspect-[3/4] rounded-3xl overflow-hidden bg-foreground/5"
              >
                {img ? (
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 25%, transparent), color-mix(in srgb, var(--dark-amethyst) 50%, transparent))",
                    }}
                  />
                )}

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 45%, color-mix(in srgb, var(--dark-amethyst) 85%, transparent) 100%)",
                  }}
                />

                <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-end text-white">
                  <h3 className="heading-serif text-xl md:text-2xl leading-tight">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80">
                      Explorează
                    </span>
                    <div className="size-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-foreground transition-all duration-500">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryShowcase;
