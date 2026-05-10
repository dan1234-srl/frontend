import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface LuxuryModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
  zIndex?: number;
  className?: string;
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export const LuxuryModal = ({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  size = "md",
  hideClose = false,
  zIndex = 700,
  className,
}: LuxuryModalProps) => {
  // Lock scroll when open
  useEffect(() => {
    if (!open) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [open]);

  // Escape key support
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 grid place-items-center px-4 py-8 overflow-hidden"
          style={{ zIndex }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop - Acesta rămâne semi-transparent pentru a focaliza atenția, dar Panelul va fi solid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60" // Fundal întunecat pentru contrast
          />

          {/* Panel - FORȚAT OPAC 100% */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-zinc-200",
              "bg-white flex flex-col overflow-hidden", // bg-white pur, fără transparență
              "rounded-[2.5rem]", // Margini foarte rotunjite pentru stil modern
              sizeMap[size],
              className,
            )}
            style={{ opacity: 1, backgroundColor: "#FFFFFF" }} // Double enforcement
          >
            {(title || eyebrow || !hideClose) && (
              <header className="relative flex items-start justify-between gap-6 px-8 sm:px-12 pt-10 pb-6 bg-white border-b border-zinc-50">
                <div className="space-y-2 min-w-0 text-left">
                  {eyebrow && (
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--french-blue)]">
                      {eyebrow}
                    </p>
                  )}
                  {title && (
                    <h2 className="heading-serif text-3xl sm:text-4xl italic text-[var(--dark-amethyst)]">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {description}
                    </p>
                  )}
                </div>

                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Închide"
                    className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-50 hover:bg-black hover:text-white transition-all duration-500"
                  >
                    <X
                      size={20}
                      strokeWidth={1.5}
                      className="transition-transform duration-500 group-hover:rotate-90"
                    />
                  </button>
                )}
              </header>
            )}

            <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-10 bg-white no-scrollbar">
              {children}
            </div>

            {/* Subsol subtil pentru brand */}
            <div className="px-12 py-4 bg-zinc-50/50 flex justify-center border-t border-zinc-50">
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300">
                Evem Luxury Retail Ecosystem
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default LuxuryModal;
