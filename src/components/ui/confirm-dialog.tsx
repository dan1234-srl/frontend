import { useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Trash2, X } from "lucide-react";

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
    btn: "bg-zinc-900 text-white hover:bg-black",
    icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
  },
  destructive: {
    btn: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
    icon: <Trash2 size={20} strokeWidth={1.5} />,
  },
  success: {
    btn: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20",
    icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
  },
};

/**
 * useConfirm — promise-based luxury confirmation modal.
 * 100% Responsive, Custom Framer Motion implementation.
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
    setState((s) => ({
      ...s,
      open: false,
      resolve: undefined,
      loading: false,
    }));
  };

  const tone = state.tone ?? "neutral";
  const t = toneStyles[tone];

  const Dialog = (
    <AnimatePresence>
      {state.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          {/* Overlay / Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(false)}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />

          {/* Modal Box - Acum are `relative` pentru a ține X-ul înăuntru */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Buton Close fixat pe marginea ferestrei albe */}
            <button
              onClick={() => close(false)}
              className="absolute right-4 top-4 sm:right-5 sm:top-5 p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-800 transition-colors z-20"
            >
              <X size={16} strokeWidth={2} />
            </button>

            <div className="p-6 sm:p-8 flex flex-col">
              {/* Header (Eyebrow + Title) */}
              <div className="mb-6 pr-8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">
                  {state.eyebrow ?? "Confirm Action"}
                </p>
                {/* break-words previne ieșirea textului lung (ex: pe mobil) */}
                <h2
                  className={`text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-tight break-words hyphens-auto ${
                    tone === "destructive"
                      ? "text-red-500"
                      : "text-[var(--dark-amethyst)]"
                  }`}
                >
                  {state.title}
                </h2>
              </div>

              {/* Body (Icon + Description) */}
              <div className="flex items-start gap-4 mb-8">
                <div
                  className={`shrink-0 flex items-center justify-center size-12 rounded-2xl border border-zinc-100 ${
                    tone === "destructive"
                      ? "text-red-500 bg-red-50/50"
                      : tone === "success"
                        ? "text-emerald-500 bg-emerald-50/50"
                        : "text-[var(--royal-violet)] bg-zinc-50"
                  }`}
                >
                  {state.icon ??
                    (tone === "destructive" ? (
                      <AlertTriangle size={20} strokeWidth={1.5} />
                    ) : (
                      t.icon
                    ))}
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-500 pt-1">
                  {state.description ??
                    "Această acțiune va fi aplicată imediat. Asigură-te că dorești să continui."}
                </p>
              </div>

              {/* Footer / Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-auto pt-6 border-t border-zinc-100">
                <button
                  onClick={() => close(false)}
                  className="h-12 px-6 rounded-xl border border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors w-full sm:w-auto"
                >
                  {state.cancelLabel ?? "Anulează"}
                </button>
                <button
                  onClick={() => close(true)}
                  disabled={state.loading}
                  className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${t.btn}`}
                >
                  {state.loading && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {state.confirmLabel ?? "Confirmă"}
                </button>
              </div>
            </div>

            {/* Footer Branding - Așa cum se vedea subtil în imagini */}
            <div className="bg-zinc-50/50 py-3 text-center border-t border-zinc-100">
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-300">
                Evem Ecosystem — Secure Action
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return { confirm, ConfirmDialog: Dialog };
}
