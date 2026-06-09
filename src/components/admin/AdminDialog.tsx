import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClass: Record<NonNullable<AdminDialogProps["size"]>, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-6xl",
};

/**
 * Fully responsive admin dialog wrapper — matches the modern-luxury theme
 * used across the storefront (royal-violet eyebrow, serif title, soft borders).
 *
 * On mobile: full-width (95vw), max-h 92vh, internal scroll, sticky header/footer.
 * On desktop: capped width by `size`.
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
  className,
}: AdminDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 w-[95vw] max-h-[92vh] overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-2xl flex flex-col",
          sizeClass[size],
          className,
        )}
      >
        <header className="px-6 sm:px-8 py-6 border-b border-zinc-100 bg-white shrink-0">
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--royal-violet)] mb-1.5">
              {eyebrow}
            </p>
          )}
          <DialogTitle className="heading-serif text-2xl sm:text-3xl tracking-tighter text-[var(--dark-amethyst)] font-medium">
            {title}
          </DialogTitle>
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
          <footer className="px-6 sm:px-8 py-5 border-t border-zinc-100 bg-zinc-50/40 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            {footer}
          </footer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;
