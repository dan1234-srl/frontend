import { useMemo, useState } from "react";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity,
  Loader2,
  Inbox,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAdminSWR } from "@/lib/admin-swr";
import { invalidateCache } from "@/lib/swr-cache";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

type ReviewStatus = "pending" | "approved" | "rejected";

interface AdminReview {
  id: string | number;
  product_id?: string | number;
  product_name?: string;
  product_slug?: string;
  user_name?: string;
  customer_name?: string;
  user_email?: string;
  rating: number;
  comment: string;
  created_at: string;
  status: ReviewStatus | string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  approved: "Aprobat",
  rejected: "Respins",
};

const initials = (name?: string) =>
  (name || "??")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AdminReviews = () => {
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [ratingFilter, setRatingFilter] = useState<string>("Toate");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<
    string | number | null
  >(null);
  const perPage = 8;

  const swrKey = `admin:reviews:status=${statusFilter}`;
  const { data: reviews = [], loading, mutate, setData } = useAdminSWR<AdminReview[]>(
    swrKey,
    async () => {
      const url = new URL(`${API_BASE_URL}/api/v1/reviews/admin`);
      if (statusFilter !== "Toate")
        url.searchParams.set("status", statusFilter);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      return Array.isArray(json) ? json : json?.items || [];
    },
    { ttl: 30_000, refreshInterval: statusFilter === "pending" ? 30_000 : undefined },
  );

  const updateStatus = async (id: string | number, status: ReviewStatus) => {
    setBusyId(id);
    const endpoint = status === "approved" ? "approve" : "reject";

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/reviews/admin/${id}/${endpoint}`,
        {
          method: status === "approved" ? "PATCH" : "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!res.ok) throw new Error();

      // Optimistic update
      setData(((reviews || []) as AdminReview[]).map((r) =>
        r.id === id ? { ...r, status } : r,
      ));
      // Invalidate all status caches since item may move tabs
      ["pending", "approved", "rejected", "Toate"].forEach((s) =>
        invalidateCache(`admin:reviews:status=${s}`),
      );
      toast.success(
        status === "approved"
          ? "Recenzia a fost aprobată."
          : "Recenzia a fost respinsă.",
      );
    } catch {
      toast.error("Operațiunea a eșuat.");
    } finally {
      setBusyId(null);
    }
  };

  const removeReview = async (id: string | number) => {
    setBusyId(id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/reviews/admin/${id}/reject`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error();
      setData(((reviews || []) as AdminReview[]).filter((r) => r.id !== id));
      ["pending", "approved", "rejected", "Toate"].forEach((s) =>
        invalidateCache(`admin:reviews:status=${s}`),
      );
      toast.success("Recenzia a fost ștearsă.");
    } catch {
      toast.error("Nu am putut șterge recenzia.");
      throw new Error();
    } finally {
      setBusyId(null);
    }
  };


  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchRating =
        ratingFilter === "Toate" ||
        (ratingFilter === "5" && r.rating === 5) ||
        (ratingFilter === "sub3" && r.rating < 3);
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.comment?.toLowerCase().includes(q) ||
        r.product_name?.toLowerCase().includes(q) ||
        (r.user_name || r.customer_name || "").toLowerCase().includes(q);
      return matchRating && matchSearch;
    });
  }, [reviews, ratingFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0 };
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return { avg: sum / reviews.length, total: reviews.length };
  }, [reviews]);

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={
          i < count
            ? "text-[var(--royal-violet)] fill-[var(--royal-violet)]"
            : "text-zinc-200"
        }
      />
    ));

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
            Moderare Recenzii
          </h1>
          <div className="bg-white border border-zinc-100 px-6 py-3 flex items-center gap-6 shadow-sm rounded-2xl">
            <div className="text-center border-r border-zinc-50 pr-6">
              <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">
                Rating Mediu
              </p>
              <p className="text-lg font-black text-[var(--dark-amethyst)]">
                {stats.avg.toFixed(1)} / 5
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">
                Total
              </p>
              <p className="text-lg font-black text-[var(--dark-amethyst)]">
                {stats.total}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CAUTĂ ÎN RECENZII..."
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
            <option value="pending">În așteptare</option>
            <option value="approved">Aprobate</option>
            <option value="rejected">Respinse</option>
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

      {/* List */}
      <div className="space-y-4 min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[var(--royal-violet)]">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Inbox size={36} strokeWidth={1} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em]">
              Nicio recenzie de afișat
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {paged.map((review) => {
              const status =
                (review.status as ReviewStatus) || ("pending" as ReviewStatus);
              const customer =
                review.user_name || review.customer_name || "Client";
              return (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-zinc-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all rounded-[2rem]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    <div className="lg:col-span-3 lg:border-r lg:border-zinc-50 lg:pr-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                          style={{ background: "var(--primary-gradient)" }}
                        >
                          {initials(customer)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight text-[var(--dark-amethyst)]">
                            {customer}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                            {new Date(review.created_at).toLocaleDateString(
                              "ro-RO",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      {review.product_name && (
                        <a
                          href={
                            review.product_slug
                              ? `/produs/${review.product_slug}`
                              : "#"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline"
                          style={{ color: "var(--royal-violet)" }}
                        >
                          {review.product_name} <ExternalLink size={12} />
                        </a>
                      )}
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
                          status === "approved"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                            : status === "pending"
                              ? "border-amber-100 bg-amber-50 text-amber-600"
                              : "border-rose-100 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {STATUS_LABEL[status] || status}
                      </span>
                    </div>

                    <div className="lg:col-span-3 flex flex-row lg:flex-col justify-start lg:justify-center gap-3">
                      {status !== "approved" && (
                        <button
                          disabled={busyId === review.id}
                          onClick={() => updateStatus(review.id, "approved")}
                          className="flex-1 lg:flex-none rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] h-12 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                          style={{ background: "var(--primary-gradient)" }}
                        >
                          {busyId === review.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}{" "}
                          Aprobă
                        </button>
                      )}
                      {status !== "rejected" && (
                        <Button
                          disabled={busyId === review.id}
                          onClick={() => updateStatus(review.id, "rejected")}
                          variant="outline"
                          className="flex-1 lg:flex-none rounded-xl border-zinc-200 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] h-12 gap-2"
                        >
                          <XCircle size={16} /> Respinge
                        </Button>
                      )}
                      <Button
                        disabled={busyId === review.id}
                        onClick={() => setConfirmDelete(review.id)}
                        variant="ghost"
                        className="flex-1 lg:flex-none rounded-xl bg-zinc-50 text-zinc-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] h-12 gap-2"
                      >
                        <Trash2 size={16} /> Șterge
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > perPage && (
        <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">
            Pagina {page} din {totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-10 w-10 rounded-xl border-zinc-200 hover:border-[var(--royal-violet)]"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-10 w-10 rounded-xl border-zinc-200 hover:border-[var(--royal-violet)]"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
