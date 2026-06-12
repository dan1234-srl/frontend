// pages/admin/AdminWishlistAnalytics.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  AlertCircle,
  ShoppingBag,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="space-y-10 text-left animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase">
          Wishlist Insights
        </h1>
        <p className="text-zinc-500 font-medium">
          Analizează produsele salvate de clienți pentru a optimiza stocul și
          campaniile de preț.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50/50 border-b border-zinc-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Produs
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">
                    Interes
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Status Stoc
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {trends.length > 0 ? (
                  trends.map((item: any) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(item.image)}
                            className="size-14 rounded-2xl object-cover bg-zinc-50 border border-zinc-100"
                            onError={(e: any) =>
                              (e.target.src = "/placeholder.png")
                            }
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900 uppercase leading-tight">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 text-rose-500">
                            <Heart size={14} fill="currentColor" />
                            <span className="text-lg font-black">
                              {item.total_saves}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {item.stock <= 5 ? (
                          <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase flex items-center gap-1.5 w-fit">
                            <AlertCircle size={12} /> Stoc Scăzut ({item.stock})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            În Stoc ({item.stock})
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleActionClick(item.sku)}
                          className="p-3 rounded-full border border-zinc-100 hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-20 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest"
                    >
                      Nu există date disponibile pentru această pagină
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROALE PAGINARE */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="size-10 rounded-full border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:bg-zinc-100 transition-all active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                Pagina {page} din {totalPages}
              </span>
              <button
                disabled={page === totalPages || loading}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="size-10 rounded-full border border-zinc-200 flex items-center justify-center disabled:opacity-30 hover:bg-zinc-100 transition-all active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-[var(--dark-amethyst)] rounded-[32px] text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4">
              <ShoppingBag className="opacity-10" size={120} />
            </div>
            <div className="relative z-10 space-y-6 text-left">
              <h3 className="text-2xl font-bold leading-tight">
                Oportunitate de Reaprovizionare
              </h3>
              <p className="text-zinc-400 text-sm italic">
                Produsele de mai jos au un număr mare de salvări, dar stocul
                este critic.
              </p>
              <div className="space-y-4">
                {trends
                  .filter((t: any) => t.stock < 3 && t.total_saves > 0)
                  .slice(0, 3)
                  .map((t: any) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => handleActionClick(t.sku)}
                    >
                      <span className="text-xs font-bold uppercase truncate max-w-[150px]">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-black bg-rose-500 px-2 py-1 rounded">
                        HOT
                      </span>
                    </div>
                  ))}
                {trends.filter((t: any) => t.stock < 3 && t.total_saves > 0)
                  .length === 0 && (
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black py-4">
                    Toate stocurile populare sunt optime
                  </p>
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
