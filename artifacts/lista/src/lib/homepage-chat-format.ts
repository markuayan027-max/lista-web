/** Strip markdown artifacts so chat bubbles never show raw asterisks */
export function sanitizeChatPlainText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\s]*[•]\s+/gm, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .trim();
}

export type ChatContentBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] };

import { CHAT_PATH_RE, isChatPathToken } from "@/lib/homepage-chat-paths";

export function splitLineWithPaths(line: string): Array<{ type: "text" | "path"; value: string }> {
  const parts: Array<{ type: "text" | "path"; value: string }> = [];
  let last = 0;
  const re = new RegExp(CHAT_PATH_RE.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    const token = match[1];
    if (!isChatPathToken(token)) continue;
    if (match.index > last) {
      parts.push({ type: "text", value: line.slice(last, match.index) });
    }
    parts.push({ type: "path", value: token.replace(/^\//, "") });
    last = match.index + token.length;
  }
  if (last < line.length) {
    parts.push({ type: "text", value: line.slice(last) });
  }
  return parts.length ? parts : [{ type: "text", value: line }];
}

export function parseChatContent(content: string): ChatContentBlock[] {
  const clean = sanitizeChatPlainText(content);
  if (!clean) return [];

  const blocks: ChatContentBlock[] = [];
  const paragraphs = clean.split(/\n\n+/);

  for (const para of paragraphs) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const orderedItems: string[] = [];
    const plainLines: string[] = [];
    let inList = true;

    for (const line of lines) {
      const numbered = line.match(/^\d+[.)]\s+(.+)$/);
      if (numbered) {
        orderedItems.push(numbered[1]);
      } else {
        inList = false;
        plainLines.push(line);
      }
    }

    if (inList && orderedItems.length > 0) {
      blocks.push({ type: "list", ordered: true, items: orderedItems });
    } else if (plainLines.length > 0) {
      blocks.push({ type: "paragraph", lines: plainLines });
    }
  }

  return blocks.length ? blocks : [{ type: "paragraph", lines: [clean] }];
}
