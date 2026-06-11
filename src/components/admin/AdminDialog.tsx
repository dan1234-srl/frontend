import { ReactNode } from "react";
import { DialogDescription } from "@/components/ui/dialog";
import { AdminDialogShell, AdminDialogTitle, AdminDialogShellSize } from "./AdminDialogShell";
import { cn } from "@/lib/utils";

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AdminDialogShellSize;
  mobileVariant?: "sheet" | "modal";
  className?: string;
}

/**
 * Branded admin dialog with built-in eyebrow/title/description header and
 * optional sticky footer. Built on top of AdminDialogShell:
 *
 * - Mobile: bottom-sheet (drag handle, safe area).
 * - Desktop: centered modal capped by `size`.
 * - GPU-only animations — no jitter.
 */
export const AdminDialog = ({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  children,
  footer,
  size = "md",
  mobileVariant = "sheet",
  className,
}: AdminDialogProps) => {
  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      mobileVariant={mobileVariant}
      className={cn("bg-white", className)}
    >
      <AdminDialogTitle>{title}</AdminDialogTitle>

      <header className="px-6 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 bg-white shrink-0 text-left">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)] mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="heading-serif text-2xl sm:text-3xl tracking-tighter text-[var(--dark-amethyst)] font-medium">
          {title}
        </h2>
        {description && (
          <DialogDescription className="text-[11px] text-zinc-400 font-medium mt-1.5">
            {description}
          </DialogDescription>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 luxury-scrollbar">
        {children}
      </div>

      {footer && (
        <footer className="px-6 sm:px-8 py-4 sm:py-5 border-t border-zinc-100 bg-zinc-50/40 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {footer}
        </footer>
      )}
    </AdminDialogShell>
  );
};

export default AdminDialog;
