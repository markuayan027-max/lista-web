import type { Express, RequestHandler } from "express";
import pinoHttp from "pino-http";
import { logger } from "../lib/logger.js";

const httpLogger = pinoHttp as unknown as (options: {
  logger: typeof logger;
  customLogLevel: (_req: unknown, res: { statusCode?: number }, err: unknown) => string;
  serializers: {
    req: (req: { id?: unknown; method?: string; url?: string }) => {
      id: unknown;
      method: string | undefined;
      url: string | undefined;
    };
    res: (res: { statusCode?: number }) => { statusCode: number | undefined };
  };
}) => RequestHandler;

/** Node / Vercel: pino-http request logging. */
export function attachNodeRequestLogger(app: Express): void {
  app.use(
    httpLogger({
      logger,
      customLogLevel(_req: unknown, res: { statusCode?: number }, err: unknown) {
        if (err) return "error";
        if (!res.statusCode) return "debug";
        if (res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      serializers: {
        req(req: { id?: unknown; method?: string; url?: string }) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res: { statusCode?: number }) {
          return { statusCode: res.statusCode };
        },
      },
    }),
  );
}
