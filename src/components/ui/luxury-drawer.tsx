import { useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface LuxuryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: string;
  eyebrow?: string;
  width?: string; // e.g. "sm:max-w-[460px]"
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Premium slide-in drawer with a milky backdrop blur matching the
 * Shopping Bag experience. Built on framer-motion (no Radix overlay)
 * so we get the exact same look across the whole app.
 */
export const LuxuryDrawer = ({
  isOpen,
  onClose,
  side = "right",
  title,
  eyebrow,
  width = "sm:max-w-[460px]",
  children,
  footer,
}: LuxuryDrawerProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fromX = side === "right" ? "100%" : "-100%";
  const justify = side === "right" ? "justify-end" : "justify-start";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[700] flex ${justify}`}>
          {/* Milky backdrop — identical to ShoppingBag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: fromX }}
            animate={{ x: 0 }}
            exit={{ x: fromX }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className={`relative z-[701] flex h-[100dvh] w-full ${width} flex-col bg-white shadow-2xl`}
          >
            <header className="flex items-center justify-between px-8 py-8 border-b border-zinc-100 bg-white shrink-0">
              <div className="space-y-1">
                {eyebrow && (
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)]">
                    {eyebrow}
                  </p>
                )}
                <p className="heading-serif text-3xl tracking-tighter text-[var(--dark-amethyst)]">
                  {title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-zinc-100 hover:bg-[var(--dark-amethyst)] hover:text-white transition-all text-[var(--dark-amethyst)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-6 luxury-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="p-8 border-t border-zinc-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] shrink-0">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LuxuryDrawer;
