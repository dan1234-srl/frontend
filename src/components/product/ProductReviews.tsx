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

// Toate culorile trimise de backend
export interface ThemeConfig {
  // Paleta principală (violet → mauve)
  dark_amethyst?: string; // #10002b – cel mai întunecat
  dark_amethyst_2?: string; // #240046
  indigo_ink?: string; // #3c096c
  indigo_velvet?: string; // #5a189a
  royal_violet?: string; // #7b2cbf – accent primar
  lavender_purple?: string; // #9d4edd
  mauve_magic?: string; // #c77dff
  mauve?: string; // #e0aaff – cel mai deschis

  // UI & Text
  text_primary?: string; // #10002b
  text_secondary?: string; // #9d4edd
  surface_bg?: string; // #FBFBFD
  surface_card?: string; // #FFFFFF
}

interface Props {
  productId?: string | number;
  reviews?: Review[];
  theme?: ThemeConfig;
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

/** Construiește toate variabilele CSS din paleta backend */
const buildThemeStyles = (t: ThemeConfig = {}): React.CSSProperties => {
  const royal = t.royal_violet || "#7b2cbf";
  const lavender = t.lavender_purple || "#9d4edd";
  const dark = t.dark_amethyst || "#10002b";
  const dark2 = t.dark_amethyst_2 || "#240046";
  const indigoV = t.indigo_velvet || "#5a189a";
  const mauveM = t.mauve_magic || "#c77dff";
  const mauve = t.mauve || "#e0aaff";

  return {
    // ── Culori brute ──────────────────────────────────────────
    "--c-dark": dark,
    "--c-dark2": dark2,
    "--c-indigo": t.indigo_ink || "#3c096c",
    "--c-indigo-v": indigoV,
    "--c-royal": royal,
    "--c-lavender": lavender,
    "--c-mauve-m": mauveM,
    "--c-mauve": mauve,

    // ── Text & suprafețe ──────────────────────────────────────
    "--c-text-p": t.text_primary || dark,
    "--c-text-s": t.text_secondary || lavender,
    "--c-surface-bg": t.surface_bg || "#FBFBFD",
    "--c-surface-card": t.surface_card || "#FFFFFF",

    // ── Gradiente ─────────────────────────────────────────────
    // Principal: royal → lavender (accent butoane, bare, avatar)
    "--c-gradient": `linear-gradient(135deg, ${royal} 0%, ${lavender} 100%)`,
    // Profund: dark2 → indigoV (orb ambiant, fundal decorativ)
    "--c-gradient-d": `linear-gradient(135deg, ${dark2} 0%, ${indigoV} 100%)`,
    // Pastel: mauveM → mauve (hover subtil, accente light)
    "--c-gradient-soft": `linear-gradient(135deg, ${mauveM} 0%, ${mauve} 100%)`,

    // ── Borduri ───────────────────────────────────────────────
    // Normală: royal la 18% opacitate
    "--c-border": `color-mix(in srgb, ${royal} 18%, transparent)`,
    // Hover: mauve_magic la 45% (mai vizibil, dar nu agresiv)
    "--c-border-h": `color-mix(in srgb, ${mauveM} 45%, transparent)`,
    // Subtilă: mauve la 30% (card-uri în repaus)
    "--c-border-soft": `color-mix(in srgb, ${mauve} 30%, transparent)`,

    // ── Umbre ─────────────────────────────────────────────────
    "--c-shadow": `0 8px 40px -12px color-mix(in srgb, ${royal} 18%, transparent)`,
    "--c-shadow-h": `0 12px 36px -10px color-mix(in srgb, ${royal} 28%, transparent)`,

    // ── Tint-uri de fundal (pentru badge-uri, tag-uri etc.) ───
    "--c-tint-royal": `color-mix(in srgb, ${royal} 8%, transparent)`,
    "--c-tint-mauve": `color-mix(in srgb, ${mauve} 25%, transparent)`,
  } as React.CSSProperties;
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

  const themeStyles = buildThemeStyles(theme);

  return (
    <section
      className="pt-16 mt-12 border-t relative"
      style={{
        ...themeStyles,
        borderTopColor: "var(--c-border-soft)",
        backgroundColor: "var(--c-surface-bg)",
      }}
    >
      {/* ── Orb decorativ ambient (gradient profund) ── */}
      <div
        className="pointer-events-none absolute -top-10 right-0 w-[420px] h-[420px] rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "var(--c-gradient-d)" }}
      />

      {/* ── Header etichetă ── */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquareText size={14} style={{ color: "var(--c-royal)" }} />
        <span
          className="text-[10px] font-black uppercase tracking-[0.4em]"
          style={{ color: "var(--c-royal)" }}
        >
          Testimoniale clienți
        </span>
      </div>

      {/* ── Titlu secțiune ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <h2
          className="text-3xl md:text-4xl font-serif italic tracking-tighter leading-[1.05]"
          style={{ color: "var(--c-text-p)" }}
        >
          Ce spun cei care
          <br />
          <span style={{ color: "var(--c-text-s)" }}>poartă Linea</span>
        </h2>
        <div
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--c-indigo)" }}
        >
          <ShieldCheck size={14} style={{ color: "var(--c-royal)" }} />
          {reviews.length} Recenzii verificate
        </div>
      </div>

      {/* ── State: loading ── */}
      {loading && reviews.length === 0 ? (
        <div
          className="flex items-center justify-center py-20"
          style={{ color: "var(--c-mauve)" }}
        >
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : reviews.length === 0 ? (
        /* ── State: gol ── */
        <div
          className="relative rounded-2xl py-16 px-8 text-center overflow-hidden backdrop-blur-xl"
          style={{
            border: "1px solid var(--c-border)",
            backgroundColor: "var(--c-surface-card)",
            boxShadow: "var(--c-shadow)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ background: "var(--c-gradient)" }}
          />
          <Quote
            size={28}
            className="mx-auto mb-4"
            style={{ color: "var(--c-lavender)", opacity: 0.7 }}
          />
          <p
            className="text-[11px] font-black uppercase tracking-[0.4em]"
            style={{ color: "var(--c-text-p)" }}
          >
            Încă nicio poveste scrisă
          </p>
          <p
            className="text-sm mt-3 font-light italic max-w-md mx-auto"
            style={{ color: "var(--c-indigo)" }}
          >
            Fii primul care împărtășește experiența cu acest produs și inspiră
            comunitatea.
          </p>
        </div>
      ) : (
        /* ── State: recenzii ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Card sumar rating ── */}
          <aside className="lg:col-span-4">
            <div
              className="sticky top-40 rounded-2xl p-7 backdrop-blur-xl"
              style={{
                border: "1px solid var(--c-border)",
                backgroundColor: "var(--c-surface-card)",
                boxShadow: "var(--c-shadow)",
              }}
            >
              {/* Scor mediu */}
              <div className="flex items-baseline gap-2">
                <span
                  className="text-5xl font-black tracking-tighter"
                  style={{ color: "var(--c-text-p)" }}
                >
                  {stats.avg.toFixed(1)}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--c-mauve-m)" }}
                >
                  / 5
                </span>
              </div>

              {/* Stele medii */}
              <div
                className="flex gap-0.5 mt-2"
                style={{ color: "var(--c-royal)" }}
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
                style={{ color: "var(--c-lavender)" }}
              >
                Bazat pe {reviews.length} recenzii
              </p>

              {/* Distribuție stele */}
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
                        style={{ color: "var(--c-dark2)" }}
                      >
                        {star}
                      </span>
                      <Star
                        size={10}
                        fill="currentColor"
                        style={{ color: "var(--c-royal)" }}
                      />
                      {/* Track bară */}
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--c-tint-mauve)" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="h-full rounded-full"
                          style={{ background: "var(--c-gradient)" }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-bold w-6 text-right"
                        style={{ color: "var(--c-mauve-m)" }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Listă recenzii ── */}
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

/** Card recenzie separat pentru hover cu CSS inline */
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
      className="group relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: "var(--c-surface-card)",
        border: `1px solid ${hovered ? "var(--c-border-h)" : "var(--c-border-soft)"}`,
        boxShadow: hovered ? "var(--c-shadow-h)" : "none",
      }}
    >
      {/* Icon citat decorativ */}
      <Quote
        size={22}
        className="absolute top-5 right-5 transition-opacity duration-300"
        style={{
          color: "var(--c-mauve-m)",
          opacity: hovered ? 0.5 : 0.15,
        }}
      />

      {/* Avatar + Nume */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black tracking-wider shadow-md flex-shrink-0"
          style={{ background: "var(--c-gradient)" }}
        >
          {initials(review.user_name || review.customer_name)}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[11px] font-black uppercase tracking-widest truncate"
            style={{ color: "var(--c-text-p)" }}
          >
            {review.user_name || review.customer_name || "Client Linea"}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: "var(--c-mauve)" }}
          >
            {new Date(review.created_at).toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stele recenzie */}
      <div className="flex gap-0.5 mt-4" style={{ color: "var(--c-royal)" }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            fill={i < review.rating ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>

      {/* Comentariu */}
      <p
        className="mt-3 text-sm font-light leading-relaxed italic"
        style={{ color: "var(--c-indigo)" }}
      >
        &ldquo;{review.comment}&rdquo;
      </p>
    </motion.article>
  );
};

export default ProductReviews;
