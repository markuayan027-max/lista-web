import { lazy, Suspense, useEffect, useState } from "react";

const SplashCursor = lazy(() => import("@/components/splash-cursor"));

function useSplashCursorEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointerMq = window.matchMedia("(pointer: fine)");
    const anyFinePointerMq = window.matchMedia("(any-pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      const finePointer = finePointerMq.matches || anyFinePointerMq.matches;
      setEnabled(finePointer && !motionMq.matches);
    };

    sync();
    finePointerMq.addEventListener("change", sync);
    anyFinePointerMq.addEventListener("change", sync);
    motionMq.addEventListener("change", sync);
    return () => {
      finePointerMq.removeEventListener("change", sync);
      anyFinePointerMq.removeEventListener("change", sync);
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
    // Mount soon after gate passes — idle deferral made the effect easy to miss.
    const t = window.setTimeout(() => setMount(true), 100);
    return () => window.clearTimeout(t);
  }, [enabled]);

  if (!enabled || !mount) return null;

  return (
    <Suspense fallback={null}>
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR="#2563eb"
        TRANSPARENT
        DYE_RESOLUTION={720}
        SPLAT_FORCE={5500}
      />
    </Suspense>
  );
}
