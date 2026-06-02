import { useReducedMotion } from "framer-motion";

/** Respects prefers-reduced-motion for motion/react and framer-motion animations. */
export function useSafeMotion() {
  const prefersReduced = useReducedMotion();
  return {
    enabled: !prefersReduced,
    prefersReduced: !!prefersReduced,
  };
}
