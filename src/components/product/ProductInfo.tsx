import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemo } from "react";
import {
  ShoppingBag,
  Heart,
  Info,
  Star,
  ShieldCheck,
  Truck,
} from "lucide-react";

interface ProductInfoProps {
  product: any;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addToCart, cart } = useCart();

  // --- CALCUL PREȚ REAL (Prioritate pe sale_price) ---
  const priceStats = useMemo(() => {
    // Dacă sale_price există și e valid, acela e prețul final.
    // Altfel, prețul final este cel din câmpul price.
    const rawPrice = Number(product.price || 0);
    const rawSalePrice = product.sale_price ? Number(product.sale_price) : 0;

    const hasDiscount = rawSalePrice > 0 && rawSalePrice < rawPrice;

    return {
      // Prețul de bază (cel tăiat)
      basePrice: rawPrice,
      // Prețul real de vânzare (cel mic)
      finalPrice: hasDiscount ? rawSalePrice : rawPrice,
      hasDiscount,
    };
  }, [product]);

  const itemInCart = cart.find((item) => item.sku === product.sku);
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLimitReached = quantityInCart >= product.stock_quantity;

  const handleAddToCart = () => {
    if (!product) return;

    if (isOutOfStock) {
      toast.error("Produsul nu mai este în stoc.");
      return;
    }

    if (isLimitReached) {
      toast.error("Stoc insuficient", {
        description: `Ai deja toate cele ${product.stock_quantity} unități disponibile în coș.`,
      });
      return;
    }

    addToCart({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: priceStats.finalPrice, // 🚀 TRANSMITEM PREȚUL REDUS ÎN COȘ
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      brand_name: product.brand_name || "",
    });

    toast.success("Adăugat în coș", {
      description: product.name,
      icon: <ShoppingBag size={14} />,
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
    <div className="flex flex-col gap-10 text-left">
      <div className="space-y-4">
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

      <div className="py-8 border-y border-neutral-100">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-3">
            {/* 🚀 AFIȘĂM PREȚUL FINAL CALCULAT */}
            <span className="text-3xl font-black text-[var(--dark-amethyst)]">
              {priceStats.finalPrice?.toLocaleString("ro-RO")}
            </span>
            <span className="text-sm font-bold text-[var(--dark-amethyst)]">
              RON
            </span>

            {/* 🚀 AFIȘĂM PREȚUL VECHI TĂIAT DOAR DACĂ EXISTĂ REDUCERE */}
            {priceStats.hasDiscount && (
              <span className="text-lg text-neutral-300 line-through ml-2">
                {priceStats.basePrice?.toLocaleString("ro-RO")} RON
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-neutral-400">
          <Info size={12} />
          <p className="text-[9px] font-bold uppercase tracking-widest">
            Cel mai mic preț 30 zile:{" "}
            <span className="text-[var(--dark-amethyst)]">
              {product.lowest_price_30d || priceStats.finalPrice} RON
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-6">
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

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLimitReached}
            className="h-16 w-full text-white rounded-none uppercase text-[10px] font-black tracking-[0.4em] transition-all disabled:bg-neutral-100 disabled:text-neutral-400 shadow-lg shadow-[var(--royal-violet)]/10 flex items-center justify-center group relative overflow-hidden"
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

          <Button
            variant="outline"
            className="h-16 w-full border-neutral-200 rounded-none uppercase text-[10px] font-black tracking-[0.4em] hover:bg-[var(--background)] hover:text-[var(--royal-violet)] hover:border-[var(--royal-violet)] transition-all"
          >
            <Heart size={16} className="mr-3" /> Wishlist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 p-4 border border-neutral-100 rounded-none">
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
        <div className="flex items-center gap-4 p-4 border border-neutral-100 rounded-none">
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
