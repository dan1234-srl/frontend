import { useState } from "react";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MOCK_REVIEWS = [
  {
    id: 1,
    product: "Inel Diamond Pantheon",
    customer: "Elena Ionescu",
    rating: 5,
    comment:
      "Absolut superb! Ambalajul a fost deosebit, iar inelul strălucește incredibil.",
    date: "18 Martie 2026",
    status: "Aprobat",
    avatar: "EI",
  },
  {
    id: 2,
    product: "Cercei Luna Silver",
    customer: "Andrei Popescu",
    rating: 4,
    comment: "Sunt foarte frumoși, însă transportul a durat cu o zi mai mult.",
    date: "15 Martie 2026",
    status: "În așteptare",
    avatar: "AP",
  },
  {
    id: 3,
    product: "Colier Stellar Gold",
    customer: "Maria Enache",
    rating: 5,
    comment: "O piesă de artă. Serviciul clienți a fost de mare ajutor.",
    date: "12 Martie 2026",
    status: "Aprobat",
    avatar: "ME",
  },
  {
    id: 4,
    product: "Bratara Aurora",
    customer: "Cristina V.",
    rating: 2,
    comment: "S-a desfăcut sistemul de închidere după doar două purtări.",
    date: "10 Martie 2026",
    status: "Respins",
    avatar: "CV",
  },
];

const AdminReviews = () => {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [ratingFilter, setRatingFilter] = useState("Toate");

  const handleStatusChange = (id: number, newStatus: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    toast.success(`Review ${newStatus.toLowerCase()} cu succes.`);
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={`${i < count ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`}
      />
    ));

  const filtered = reviews.filter((r) => {
    const matchStatus = statusFilter === "Toate" || r.status === statusFilter;
    const matchRating =
      ratingFilter === "Toate" ||
      (ratingFilter === "5" && r.rating === 5) ||
      (ratingFilter === "sub3" && r.rating < 3);
    return matchStatus && matchRating;
  });

  return (
    <div className="space-y-8 pb-16 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 pb-8">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg text-white"
            style={{ background: "var(--primary-gradient)" }}
          >
            <Activity size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--royal-violet)]">
            Feedback Clienți
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-serif italic tracking-tighter text-[var(--dark-amethyst)]">
            Recenzii
          </h1>
          <div className="bg-white border border-zinc-100 px-6 py-3 flex items-center gap-6 shadow-sm rounded-2xl">
            <div className="text-center border-r border-zinc-50 pr-6">
              <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">
                Rating Mediu
              </p>
              <p className="text-lg font-black text-[var(--dark-amethyst)]">
                4.8 / 5
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">
                Total
              </p>
              <p className="text-lg font-black text-[var(--dark-amethyst)]">
                1,284
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-100 p-4 shadow-sm rounded-[1.5rem] flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
            size={16}
          />
          <Input
            placeholder="CAUTĂ ÎN REVIEWS..."
            className="pl-12 rounded-xl border-zinc-50 bg-zinc-50/50 text-[10px] uppercase tracking-widest h-12 focus:ring-2 focus:ring-[var(--royal-violet)]/10"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 border border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest px-6 outline-none rounded-xl text-[var(--dark-amethyst)] font-bold"
          >
            <option value="Toate">Toate statusurile</option>
            <option value="În așteptare">În așteptare</option>
            <option value="Aprobat">Aprobate</option>
            <option value="Respins">Respinse</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-12 border border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest px-6 outline-none rounded-xl text-[var(--dark-amethyst)] font-bold"
          >
            <option value="Toate">Toate ratingurile</option>
            <option value="5">5 Stele</option>
            <option value="sub3">Sub 3 Stele</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all rounded-[2rem]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              <div className="lg:col-span-3 lg:border-r lg:border-zinc-50 lg:pr-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
                      {review.customer}
                    </p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                      {review.date}
                    </p>
                  </div>
                </div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:underline"
                  style={{ color: "var(--royal-violet)" }}
                >
                  {review.product} <ExternalLink size={12} />
                </p>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <p className="text-[14px] text-zinc-600 leading-relaxed italic font-medium">
                  "{review.comment}"
                </p>
                <span
                  className={`inline-block text-[9px] font-black uppercase px-3 py-1 border rounded-full shadow-sm ${
                    review.status === "Aprobat"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : review.status === "În așteptare"
                        ? "border-amber-100 bg-amber-50 text-amber-600"
                        : "border-rose-100 bg-rose-50 text-rose-600"
                  }`}
                >
                  {review.status}
                </span>
              </div>

              <div className="lg:col-span-3 flex flex-row lg:flex-col justify-start lg:justify-center gap-3">
                {review.status !== "Aprobat" && (
                  <button
                    onClick={() => handleStatusChange(review.id, "Aprobat")}
                    className="flex-1 lg:flex-none rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] h-12 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    style={{ background: "var(--primary-gradient)" }}
                  >
                    <CheckCircle2 size={16} /> Aprobă
                  </button>
                )}
                {review.status === "În așteptare" && (
                  <Button
                    onClick={() => handleStatusChange(review.id, "Respins")}
                    variant="outline"
                    className="flex-1 lg:flex-none rounded-xl border-zinc-200 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] h-12 gap-2"
                  >
                    <XCircle size={16} /> Respinge
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="flex-1 lg:flex-none rounded-xl bg-zinc-50 text-zinc-400 hover:text-[var(--dark-amethyst)] text-[10px] font-black uppercase tracking-[0.2em] h-12 gap-2"
                >
                  <MessageCircle size={16} /> Răspunde
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">
          Pagina 1 din 24
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-zinc-200 hover:border-[var(--royal-violet)]"
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-zinc-200 hover:border-[var(--royal-violet)]"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
