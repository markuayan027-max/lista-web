import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

export function useCardPointerGlow(enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !canHover) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setActive(true);
    },
    [canHover, enabled],
  );

  const onLeave = useCallback(() => setActive(false), []);

  return {
    ref,
    active: enabled && canHover && active,
    pos,
    onMove,
    onLeave,
    canHover: enabled && canHover,
  };
}
