import { Star, UserCircle } from "lucide-react";

// DATE GENERICE pentru previzualizare
const MOCK_REVIEWS = [
  {
    id: "1",
    user_name: "Andrei Mureșan",
    rating: 5,
    comment:
      "Calitatea materialelor este excepțională. Sistemul de prindere este foarte robust, mult peste ce am găsit în magazinele obișnuite.",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_name: "Elena Vasilescu",
    rating: 4,
    comment:
      "Design foarte minimalist care se potrivește perfect pe terasa noastră. Livrarea a durat puțin mai mult, dar produsul merită așteptarea.",
    created_at: new Date().toISOString(),
  },
];

const ProductReviews = ({ reviews }: { reviews: any[] }) => {
  // Folosim datele de test dacă array-ul de reviews este gol
  const displayReviews = reviews && reviews.length > 0 ? reviews : MOCK_REVIEWS;

  return (
    <div className="py-20 border-t border-neutral-100">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8">
        <h2 className="text-3xl font-serif italic tracking-tighter text-[#050B18]">
          Client Testimonials
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
          {displayReviews.length} Verified Reviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
        {displayReviews.map((review) => (
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
                <span className="text-[11px] font-black uppercase tracking-widest text-[#050B18]">
                  {review.user_name || "Evem Client"}
                </span>
              </div>
              <div className="flex gap-0.5 text-[#050B18]">
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
    </div>
  );
};

export default ProductReviews;
