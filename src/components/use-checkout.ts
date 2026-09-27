"use client";

import { isAddressComplete, useCart } from "@/lib/cart-store";
import { summarize } from "@/lib/pricing";
import { useStoreStatus } from "./store-status";
import { useNow } from "./use-now";

/** Order totals plus everything that currently prevents checking out. */
export function useCheckout() {
  const lines = useCart((s) => s.lines);
  const mode = useCart((s) => s.mode);
  const address = useCart((s) => s.address);
  const now = useNow();
  const status = useStoreStatus();
  // Before the clock is known, assume "now" = epoch only for totals; availability checks are skipped.
  const summary = summarize(lines, mode, now ?? new Date(0));
  const unavailable = now ? summary.unavailableLineIds : [];

  const blockers: string[] = [];
  if (lines.length === 0) blockers.push("Your order is empty.");
  if (status && !status.open) blockers.push(status.detail);
  if (unavailable.length) blockers.push("Remove the items that aren't available today.");
  if (mode === "delivery" && !isAddressComplete(address)) blockers.push("Add your delivery address.");

  return { lines, mode, summary: { ...summary, unavailableLineIds: unavailable }, blockers, canCheckout: !!now && blockers.length === 0 };
}
