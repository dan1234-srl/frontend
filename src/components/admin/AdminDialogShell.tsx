import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Premium admin dialog shell.
 *
 * - GPU-only animations (`opacity` + `translate`), no `zoom`/`scale` jitter.
 * - Desktop: centered modal, fade + 8px translate.
 * - Mobile (`mobileVariant="sheet"`, default): bottom-sheet, slide-up,
 *   rounded top corners, safe-area padding, drag handle.
 * - Children layout fully controlled by caller (allows complex custom headers /
 *   tab bars / footers). Pair with `AdminDialogTitle` for a11y.
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
  children: React.ReactNode;
  /** Optional: hide the default overlay (rare). */
  hideOverlay?: boolean;
}

export const AdminDialogShell = ({
  open,
  onOpenChange,
  size = "md",
  mobileVariant = "sheet",
  className,
  children,
  hideOverlay,
}: AdminDialogShellProps) => {
  const isMobile = useIsMobile();
  const asSheet = isMobile && mobileVariant === "sheet";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {!hideOverlay && (
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "duration-200",
            )}
          />
        )}

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden outline-none",
            "[will-change:transform,opacity]",
            // Animation timing
            "duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            asSheet
              ? [
                  // Mobile bottom-sheet
                  "inset-x-0 bottom-0 top-auto w-full max-h-[92vh]",
                  "rounded-t-[2rem] rounded-b-none border-t border-zinc-100",
                  "pb-[env(safe-area-inset-bottom)]",
                  "data-[state=open]:slide-in-from-bottom-8",
                  "data-[state=closed]:slide-out-to-bottom-8",
                ]
              : [
                  // Desktop centered modal
                  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "w-[95vw] max-h-[92vh] rounded-[2rem] border border-zinc-100",
                  sizeClass[size],
                  "data-[state=open]:slide-in-from-top-2",
                  "data-[state=closed]:slide-out-to-top-2",
                ],
            className,
          )}
        >
          {asSheet && (
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <span className="h-1.5 w-10 rounded-full bg-zinc-200" />
            </div>
          )}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

/** Hidden-but-accessible title. Use when the caller renders a custom visual header. */
export const AdminDialogTitle = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Title className="sr-only">{children}</DialogPrimitive.Title>
);

export default AdminDialogShell;
