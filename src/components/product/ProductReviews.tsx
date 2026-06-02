import { useEffect, useState } from "react";
import { Star, UserCircle, Loader2 } from "lucide-react";

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

  return (
    <div className="py-20 border-t border-neutral-100">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8">
        <h2 className="text-3xl font-serif italic tracking-tighter text-[var(--dark-amethyst)]">
          Client Testimonials
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
          {reviews.length} Verified Reviews
        </p>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-neutral-300">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-300">
            Nicio recenzie încă
          </p>
          <p className="text-sm text-neutral-400 mt-3 font-light italic">
            Fii primul care împărtășește experiența cu acest produs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="space-y-4 border-b border-neutral-50 pb-12"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <UserCircle
                    size={24}
                    strokeWidth={1}
                    className="text-neutral-300"
                  />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
                    {review.user_name || review.customer_name || "Client"}
                  </span>
                </div>
                <div className="flex gap-0.5 text-[var(--royal-violet)]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={i < review.rating ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm font-light leading-relaxed text-neutral-600 italic">
                "{review.comment}"
              </p>

              <p className="text-[9px] text-neutral-300 uppercase font-bold tracking-widest">
                {new Date(review.created_at).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
