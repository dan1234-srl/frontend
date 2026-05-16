import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ImageZoomProps {
  images: string[]; // Acum acceptă doar string-uri (URL-uri)
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoom = ({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageZoomProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gestionare tastă Escape și Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Scroll automat la imaginea selectată când se deschide
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const container = scrollRef.current;
      // Timeout mic pentru a lăsa browserul să randeze elementele înainte de scroll
      const timer = setTimeout(() => {
        const imageElement = container.querySelector(
          `[data-index="${initialIndex}"]`,
        );
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  // Folosim createPortal pentru a randa la nivel de body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md">
      {/* Header Modal */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
        <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">
          Galerie Proiect {initialIndex + 1} / {images.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <X size={24} />
        </Button>
      </div>

      {/* Container Imagini */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden luxury-scrollbar scroll-smooth"
      >
        <div className="flex flex-col items-center gap-8 py-24 px-4">
          {images.map((url, index) => (
            <motion.div
              key={index}
              data-index={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full max-w-5xl"
            >
              <img
                src={url}
                alt={`Vizualizare produs ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-2xl select-none"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .luxury-scrollbar::-webkit-scrollbar { width: 6px; }
        .luxury-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      ` }} />
    </div>,
    document.body,
  );
};

export default ImageZoom;
