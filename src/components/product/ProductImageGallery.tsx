import { useState, useMemo } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import ImageZoom from "./ImageZoom";
import { optimizeImageUrl } from "@/lib/images";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0)
    return (
      <div className="aspect-[3/4] bg-zinc-100 rounded-2xl w-full max-w-[450px] mx-auto" />
    );

  return (
    <div className="flex flex-col gap-3 w-full max-w-[450px] mx-auto lg:mx-0">
      {/* Imaginea Principală - Limităm înălțimea pe mobil (max-h-[45vh]) */}
      <div className="relative aspect-[3/4] md:aspect-[3/4] max-h-[45vh] md:max-h-none group overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm cursor-zoom-in flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full flex items-center justify-center"
          >
            <SmartImage
              src={optimizeImageUrl(
                getRawImgUrl(images[currentIndex]),
                800,
                1067,
              )}
              lqip={optimizeImageUrl(
                getRawImgUrl(images[currentIndex]),
                50,
                67,
              )}
              alt="Imagine produs"
              eager
              // Folosim object-contain pentru a ne asigura că imaginea se vede întreagă în noul spațiu limitat
              className="max-h-full max-w-full object-contain p-2"
              onClick={() => setIsZoomOpen(true)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badge Zoom */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
        >
          <Maximize2 size={16} className="text-zinc-600" />
        </button>

        {/* Navigație Săgeți */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Rândul de miniaturi (Thumbnails) - Mai compacte pe mobil */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x justify-center">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex-shrink-0 w-12 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all snap-start ${
                i === currentIndex
                  ? "border-zinc-900 shadow-sm"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <img
                src={optimizeImageUrl(getRawImgUrl(img), 160, 213)}
                className="w-full h-full object-cover"
                alt={`Miniatură ${i + 1}`}
              />
            </button>
          ))}
        </div>
      )}

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
