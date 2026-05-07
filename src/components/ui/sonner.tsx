import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast !bg-card !text-foreground !border !border-border !shadow-luxe !rounded-none !font-sans px-5 py-4",
          title: "!text-[12px] !font-semibold !tracking-tight",
          description: "!text-[12px] !text-muted-foreground !mt-0.5",
          actionButton:
            "!bg-foreground !text-background !text-[10px] !font-bold !uppercase !tracking-[0.2em] !rounded-none",
          cancelButton:
            "!bg-surface !text-muted-foreground !text-[10px] !font-bold !uppercase !tracking-[0.2em] !rounded-none",
          success: "!border-success/30",
          error: "!border-destructive/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
