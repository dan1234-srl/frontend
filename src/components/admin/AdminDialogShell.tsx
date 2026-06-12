import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Premium admin dialog shell — cinematic entrance, asymmetric form,
 * Evem accent bar, glowing halo, mobile drag-to-close sheet.
 *
 * GPU-only animations (transform / opacity / clip-path). No layout reflow.
 * Respects `prefers-reduced-motion` → falls back to a 150ms fade.
 */
export type AdminDialogShellSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClass: Record<AdminDialogShellSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
  full: "sm:max-w-[1300px]",
};

interface AdminDialogShellProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  size?: AdminDialogShellSize;
  mobileVariant?: "sheet" | "modal";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  hideOverlay?: boolean;
  /** Accent color for the left bar + halo. Defaults to royal violet. */
  accentColor?: string;
  /** Hide the floating external close button (rare). */
  hideClose?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SHEET_EASE = [0.34, 1.2, 0.64, 1] as const;

export const AdminDialogShell = ({
  open,
  onOpenChange,
  size = "md",
  mobileVariant = "sheet",
  className,
  style,
  children,
  hideOverlay,
  accentColor = "var(--royal-violet)",
  hideClose,
}: AdminDialogShellProps) => {
  const isMobile = useIsMobile();
  const asSheet = isMobile && mobileVariant === "sheet";
  const reduce = useReducedMotion();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay — milky blur fade */}
            {!hideOverlay && (
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: "linear" }}
                  className="fixed inset-0 z-[9998] bg-zinc-950/55"
                  style={{
                    backdropFilter: "blur(6px) saturate(1.05)",
                    WebkitBackdropFilter: "blur(6px) saturate(1.05)",
                  }}
                />
              </DialogPrimitive.Overlay>
            )}

            {/* Halo — pulsing gradient behind the shell (desktop only) */}
            {!asSheet && !reduce && (
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: 0.35,
                  scale: 1,
                  transition: { duration: 0.45, ease: EASE },
                }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="fixed left-1/2 top-1/2 z-[9998] pointer-events-none"
                style={{
                  width: "min(90vw, 1400px)",
                  height: "min(88vh, 900px)",
                  transform: "translate(-50%, -50%)",
                  background: `radial-gradient(ellipse at center, ${accentColor}55 0%, transparent 65%)`,
                  filter: "blur(70px)",
                }}
              />
            )}

            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => {
                // Avoid initial focus jumping into the first input on mobile
                if (asSheet) e.preventDefault();
              }}
            >
              <motion.div
                {...(asSheet
                  ? {
                      initial: reduce
                        ? { opacity: 0 }
                        : { y: "100%", opacity: 0.6 },
                      animate: reduce
                        ? { opacity: 1, transition: { duration: 0.15 } }
                        : {
                            y: 0,
                            opacity: 1,
                            transition: { duration: 0.32, ease: SHEET_EASE },
                          },
                      exit: reduce
                        ? { opacity: 0, transition: { duration: 0.12 } }
                        : {
                            y: "100%",
                            opacity: 0.4,
                            transition: { duration: 0.22, ease: "easeIn" },
                          },
                      drag: "y" as const,
                      dragConstraints: { top: 0, bottom: 0 },
                      dragElastic: { top: 0, bottom: 0.4 },
                      onDragEnd: (_: any, info: any) => {
                        if (info.offset.y > 120 || info.velocity.y > 600) {
                          onOpenChange(false);
                        }
                      },
                    }
                  : {
                      initial: reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: 18,
                            scale: 0.965,
                            clipPath: "inset(30% 30% 30% 30% round 28px)",
                          },
                      animate: reduce
                        ? { opacity: 1, transition: { duration: 0.15 } }
                        : {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            clipPath: "inset(0% 0% 0% 0% round 28px)",
                            transition: { duration: 0.36, ease: EASE },
                          },
                      exit: reduce
                        ? { opacity: 0, transition: { duration: 0.12 } }
                        : {
                            opacity: 0,
                            y: 10,
                            scale: 0.97,
                            transition: { duration: 0.18, ease: "easeIn" },
                          },
                    })}
                style={{
                  willChange: "transform, opacity, clip-path",
                  boxShadow: asSheet
                    ? "0 -20px 60px -20px rgba(16, 0, 43, 0.35), 0 -2px 0 0 rgba(255,255,255,0.6) inset"
                    : `0 30px 80px -20px rgba(16, 0, 43, 0.45), 0 8px 24px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 0 60px -10px ${accentColor}33`,
                  ...style,
                }}
                className={cn(
                  "fixed z-[9999] bg-white flex flex-col overflow-hidden outline-none",
                  asSheet
                    ? [
                        "inset-x-0 bottom-0 top-auto w-full max-h-[92vh]",
                        "rounded-t-[28px] rounded-b-none",
                        "pb-[env(safe-area-inset-bottom)]",
                      ]
                    : [
                        "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                        "w-[95vw] max-h-[92vh] rounded-[28px]",
                        sizeClass[size],
                      ],
                  className,
                )}
              >
                {/* Accent vertical bar — Evem signature (desktop) */}
                {!asSheet && (
                  <div
                    aria-hidden
                    className="absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}00 85%)`,
                    }}
                  />
                )}

                {/* Aurora wash on header area */}
                {!asSheet && !reduce && (
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-[0.06]"
                    style={{
                      background: `radial-gradient(ellipse at 20% 0%, ${accentColor} 0%, transparent 60%), radial-gradient(ellipse at 90% 0%, var(--dark-amethyst) 0%, transparent 55%)`,
                    }}
                  />
                )}

                {/* Mobile drag handle (also visual pull target) */}
                {asSheet && (
                  <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
                    <motion.span
                      initial={{ scaleX: 0.4, opacity: 0.4 }}
                      animate={{
                        scaleX: 1,
                        opacity: 1,
                        transition: { delay: 0.12, duration: 0.3 },
                      }}
                      className="h-1.5 w-10 rounded-full bg-zinc-300"
                    />
                  </div>
                )}

                <div className="relative flex-1 flex flex-col min-h-0">
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>

            {/* External floating close (desktop only) */}
            {!asSheet && !hideClose && (
              <motion.button
                type="button"
                onClick={() => onOpenChange(false)}
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  transition: { delay: 0.15, duration: 0.3, ease: EASE },
                }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.25 }}
                className="fixed z-[10000] top-6 right-6 sm:top-8 sm:right-8 h-11 w-11 rounded-full bg-white text-[var(--dark-amethyst)] flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] hover:bg-[var(--dark-amethyst)] hover:text-white transition-colors"
                aria-label="Închide"
              >
                <X size={16} strokeWidth={2.4} />
              </motion.button>
            )}
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};

/** Hidden-but-accessible title. Use when the caller renders a custom visual header. */
export const AdminDialogTitle = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Title className="sr-only">{children}</DialogPrimitive.Title>
);

export default AdminDialogShell;
