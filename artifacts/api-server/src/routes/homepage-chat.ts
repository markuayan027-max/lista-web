import { Router, type Request, type Response } from "express";
import { fetchCoursesCatalog } from "../lib/courses-catalog.js";
import {
  buildDeterministicCourseListReply,
  isListAllCoursesIntent,
} from "../lib/homepage-chat-course-list.js";
import { buildKnowledgeBlock } from "../lib/homepage-chat-knowledge.js";
import { buildHomepageChatSystemPrompt } from "../lib/homepage-chat-meta-prompt.js";
import {
  homepageChatBurstLimiter,
  homepageChatWindowLimiter,
} from "../lib/homepage-chat-rate-limit.js";
import { getGroqApiKey, getGroqModel } from "../lib/groq-env.js";
import { sanitizeAssistantReply } from "../lib/homepage-chat-sanitize.js";
import { logger } from "../lib/logger.js";

const router = Router();

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

const MAX_MESSAGES = 12;
const MAX_CONTENT_LENGTH = 800;
const MAX_MESSAGES_TO_MODEL = 10;

function sanitizeContent(raw: string): string {
  return raw
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);
}

function isValidMessages(raw: unknown): raw is ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return false;
  }
  return raw.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      sanitizeContent(m.content).length > 0,
  );
}

function prepareMessagesForModel(messages: ChatMessage[]): ChatMessage[] {
  const sanitized = messages.map((m) => ({
    role: m.role,
    content: sanitizeContent(m.content),
  }));
  return sanitized.slice(-MAX_MESSAGES_TO_MODEL);
}

router.post(
  "/chat/homepage",
  homepageChatBurstLimiter,
  homepageChatWindowLimiter,
  async (req: Request, res: Response) => {
    const apiKey = getGroqApiKey();
    if (!apiKey) {
      logger.warn("POST /api/chat/homepage — GROQ_API_KEY missing (check repo root .env)");
      res.status(503).json({
        error: "Chat is temporarily unavailable. Please contact the school directly.",
        code: "CHAT_NOT_CONFIGURED",
      });
      return;
    }

    const { messages } = req.body ?? {};
    if (!isValidMessages(messages)) {
      res.status(400).json({
        error: "Invalid message format. Send a short question as the latest user message.",
        code: "CHAT_INVALID_PAYLOAD",
      });
      return;
    }

    const last = messages[messages.length - 1];
    if (last.role !== "user") {
      res.status(400).json({
        error: "The last message must be from the user.",
        code: "CHAT_INVALID_TURN",
      });
      return;
    }

    const catalog = await fetchCoursesCatalog();
    const programCountNum = catalog.length;

    const lastUserText = sanitizeContent(last.content);
    if (isListAllCoursesIntent(lastUserText)) {
      const listReply = buildDeterministicCourseListReply(catalog, lastUserText);
      if (listReply) {
        res.json({
          message: {
            role: "assistant" as const,
            content: sanitizeAssistantReply(listReply),
          },
        });
        return;
      }
    }

    const modelMessages = prepareMessagesForModel(messages);
    const systemPrompt = buildHomepageChatSystemPrompt({
      programCount: programCountNum,
      knowledgeBlock: buildKnowledgeBlock(catalog),
    });

    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...modelMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: getGroqModel(),
          messages: groqMessages,
          max_tokens: 1024,
          temperature: 0.3,
          top_p: 0.9,
        }),
        signal: AbortSignal.timeout(22_000),
      });

      if (groqRes.status === 429) {
        res.status(503).json({
          error: "The assistant is busy. Please wait a moment and try again.",
          code: "CHAT_UPSTREAM_BUSY",
        });
        return;
      }

      if (!groqRes.ok) {
        const body = await groqRes.text().catch(() => "");
        logger.warn({ status: groqRes.status, body: body.slice(0, 200) }, "Groq API error");
        res.status(502).json({
          error: "The assistant is temporarily unavailable. Please try again.",
          code: "CHAT_UPSTREAM_ERROR",
        });
        return;
      }

      const data = (await groqRes.json()) as {
        choices?: { message?: { content?: string } }[];
      };
    const rawReply = data.choices?.[0]?.message?.content?.trim();
    const reply = rawReply ? sanitizeAssistantReply(rawReply) : "";
    if (!reply) {
        res.status(502).json({
          error: "Empty response from assistant.",
          code: "CHAT_EMPTY_REPLY",
        });
        return;
      }

      res.json({ message: { role: "assistant" as const, content: reply } });
    } catch (err) {
      const isTimeout =
        err instanceof Error &&
        (err.name === "TimeoutError" || err.name === "AbortError");
      logger.error({ err, isTimeout }, "Homepage chat request failed");
      res.status(isTimeout ? 504 : 502).json({
        error: isTimeout
          ? "The assistant took too long. Please try a shorter question."
          : "Could not reach the assistant. Please try again.",
        code: isTimeout ? "CHAT_TIMEOUT" : "CHAT_NETWORK_ERROR",
      });
    }
  },
);

export default router;
