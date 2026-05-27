import "./load-env.js";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";

const STATIC_CORS_ORIGINS = [
  "https://lista.dpdns.org",
  "https://www.lista.dpdns.org",
  "https://lista-frontend.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
] as const;

/** Vercel preview URLs: lista-frontend-*.vercel.app */
function isListaVercelPreviewOrigin(origin: string): boolean {
  return /^https:\/\/lista-frontend[a-z0-9-]*\.vercel\.app$/i.test(origin);
}

function buildAllowedOrigins(): Set<string> {
  const fromEnv = [process.env.LISTA_APP_URL, process.env.VITE_APP_URL].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  return new Set([...STATIC_CORS_ORIGINS, ...fromEnv]);
}

function isAllowedCorsOrigin(origin: string, allowed: Set<string>): boolean {
  return allowed.has(origin) || isListaVercelPreviewOrigin(origin);
}

/** Mount CORS, parsers, rate limit, and API routes (call after request logger on each runtime). */
export function mountAppRoutes(app: Application): void {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
    skip: (_req: unknown) => process.env.NODE_ENV === "development",
  });

  const allowedOrigins = buildAllowedOrigins();

  const reflectCorsOrigin = (req: Request, res: Response): void => {
    const origin = req.headers.origin;
    if (typeof origin !== "string" || !origin) return;
    if (!isAllowedCorsOrigin(origin, allowedOrigins)) return;
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  };

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (isAllowedCorsOrigin(origin, allowedOrigins)) return callback(null, origin);
        return callback(null, false);
      },
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      optionsSuccessStatus: 204,
    }),
  );
  app.use((req, res, next) => {
    reflectCorsOrigin(req, res);
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", limiter);
  app.use("/api", router);

  app.use(
    (err: unknown, req: Request, res: Response, _next: NextFunction) => {
      reflectCorsOrigin(req, res);
      if (res.headersSent) return;
      const message = err instanceof Error ? err.message : "Internal Server Error";
      res.status(500).json({ success: false, error: message });
    },
  );
}
