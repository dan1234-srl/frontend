import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import ProductReviews from "../components/product/ProductReviews";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { getPrefetchedProduct } from "@/lib/prefetch";
import { preloadLcp } from "@/lib/cf-image";
import { Seo } from "@/components/Seo";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://linea-backend-production.up.railway.app";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const { processedMainImage, processedGallery } = useMemo(() => {
    if (!product) return { processedMainImage: null, processedGallery: [] };

    let media = product.image_url;
    if (typeof media === "string" && media.trim().startsWith("{")) {
      try {
        media = JSON.parse(media);
      } catch (e) {
        console.error("Eroare parsare JSON media:", e);
      }
    }

    const mainImg = media?.main || media;
    const galleryItems = media?.gallery || product.additional_image_link || [];

    return {
      processedMainImage: mainImg,
      processedGallery: Array.isArray(galleryItems) ? galleryItems : [],
    };
  }, [product]);

  useEffect(() => {
    if (!processedMainImage) return;

    // 1. Determine the URL string safely
    // Check if processedMainImage is a string itself,
    // or if it's an object containing sizes
    const lcp =
      typeof processedMainImage === "string"
        ? processedMainImage
        : processedMainImage.large ||
          processedMainImage.medium ||
          processedMainImage.small;

    // 2. Ensure it is a valid string before calling the function
    if (typeof lcp === "string" && lcp.startsWith("http")) {
      preloadLcp(lcp);
    }
  }, [processedMainImage]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || productId === "null") {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const cached = getPrefetchedProduct(productId);
        const data = cached
          ? await cached
          : await (
              await fetch(`${API_BASE_URL}/api/v1/products/${productId}`)
            ).json();

        if (!data) throw new Error("Not found");
        setProduct(data);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // ───────────────────── SEO ─────────────────────
  const seo = useMemo(() => {
    if (!product) return null;
    const slug = product.slug || productId;
    const canonical = `/product/${slug}`;
    const cleanDesc = (product.description || product.short_description || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const description =
      cleanDesc.slice(0, 160) ||
      `Cumpără ${product.name} de la Evem. Livrare rapidă în toată România.`;
    const title = `${product.name}${product.brand_name ? " · " + product.brand_name : ""} | Evem`;

    const img =
      typeof processedMainImage === "string"
        ? processedMainImage
        : processedMainImage?.large ||
          processedMainImage?.medium ||
          processedMainImage?.small;

    const price = Number(product.sale_price && product.sale_price > 0 ? product.sale_price : product.price) || 0;
    const stock = Number(product.stock_quantity ?? product.stock ?? 0);

    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: cleanDesc.slice(0, 5000),
      sku: product.sku,
      mpn: product.sku,
      image: img ? [img] : undefined,
      brand: { "@type": "Brand", name: product.brand_name || "Evem" },
      category: product.category?.name || product.category_name,
      url: `https://evem.ro${canonical}`,
      offers: {
        "@type": "Offer",
        url: `https://evem.ro${canonical}`,
        priceCurrency: "RON",
        price: price.toFixed(2),
        availability:
          stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)
          .toISOString()
          .slice(0, 10),
      },
    };

    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    if (reviews.length > 0) {
      const avg =
        reviews.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0) /
        reviews.length;
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: avg.toFixed(1),
        reviewCount: reviews.length,
      };
    }

    return { title, description, canonical, img, jsonLd };
  }, [product, productId, processedMainImage]);

  return (
    <div className="min-h-screen bg-white relative">
      {seo && (
        <Seo
          title={seo.title}
          description={seo.description}
          canonical={seo.canonical}
          image={seo.img}
          type="product"
          jsonLd={seo.jsonLd}
        />
      )}
      <Navbar />


      {loading ? (
        <main className="px-6 pt-[8.5rem] lg:pt-[9.25rem] max-w-[1400px] mx-auto pb-20">
          <ProductDetailSkeleton />
        </main>
      ) : error || !product ? (
        <main className="flex-1 flex flex-col items-center justify-center pt-[8.5rem] text-center p-6">
          <h1 className="text-2xl font-serif mb-4">Produsul nu a fost găsit</h1>
          <Link
            to="/"
            className="text-brand font-bold uppercase text-xs tracking-widest border-b border-brand"
          >
            Înapoi în magazin
          </Link>
        </main>
      ) : (
        <main className="px-6 lg:px-12 pt-[9.25rem] max-w-[1400px] mx-auto pb-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
          >
            <ChevronLeft size={14} /> Înapoi la Categorie
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-40 flex justify-center lg:justify-end pr-0 lg:pr-8">
              <ProductImageGallery
                mainImage={processedMainImage}
                additionalImages={processedGallery}
                isLCP={true}
              />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-8">
              <ProductInfo product={product} />
              <ProductDescription product={product} />
            </div>
          </div>
          <div className="mt-16 pt-16 border-t border-neutral-100">
            <ProductCarousel
              categorySlug={
                product.category?.slug ||
                product.category_slug ||
                product._meta_category_slug
              }
              title="Produse Similare"
              subtitle="Recomandări din aceeași categorie"
            />
          </div>

          <ProductReviews
            productId={product.id}
            reviews={product.reviews || []}
          />
        </main>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetail;
