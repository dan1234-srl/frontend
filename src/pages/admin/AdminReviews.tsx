/**
 * AdminReviews.tsx
 * Moderare Recenzii - Design Futuristic (Bento Neo-Mosaic & Glassmorphism)
 */

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
  Sparkles,
  MessageSquareQuote,
} from "lucide-react";
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
  const [confirmDelete, setConfirmDelete] = useState<string | number | null>(
    null,
  );
  const perPage = 10;

  const swrKey = `admin:reviews:status=${statusFilter}`;
  const {
    data: rawData,
    loading,
    setData,
  } = useAdminSWR<any>(
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
    {
      ttl: 30_000,
      refreshInterval: statusFilter === "pending" ? 30_000 : undefined,
    },
  );

  const reviews: AdminReview[] = Array.isArray(rawData) ? rawData : [];

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

      setData(reviews.map((r) => (r.id === id ? { ...r, status } : r)));

      ["pending", "approved", "rejected", "Toate"].forEach((s) =>
        invalidateCache(`admin:reviews:status=${s}`),
      );

      toast.success(
        status === "approved"
          ? "Recenzia a fost aprobată public."
          : "Recenzia a fost ascunsă/respinsă.",
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
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) throw new Error();

      setData(reviews.filter((r) => r.id !== id));

      ["pending", "approved", "rejected", "Toate"].forEach((s) =>
        invalidateCache(`admin:reviews:status=${s}`),
      );

      toast.success("Recenzia a fost ștearsă definitiv.");
    } catch {
      toast.error("Nu am putut șterge recenzia.");
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
        size={14}
        className={
          i < count
            ? "text-[var(--royal-violet)] fill-[var(--royal-violet)]"
            : "text-zinc-200"
        }
      />
    ));

  return (
    <div className="w-full space-y-8 px-2 sm:px-4 md:px-8 pb-20 font-sans text-left animate-fade-in relative z-0">
      {/* ── HEADER FUTURISTIC ──────────────────────────────────────────────── */}
      <header
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pb-6 pt-4 border-b"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Sparkles
              size={12}
              className="animate-pulse"
              style={{ color: "var(--royal-violet)" }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{
                color: "color-mix(in srgb, var(--royal-violet) 80%, black)",
              }}
            >
              Feedback Clienți
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Moderare{" "}
            <span style={{ color: "var(--royal-violet)" }}>Recenzii</span>
          </h1>
        </div>
      </header>

      {/* ── KPI STRIP ANIMATED ──────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-[20px] p-5 sm:p-6 shadow-lg shadow-black/[0.04] group border border-white/10"
          style={{ background: "var(--primary-gradient)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 text-white shadow-sm w-fit transition-transform group-hover:scale-105">
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70 mb-1">
                Rating Global
              </p>
              <h4 className="heading-serif text-2xl sm:text-[32px] tracking-tight text-white font-medium leading-none drop-shadow-sm">
                {stats.avg.toFixed(1)}{" "}
                <span className="text-lg opacity-60">/ 5</span>
              </h4>
            </div>
          </div>
          <div
            aria-hidden
            className="absolute -right-6 -bottom-6 size-28 rounded-full pointer-events-none mix-blend-overlay transition-transform duration-700 group-hover:scale-150"
            style={{
              background: "rgba(255,255,255,0.15)",
              filter: "blur(20px)",
            }}
          />
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-[20px] p-5 sm:p-6 shadow-lg shadow-black/[0.04] group border border-white/10 bg-white"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div
              className="p-3 bg-zinc-50 rounded-2xl border text-zinc-400 shadow-sm w-fit transition-transform group-hover:scale-105 group-hover:text-[var(--royal-violet)] group-hover:border-[var(--royal-violet)]"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
              }}
            >
              <MessageSquareQuote size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">
                Volum Analizat
              </p>
              <h4 className="heading-serif text-2xl sm:text-[32px] tracking-tight text-[var(--dark-amethyst)] font-medium leading-none">
                {stats.total}
              </h4>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Search + filter chips (Glassmorphism) ──────────────────────────── */}
      <section
        className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between p-3 rounded-[1.5rem] backdrop-blur-xl border bg-white/40"
        style={{
          borderColor:
            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
        }}
      >
        <div className="relative w-full lg:w-[420px] group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{
              color: "color-mix(in srgb, var(--royal-violet) 40%, transparent)",
            }}
            size={14}
          />
          <input
            placeholder="Căutare după conținut, client, produs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md border rounded-xl text-sm font-medium outline-none transition placeholder:text-zinc-400 placeholder:font-normal text-[var(--dark-amethyst)]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
              boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--royal-violet)";
              e.target.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)";
              e.target.style.backgroundColor = "rgba(255,255,255,0.6)";
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2 relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white/80 backdrop-blur-md border rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm transition-colors text-[var(--dark-amethyst)]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <option value="Toate">Toate Statusurile</option>
            <option value="pending">În așteptare (Necesită Acțiune)</option>
            <option value="approved">Aprobate (Live pe site)</option>
            <option value="rejected">Respinse (Ascunse)</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white/80 backdrop-blur-md border rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm transition-colors text-[var(--dark-amethyst)]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <option value="Toate">Toate Scorurile</option>
            <option value="5">Doar 5 Stele</option>
            <option value="sub3">Problematice (Sub 3 stele)</option>
          </select>
        </div>
      </section>

      {/* ── LISTA DE CARDURI (BENTO STYLE) ─────────────────────────────────── */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[2rem] border p-6 md:p-8 space-y-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                  }}
                >
                  <div className="flex gap-4">
                    <div className="size-12 bg-zinc-100 rounded-2xl animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
                      <div className="h-2 w-24 bg-zinc-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-zinc-100 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-zinc-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : paged.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center gap-3 bg-white/50 rounded-[28px] border border-dashed"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 20%, transparent)",
              }}
            >
              <Inbox
                size={40}
                strokeWidth={1}
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-[0.3em]"
                style={{
                  color: "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                }}
              >
                Nicio recenzie găsită
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {paged.map((review) => {
                const status = (review.status as ReviewStatus) || "pending";
                const customer =
                  review.user_name || review.customer_name || "Client Anonim";

                return (
                  <div
                    key={review.id}
                    className="group relative bg-white border rounded-[2rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm flex flex-col overflow-hidden"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
                    }}
                  >
                    {/* Background Hover Gradient */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                      }}
                    />
                    <div className="absolute inset-1 rounded-[1.8rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0 bg-white/95" />

                    <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                      {/* Top Info */}
                      <div className="flex justify-between items-start mb-6 gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="size-12 rounded-[1rem] flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0"
                            style={{ background: "var(--primary-gradient)" }}
                          >
                            {initials(customer)}
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-tight text-[var(--dark-amethyst)] group-hover:text-[var(--royal-violet)] transition-colors">
                              {customer}
                            </p>
                            <p
                              className="text-[9px] font-black uppercase tracking-widest mt-0.5"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                              }}
                            >
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

                        {/* Status Badge */}
                        <span
                          className="px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap border shadow-sm"
                          style={{
                            backgroundColor:
                              status === "approved"
                                ? "color-mix(in srgb, #10b981 5%, transparent)"
                                : status === "pending"
                                  ? "color-mix(in srgb, #f59e0b 5%, transparent)"
                                  : "color-mix(in srgb, #f43f5e 5%, transparent)",
                            color:
                              status === "approved"
                                ? "#10b981"
                                : status === "pending"
                                  ? "#d97706"
                                  : "#e11d48",
                            borderColor:
                              status === "approved"
                                ? "color-mix(in srgb, #10b981 20%, transparent)"
                                : status === "pending"
                                  ? "color-mix(in srgb, #f59e0b 20%, transparent)"
                                  : "color-mix(in srgb, #f43f5e 20%, transparent)",
                          }}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>

                      {/* Continut Recenzie */}
                      <div className="flex-1 space-y-4 mb-8">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <p
                          className="text-[13px] leading-relaxed italic font-medium"
                          style={{
                            color:
                              "color-mix(in srgb, var(--royal-violet) 70%, black)",
                          }}
                        >
                          „{review.comment}”
                        </p>
                        {review.product_name && (
                          <a
                            href={
                              review.product_slug
                                ? `/produs/${review.product_slug}`
                                : "#"
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-50 border transition-all hover:bg-white"
                            style={{
                              color: "var(--royal-violet)",
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                            }}
                          >
                            <ExternalLink size={12} /> {review.product_name}
                          </a>
                        )}
                      </div>

                      {/* Bottom Actions */}
                      <div
                        className="pt-5 border-t flex justify-end gap-2"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                        }}
                      >
                        {status !== "approved" && (
                          <button
                            disabled={busyId === review.id}
                            onClick={() => updateStatus(review.id, "approved")}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            style={{ background: "var(--primary-gradient)" }}
                          >
                            {busyId === review.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} strokeWidth={2.5} />
                            )}{" "}
                            Publică
                          </button>
                        )}
                        {status !== "rejected" && (
                          <button
                            disabled={busyId === review.id}
                            onClick={() => updateStatus(review.id, "rejected")}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white border hover:bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            style={{
                              borderColor:
                                "color-mix(in srgb, #f43f5e 20%, transparent)",
                            }}
                          >
                            <XCircle size={14} strokeWidth={2.5} /> Ascunde
                          </button>
                        )}
                        <button
                          disabled={busyId === review.id}
                          onClick={() => setConfirmDelete(review.id)}
                          className="px-4 py-3 rounded-xl bg-white border hover:bg-rose-500 hover:text-white hover:border-rose-500 text-rose-500 transition-all disabled:opacity-50 shadow-sm"
                          style={{
                            borderColor:
                              "color-mix(in srgb, #f43f5e 20%, transparent)",
                          }}
                          title="Ștergere Definitivă"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PAGINATION ─────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          className="p-4 border border-white rounded-2xl flex justify-center items-center gap-4 shrink-0 bg-white/50 backdrop-blur-md shadow-sm"
          style={{
            borderColor:
              "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronLeft size={14} style={{ color: "var(--royal-violet)" }} />
          </button>

          <div className="hidden sm:flex gap-1.5">
            {[...Array(totalPages)]
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all shadow-sm border ${page === i + 1 ? "text-white border-transparent" : "bg-white hover:bg-zinc-50"}`}
                  style={{
                    background:
                      page === i + 1 ? "var(--primary-gradient)" : undefined,
                    borderColor:
                      page !== i + 1
                        ? "color-mix(in srgb, var(--royal-violet) 10%, transparent)"
                        : undefined,
                    color:
                      page !== i + 1
                        ? "var(--dark-amethyst)"
                        : "color-mix(in srgb, var(--royal-violet) 60%, gray)",
                  }}
                >
                  {i + 1}
                </button>
              ))
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
          </div>

          <span
            className="sm:hidden text-[10px] font-black uppercase tracking-[0.2em] bg-white border px-4 py-2 rounded-xl shadow-sm"
            style={{
              color: "var(--dark-amethyst)",
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            {page} <span className="opacity-30 mx-1">/</span> {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2.5 bg-white border rounded-xl hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <ChevronRight size={14} style={{ color: "var(--royal-violet)" }} />
          </button>
        </div>
      )}

      {/* ── MODAL DE CONFIRMARE ȘTERGERE ── */}
      <AdminConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        eyebrow="Ștergere Definitivă"
        title="Ștergi această recenzie?"
        description="Acțiunea este ireversibilă. Recenzia va fi eliminată complet din baza de date și nu va mai putea fi recuperată."
        confirmLabel="Confirmă Ștergerea"
        destructive
        onConfirm={async () => {
          if (confirmDelete !== null) await removeReview(confirmDelete);
        }}
      />
    </div>
  );
};

export default AdminReviews;
