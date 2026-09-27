"use client";

import clsx from "clsx";
import Link from "next/link";
import { storeClock } from "@/lib/hours";
import { useNow } from "./use-now";

const DEALS = [
  { days: [1, 2], when: "Mon & Tue", lines: [["Large cheese", "$9.99"], ["Large 1-topping", "$11.99"]], note: "1-topping deal is online only" },
  { days: [3, 4], when: "Wed & Thu", lines: [["2 large cheese", "$19.99"], ["2 large 1-topping", "$23.99"]] },
  { days: [], when: "Every day", lines: [["$5 off", "orders $50+"]] },
  { days: [], when: "Every day", lines: [["Free cannoli", "with any large specialty pizza"]] },
];

export function Deals() {
  const now = useNow();
  const today = now ? storeClock(now).day : -1;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {DEALS.map((d, i) => {
        const live = d.days.includes(today);
        return (
          <Link
            key={i}
            href="/order#specials"
            className={clsx(
              "group relative flex flex-col rounded-3xl border-2 border-dashed p-5 transition hover:-translate-y-0.5",
              live ? "border-gold bg-ink text-cream" : "border-cream/25 bg-white/5 text-cream",
            )}
          >
            <span className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-gold">{d.when}</span>
              {live && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold uppercase text-ink">Today</span>}
            </span>
            <span className="mt-3 space-y-1.5">
              {d.lines.map(([a, b]) => (
                <span key={a} className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-xl font-semibold uppercase leading-tight">{a}</span>
                  <span className="text-right font-semibold text-cream/90">{b}</span>
                </span>
              ))}
            </span>
            {d.note && <span className="mt-2 text-xs text-cream/60">{d.note}</span>}
            <span className="mt-auto pt-3 text-xs text-cream/50">Can&apos;t be combined with other offers</span>
          </Link>
        );
      })}
    </div>
  );
}
