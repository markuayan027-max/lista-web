import "./load-env.js";
import express from "express";
import type { RequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
  skip: (_req: unknown) => process.env.NODE_ENV === "development", // Skip rate limiting in development
});

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

app.use(
  httpLogger({
    logger,
    customLogLevel(_req: unknown, res: { statusCode?: number }, err: unknown) {
      if (err) return "error";
      // Client navigated away or HMR cancelled the fetch — not a server failure.
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
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all /api routes
app.use("/api", limiter);
app.use("/api", router);

export default app;
