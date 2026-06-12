import { ReactNode, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AdminDialog } from "./AdminDialog";

interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Premium confirmation dialog (replaces native `confirm()`).
 * Reuses AdminDialog → inherits cinematic shell + mobile bottom-sheet.
 */
export const AdminConfirmDialog = ({
  open,
  onOpenChange,
  eyebrow = "Confirmare",
  title,
  description,
  confirmLabel = "Confirmă",
  cancelLabel = "Anulează",
  destructive,
  onConfirm,
}: AdminConfirmDialogProps) => {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      open={open}
      onOpenChange={(v) => !busy && onOpenChange(v)}
      size="sm"
      eyebrow={eyebrow}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="h-11 px-5 rounded-xl border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handle}
            disabled={busy}
            className={`h-11 px-6 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-60`}
            style={{
              background: destructive
                ? "linear-gradient(135deg, #be123c 0%, #881337 100%)"
                : "var(--primary-gradient)",
            }}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div
          className={`shrink-0 size-12 rounded-2xl flex items-center justify-center ${
            destructive
              ? "bg-rose-50 text-rose-600"
              : "bg-[var(--royal-violet)]/10 text-[var(--royal-violet)]"
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <div className="text-sm text-zinc-600 leading-relaxed pt-1">
          {description}
        </div>
      </div>
    </AdminDialog>
  );
};

export default AdminConfirmDialog;
