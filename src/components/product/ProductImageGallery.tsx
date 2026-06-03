"use client";

import { useState, useMemo } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import ImageZoom from "./ImageZoom";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryProps {
  mainImage: any;
  additionalImages?: any;
  isLCP?: boolean;
}

const getRawImgUrl = (imgData: any): string => {
  if (!imgData) return "";
  if (typeof imgData === "object") {
    const container = imgData.main || imgData;
    return (
      container.large ||
      container.medium ||
      container.small ||
      (typeof imgData === "string" ? imgData : "")
    );
  }
  return typeof imgData === "string" ? imgData : "";
};

const ProductImageGallery = ({
  mainImage,
  additionalImages,
  isLCP = false,
}: GalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const imageObjects = useMemo(() => {
    return [
      mainImage,
      ...(Array.isArray(additionalImages) ? additionalImages : []),
    ].filter((img) => getRawImgUrl(img) !== "");
  }, [mainImage, additionalImages]);

  const zoomUrls = useMemo(() => {
    return imageObjects.map((img) => getRawImgUrl(img));
  }, [imageObjects]);

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imageObjects.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + imageObjects.length) % imageObjects.length,
    );
  };

  if (imageObjects.length === 0)
    return (
      <div className="aspect-[3/4] bg-zinc-50 rounded-2xl w-full max-w-[200px]" />
    );

  return (
    //  ↓ mărit pe mobil: 180px → md: 240px → lg: 300px
    <div className="flex flex-col gap-3 w-full max-w-[180px] md:max-w-[240px] lg:max-w-[300px] mx-auto lg:mx-0">
      {/* Imaginea principală */}
      <div className="relative aspect-[3/4] group overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
            onClick={() => setIsZoomOpen(true)}
          >
            <SmartImage
              src={getRawImgUrl(imageObjects[currentIndex])}
              alt="Imagine produs"
              eager={isLCP}
              objectFit="contain"
              sizes="(max-width: 768px) 180px, (max-width: 1024px) 240px, 300px"
              widths={[180, 240, 300, 600]}
              className="h-full w-full p-3 transition-transform duration-700 group-hover:scale-105 bg-white"
            />
          </motion.div>
        </AnimatePresence>

        {/* Badge Zoom */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 hover:bg-black hover:text-white"
        >
          <Maximize2 size={14} />
        </button>

        {/* Săgeți navigație */}
        {imageObjects.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10">
            <button
              onClick={prev}
              className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md pointer-events-auto opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md pointer-events-auto opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Miniaturi */}
      {imageObjects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 snap-x">
          {imageObjects.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex-shrink-0 w-10 sm:w-12 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all snap-start ${
                i === currentIndex
                  ? "border-zinc-900 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={getRawImgUrl(img)}
                className="w-full h-full object-cover"
                alt={`Miniatură ${i + 1}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal Zoom */}
      <ImageZoom
        images={zoomUrls}
        initialIndex={currentIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};

export default ProductImageGallery;
