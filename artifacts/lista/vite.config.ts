import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT || "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

const CACHEABLE = /\.(webp|avif|png|jpe?g|svg|ico|woff2?|ttf)$/i;

function staticCacheHeaders() {
  return {
    name: "lista-static-cache",
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (req.url && CACHEABLE.test(req.url.split("?")[0] ?? "")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        next();
      });
    },
    configurePreviewServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (req.url && CACHEABLE.test(req.url.split("?")[0] ?? "")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  appType: "spa",
  plugins: [
    react(),
    tailwindcss(),
    staticCacheHeaders(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@radix-ui")) return "radix";
          if (
            id.includes("html2pdf") ||
            id.includes("jspdf") ||
            id.includes("html2canvas")
          ) {
            return "pdf";
          }
          if (id.includes("xlsx") || id.includes("docx") || id.includes("file-saver")) {
            return "office";
          }
          if (id.includes("@insforge")) return "insforge";
          if (
            id.includes("/react/") ||
            id.includes("react-dom") ||
            id.includes("@tanstack/react-query") ||
            id.includes("wouter")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
