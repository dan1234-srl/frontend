import { Link } from "react-router-dom";
import { memo, useMemo, useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

export const ProductCard = memo(({ product, eager = false }: any) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  // Verifică dacă produsul este la favorite
  useEffect(() => {
    const checkFavorite = () => {
      if (user) {
        const savedIds = JSON.parse(
          localStorage.getItem("user_wishlist_ids") || "[]",
        );
        setIsFavorite(savedIds.includes(product.id));
      } else {
        const local = JSON.parse(
          localStorage.getItem("guest_wishlist") || "[]",
        );
        setIsFavorite(local.some((item: any) => item.id === product.id));
      }
    };
    checkFavorite();
  }, [user, product.id]);

  // Procesare date produs (Imagini, Prețuri, Discount)
  const stats = useMemo(() => {
    // 1. Logica Imagine
    let media = product.image_url;
    if (typeof media === "string" && media.trim().startsWith("{")) {
      try {
        media = JSON.parse(media);
      } catch {
        media = null;
      }
    }

    const imgContainer = media?.main || media;
    let mediumUrl =
      imgContainer?.medium ||
      imgContainer?.large ||
      (typeof media === "string" ? media : "") ||
      "/placeholder.svg";
    let smallUrl =
      imgContainer?.small || imgContainer?.medium || "/placeholder.svg";

    // 🚀 FIX: Verificare de tip string pentru a preveni erorile de tip "f.startsWith is not a function"
    if (typeof mediumUrl === "string" && mediumUrl.startsWith("/")) {
      mediumUrl = `${API_BASE_URL}${mediumUrl}`;
    }
    if (typeof smallUrl === "string" && smallUrl.startsWith("/")) {
      smallUrl = `${API_BASE_URL}${smallUrl}`;
    }

    // 2. Logica Preț (Adaptată pentru Meilisearch)
    // original_price/base_price este prețul tăiat, price este prețul curent de vânzare
    const basePrice = Number(
      product.original_price || product.base_price || product.price || 0,
    );
    const finalPrice = Number(product.price || 0);
    const salePrice = product.sale_price ? Number(product.sale_price) : null;

    const _hasDiscount = !!(
      salePrice &&
      salePrice > 0 &&
      finalPrice < basePrice
    );
    const _discountPct = _hasDiscount
      ? Math.round(100 - (finalPrice / basePrice) * 100)
      : 0;

    const _isOutOfStock =
      product.stock_quantity !== undefined
        ? product.stock_quantity <= 0
        : product.is_active === false;

    return {
      mainImg: { medium: mediumUrl, small: smallUrl },
      hasDiscount: _hasDiscount,
      discountPct: _discountPct,
      finalPrice: finalPrice,
      basePrice: basePrice,
      isOutOfStock: _isOutOfStock,
    };
  }, [product]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/wishlist/toggle/${product.id}`,
          {
            method: "POST",
            credentials: "include",
          },
        );
        if (res.ok) {
          const data = await res.json();
          const active = data.action === "added";
          setIsFavorite(active);
          const savedIds = JSON.parse(
            localStorage.getItem("user_wishlist_ids") || "[]",
          );
          const newIds = active
            ? [...savedIds, product.id]
            : savedIds.filter((id: string) => id !== product.id);
          localStorage.setItem("user_wishlist_ids", JSON.stringify(newIds));
          toast.success(
            active ? "Adăugat la favorite" : "Eliminat de la favorite",
          );
        }
      } catch (err) {
        toast.error("Eroare la sincronizarea listei");
      }
    } else {
      const local = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      const exists = local.some((item: any) => item.id === product.id);
      let updated;
      if (exists) {
        updated = local.filter((item: any) => item.id !== product.id);
        toast.info("Eliminat din favorite");
      } else {
        updated = [
          ...local,
          {
            id: product.id,
            name: product.name,
            price: stats.finalPrice,
            image_url: stats.mainImg.medium,
            slug: product.slug,
          },
        ];
        toast.success("Salvat în wishlist (Guest)");
      }
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
      setIsFavorite(!exists);
    }
  };

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-lg transition-all duration-300">
      {/* Zona Vizuală (Imagine + Badges) */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f8f5fb] rounded-sm">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <SmartImage
            src={stats.mainImg.medium}
            lqip={stats.mainImg.small}
            alt={product.name}
            eager={eager}
            className={`transition-transform duration-700 group-hover:scale-105 ${stats.isOutOfStock ? "opacity-60 grayscale-[0.5]" : ""}`}
          />
        </Link>

        {/* Buton Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-30 p-2 rounded-full bg-white/60 backdrop-blur-md hover:bg-white transition-all shadow-sm"
        >
          <Heart
            size={16}
            className={`transition-colors ${isFavorite ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`}
          />
        </button>

        {/* Badge Procent Reducere */}
        {stats.hasDiscount && !stats.isOutOfStock && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">
            -{stats.discountPct}%
          </div>
        )}

        {/* Indicator Stoc Epuizat */}
        {stats.isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <div className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2">
              Stoc Epuizat
            </div>
          </div>
        )}
      </div>

      {/* Detalii Produs */}
      <Link
        to={`/product/${product.slug}`}
        className="mt-4 space-y-2 px-1 text-left flex-1"
      >
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">
          {product.brand_name || product.brand || "Evem"}
        </p>

        <h3 className="text-[12px] font-medium text-black leading-tight line-clamp-2 h-[32px]">
          {product.name}
        </h3>

        {/* Secțiune Rating */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={
                  i < Math.round(product.rating_avg || 0)
                    ? "currentColor"
                    : "none"
                }
                className={
                  i < Math.round(product.rating_avg || 0) ? "" : "text-zinc-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-zinc-400">
            ({product.review_count || 0})
          </span>
        </div>

        {/* Secțiune Prețuri */}
        <div className="flex items-baseline gap-2 pt-1">
          <span
            className={`text-sm font-black ${stats.isOutOfStock ? "text-zinc-400" : "text-black"}`}
          >
            {stats.finalPrice.toLocaleString("ro-RO")} RON
          </span>
          {stats.hasDiscount && (
            <span className="text-[11px] text-zinc-400 line-through">
              {stats.basePrice.toLocaleString("ro-RO")}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
});

ProductCard.displayName = "ProductCard";
