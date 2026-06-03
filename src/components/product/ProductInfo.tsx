import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // 🚀 REPARAT ATOMIC: Importăm hook-ul nativ Shadcn în loc de sonner
import { useMemo, useState, useEffect } from "react";
import {
  ShoppingBag,
  Heart,
  Info,
  Star,
  ShieldCheck,
  Truck,
  Phone,
} from "lucide-react";

const SUPPORT_PHONE = "+40 735 928 664";
const SUPPORT_PHONE_TEL = "+40735928664";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

interface ProductInfoProps {
  product: any;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast(); // 🚀 REPARAT ATOMIC: Inițializăm generatorul de ferestre toast

  // --- LOGICĂ VERIFICARE FAVORIT ---
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

  // --- LOGICĂ CALCUL PREȚ ---
  const priceStats = useMemo(() => {
    // 1. Prețul final cu adaos comercial pe care îl achită clientul
    const finalPrice = Number(product.sale_price || product.price || 0);

    // 2. Prețul de referință (original_price din Meilisearch dacă există o reducere reală)
    const basePrice = Number(product.original_price || product.price || 0);

    // 3. Este reducere doar dacă prețul tăiat e mai mare decât prețul final calculat
    const hasDiscount = !!(
      product.original_price &&
      basePrice > finalPrice &&
      finalPrice > 0
    );

    return {
      basePrice,
      finalPrice,
      hasDiscount,
    };
  }, [product]);

  // --- FUNCȚIE TOGGLE WISHLIST ---
  const handleWishlistToggle = async () => {
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

          toast({
            title: active ? "Adăugat la favorite" : "Eliminat de la favorite",
            description: product.name,
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Eroare asimetrică",
          description: "Nu s-a putut salva elementul.",
        });
      }
    } else {
      const local = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      const exists = local.some((item: any) => item.id === product.id);
      let updated;

      if (exists) {
        updated = local.filter((item: any) => item.id !== product.id);
        toast({
          title: "Eliminat din favorite",
          description: product.name,
        });
      } else {
        updated = [
          ...local,
          {
            id: product.id,
            name: product.name,
            price: priceStats.finalPrice,
            image_url: product.image_url,
            slug: product.slug,
          },
        ];
        toast({
          title: "Salvat în wishlist",
          description: product.name,
        });
      }
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
      setIsFavorite(!exists);
    }
  };

  const itemInCart = cart.find((item) => item.sku === product.sku);
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLimitReached = quantityInCart >= product.stock_quantity;

  const handleAddToCart = () => {
    if (!product) return;
    if (isOutOfStock) {
      toast({
        variant: "destructive",
        title: "Stoc epuizat",
        description: "Produsul nu mai este disponibil.",
      });
      return;
    }
    if (isLimitReached) {
      toast({
        variant: "destructive",
        title: "Stoc insuficient",
        description: `Ai deja toate cele ${product.stock_quantity} unități adăugate.`,
      });
      return;
    }

    addToCart({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: priceStats.finalPrice,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      brand_name: product.brand_name || "",
    });

    // 🚀 REPARAT ATOMIC: Trimitere fluidă sub structura unificată a temei tale
    toast({
      title: "Adăugat în coș",
      description: product.name,
    });
  };

  const getStockStatus = () => {
    const qty = product.stock_quantity || 0;
    if (qty <= 0)
      return {
        label: "Momentan Indisponibil",
        color: "text-rose-600",
        dot: "bg-rose-500",
      };
    if (isLimitReached)
      return {
        label: "Stoc maxim adăugat în coș",
        color: "text-[var(--royal-violet)]",
        dot: "bg-[var(--royal-violet)]",
      };
    if (qty <= 3)
      return {
        label: `Ediție Limitată: Doar ${qty} rămase`,
        color: "text-amber-600",
        dot: "bg-amber-500",
      };
    return {
      label: `În Stoc: ${qty} unități`,
      color: "text-emerald-600",
      dot: "bg-emerald-500",
    };
  };

  const status = getStockStatus();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={
                  i < Math.floor(product.rating_avg || 0)
                    ? "var(--dark-amethyst)"
                    : "none"
                }
                className={
                  i < Math.floor(product.rating_avg || 0)
                    ? "text-[var(--dark-amethyst)]"
                    : "text-neutral-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
            {product.rating_avg || 0} / 5
            <span className="text-neutral-400 ml-1">
              ({product.review_count || 0} Reviews)
            </span>
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif italic tracking-tighter text-[var(--dark-amethyst)] leading-[1.1]">
          {product.name}
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">
          Ref. {product.sku}
        </p>
      </div>

      <div className="py-5 border-y border-neutral-100">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-[var(--dark-amethyst)]">
            {priceStats.finalPrice?.toLocaleString("ro-RO")}
          </span>
          <span className="text-sm font-bold text-[var(--dark-amethyst)]">
            RON
          </span>
          {priceStats.hasDiscount && (
            <span className="text-lg text-neutral-300 line-through ml-2">
              {priceStats.basePrice?.toLocaleString("ro-RO")} RON
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-neutral-400">
          <Info size={12} />
          <p className="text-[9px] font-bold uppercase tracking-widest">
            Cel mai mic preț 30 zile:{" "}
            <span className="text-[var(--dark-amethyst)]">
              {product.lowest_price_30d || priceStats.finalPrice} RON
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-3 py-2 bg-neutral-50 w-fit rounded-sm">
          <div
            className={`w-1.5 h-1.5 rounded-full ${status.dot} ${!isOutOfStock && "animate-pulse"}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* CTA row: Add to cart + Call */}
          <div className="flex gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLimitReached}
              className="h-16 flex-1 text-white rounded-none uppercase text-[10px] font-black tracking-[0.4em] transition-all disabled:bg-neutral-100 disabled:text-neutral-400 shadow-lg shadow-[var(--royal-violet)]/10 flex items-center justify-center group relative overflow-hidden"
              style={{
                background:
                  !isOutOfStock && !isLimitReached
                    ? "var(--primary-gradient)"
                    : undefined,
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center">
                <ShoppingBag size={16} className="mr-3" />
                {isOutOfStock
                  ? "Epuizat"
                  : isLimitReached
                    ? "Limită atinsă"
                    : "Adaugă în coș"}
              </div>
            </button>

            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              aria-label={`Sună consultantul Linea ${SUPPORT_PHONE}`}
              title={`Sună-ne: ${SUPPORT_PHONE}`}
              className="group h-16 w-16 sm:w-auto sm:px-5 flex items-center justify-center gap-3 border border-[var(--royal-violet)]/30 text-[var(--dark-amethyst)] hover:text-white hover:border-transparent transition-all relative overflow-hidden rounded-none"
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "var(--primary-gradient)" }}
              />
              <Phone
                size={16}
                className="relative shrink-0 transition-transform group-hover:rotate-12"
              />
              <span className="hidden sm:inline relative text-[10px] font-black uppercase tracking-[0.3em]">
                Sună-ne
              </span>
            </a>
          </div>

          <Button
            variant="outline"
            onClick={handleWishlistToggle}
            className={`h-14 w-full border-neutral-200 rounded-none uppercase text-[10px] font-black tracking-[0.4em] transition-all hover:bg-[var(--background)] ${
              isFavorite
                ? "text-rose-500 border-rose-500 bg-rose-50/50"
                : "hover:text-[var(--royal-violet)] hover:border-[var(--royal-violet)]"
            }`}
          >
            <Heart
              size={16}
              className={`mr-3 ${isFavorite ? "fill-rose-500" : ""}`}
            />
            {isFavorite ? "În listă" : "Wishlist"}
          </Button>

          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-[var(--royal-violet)] transition-colors"
          >
            Consultant disponibil · {SUPPORT_PHONE}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-4 p-3.5 border border-neutral-100 rounded-none">
          <Truck size={20} className="text-[var(--royal-violet)]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
              Livrare Rapidă
            </span>
            <span className="text-[9px] text-neutral-400 font-bold uppercase">
              24-48 Ore
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3.5 border border-neutral-100 rounded-none">
          <ShieldCheck size={20} className="text-[var(--royal-violet)]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dark-amethyst)]">
              Plată Securizată
            </span>
            <span className="text-[9px] text-neutral-400 font-bold uppercase">
              SSL Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
