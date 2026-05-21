import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  MessageCircle,
  MessagesSquare,
  Send,
  X,
  Loader2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HomepageChatError,
  sendHomepageChatMessage,
  type HomepageChatMessage,
} from "@/lib/homepage-chat-api";
import HomepageChatMessageBody from "@/components/homepage-chat-message";

const WELCOME: HomepageChatMessage = {
  role: "assistant",
  content:
    "Maayong adlaw! I'm LISTA Guide. Ask me to list courses, scholarships (TWSP), admission requirements, enrollment steps, or contact — English, Tagalog, or Bisaya.",
};

const QUICK_PROMPTS = [
  { label: "All courses", text: "List all courses you offer" },
  { label: "TWSP", text: "What is TWSP scholarship and who is eligible?" },
  { label: "Requirements", text: "What documents do I need for admission?" },
  { label: "Paano enroll?", text: "Paano mag-enroll?" },
  { label: "Unsa mga course?", text: "Unsa tanan nga kurso ninyo?" },
  { label: "Assessment", text: "What is the career assessment on this site?" },
  { label: "Location", text: "Where is LISTA located and what are office hours?" },
  { label: "Contact", text: "How can I contact LISTA?" },
] as const;

const MIN_SEND_INTERVAL_MS = 2_500;
const MAX_INPUT_LENGTH = 800;
const MAX_THREAD_MESSAGES = 20;

type HomepageChatProps = {
  programCount?: number;
};

function rateLimitFriendlyMessage(err: HomepageChatError): string {
  if (err.status === 429 || err.code === "CHAT_RATE_LIMITED") {
    return "Paspas kaayo — hulat gamay then try again.";
  }
  if (err.code === "CHAT_UPSTREAM_BUSY") {
    return "Busy ang assistant — try again in a few seconds.";
  }
  return err.message;
}

export default function HomepageChat({ programCount }: HomepageChatProps) {
  const [location] = useLocation();
  const path = location.split("?")[0] ?? "";
  const courseDetailStickyBar = /^\/courses\/[^/]+$/.test(path);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HomepageChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSendAtRef = useRef(0);

  const threadFull = messages.length >= MAX_THREAD_MESSAGES;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      inputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [open, messages, loading]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const resetChat = useCallback(() => {
    setMessages([WELCOME]);
    setError(null);
    setInput("");
  }, []);

  const submitText = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, MAX_INPUT_LENGTH);
      if (!trimmed || loading || threadFull) return;

      const now = Date.now();
      if (now - lastSendAtRef.current < MIN_SEND_INTERVAL_MS) {
        setError("Hulat gamay before sending again.");
        return;
      }

      const userMsg: HomepageChatMessage = { role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setError(null);
      setLoading(true);
      lastSendAtRef.current = now;

      try {
        const reply = await sendHomepageChatMessage(
          next.filter((m) => m.role === "user" || m.role === "assistant"),
          programCount,
        );
        setMessages((prev) => [...prev, reply]);
      } catch (e) {
        const msg =
          e instanceof HomepageChatError
            ? rateLimitFriendlyMessage(e)
            : e instanceof Error
              ? e.message
              : "Something went wrong";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, programCount, threadFull],
  );

  const send = useCallback(() => void submitText(input), [input, submitText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close chat overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] md:bg-slate-900/25"
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-label="LISTA homepage assistant"
              aria-modal="true"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className={cn(
                "fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl shadow-slate-900/15",
                "inset-x-0 bottom-0 max-h-[min(88dvh,640px)] rounded-t-2xl border border-slate-200",
                "pb-[env(safe-area-inset-bottom)]",
                "md:inset-x-auto md:bottom-24 md:right-6 md:left-auto",
                "md:h-[min(32rem,70dvh)] md:max-h-[70dvh] md:w-[min(100vw-2rem,26rem)] md:rounded-2xl",
              )}
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-3.5 text-white">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20"
                  aria-hidden
                >
                  <MessagesSquare className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-tight tracking-tight">
                    LISTA Guide
                  </p>
                  <p className="text-xs text-blue-100">
                    English · Tagalog · Bisaya
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white hover:bg-white/15 hover:text-white"
                    onClick={resetChat}
                    aria-label="Start new conversation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white hover:bg-white/15 hover:text-white"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                <ul className="space-y-4">
                  {messages.map((m, i) => {
                    const isUser = m.role === "user";
                    return (
                      <li
                        key={`${m.role}-${i}`}
                        className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
                      >
                        <motion.div
                          aria-hidden
                          className={cn(
                            "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            isUser
                              ? "bg-blue-700 text-white"
                              : "bg-slate-200 text-slate-600",
                          )}
                        >
                          {isUser ? "You" : "LG"}
                        </motion.div>
                        <div
                          className={cn(
                            "max-w-[min(100%,18rem)] rounded-2xl px-3.5 py-2.5 shadow-sm",
                            isUser
                              ? "rounded-tr-md bg-blue-700 text-white"
                              : "rounded-tl-md border border-slate-100 bg-slate-50 text-slate-800",
                          )}
                        >
                          <HomepageChatMessageBody
                            content={m.content}
                            variant={isUser ? "user" : "assistant"}
                          />
                        </div>
                      </li>
                    );
                  })}
                  {loading && (
                    <li className="flex gap-2">
                      <div
                        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600"
                        aria-hidden
                      >
                        LG
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        Thinking…
                      </div>
                    </li>
                  )}
                  <li ref={bottomRef} className="h-px" aria-hidden />
                </ul>
              </div>

              {!threadFull && messages.length <= 2 && !loading && (
                <div className="flex shrink-0 gap-2 overflow-x-auto px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => void submitText(q.text)}
                      className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              {threadFull && (
                <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
                  Limit reached.{" "}
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={resetChat}
                  >
                    New chat
                  </button>
                </p>
              )}

              {error && (
                <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-center text-xs text-red-700">
                  {error}
                </p>
              )}

              <motion.div
                layout
                className="flex shrink-0 gap-2 border-t border-slate-100 bg-white p-3 pt-2"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder={
                    threadFull ? "Start a new chat…" : "Type in English, Tagalog, or Bisaya…"
                  }
                  disabled={loading || threadFull}
                  maxLength={MAX_INPUT_LENGTH}
                  className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base leading-snug outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 md:text-sm"
                  aria-label="Message"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800"
                  onClick={send}
                  disabled={loading || threadFull || !input.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-50 h-14 w-14 rounded-full bg-blue-700 shadow-lg shadow-blue-900/20 hover:bg-blue-800",
          courseDetailStickyBar
            ? "bottom-[5.5rem] right-4 lg:bottom-[max(1.25rem,env(safe-area-inset-bottom))] lg:right-6"
            : "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 md:right-6",
          open && "ring-2 ring-blue-300 ring-offset-2",
        )}
        aria-expanded={open}
        aria-label={open ? "Close LISTA Guide" : "Open LISTA Guide"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
}
