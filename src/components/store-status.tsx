"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FORCE_OPEN, getStoreStatus, HOURS_DISPLAY, storeClock } from "@/lib/hours";
import { fullAddress, SITE } from "@/lib/site";
import { useNow } from "./use-now";

export function useStoreStatus() {
  const now = useNow();
  if (!now) return null;
  const status = getStoreStatus(now);
  return FORCE_OPEN && !status.open ? { ...status, open: true, label: "Open (demo mode)", detail: status.detail } : status;
}

/** Which HOURS_DISPLAY row covers a weekday (0 = Sunday). */
const displayRow = (day: number) => (day === 0 ? 2 : day >= 5 ? 1 : 0);

/** Open/closed pill. Click it to expand the week's hours and address. */
export function StoreStatusBadge({
  className,
  tone = "dark",
  align = "center",
}: {
  className?: string;
  tone?: "dark" | "light";
  /** Where the hours panel lines up under the pill. */
  align?: "center" | "start";
}) {
  const now = useNow();
  const status = useStoreStatus();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = now ? displayRow(storeClock(now).day) : -1;

  return (
    <div ref={ref} className={clsx("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={clsx(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs sm:gap-2 sm:px-3 font-semibold transition",
          tone === "dark" ? "bg-white/10 text-cream hover:bg-white/15" : "bg-cream text-ink-soft hover:bg-line",
          !status && "invisible",
        )}
      >
        <span className="relative flex size-2">
          {status?.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
          <span className={clsx("relative inline-flex size-2 rounded-full", status?.open ? "bg-emerald-400" : "bg-tomato")} />
        </span>
        {status ? (
          <span>
            {/* "Closed · opens …" is too long for the phone header; the panel has the hours. */}
            {status.label.split(" · ")[0]}
            {status.label.includes(" · ") && <span className="hidden sm:inline"> · {status.label.split(" · ").slice(1).join(" · ")}</span>}
          </span>
        ) : (
          "Checking hours"
        )}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={clsx("hidden transition sm:block", open && "rotate-180")}>
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          className={clsx(
            "animate-fade-in absolute top-full z-50 mt-2 w-72 rounded-2xl bg-paper p-4 text-left text-sm text-ink shadow-lift ring-1 ring-line",
            align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
          )}
        >
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tomato">Hours</p>
          <dl className="mt-2 space-y-1">
            {HOURS_DISPLAY.map((h, i) => (
              <div key={h.days} className={clsx("flex justify-between gap-3", i === today ? "font-semibold" : "text-muted")}>
                <dt className="whitespace-nowrap">{h.days}</dt>
                <dd className="whitespace-nowrap">{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-muted">{fullAddress}</p>
          <div className="mt-2 flex items-center justify-between gap-3 font-semibold">
            <a href={SITE.phoneHref} className="hover:underline">
              {SITE.phone}
            </a>
            <Link href="/#visit" onClick={() => setOpen(false)} className="text-tomato hover:underline">
              Directions →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
