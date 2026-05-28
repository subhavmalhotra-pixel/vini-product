import { useEffect, useState } from "react";
import { getCurrentUserId, getUser, setCurrentUserId, subscribe } from "./store";
import type { User } from "@test-data";

/**
 * Tiny hook that re-renders the component whenever the mock store mutates.
 * Replace with React Query / SWR / Zustand when wiring real backend.
 */
export function useStore(): number {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return 0;
}

/**
 * Active user — reactive to the persona switcher.
 * Returns the live User object + a setter that updates localStorage.
 */
export function useCurrentUser(): {
  user: User | undefined;
  userId: string;
  setUserId: (id: string) => void;
} {
  useStore(); // re-render on any store change
  const userId = getCurrentUserId();
  return {
    user: getUser(userId),
    userId,
    setUserId: setCurrentUserId,
  };
}
