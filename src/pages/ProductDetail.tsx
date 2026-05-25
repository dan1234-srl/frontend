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
    const lcp =
      processedMainImage.large ||
      processedMainImage.medium ||
      processedMainImage.small;
    if (lcp) preloadLcp(lcp);
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

  return (
    <div className="min-h-screen bg-white relative">
      {/* Buton Back Global - Vizibil mereu */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-8 left-4 md:left-12 z-[100] p-3 bg-white/60 backdrop-blur-md rounded-full border border-zinc-100 shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl active:scale-95 group"
        aria-label="Înapoi"
      >
        <ChevronLeft
          size={20}
          className="text-zinc-800 group-hover:text-[var(--royal-violet)] transition-colors"
        />
      </button>

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
        <main className="px-6 lg:px-12 pt-[8.5rem] lg:pt-[9.25rem] max-w-[1400px] mx-auto pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-40">
              <ProductImageGallery
                mainImage={processedMainImage}
                additionalImages={processedGallery}
                isLCP={true}
              />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-12">
              <ProductInfo product={product} />
              <div className="h-px bg-zinc-100 w-full" />
              <ProductDescription product={product} />
            </div>
          </div>
          <div className="mt-24 border-t border-zinc-100 pt-16">
            <ProductReviews reviews={product.reviews || []} />
          </div>
          <div className="mt-20">
            <ProductCarousel
              categorySlug={product.category?.slug}
              title="Produse Similare"
            />
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetail;
