import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Activează compresia pentru a livra fișiere mai mici pe 3G
    viteCompression({
      algorithm: "brotliCompress", // Brotli este mai eficient decât Gzip
      ext: ".br",
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Îmbunătățirea împachetării pentru a reduce numărul de request-uri
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Grupează bibliotecile mari în fișiere separate (vendor chunks)
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion") || id.includes("lucide-react")) {
              return "vendor-ui";
            }
            if (id.includes("@tanstack") || id.includes("axios")) {
              return "vendor-data";
            }
            return "vendor"; // Restul depedențelor
          }
        },
      },
    },
    // Optimizări extra pentru dimensiune
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
  },
}));
