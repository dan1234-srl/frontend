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
  /**
   * z-index. Defaults sit above admin sidebar (z-200) and below toasts (z-[9999]).
   */
  zIndex?: number;
  className?: string;
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

/**
 * Center modal — Ivory & Obsidian luxury aesthetic.
 * - Backdrop blur, scale+fade entry, framer-motion driven.
 * - Locks page scroll while open.
 * - Portaled to body so it never overlaps the admin sidebar.
 */
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
  useEffect(() => {
    if (!open) return;
    document.body.dataset.scrollLocked = "true";
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [open]);

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
          className="fixed inset-0 grid place-items-center px-4 py-8"
          style={{ zIndex }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full bg-card text-card-foreground shadow-modal border border-border",
              "max-h-[90dvh] flex flex-col overflow-hidden",
              sizeMap[size],
              className,
            )}
          >
            {(title || eyebrow || !hideClose) && (
              <header className="flex items-start justify-between gap-6 px-6 sm:px-10 pt-8 pb-6 border-b border-border">
                <div className="space-y-2 min-w-0">
                  {eyebrow && <p className="label-luxury">{eyebrow}</p>}
                  {title && (
                    <h2 className="heading-serif text-2xl sm:text-3xl text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    <X
                      size={16}
                      strokeWidth={1.4}
                      className="transition-transform duration-300 group-hover:rotate-90"
                    />
                  </button>
                )}
              </header>
            )}

            <div className="flex-1 overflow-y-auto luxury-scrollbar px-6 sm:px-10 py-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default LuxuryModal;
