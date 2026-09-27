"use client";

import { formatMoney } from "@/lib/pricing";
import type { OrderSummary } from "@/lib/pricing";
import { TagIcon } from "./icons";

export function SummaryRows({ summary, mode }: { summary: OrderSummary; mode: "pickup" | "delivery" }) {
  return (
    <dl className="space-y-2 text-sm">
      <Row label={`Subtotal (${summary.itemCount} ${summary.itemCount === 1 ? "item" : "items"})`} value={formatMoney(summary.subtotal)} />
      {summary.promo && (
        <div className="flex items-start justify-between gap-3 text-basil">
          <dt className="flex items-center gap-1.5 font-medium">
            <TagIcon width={15} height={15} /> {summary.promo.label}
          </dt>
          <dd className="font-semibold tabular-nums">
            {summary.promo.discount ? formatMoney(-summary.promo.discount) : "Free"}
          </dd>
        </div>
      )}
      {mode === "delivery" && <Row label="Delivery charge" value={formatMoney(summary.deliveryFee)} />}
      <Row label="NH meals tax (8.5%)" value={formatMoney(summary.tax)} />
      <div className="flex items-center justify-between border-t border-line pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums" data-testid="order-total">
          {formatMoney(summary.total)}
        </dd>
      </div>
      {summary.promoNote && <p className="rounded-xl bg-cream px-3 py-2 text-xs text-ink-soft">{summary.promoNote}</p>}
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
