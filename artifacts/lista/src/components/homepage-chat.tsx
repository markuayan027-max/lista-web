import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Send, X, Loader2, RotateCcw } from "lucide-react";
import ListaGuideAvatar from "@/components/lista-guide-avatar";
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
  const traineePortal = /^\/trainee(\/|$)/.test(path);
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
              className="fixed inset-0 z-[55] hidden bg-slate-900/25 backdrop-blur-[2px] md:block"
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-label="LISTA homepage assistant"
              aria-modal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className={cn(
                "fixed z-[60] flex flex-col overflow-hidden bg-white",
                "inset-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 shadow-none",
                "pb-[env(safe-area-inset-bottom)]",
                "md:inset-x-auto md:inset-y-0 md:right-0 md:left-auto md:top-0 md:bottom-0",
                "md:h-[100dvh] md:max-h-[100dvh] md:w-[min(100vw,26rem)]",
                "md:rounded-none md:rounded-l-2xl md:border-0 md:border-l md:border-slate-200",
                "md:shadow-[-8px_0_32px_rgba(15,23,42,0.12)]",
              )}
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-slate-900 md:border-slate-700/50 md:bg-slate-900 md:py-3.5 md:text-white">
                <ListaGuideAvatar
                  size="md"
                  alt="LISTA Guide assistant"
                  className="ring-slate-200 md:ring-white/25"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-tight tracking-tight">
                    LISTA Guide
                  </p>
                  <p className="text-xs text-slate-500 md:text-slate-300">
                    English · Tagalog · Bisaya
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:text-white md:hover:bg-white/15 md:hover:text-white"
                    onClick={resetChat}
                    aria-label="Start new conversation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:text-white md:hover:bg-white/15 md:hover:text-white"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-4">
                <ul className="space-y-3">
                  {messages.map((m, i) => {
                    const isUser = m.role === "user";
                    return (
                      <li
                        key={`${m.role}-${i}`}
                        className={cn(
                          "flex gap-2.5",
                          isUser ? "flex-row-reverse" : "flex-row justify-start",
                        )}
                      >
                        {isUser ? (
                          <div
                            aria-hidden
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white"
                          >
                            You
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            "max-w-[min(100%,calc(100vw-2rem))] rounded-2xl px-3.5 py-2.5 shadow-sm md:max-w-[20rem]",
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
                    <li className="flex justify-start">
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
                <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                className="flex shrink-0 gap-2 border-t border-slate-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
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

      {/* Hide FAB while panel is open — use header/overlay close; keeps Send fully tappable */}
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-[50] h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-slate-100 p-0 shadow-lg shadow-slate-900/20 hover:bg-slate-50",
          courseDetailStickyBar || traineePortal
            ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 max-lg:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-[max(1.25rem,env(safe-area-inset-bottom))] lg:right-6"
            : "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 md:right-6",
          open && "hidden",
        )}
        aria-expanded={open}
        aria-label={open ? "Close LISTA Guide" : "Open LISTA Guide"}
      >
        {open ? (
          <X className="h-6 w-6 text-slate-900" />
        ) : (
          <ListaGuideAvatar size="lg" className="h-full w-full" />
        )}
      </Button>
    </>
  );
}
