import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const MOBILE_MQ = "(max-width: 767px)";
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

type ScrollParallaxProps = {
  children?: ReactNode;
  className?: string;
  /** Scroll multiplier — 0.05 ≈ Elementor vertical speed 5, 0.02 ≈ speed 2 */
  speed?: number;
  as?: ElementType;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
};

function motionAllowed() {
  if (typeof window === "undefined") return false;
  return (
    !window.matchMedia(MOBILE_MQ).matches &&
    !window.matchMedia(REDUCED_MQ).matches
  );
}

export default function ScrollParallax({
  children,
  className,
  speed = 0.05,
  as: Tag = "div",
  style,
  "aria-hidden": ariaHidden,
}: ScrollParallaxProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(motionAllowed());
    sync();

    const mobileMq = window.matchMedia(MOBILE_MQ);
    const reducedMq = window.matchMedia(REDUCED_MQ);
    mobileMq.addEventListener("change", sync);
    reducedMq.addEventListener("change", sync);
    return () => {
      mobileMq.removeEventListener("change", sync);
      reducedMq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      setOffsetY(0);
      return;
    }

    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (vh * 0.5 - rect.top - rect.height * 0.5) / vh;
      setOffsetY(progress * speed * 100);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, speed]);

  const mergedStyle: CSSProperties = active
    ? {
        ...(style ?? {}),
        transform: `translate3d(0, ${offsetY}px, 0)`,
        willChange: "transform",
      }
    : (style ?? {});

  return (
    <Tag
      ref={rootRef as never}
      data-parallax={active ? "" : undefined}
      className={cn("scroll-parallax-layer", className)}
      style={mergedStyle}
      aria-hidden={ariaHidden}
    >
      {children}
    </Tag>
  );
}
