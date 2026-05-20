import { apiUrl } from "./api-url";
export type HomepageChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type HomepageChatErrorCode =
  | "CHAT_RATE_LIMITED"
  | "CHAT_NOT_CONFIGURED"
  | "CHAT_INVALID_PAYLOAD"
  | "CHAT_INVALID_TURN"
  | "CHAT_UPSTREAM_BUSY"
  | "CHAT_UPSTREAM_ERROR"
  | "CHAT_EMPTY_REPLY"
  | "CHAT_TIMEOUT"
  | "CHAT_NETWORK_ERROR"
  | string;

export class HomepageChatError extends Error {
  readonly code?: HomepageChatErrorCode;
  readonly status: number;

  constructor(message: string, status: number, code?: HomepageChatErrorCode) {
    super(message);
    this.name = "HomepageChatError";
    this.status = status;
    this.code = code;
  }
}

export async function sendHomepageChatMessage(
  messages: HomepageChatMessage[],
  programCount?: number,
): Promise<HomepageChatMessage> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/api/chat/homepage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, programCount }),
    });
  } catch {
    throw new HomepageChatError(
      "Unable to reach LISTA Guide. Please check that the server is running and try again.",
      0,
      "CHAT_NETWORK_ERROR",
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: HomepageChatErrorCode;
    message?: HomepageChatMessage;
  };

  if (!res.ok) {
    throw new HomepageChatError(
      data.error ?? "Chat request failed",
      res.status,
      data.code,
    );
  }

  if (!data.message?.content) {
    throw new HomepageChatError("No reply from assistant", res.status);
  }

  return data.message;
}
