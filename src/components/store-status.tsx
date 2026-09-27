"use client";

import clsx from "clsx";
import { FORCE_OPEN, getStoreStatus } from "@/lib/hours";
import { useNow } from "./use-now";

export function useStoreStatus() {
  const now = useNow();
  if (!now) return null;
  const status = getStoreStatus(now);
  return FORCE_OPEN && !status.open ? { ...status, open: true, label: "Open (demo mode)", detail: status.detail } : status;
}

export function StoreStatusBadge({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const status = useStoreStatus();
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        tone === "dark" ? "bg-white/10 text-cream" : "bg-cream text-ink-soft",
        !status && "invisible",
        className,
      )}
    >
      <span className="relative flex size-2">
        {status?.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={clsx("relative inline-flex size-2 rounded-full", status?.open ? "bg-emerald-400" : "bg-tomato")} />
      </span>
      {status?.label ?? "Checking hours"}
    </span>
  );
}
