import "./load-env.js";
import express, { type Application } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";

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

  const corsOrigins = [
    process.env.LISTA_APP_URL,
    process.env.VITE_APP_URL,
    "https://lista.dpdns.org",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter((v): v is string => typeof v === "string" && v.length > 0);

  app.use(
    cors({
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", limiter);
  app.use("/api", router);
}
