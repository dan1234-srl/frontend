import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-4 text-left">
              {/* 🚀 REPARAT: Schimbat din bg-zinc-700 fix în culoarea dinamică a brandului de pe backend */}
              <div
                className="w-[1.5px] shrink-0"
                style={{ backgroundColor: "var(--royal-violet)", opacity: 0.7 }}
              />

              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}

      {/* 🚀 FIX CRITIC: Adăugat z-[99999] pentru a sparge complet backdrop-blur-ul modalului și a-l aduce în prim-plan */}
      <ToastViewport className="z-[99999]" />
    </ToastProvider>
  );
}
