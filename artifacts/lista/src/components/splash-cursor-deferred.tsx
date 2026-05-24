import { lazy, Suspense, useEffect, useState } from "react";

const SplashCursor = lazy(() => import("@/components/splash-cursor"));

function useSplashCursorEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setEnabled(hoverMq.matches && !motionMq.matches);
    };

    sync();
    hoverMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);
    return () => {
      hoverMq.removeEventListener("change", sync);
      motionMq.removeEventListener("change", sync);
    };
  }, []);

  return enabled;
}

/** WebGL fluid cursor — lazy-loaded on desktop pointer devices only. */
export default function SplashCursorDeferred() {
  const enabled = useSplashCursorEnabled();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setMount(false);
      return;
    }
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setMount(true), { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(() => setMount(true), 1500);
    return () => window.clearTimeout(t);
  }, [enabled]);

  if (!enabled || !mount) return null;

  return (
    <Suspense fallback={null}>
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR="#2563eb"
        TRANSPARENT
        DYE_RESOLUTION={640}
        SPLAT_FORCE={3000}
      />
    </Suspense>
  );
}
