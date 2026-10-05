import clsx from "clsx";
import { CheckIcon } from "./icons";

/** The online ordering flow, same order as the old Weborder site: details → menu → your order → checkout. */
const STEPS = ["Order details", "Menu", "Your order", "Checkout"] as const;

export type OrderStep = (typeof STEPS)[number];

export function OrderSteps({ current, className }: { current: OrderStep; className?: string }) {
  const at = STEPS.indexOf(current);
  return (
    <ol className={clsx("flex items-center gap-1.5 text-xs font-semibold sm:gap-2 sm:text-sm", className)} aria-label="Ordering steps">
      {STEPS.map((step, i) => (
        <li key={step} className="flex items-center gap-1.5 sm:gap-2" aria-current={i === at ? "step" : undefined}>
          {i > 0 && <span className={clsx("h-px w-3 sm:w-6", i <= at ? "bg-ink" : "bg-line")} aria-hidden />}
          <span
            className={clsx(
              "grid size-5 shrink-0 place-items-center rounded-full text-[11px] tabular-nums sm:size-6 sm:text-xs",
              i < at && "bg-basil text-white",
              i === at && "bg-tomato text-white",
              i > at && "border border-line text-muted",
            )}
            aria-hidden
          >
            {i < at ? <CheckIcon width={12} height={12} /> : i + 1}
          </span>
          <span className={clsx(i === at ? "text-ink" : "text-muted", i !== at && "max-sm:sr-only")}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
