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
    <div className="flex flex-col gap-4 w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] mx-auto lg:mx-0">
      {/* Imaginea Principală */}
      <div className="relative aspect-[3/4] group overflow-hidden rounded-3xl bg-white border border-zinc-100 shadow-sm cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
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
              className="absolute inset-0 h-full w-full object-contain p-4"
              onClick={() => setIsZoomOpen(true)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badge Zoom */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
        >
          <Maximize2 size={18} className="text-zinc-600" />
        </button>

        {/* Navigație Săgeți */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-zinc-900 hover:text-white z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-zinc-900 hover:text-white z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Rândul de miniaturi (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x justify-center lg:justify-start">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex-shrink-0 w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all snap-start ${
                i === currentIndex
                  ? "border-zinc-900 shadow-md scale-105"
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
