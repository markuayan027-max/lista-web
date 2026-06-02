import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HomepageChat = lazy(() => import("@/components/homepage-chat"));

type Props = {
  programCount?: number;
};

function ChatFab({
  busy,
  onClick,
  className,
}: {
  busy?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "fixed z-50 h-14 w-14 rounded-full bg-blue-700 shadow-lg shadow-blue-900/20 hover:bg-blue-800",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 md:right-6",
        className,
      )}
      aria-label={busy ? "Loading LISTA Guide" : "Open LISTA Guide"}
    >
      {busy ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      ) : (
        <MessageCircle className="h-6 w-6" aria-hidden />
      )}
    </Button>
  );
}

/** Loads framer-motion chat bundle after idle or first FAB click — not on initial public paint. */
export default function HomepageChatDeferred({ programCount }: Props) {
  const [location] = useLocation();
  const path = (location.split("?")[0] ?? "").trim();
  const traineePortal = /^\/trainee(\/|$)/.test(path);
  const [loadChat, setLoadChat] = useState(false);
  const [prefetching, setPrefetching] = useState(false);

  const activate = useCallback(() => {
    setLoadChat(true);
    setPrefetching(true);
  }, []);

  useEffect(() => {
    const prefetch = () => {
      void import("@/components/homepage-chat").finally(() => setPrefetching(false));
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(
        () => {
          prefetch();
          setLoadChat(true);
        },
        { timeout: 4000 },
      );
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(() => {
      prefetch();
      setLoadChat(true);
    }, 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (!loadChat) {
    return (
      <ChatFab
        onClick={activate}
        busy={prefetching}
        className={traineePortal ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))]" : undefined}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <ChatFab
          onClick={() => {}}
          busy
          className={traineePortal ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))]" : undefined}
        />
      }
    >
      <HomepageChat programCount={programCount} />
    </Suspense>
  );
}
