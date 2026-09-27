"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { getItem } from "@/lib/menu";
import { describeLine, formatMoney, unitPrice } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";
import { TrashIcon } from "./icons";
import { useOrderUI } from "./providers";
import { QtyStepper } from "./qty-stepper";

export function CartLineRow({ line, unavailable, compact = false }: { line: CartLine; unavailable?: boolean; compact?: boolean }) {
  const { openItem } = useOrderUI();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const item = getItem(line.itemId);

  if (!item) {
    return (
      <li className="flex items-center justify-between gap-3 py-4 text-sm">
        <span className="text-tomato">This item is no longer on the menu.</span>
        <button type="button" onClick={() => remove(line.lineId)} className="font-semibold underline">
          Remove
        </button>
      </li>
    );
  }

  const details = describeLine(item, line);
  const total = unitPrice(item, line.sizeId, line.selections) * line.quantity;

  return (
    <li className={clsx("flex gap-3 py-4", compact ? "sm:gap-3" : "sm:gap-4")} data-testid="cart-line">
      {!compact && (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cream sm:size-24">
          <Image src={item.image.src} alt="" fill sizes="96px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className={clsx("font-semibold leading-snug", compact ? "text-sm" : "text-base")}>{item.name}</h3>
          <span className={clsx("shrink-0 font-semibold tabular-nums", compact && "text-sm")}>{formatMoney(total)}</span>
        </div>
        {details.length > 0 && <p className="mt-0.5 text-sm text-muted">{details.join(" · ")}</p>}
        {line.notes && <p className="mt-0.5 text-sm italic text-ink-soft">“{line.notes}”</p>}
        {unavailable && (
          <p className="mt-1 text-sm font-semibold text-tomato">Only available {item.availability?.label ?? "on certain days"} — please remove.</p>
        )}
        <div className="mt-2.5 flex items-center gap-2">
          <QtyStepper value={line.quantity} onChange={(n) => setQuantity(line.lineId, n)} label={item.name} size="sm" />
          <button
            type="button"
            onClick={() => openItem(item.id, line.lineId)}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft hover:bg-cream"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => remove(line.lineId)}
            className="ml-auto grid size-8 place-items-center rounded-full text-muted hover:bg-cream hover:text-tomato"
            aria-label={`Remove ${item.name}`}
          >
            <TrashIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
