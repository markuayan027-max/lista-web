import type { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

/** Lightweight request logging for Cloudflare Workers (pino-http is incompatible). */
export const workerRequestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const status = res.statusCode ?? 0;
    const payload = {
      method: req.method,
      url: req.url?.split("?")[0],
      status,
      ms: Date.now() - start,
    };
    if (status >= 500) logger.error(payload);
    else if (status >= 400) logger.warn(payload);
    else logger.info(payload);
  });
  next();
};
