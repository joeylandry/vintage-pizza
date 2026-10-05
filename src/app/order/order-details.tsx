"use client";

import clsx from "clsx";
import { useState } from "react";
import { ArrowRightIcon, CarIcon, ClockIcon, StoreIcon } from "@/components/icons";
import { DeliveryAddressFields, PickupInfo } from "@/components/order-mode";
import { OrderSteps } from "@/components/order-steps";
import { useStoreStatus } from "@/components/store-status";
import { isAddressComplete, useCart } from "@/lib/cart-store";
import { HOURS_DISPLAY } from "@/lib/hours";
import { SITE } from "@/lib/site";

const MODES = [
  { id: "pickup", label: "Pickup", detail: "Ready at 241 Candia Rd", icon: StoreIcon },
  { id: "delivery", label: "Delivery", detail: "$2.99 delivery charge", icon: CarIcon },
] as const;

/** Step 1 of online ordering, like the old site's "Order Details" page: pickup or delivery, then the menu. */
export function OrderDetailsStep() {
  const mode = useCart((s) => s.mode);
  const setMode = useCart((s) => s.setMode);
  const address = useCart((s) => s.address);
  const confirm = useCart((s) => s.setDetailsConfirmed);
  const status = useStoreStatus();
  const [tried, setTried] = useState(false);
  const missingAddress = mode === "delivery" && !isAddressComplete(address);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <OrderSteps current="Order details" />
        <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">Order details</h1>
        <p className="mt-2 text-muted">How would you like to get your order?</p>

        {status && !status.open && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-tomato/20 bg-tomato/5 px-4 py-3 text-sm" role="status">
            <ClockIcon className="mt-0.5 shrink-0 text-tomato" width={18} height={18} />
            <p>
              <span className="font-semibold">{status.detail}</span> You can still build your order now.
            </p>
          </div>
        )}

        <form
          className="mt-6 rounded-3xl border border-line bg-white p-4 shadow-card sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (missingAddress) return;
            confirm(true);
            window.scrollTo({ top: 0 });
          }}
        >
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Order type">
            {MODES.map((m) => {
              const on = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMode(m.id)}
                  className={clsx(
                    "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-5 text-center transition",
                    on ? "border-tomato bg-tomato/5" : "border-line hover:border-ink/30",
                  )}
                >
                  <m.icon width={28} height={28} className={on ? "text-tomato" : "text-muted"} />
                  <span className="font-display text-xl font-semibold uppercase tracking-wide">{m.label}</span>
                  <span className="text-xs text-muted">{m.detail}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">{mode === "pickup" ? <PickupInfo /> : <DeliveryAddressFields />}</div>
          {tried && missingAddress && (
            <p className="mt-3 text-sm font-semibold text-tomato" role="alert">
              Add your delivery address to continue.
            </p>
          )}

          <button
            type="submit"
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-tomato text-lg font-semibold text-white shadow-lift transition hover:bg-tomato-dark"
          >
            Continue to menu <ArrowRightIcon />
          </button>
        </form>

        <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
          <dl className="space-y-1">
            {HOURS_DISPLAY.map((h) => (
              <div key={h.days} className="flex justify-between gap-4">
                <dt className="text-muted">{h.days}</dt>
                <dd className="font-semibold tabular-nums">{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted">
            Ordering for a specific time, or a big order? Call us at{" "}
            <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-2">
              {SITE.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
