/**
 * AdminWishlistAnalytics.tsx
 * Pagina de analiză Wishlist - Design Futuristic (Bento Neo-Mosaic)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  AlertCircle,
  ShoppingBag,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSWR } from "@/lib/admin-swr";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const AdminWishlistAnalytics = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const getImageUrl = (imageSource: any) => {
    if (!imageSource) return "";
    if (typeof imageSource === "string" && imageSource.startsWith("{")) {
      try {
        const parsed = JSON.parse(imageSource);
        return parsed.main?.small || parsed.small || parsed.url || "";
      } catch {
        return "";
      }
    }
    if (typeof imageSource === "object") {
      return (
        imageSource.main?.small || imageSource.small || imageSource.url || ""
      );
    }
    return typeof imageSource === "string" ? imageSource : "";
  };

  const skip = (page - 1) * limit;
  const { data, loading } = useAdminSWR<{
    items: any[];
    pages: number;
    total: number;
  }>(
    `admin:wishlist:trends:skip=${skip}:limit=${limit}`,
    async () => {
      const res = await fetch(
        `${API_BASE}/api/v1/admin/analytics/wishlist-trends?skip=${skip}&limit=${limit}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`Eroare server: ${res.status}`);
      return res.json();
    },
    { ttl: 60_000 },
  );

  const trends = data?.items || [];
  const totalPages = data?.pages || 1;

  const handleActionClick = (sku: string) => {
    navigate(`/admin/products?search=${sku}`);
  };

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
              Marketing Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--dark-amethyst)] leading-none">
            Wishlist{" "}
            <span style={{ color: "var(--royal-violet)" }}>Insights</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div
            className="bg-white/60 backdrop-blur-xl border px-6 py-3.5 rounded-xl flex items-center gap-4 shadow-sm w-full sm:w-auto"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
            }}
          >
            <Activity size={18} className="text-rose-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">
                Analiză Produse Salvare
              </span>
              <span className="text-[11px] font-bold text-[var(--dark-amethyst)] leading-tight">
                Optimizare Stoc & Prețuri
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── BENTO GRID PRINCIPAL ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* TABEL ANALITIC */}
        <div className="xl:col-span-2 space-y-6">
          <div
            className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.02] border overflow-hidden relative min-h-[500px]"
            style={{
              borderColor:
                "color-mix(in srgb, var(--royal-violet) 10%, transparent)",
            }}
          >
            <div
              className="hidden md:grid grid-cols-12 bg-zinc-50/80 backdrop-blur-md border-b text-[9px] uppercase tracking-[0.25em] font-black px-8 py-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--royal-violet) 8%, transparent)",
                color: "color-mix(in srgb, var(--royal-violet) 60%, gray)",
              }}
            >
              <div className="col-span-5 pl-2">Produs</div>
              <div className="col-span-2 text-center">Interes (Inimi)</div>
              <div className="col-span-3">Status Stoc</div>
              <div className="col-span-2 text-right pr-4">Acțiuni</div>
            </div>

            <div className="divide-y">

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col md:grid md:grid-cols-12 px-6 md:px-10 py-5 items-start md:items-center gap-4 border-b last:border-0"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                        }}
                      >
                        <div className="col-span-5 flex items-center gap-4 w-full">
                          <Skeleton className="size-14 rounded-2xl shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-2 w-24" />
                          </div>
                        </div>
                        <div className="col-span-2 md:mx-auto">
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <div className="col-span-3">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <div className="col-span-2 md:ml-auto">
                          <Skeleton className="size-10 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : trends.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-32 flex flex-col items-center gap-3"
                  >
                    <Heart
                      size={40}
                      strokeWidth={1}
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 30%, gray)",
                      }}
                    />
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{
                        color:
                          "color-mix(in srgb, var(--royal-violet) 40%, gray)",
                      }}
                    >
                      Niciun produs în wishlist-uri
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {trends.map((item: any) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col md:grid md:grid-cols-12 items-start md:items-center px-4 md:px-10 py-4 gap-4 md:gap-0 border-b transition-colors hover:bg-zinc-50/50"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--royal-violet) 5%, transparent)",
                        }}
                      >
                        {/* Hover Gradient */}
                        <div
                          className="absolute inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
                          style={{
                            background:
                              "linear-gradient(100deg, color-mix(in srgb, var(--royal-violet) 3%, transparent) 0%, color-mix(in srgb, var(--mauve-magic) 1.5%, transparent) 100%)",
                          }}
                        />

                        <div className="col-span-5 flex items-center gap-4 w-full relative z-10 pl-2">
                          <img
                            src={getImageUrl(item.image) || "/placeholder.png"}
                            loading="lazy"
                            className="size-14 rounded-2xl object-cover bg-white border shadow-sm group-hover:scale-105 transition-transform duration-500 shrink-0"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                            }}
                            onError={(e: any) =>
                              (e.target.src = "/placeholder.png")
                            }
                            alt={item.name}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-[var(--dark-amethyst)] uppercase tracking-tight truncate group-hover:text-[var(--royal-violet)] transition-colors">
                              {item.name}
                            </span>
                            <span
                              className="text-[9px] font-semibold uppercase tracking-widest mt-0.5 truncate"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--royal-violet) 50%, gray)",
                              }}
                            >
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 flex justify-start md:justify-center w-full pl-2 md:pl-0 relative z-10">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-500 shadow-sm">
                            <Heart size={12} fill="currentColor" />
                            <span className="text-xs font-black">
                              {item.total_saves}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3 pl-2 md:pl-0 relative z-10">
                          {item.stock <= 5 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                              <AlertCircle size={10} /> Stoc Scăzut (
                              {item.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                              În Stoc ({item.stock})
                            </span>
                          )}
                        </div>

                        <div className="col-span-2 flex justify-end w-full md:w-auto pr-2 relative z-10 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleActionClick(item.sku)}
                            className="size-10 rounded-full border bg-white flex items-center justify-center hover:bg-[var(--royal-violet)] hover:text-white transition-all shadow-sm"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--royal-violet) 15%, transparent)",
                              color: "var(--dark-amethyst)",
                            }}
                            title="Deschide Produs"
                          >
                            <ArrowUpRight size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* PAGINATION */}
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
                <ChevronLeft
                  size={14}
                  style={{ color: "var(--royal-violet)" }}
                />
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
                          page === i + 1
                            ? "var(--primary-gradient)"
                            : undefined,
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
                <ChevronRight
                  size={14}
                  style={{ color: "var(--royal-violet)" }}
                />
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR ACTIONABLE INSIGHTS */}
        <div className="space-y-6">
          <div
            className="p-8 rounded-[2rem] shadow-xl relative overflow-hidden group border border-white/10"
            style={{ background: "var(--primary-gradient)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 text-white">
              <ShoppingBag size={150} />
            </div>

            <div className="relative z-10 flex flex-col h-full text-white">
              <h3 className="text-2xl font-serif italic font-black leading-tight mb-2 drop-shadow-sm">
                Oportunități Rapide
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/70 mb-8 leading-relaxed">
                Produsele de mai jos sunt extrem de dorite, însă stocul este
                critic de mic.
              </p>

              <div className="space-y-3">
                {trends
                  .filter((t: any) => t.stock < 3 && t.total_saves > 0)
                  .slice(0, 4)
                  .map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => handleActionClick(t.sku)}
                      className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[11px] font-bold uppercase truncate max-w-[200px] text-white">
                          {t.name}
                        </span>
                        <span className="text-[8px] font-medium tracking-widest text-white/60">
                          Stoc: {t.stock}
                        </span>
                      </div>
                      <span className="text-[9px] font-black bg-rose-500 text-white px-2.5 py-1 rounded-md shadow-sm shrink-0">
                        HOT
                      </span>
                    </div>
                  ))}

                {trends.filter((t: any) => t.stock < 3 && t.total_saves > 0)
                  .length === 0 &&
                  !loading && (
                    <div className="p-4 bg-black/10 rounded-2xl border border-white/10 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        Toate stocurile populare sunt optime.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWishlistAnalytics;
