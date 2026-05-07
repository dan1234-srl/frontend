import { motion } from "framer-motion";
import { ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.01, y: -10 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // "Quintic Out" - Foarte fin la final
      }}
      className="w-full h-full origin-top"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
