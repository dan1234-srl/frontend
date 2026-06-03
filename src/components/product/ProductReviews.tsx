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

interface Props {
  productId?: string | number;
  reviews?: Review[];
}

// Variabile derivate calculate o singură dată — referențiază global CSS vars
// din :root (injectate de backend). Nu conțin valori hardcodate.
const DERIVED: React.CSSProperties = {
  "--rv-gradient":
    "linear-gradient(135deg, var(--royal-violet) 0%, var(--lavender-purple) 100%)",
  "--rv-gradient-d":
    "linear-gradient(135deg, var(--dark-amethyst-2) 0%, var(--indigo-velvet) 100%)",
  "--rv-border": "color-mix(in srgb, var(--royal-violet) 18%, transparent)",
  "--rv-border-h": "color-mix(in srgb, var(--mauve-magic) 45%, transparent)",
  "--rv-border-soft": "color-mix(in srgb, var(--mauve) 30%, transparent)",
  "--rv-shadow":
    "0 8px 40px -12px color-mix(in srgb, var(--royal-violet) 18%, transparent)",
  "--rv-shadow-h":
    "0 12px 36px -10px color-mix(in srgb, var(--royal-violet) 28%, transparent)",
  "--rv-tint-mauve": "color-mix(in srgb, var(--mauve) 25%, transparent)",
} as React.CSSProperties;

const initials = (name?: string) => {
  if (!name) return "L";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
};

const ProductReviews = ({ productId, reviews: initial }: Props) => {
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

  return (
    // ── Fără backgroundColor — fundalul paginii (alb) rămâne vizibil ──
    <section
      className="pt-16 mt-12 border-t relative"
      style={{
        ...DERIVED,
        borderTopColor: "var(--rv-border-soft)",
      }}
    >
      {/* Orb ambient — gradient profund din tema globală */}
      <div
        className="pointer-events-none absolute -top-10 right-0 w-[420px] h-[420px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "var(--rv-gradient-d)" }}
      />

      {/* Header etichetă */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquareText size={14} style={{ color: "var(--royal-violet)" }} />
        <span
          className="text-[10px] font-black uppercase tracking-[0.4em]"
          style={{ color: "var(--royal-violet)" }}
        >
          Testimoniale clienți
        </span>
      </div>

      {/* Titlu secțiune */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <h2
          className="text-3xl md:text-4xl font-serif italic tracking-tighter leading-[1.05]"
          style={{ color: "var(--dark-amethyst)" }}
        >
          Ce spun cei care
          <br />
          <span style={{ color: "var(--lavender-purple)" }}>poartă Linea</span>
        </h2>
        <div
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--indigo-ink)" }}
        >
          <ShieldCheck size={14} style={{ color: "var(--royal-violet)" }} />
          {reviews.length} Recenzii verificate
        </div>
      </div>

      {/* State: loading */}
      {loading && reviews.length === 0 ? (
        <div
          className="flex items-center justify-center py-20"
          style={{ color: "var(--mauve)" }}
        >
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : reviews.length === 0 ? (
        /* State: gol */
        <div
          className="relative rounded-2xl py-16 px-8 text-center overflow-hidden backdrop-blur-xl bg-white"
          style={{
            border: "1px solid var(--rv-border)",
            boxShadow: "var(--rv-shadow)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ background: "var(--rv-gradient)" }}
          />
          <Quote
            size={28}
            className="mx-auto mb-4"
            style={{ color: "var(--lavender-purple)", opacity: 0.7 }}
          />
          <p
            className="text-[11px] font-black uppercase tracking-[0.4em]"
            style={{ color: "var(--dark-amethyst)" }}
          >
            Încă nicio poveste scrisă
          </p>
          <p
            className="text-sm mt-3 font-light italic max-w-md mx-auto"
            style={{ color: "var(--indigo-ink)" }}
          >
            Fii primul care împărtășește experiența cu acest produs și inspiră
            comunitatea.
          </p>
        </div>
      ) : (
        /* State: recenzii */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Card sumar rating */}
          <aside className="lg:col-span-4">
            <div
              className="sticky top-40 rounded-2xl p-7 backdrop-blur-xl bg-white"
              style={{
                border: "1px solid var(--rv-border)",
                boxShadow: "var(--rv-shadow)",
              }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="text-5xl font-black tracking-tighter"
                  style={{ color: "var(--dark-amethyst)" }}
                >
                  {stats.avg.toFixed(1)}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--mauve-magic)" }}
                >
                  / 5
                </span>
              </div>

              <div
                className="flex gap-0.5 mt-2"
                style={{ color: "var(--royal-violet)" }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(stats.avg) ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <p
                className="mt-2 text-[10px] font-black uppercase tracking-[0.3em]"
                style={{ color: "var(--lavender-purple)" }}
              >
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
                      <span
                        className="text-[10px] font-black w-3"
                        style={{ color: "var(--dark-amethyst-2)" }}
                      >
                        {star}
                      </span>
                      <Star
                        size={10}
                        fill="currentColor"
                        style={{ color: "var(--royal-violet)" }}
                      />
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--rv-tint-mauve)" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="h-full rounded-full"
                          style={{ background: "var(--rv-gradient)" }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-bold w-6 text-right"
                        style={{ color: "var(--mauve-magic)" }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Listă recenzii */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((review, idx) => (
              <ReviewCard key={review.id} review={review} idx={idx} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

/** Subcomponentă separată pentru a gestiona starea hover local */
const ReviewCard = ({ review, idx }: { review: Review; idx: number }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(idx * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl p-6 backdrop-blur-xl bg-white transition-all duration-300"
      style={{
        border: `1px solid ${hovered ? "var(--rv-border-h)" : "var(--rv-border-soft)"}`,
        boxShadow: hovered ? "var(--rv-shadow-h)" : "none",
      }}
    >
      <Quote
        size={22}
        className="absolute top-5 right-5 transition-opacity duration-300"
        style={{
          color: "var(--mauve-magic)",
          opacity: hovered ? 0.5 : 0.15,
        }}
      />

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black tracking-wider shadow-md flex-shrink-0"
          style={{ background: "var(--rv-gradient)" }}
        >
          {initials(review.user_name || review.customer_name)}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[11px] font-black uppercase tracking-widest truncate"
            style={{ color: "var(--dark-amethyst)" }}
          >
            {review.user_name || review.customer_name || "Client Linea"}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: "var(--mauve)" }}
          >
            {new Date(review.created_at).toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div
        className="flex gap-0.5 mt-4"
        style={{ color: "var(--royal-violet)" }}
      >
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            fill={i < review.rating ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>

      <p
        className="mt-3 text-sm font-light leading-relaxed italic"
        style={{ color: "var(--indigo-ink)" }}
      >
        &ldquo;{review.comment}&rdquo;
      </p>
    </motion.article>
  );
};

export default ProductReviews;
