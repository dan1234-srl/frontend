import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const languages: { code: Language; label: string; native: string }[] = [
  { code: "ro", label: "Română", native: "RO" },
  { code: "en", label: "English", native: "EN" },
];

interface Props {
  variant?: "compact" | "full";
}

export const LanguageSwitcher = ({ variant = "compact" }: Props) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = languages.find((l) => l.code === language)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-2 h-9 px-3 text-foreground border border-transparent hover:border-border transition-colors"
      >
        <Globe size={15} strokeWidth={1.4} />
        <span className="text-[10px] font-bold tracking-[0.25em]">
          {current.native}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] w-44 bg-card border border-border shadow-luxe py-1 z-50"
          >
            {languages.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                    active
                      ? "bg-surface text-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-[0.25em]">
                      {lang.native}
                    </span>
                    {variant === "full" && (
                      <span className="text-xs">{lang.label}</span>
                    )}
                  </span>
                  {active && <Check size={14} strokeWidth={1.6} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
