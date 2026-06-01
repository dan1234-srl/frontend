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
  zIndex = 1000, // Ridicat pentru a fi peste orice
  className,
}: LuxuryModalProps) => {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-[1000]"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Solid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 glass-overlay"
          />
          {/* Panel Responsive */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full bg-white flex flex-col shadow-2xl",
              "rounded-t-[2.5rem] sm:rounded-[2.5rem]", // Mobile: doar sus | Desktop: total
              "h-[95dvh] sm:h-auto sm:max-h-[90dvh]", // Mobile: aproape tot ecranul
              sizeMap[size],
              className,
            )}
            style={{ backgroundColor: "#FFFFFF" }} // Force no transparency
          >
            {/* Header Flexibil */}
            {(title || !hideClose) && (
              <header className="shrink-0 px-6 sm:px-12 pt-8 pb-6 border-b border-zinc-100 bg-white sticky top-0 z-20 rounded-t-[2.5rem]">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {eyebrow && (
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--french-blue)]">
                        {eyebrow}
                      </p>
                    )}
                    {title && (
                      <h2 className="heading-serif text-2xl sm:text-4xl italic text-[var(--dark-amethyst)] leading-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 truncate">
                        {description}
                      </p>
                    )}
                  </div>

                  {!hideClose && (
                    <button
                      onClick={onClose}
                      className="group size-10 sm:size-12 shrink-0 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-black hover:text-white transition-all duration-300"
                    >
                      <X
                        size={20}
                        strokeWidth={1.5}
                        className="group-hover:rotate-90 transition-transform"
                      />
                    </button>
                  )}
                </div>
              </header>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 bg-white no-scrollbar">
              {children}
            </div>

            {/* Subsol Brand */}
            <div className="shrink-0 px-12 py-4 bg-zinc-50 flex justify-center items-center border-t border-zinc-100 rounded-b-[2.5rem] hidden sm:flex">
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300">
                Evem Ecosystem — Secure Order Archive
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
