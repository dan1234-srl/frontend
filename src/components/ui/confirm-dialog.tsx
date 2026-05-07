import { useState, useCallback, ReactNode } from "react";
import { LuxuryModal } from "./luxury-modal";
import { Loader2, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

type Tone = "neutral" | "destructive" | "success";

interface ConfirmOptions {
  title: string;
  description?: string;
  eyebrow?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  icon?: ReactNode;
}

interface InternalState extends ConfirmOptions {
  open: boolean;
  resolve?: (val: boolean) => void;
  loading: boolean;
}

const toneStyles: Record<Tone, { btn: string; icon: ReactNode }> = {
  neutral: {
    btn: "bg-foreground text-background hover:bg-primary-hover",
    icon: <CheckCircle2 size={20} strokeWidth={1.4} />,
  },
  destructive: {
    btn: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    icon: <Trash2 size={20} strokeWidth={1.4} />,
  },
  success: {
    btn: "bg-success text-success-foreground hover:bg-success/90",
    icon: <CheckCircle2 size={20} strokeWidth={1.4} />,
  },
};

/**
 * useConfirm — promise-based luxury confirmation modal.
 *
 * const confirm = useConfirm();
 * const ok = await confirm({ title: "Delete order?", tone: "destructive" });
 */
export function useConfirm() {
  const [state, setState] = useState<InternalState>({
    open: false,
    loading: false,
    title: "",
  });

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ ...opts, open: true, loading: false, resolve });
      }),
    [],
  );

  const close = (value: boolean) => {
    state.resolve?.(value);
    setState((s) => ({ ...s, open: false, resolve: undefined, loading: false }));
  };

  const tone = state.tone ?? "neutral";
  const t = toneStyles[tone];

  const Dialog = (
    <LuxuryModal
      open={state.open}
      onClose={() => close(false)}
      eyebrow={state.eyebrow ?? "Confirm action"}
      title={state.title}
      description={state.description}
      size="sm"
      zIndex={9000}
    >
      <div className="flex items-start gap-5 mb-10">
        <div
          className={`shrink-0 grid place-items-center h-12 w-12 rounded-full border border-border ${
            tone === "destructive"
              ? "text-destructive bg-destructive/5"
              : tone === "success"
                ? "text-success bg-success/5"
                : "text-foreground bg-surface"
          }`}
        >
          {state.icon ?? (tone === "destructive" ? <AlertTriangle size={20} strokeWidth={1.4} /> : t.icon)}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground pt-2">
          {state.description ??
            "Această acțiune va fi aplicată imediat. Asigură-te că dorești să continui."}
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <button
          onClick={() => close(false)}
          className="h-12 px-8 border border-border text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:bg-surface transition-colors"
        >
          {state.cancelLabel ?? "Renunță"}
        </button>
        <button
          onClick={() => close(true)}
          disabled={state.loading}
          className={`h-12 px-8 text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${t.btn}`}
        >
          {state.loading && <Loader2 size={14} className="animate-spin" />}
          {state.confirmLabel ?? "Confirmă"}
        </button>
      </div>
    </LuxuryModal>
  );

  return { confirm, ConfirmDialog: Dialog };
}
