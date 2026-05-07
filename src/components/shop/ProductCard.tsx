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

  const { mainImg, hasDiscount, discountPct, finalPrice, isOutOfStock } =
    useMemo(() => {
      let media = product.image_url;
      if (typeof media === "string" && media.trim().startsWith("{")) {
        try {
          media = JSON.parse(media);
        } catch {
          media = null;
        }
      }

      const imgContainer = media?.main || media;
      const basePrice = Number(product.base_price || product.price || 0);
      const salePrice = product.sale_price ? Number(product.sale_price) : null;
      const _hasDiscount = !!(salePrice && salePrice < basePrice);
      const _isOutOfStock =
        product.stock_quantity !== undefined
          ? product.stock_quantity <= 0
          : !product.is_active;

      return {
        mainImg: {
          medium:
            imgContainer?.medium ||
            imgContainer?.large ||
            (typeof media === "string" ? media : "") ||
            "/placeholder.svg",
          small:
            imgContainer?.small || imgContainer?.medium || "/placeholder.svg",
        },
        hasDiscount: _hasDiscount,
        discountPct: _hasDiscount
          ? Math.round(100 - (salePrice / basePrice) * 100)
          : 0,
        finalPrice: salePrice || basePrice,
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
            price: finalPrice,
            image_url: mainImg.medium,
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
    <article className="group relative flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f8f5fb] rounded-sm">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <SmartImage
            src={mainImg.medium}
            lqip={mainImg.small}
            alt={product.name}
            eager={eager}
            className={isOutOfStock ? "opacity-60 grayscale-[0.5]" : ""}
          />
        </Link>
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-30 p-2 rounded-full bg-white/60 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-sm group/heart"
        >
          <Heart
            size={16}
            className={`transition-colors duration-300 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-brand-deep group-hover/heart:text-rose-500"}`}
          />
        </button>
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-2 left-2 z-10 bg-brand text-white text-[9px] font-black px-2 py-0.5 rounded-full">
            -{discountPct}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <div className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2">
              Stoc Epuizat
            </div>
          </div>
        )}
      </div>
      <Link
        to={`/product/${product.slug}`}
        className="mt-4 space-y-2 px-1 text-left flex-1"
      >
        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-bright">
          {product.brand || "LINEA"}
        </p>
        <h3 className="text-[12px] font-medium text-brand-deep leading-tight line-clamp-2 h-[32px]">
          {product.name}
        </h3>
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
        <div className="flex items-baseline gap-2 pt-1">
          <span
            className={`text-sm font-black ${isOutOfStock ? "text-zinc-400" : "text-brand-deep"}`}
          >
            {finalPrice.toLocaleString()} RON
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-zinc-400 line-through decoration-brand/40">
              {Number(product.base_price || product.price).toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
});

ProductCard.displayName = "ProductCard";
