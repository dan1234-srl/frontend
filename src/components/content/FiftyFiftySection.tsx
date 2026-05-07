import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

const FiftyFiftySection = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Extragem categoriile direct din backend pentru a avea date reale
  useEffect(() => {
    const fetchHeroCategories = async () => {
      try {
        // Luăm primele 2 categorii principale pentru secțiunea 50/50
        const res = await fetch(`${API_BASE_URL}/api/v1/categories/?limit=2`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Error fetching categories for FiftyFifty:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroCategories();
  }, []);

  // Helper pentru procesarea imaginii din backend (structura ta de S3)
  const getCategoryImage = (cat: any) => {
    if (!cat.image_url) return null;
    if (typeof cat.image_url === "object") {
      return (
        cat.image_url.large || cat.image_url.main?.large || cat.image_url.medium
      );
    }
    return cat.image_url;
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
      </div>
    );
  }

  return (
    <section className="w-full px-6 max-w-[1800px] mx-auto py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        {categories.map((item, i) => {
          const img = getCategoryImage(item);

          return (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            >
              <Link
                to={`/category/${item.slug}`}
                className="group block space-y-8"
              >
                {/* Image Container cu date din Backend-ul tău */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100 rounded-sm">
                  {img ? (
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                      alt={item.name}
                    />
                  ) : (
                    // Fallback vizual dacă nu ai poză în DB
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-300">
                      Imagine in curs de actualizare
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute bottom-8 right-8 size-14 bg-white rounded-full flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                    <ArrowUpRight size={20} className="text-zinc-900" />
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                      Colecția Evem De modificat
                    </span>
                    <h3 className="heading-serif text-3xl md:text-4xl text-zinc-900 uppercase tracking-tighter">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-sm font-light text-zinc-500 leading-relaxed max-w-[450px] line-clamp-2">
                    {item.description ||
                      "Sisteme de umbrire arhitecturală de înaltă precizie pentru spații exclusiviste."}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-2 group-hover:border-zinc-900 transition-all">
                      Vezi Categoria
                    </span>
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

export default FiftyFiftySection;
