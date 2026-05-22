import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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

  // 🚀 LCP preload — large variant pentru imaginea principală
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

      const cached = getPrefetchedProduct(productId);
      if (cached) {
        const cachedData = await cached;
        if (cachedData) {
          setProduct(cachedData);
          setLoading(false);
          window.scrollTo(0, 0);
          return;
        }
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/products/${productId}`,
        );
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        {/* 🚀 REPARAT ATOMIC: Spacer adăugat și în starea de loading pentru a alinia scheletul perfect sub Navbar */}
        <div
          className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
          aria-hidden="true"
        />
        <main className="px-6 max-w-[1400px] mx-auto pb-20">
          <ProductDetailSkeleton />
        </main>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        {/* 🚀 REPARAT ATOMIC: Spacer adăugat în starea de eroare */}
        <div
          className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
          aria-hidden="true"
        />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl font-serif mb-4">Produsul nu a fost găsit</h1>
          <Link
            to="/"
            className="text-brand font-bold uppercase text-xs tracking-widest border-b border-brand"
          >
            Înapoi în magazin
          </Link>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 🚀 REPARAT ATOMIC: Acest Spacer structural oprește intrarea titlului sub meniu pe orice ecran (mobil/desktop) */}
      <div
        className="w-full h-[8.5rem] lg:h-[9.25rem] shrink-0"
        aria-hidden="true"
      />

      {/* Containerul principal folosește items-start pentru a permite coloanelor să aibă înălțimi diferite */}
      <main className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* COLOANA STÂNGA: Galeria (Ea devine Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-40">
            <ProductImageGallery
              mainImage={processedMainImage}
              additionalImages={processedGallery}
            />
          </div>

          {/* COLOANA DREAPTĂ: Info & Descriere (Ea curge natural) */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            <ProductInfo product={product} />

            <div className="h-px bg-zinc-100 w-full" />

            <ProductDescription product={product} />
          </div>
        </div>

        {/* SECȚIUNI FULL WIDTH (SUB GRID) */}
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

      <Footer />
    </div>
  );
};

export default ProductDetail;
