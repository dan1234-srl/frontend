import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Quote,
  Loader2,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

interface Review {
  id: string | number;
  user_name?: string;
  customer_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

// 1. Definim interfața pentru setările de temă primite de la backend
export interface ThemeConfig {
  primaryColor?: string; // ex: "#7b2cbf"
  secondaryColor?: string; // ex: "#3c096c"
  gradient?: string; // ex: "linear-gradient(135deg, #7b2cbf 0%, #9d4edd 100%)"
}

interface Props {
  productId?: string | number;
  reviews?: Review[];
  theme?: ThemeConfig; // 2. Prop-ul nou
}

const initials = (name?: string) => {
  if (!name) return "L";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
};

const ProductReviews = ({ productId, reviews: initial, theme }: Props) => {
  const [reviews, setReviews] = useState<Review[]>(initial || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let alive = true;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/reviews/products/${productId}/reviews`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.items || [];
        setReviews(list);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productId]);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    reviews.forEach((r) => {
      const v = Math.max(1, Math.min(5, Math.round(r.rating)));
      dist[v - 1] += 1;
      sum += r.rating;
    });
    return { avg: sum / reviews.length, dist };
  }, [reviews]);

  // 3. Setăm variabilele CSS local folosind datele din backend
  // color-mix() gestionează opacitățile automat (ex: 15% opacitate pentru borduri)
  const themeStyles = {
    "--theme-primary": theme?.primaryColor || "#7b2cbf",
    "--theme-secondary": theme?.secondaryColor || "#3c096c",
    "--theme-gradient":
      theme?.gradient || "linear-gradient(to right, #7b2cbf, #9d4edd)",
    "--theme-primary-15": `color-mix(in srgb, ${theme?.primaryColor || "#7b2cbf"} 15%, transparent)`,
    "--theme-primary-30": `color-mix(in srgb, ${theme?.primaryColor || "#7b2cbf"} 30%, transparent)`,
    "--theme-shadow-18": `0 8px 40px -12px color-mix(in srgb, ${theme?.primaryColor || "#7b2cbf"} 18%, transparent)`,
    "--theme-shadow-22": `0 10px 30px -12px color-mix(in srgb, ${theme?.primaryColor || "#7b2cbf"} 22%, transparent)`,
  } as React.CSSProperties;

  return (
    <section
      className="pt-16 mt-12 border-t border-neutral-100 relative"
      style={themeStyles} // Aplicăm stilurile pe rădăcina secțiunii
    >
      {/* Ambient orb decor */}
      <div
        className="pointer-events-none absolute -top-10 right-0 w-[420px] h-[420px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "var(--theme-gradient)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquareText size={14} className="text-[var(--theme-primary)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--theme-primary)]">
          Testimoniale clienți
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <h2 className="text-3xl md:text-4xl font-serif italic tracking-tighter text-[var(--theme-secondary)] leading-[1.05]">
          Ce spun cei care
          <br />
          poartă Linea
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
          <ShieldCheck size={14} className="text-[var(--theme-primary)]" />
          {reviews.length} Recenzii verificate
        </div>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-neutral-300">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="relative rounded-2xl border border-[var(--theme-primary-15)] bg-white/60 backdrop-blur-xl py-16 px-8 text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ background: "var(--theme-gradient)" }}
          />
          <Quote
            size={28}
            className="mx-auto text-[var(--theme-primary)] opacity-60 mb-4"
          />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--theme-secondary)]">
            Încă nicio poveste scrisă
          </p>
          <p className="text-sm text-neutral-500 mt-3 font-light italic max-w-md mx-auto">
            Fii primul care împărtășește experiența cu acest produs și inspiră
            comunitatea.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Summary card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-40 rounded-2xl border border-[var(--theme-primary-15)] bg-white/70 backdrop-blur-xl p-7 shadow-[var(--theme-shadow-18)]">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[var(--theme-secondary)] tracking-tighter">
                  {stats.avg.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-neutral-400">/ 5</span>
              </div>
              <div className="flex gap-0.5 mt-2 text-[var(--theme-primary)]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(stats.avg) ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                Bazat pe {reviews.length} recenzii
              </p>

              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.dist[star - 1];
                  const pct = reviews.length
                    ? (count / reviews.length) * 100
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-[10px] font-black w-3 text-[var(--theme-secondary)]">
                        {star}
                      </span>
                      <Star
                        size={10}
                        className="text-[var(--theme-primary)]"
                        fill="currentColor"
                      />
                      <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="h-full rounded-full"
                          style={{ background: "var(--theme-gradient)" }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Reviews list */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review, idx) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(idx * 0.05, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative rounded-2xl border border-neutral-100 bg-white/80 backdrop-blur-xl p-6 hover:border-[var(--theme-primary-30)] hover:shadow-[var(--theme-shadow-22)] transition-all"
              >
                <Quote
                  size={22}
                  className="absolute top-5 right-5 text-[var(--theme-primary)] opacity-15 group-hover:opacity-40 transition-opacity"
                />

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black tracking-wider shadow-md"
                    style={{ background: "var(--theme-gradient)" }}
                  >
                    {initials(review.user_name || review.customer_name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-secondary)] truncate">
                      {review.user_name ||
                        review.customer_name ||
                        "Client Linea"}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">
                      {new Date(review.created_at).toLocaleDateString("ro-RO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-0.5 mt-4 text-[var(--theme-primary)]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      fill={i < review.rating ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>

                <p className="mt-3 text-sm font-light leading-relaxed text-neutral-600 italic">
                  "{review.comment}"
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
