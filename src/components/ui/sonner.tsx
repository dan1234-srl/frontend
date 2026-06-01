import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Sonner premium — fundal SOLID alb, accent stânga colorat per tip,
 * tipografie luxury (eyebrow uppercase + descriere), shadow profund.
 * Tematica respectă variabilele CSS venite din backend (--dark-amethyst).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      expand={false}
      visibleToasts={4}
      closeButton
      icons={{
        success: <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2} />,
        error: <XCircle size={18} className="text-rose-500" strokeWidth={2} />,
        info: <Info size={18} className="text-sky-500" strokeWidth={2} />,
        warning: <AlertTriangle size={18} className="text-amber-500" strokeWidth={2} />,
        loading: <Loader2 size={18} className="animate-spin text-[var(--dark-amethyst,#10002b)]" strokeWidth={2} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden " +
            "rounded-[2px] border border-zinc-200/80 bg-white pl-5 pr-10 py-4 " +
            "shadow-[0_20px_60px_-12px_rgba(16,0,43,0.25)] " +
            "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[var(--dark-amethyst,#10002b)]",
          success:
            "before:!bg-emerald-500",
          error:
            "before:!bg-rose-500",
          info:
            "before:!bg-sky-500",
          warning:
            "before:!bg-amber-500",
          loading:
            "before:!bg-[var(--dark-amethyst,#10002b)]",
          icon: "shrink-0 mt-0.5",
          content: "flex flex-col gap-0.5 flex-1 min-w-0",
          title:
            "text-[11px] font-black uppercase tracking-[0.22em] text-zinc-900 leading-tight",
          description:
            "text-[12px] font-light leading-relaxed text-zinc-500 mt-0.5",
          actionButton:
            "shrink-0 ml-2 h-8 px-3 rounded-full text-white text-[9px] font-black uppercase tracking-[0.25em] " +
            "bg-[var(--dark-amethyst,#10002b)] hover:opacity-90 transition-opacity",
          cancelButton:
            "shrink-0 ml-1 h-8 px-3 rounded-full bg-zinc-100 text-zinc-600 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-zinc-200 transition-colors",
          closeButton:
            "!absolute !top-2 !right-2 !left-auto !translate-x-0 !translate-y-0 " +
            "!size-6 !rounded-full !border-0 !bg-transparent !text-zinc-400 hover:!bg-zinc-100 hover:!text-zinc-900 transition-colors",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
