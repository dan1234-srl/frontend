import { Link } from "react-router-dom";
import { Star, Info, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { prefetchProduct, prefetchImage } from "@/lib/prefetch";

// Variante pentru animația de tip "stagger"
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const ProductGrid = ({
  products = [],
  loading,
}: {
  products?: any[];
  loading?: boolean;
}) => {
  if (loading)
    return (
      <section className="w-full px-6 mb-24 mt-12">
        <ProductGridSkeleton count={8} />
      </section>
    );

  return (
    <section className="w-full px-6 mb-24 mt-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16"
      >
        {products.map((product, i) => (
          <motion.article
            key={product.id}
            variants={itemVariants}
            className="group relative"
          >
            <Link
              to={`/product/${product.id || product.sku}`}
              onMouseEnter={() => {
                prefetchProduct(String(product.id || product.sku));
                prefetchImage(
                  typeof product.image_url === "object"
                    ? product.image_url.medium
                    : product.image_url,
                );
              }}
              className="block"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] mb-5 overflow-hidden bg-[#F9F9F9] transition-all duration-500 group-hover:shadow-luxe">
                <SmartImage
                  src={
                    typeof product.image_url === "object"
                      ? product.image_url.medium
                      : product.image_url
                  }
                  lqip={
                    typeof product.image_url === "object"
                      ? product.image_url.small
                      : undefined
                  }
                  alt={product.name}
                  eager={i < 4}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-105"
                />

                {/* Overlay discret la hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500" />

                {/* Badges Premium */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.stock_quantity > 0 &&
                    product.stock_quantity <= 3 && (
                      <div className="bg-white/90 backdrop-blur-md px-2 py-1 border border-black/[0.05]">
                        <p className="text-[8px] font-bold uppercase tracking-tighter text-orange-700">
                          Limited: {product.stock_quantity} unități
                        </p>
                      </div>
                    )}
                  {product.isNew && (
                    <div className="bg-black px-2 py-1">
                      <p className="text-[8px] font-bold text-white tracking-[0.2em] uppercase">
                        New Collection
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Container */}
              <div className="space-y-3 px-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <h3 className="text-[12px] font-medium leading-tight text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1 uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-[9px] text-zinc-400 font-medium tracking-widest uppercase">
                      REF. {product.sku}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-zinc-950">
                      {product.price.toLocaleString()} RON
                    </span>
                  </div>

                  {/* Info Preț minim (Obligație legală) - Redus vizual pentru a nu aglomera */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Info size={9} className="text-zinc-300" />
                    <p className="text-[7px] text-zinc-400 uppercase tracking-widest">
                      Preț minim 30 zile:{" "}
                      <span className="text-zinc-600 font-semibold">
                        {product.lowest_price_30d} RON
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

export default ProductGrid;
