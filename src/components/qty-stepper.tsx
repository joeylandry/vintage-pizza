"use client";

import clsx from "clsx";
import { MAX_QTY } from "@/lib/cart-store";
import { MinusIcon, PlusIcon } from "./icons";

export function QtyStepper({
  value,
  onChange,
  label,
  size = "md",
  min = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
  min?: number;
}) {
  const btn = clsx(
    "grid place-items-center rounded-full text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-white"
      role="group"
      aria-label={`Quantity for ${label}`}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <MinusIcon width={16} height={16} />
      </button>
      <span className={clsx("text-center font-semibold tabular-nums", size === "sm" ? "w-6 text-sm" : "w-8")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Increase quantity">
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
