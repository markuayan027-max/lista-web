import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealFrom = "bottom" | "left" | "right" | "scale";

type RevealProps = {
  children: ReactNode;
  className?: string;
  from?: RevealFrom;
  delay?: number;
  duration?: number;
  /** When true, plays when scrolled into view (once). */
  inView?: boolean;
  as?: "div" | "section" | "header" | "button";
};

function useInViewOnce(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  return { ref, visible };
}

export function Reveal({
  children,
  className,
  from = "bottom",
  delay = 0,
  duration,
  inView = false,
  as: Tag = "div",
}: RevealProps) {
  const { ref, visible } = useInViewOnce(inView);
  const style: CSSProperties = {
    animationDelay: delay ? `${delay}ms` : undefined,
    animationDuration: duration ? `${duration}ms` : undefined,
  };

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "lista-reveal",
        `lista-reveal--${from}`,
        visible && "lista-reveal--active",
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}

export function RevealStagger({
  children,
  className,
  staggerMs = 100,
  inView = true,
}: {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
  inView?: boolean;
}) {
  const { ref, visible } = useInViewOnce(inView);

  return (
    <div
      ref={ref as never}
      className={cn(
        "lista-stagger",
        visible && "lista-stagger--active",
        className,
      )}
      style={{ "--lista-stagger-step": `${staggerMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function RevealStaggerItem({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn("lista-stagger__item", className)}
      style={{ "--lista-stagger-i": index } as CSSProperties}
    >
      {children}
    </div>
  );
}
