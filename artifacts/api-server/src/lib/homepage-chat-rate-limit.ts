import rateLimit, { type Options } from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";

function chatLimitMessage(retryAfterSec?: number) {
  const wait =
    retryAfterSec && retryAfterSec > 0
      ? ` Try again in about ${Math.ceil(retryAfterSec / 60) || 1} minute(s).`
      : " Please wait a few minutes and try again.";
  return {
    error: `Too many chat messages.${wait}`,
    code: "CHAT_RATE_LIMITED",
  };
}

function baseOptions(overrides: Partial<Options>): Options {
  return {
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      res.status(429).json(chatLimitMessage(retryAfter));
    },
    ...overrides,
  };
}

/** Short burst window — stops rapid spam / bot floods */
export const homepageChatBurstLimiter = rateLimit(
  baseOptions({
    windowMs: 60 * 1000,
    max: isDev ? 40 : 6,
    message: chatLimitMessage(60),
  }),
);

/** 15-minute window — caps cost per visitor */
export const homepageChatWindowLimiter = rateLimit(
  baseOptions({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 120 : 20,
    message: chatLimitMessage(15 * 60),
  }),
);
