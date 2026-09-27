"use client";

import { useEffect, useState } from "react";

/**
 * Current time, refreshed every 30s. Returns null during server render and
 * the first client render so time-dependent UI doesn't cause hydration mismatches.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}
