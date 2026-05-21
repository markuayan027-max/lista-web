import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
/** Vercel sets VERCEL=1 — avoid pino worker threads (FUNCTION_INVOCATION_FAILED). */
const isVercel = process.env.VERCEL === "1";

export const logger = isVercel
  ? {
      info: (obj: unknown) => console.log(obj),
      warn: (obj: unknown) => console.warn(obj),
      error: (obj: unknown) => console.error(obj),
      debug: (obj: unknown) => console.debug(obj),
    }
  : pino({
      level: process.env.LOG_LEVEL ?? "info",
      redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers['set-cookie']",
      ],
      ...(isProduction
        ? {}
        : {
            transport: {
              target: "pino-pretty",
              options: { colorize: true },
            },
          }),
    });
