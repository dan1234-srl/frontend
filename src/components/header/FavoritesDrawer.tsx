import { X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const FavoritesDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isOpen) document.body.dataset.scrollLocked = "true";
    else delete document.body.dataset.scrollLocked;
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
          {/* Overlay cu blur discret */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative flex h-[100dvh] w-full sm:max-w-md flex-col border-l border-zinc-100 shadow-2xl"
            style={{ backgroundColor: "var(--background)" }}
          >
            <header className="flex items-center justify-between px-6 sm:px-10 py-7 border-b border-zinc-100 bg-white">
              <div className="space-y-1 text-left">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.3em]"
                  style={{ color: "var(--royal-violet)" }}
                >
                  Selecție
                </p>
                <p className="heading-serif text-3xl italic text-[var(--dark-amethyst)]">
                  Favorite
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="group h-12 w-12 grid place-items-center rounded-full bg-zinc-50 hover:bg-rose-500 hover:text-white transition-all duration-300"
              >
                <X
                  size={20}
                  strokeWidth={1.5}
                  className="group-hover:rotate-90 transition-transform duration-500"
                />
              </button>
            </header>

            {/* Empty State Section */}
            <div className="flex-1 px-10 flex flex-col items-center justify-center text-center gap-6">
              <div
                className="size-24 rounded-full flex items-center justify-center mb-2 shadow-inner"
                style={{ backgroundColor: "var(--light-cyan)" }}
              >
                <Heart
                  size={40}
                  strokeWidth={1}
                  style={{ color: "var(--royal-violet)" }}
                  className="opacity-60"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--dark-amethyst)]">
                  Lista ta este goală
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-[260px] mx-auto">
                  Explorează colecția noastră și salvează articolele preferate
                  apăsând pe pictograma inimă.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:brightness-110 active:scale-95 transition-all"
                style={{ background: "var(--primary-gradient)" }}
              >
                Începe cumpărăturile
              </button>
            </div>

            {/* Footer subtil (opțional) */}
            <footer className="p-8 border-t border-zinc-100 bg-white/50 text-center">
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                Evem Premium Selection
              </p>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FavoritesDrawer;
