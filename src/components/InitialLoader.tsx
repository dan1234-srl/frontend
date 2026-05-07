import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const InitialLoader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulează încărcarea resurselor critice
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ duration: 1 }}
            className="text-2xl font-light uppercase tracking-[0.5em] text-foreground"
          >
            Linea
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InitialLoader;
