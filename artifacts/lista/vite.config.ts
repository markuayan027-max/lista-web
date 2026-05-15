import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "path";

const rawPort = process.env.PORT || "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

// #region agent log
try {
  const logPath = path.resolve(import.meta.dirname, "..", "..", "debug-f3a3f4.log");
  fs.appendFileSync(
    logPath,
    JSON.stringify({
      sessionId: "f3a3f4",
      runId: "pre-fix",
      hypothesisId: "A",
      location: "vite.config.ts:22",
      message: "Vite config loaded; proxy target intended",
      data: { vitePort: port, basePath, proxyTarget: "http://localhost:3001" },
      timestamp: Date.now(),
    }) + "\n",
    "utf8",
  );
} catch {}
// #endregion agent log

export default defineConfig({
  base: basePath,
  appType: "spa",
  plugins: [
    react(),
    tailwindcss(),
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
        configure: (proxy) => {
          proxy.on("error", (err: NodeJS.ErrnoException) => {
            // #region agent log
            try {
              const logPath = path.resolve(import.meta.dirname, "..", "..", "debug-f3a3f4.log");
              fs.appendFileSync(
                logPath,
                JSON.stringify({
                  sessionId: "f3a3f4",
                  runId: "pre-fix",
                  hypothesisId: "A",
                  location: "vite.config.ts:proxy",
                  message: "Vite proxy /api forward failed",
                  data: {
                    code: err?.code,
                    syscall: err?.syscall,
                    address: err?.address,
                    port: err?.port,
                  },
                  timestamp: Date.now(),
                }) + "\n",
                "utf8",
              );
            } catch {}
            fetch("http://127.0.0.1:7838/ingest/51fce929-fb5a-4ca3-a84f-dc79a797293d", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f3a3f4" },
              body: JSON.stringify({
                sessionId: "f3a3f4",
                runId: "pre-fix",
                hypothesisId: "A",
                location: "vite.config.ts:proxy",
                message: "Vite proxy /api forward failed",
                data: { code: err?.code },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion agent log
          });
        },
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
