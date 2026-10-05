"use client";

import clsx from "clsx";
import Link from "next/link";
import { storeClock } from "@/lib/hours";
import { useNow } from "./use-now";

const DEALS = [
  { days: [1, 2], when: "Mon & Tue", lines: [["Large cheese", "$9.99"], ["Large 1-topping", "$11.99"]], note: "1-topping online only" },
  { days: [3, 4], when: "Wed & Thu", lines: [["2 large cheese", "$19.99"], ["2 large 1-topping", "$23.99"]] },
  { days: [], when: "Every day", lines: [["$5 off", "orders $50+"]] },
  { days: [], when: "Every day", lines: [["Free cannoli", "w/ large specialty pizza"]] },
];

export function Deals() {
  const now = useNow();
  const today = now ? storeClock(now).day : -1;
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {DEALS.map((d, i) => {
        const live = d.days.includes(today);
        return (
          <Link
            key={i}
            href="/order#specials"
            className={clsx(
              "flex flex-col rounded-2xl border bg-white px-3.5 py-3 text-sm transition hover:border-ink/30",
              live ? "border-tomato ring-1 ring-tomato" : "border-line",
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-tomato">{d.when}</span>
              {live && <span className="rounded-full bg-tomato px-2 py-0.5 text-[10px] font-bold uppercase text-white">Today</span>}
            </span>
            <span className="mt-1.5 space-y-0.5">
              {d.lines.map(([a, b]) => (
                <span key={a} className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="font-semibold">{a}</span>
                  <span className="text-muted tabular-nums">{b}</span>
                </span>
              ))}
            </span>
            {d.note && <span className="mt-1 text-[11px] text-muted">{d.note}</span>}
          </Link>
        );
      })}
    </div>
  );
}
