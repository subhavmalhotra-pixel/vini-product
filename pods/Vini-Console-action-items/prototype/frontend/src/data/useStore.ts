import { useEffect, useState } from "react";
import { subscribe } from "./store";

/**
 * Tiny hook that re-renders the component whenever the mock store mutates.
 * Replace with React Query / SWR / Zustand when wiring real backend.
 */
export function useStore(): number {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return 0;
}
