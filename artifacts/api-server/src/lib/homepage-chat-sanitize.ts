import { stripLeadingSlashesFromPaths } from "./homepage-chat-paths.js";

/** Strip markdown so mobile chat never shows raw asterisks. Keeps hyphenated course lines. */
export function sanitizeAssistantReply(text: string): string {
  return stripLeadingSlashesFromPaths(
    text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^[\s]*[•]\s+/gm, "")
      .replace(/\*/g, "")
      .trim(),
  );
}
