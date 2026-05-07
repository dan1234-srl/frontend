import { useState, useMemo } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import ImageZoom from "./ImageZoom";
import { optimizeImageUrl } from "@/lib/images";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryProps {
  mainImage: any;
  additionalImages?: any;
}

const getRawImgUrl = (imgData: any): string => {
  if (!imgData) return "";
  if (typeof imgData === "object") {
    const container = imgData.main || imgData;
    return container.large || container.medium || container.small || "";
  }
  return typeof imgData === "string" ? imgData : "";
};

const ProductImageGallery = ({ mainImage, additionalImages }: GalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const images = useMemo(() => {
    const list = [
      mainImage,
      ...(Array.isArray(additionalImages) ? additionalImages : []),
    ].filter((img) => getRawImgUrl(img) !== "");
    return list;
  }, [mainImage, additionalImages]);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0)
    return <div className="aspect-[3/4] bg-zinc-100 rounded-2xl" />;

  return (
    <div className="flex flex-col gap-4">
      {/* Imaginea Principală */}
      <div className="relative aspect-[3/4] group overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100 cursor-zoom-in">
        <SmartImage
          key={currentIndex}
          src={optimizeImageUrl(getRawImgUrl(images[currentIndex]), 800, 1067)}
          lqip={optimizeImageUrl(getRawImgUrl(images[currentIndex]), 50, 67)}
          alt="Imagine produs"
          eager
          className="absolute inset-0 h-full w-full object-cover"
          onClick={() => setIsZoomOpen(true)}
        />

        {/* Săgeți de navigare (apar la hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
            >
              <ChevronLeft size={20} className="text-zinc-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
            >
              <ChevronRight size={20} className="text-zinc-800" />
            </button>
          </>
        )}
      </div>

      {/* Rândul de miniaturi (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex-shrink-0 w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIndex
                  ? "border-brand"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={optimizeImageUrl(getRawImgUrl(img), 160, 213)}
                className="w-full h-full object-cover"
                alt={`thumbnail ${i}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Modalul de Zoom */}
      <ImageZoom
        images={images}
        initialIndex={currentIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};

export default ProductImageGallery;
