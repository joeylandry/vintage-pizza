import { CANNOLI_PRICE, getItem } from "./menu";
import { isAvailableNow } from "./hours";
import type { CartLine, Choice, MenuItem, OrderMode, Placement, Price, Selection, SizeId } from "./types";

/** All math is done in integer cents to avoid floating point drift. */
export const cents = (dollars: number) => Math.round(dollars * 100);

export const formatMoney = (c: number) =>
  (c < 0 ? "−$" : "$") + (Math.abs(c) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const MEALS_TAX_RATE = 0.085; // New Hampshire Meals & Rentals Tax
export const DELIVERY_FEE = cents(2.99);
export const FIVE_OFF_THRESHOLD = cents(50);
export const FIVE_OFF_AMOUNT = cents(5);

export function priceFor(price: Price | undefined, sizeId: SizeId | undefined): number {
  if (price === undefined) return 0;
  if (typeof price === "number") return cents(price);
  if (sizeId && price[sizeId] !== undefined) return cents(price[sizeId]);
  // Size not chosen yet: show the smallest price.
  return cents(Math.min(...Object.values(price)));
}

export function basePrice(item: MenuItem, sizeId?: SizeId): number {
  if (item.sizes?.length) {
    const size = item.sizes.find((s) => s.id === sizeId) ?? item.sizes[0];
    return cents(size.price);
  }
  return cents(item.price ?? 0);
}

/** Lowest price, used for "from $X" labels. */
export function startingPrice(item: MenuItem): number {
  if (item.sizes?.length) return Math.min(...item.sizes.map((s) => cents(s.price)));
  return cents(item.price ?? 0);
}

function findChoice(item: MenuItem, groupId: string, choiceId: string): Choice | undefined {
  return item.optionGroups.find((g) => g.id === groupId)?.choices.find((c) => c.id === choiceId);
}

export function unitPrice(item: MenuItem, sizeId: SizeId | undefined, selections: CartLine["selections"]): number {
  let total = basePrice(item, sizeId);
  for (const [groupId, picks] of Object.entries(selections)) {
    for (const pick of picks) {
      total += priceFor(findChoice(item, groupId, pick.choiceId)?.price, sizeId);
    }
  }
  return total;
}

export function defaultSelections(item: MenuItem): Record<string, Selection[]> {
  const out: Record<string, Selection[]> = {};
  for (const g of item.optionGroups) {
    out[g.id] = (g.defaults ?? []).map((choiceId) => ({ choiceId, ...(g.placement ? { placement: "whole" as const } : {}) }));
  }
  return out;
}

export function defaultSize(item: MenuItem): SizeId | undefined {
  // Pizzas default to large (the most-ordered size); other items to the first size.
  return item.sizes?.find((s) => s.id === "17")?.id ?? item.sizes?.[0]?.id;
}

/** Returns a map of groupId -> error message for unmet requirements. */
export function validate(item: MenuItem, sizeId: SizeId | undefined, selections: CartLine["selections"]) {
  const errors: Record<string, string> = {};
  if (item.sizes?.length && !item.sizes.some((s) => s.id === sizeId)) errors.size = "Choose a size";
  for (const g of item.optionGroups) {
    const n = selections[g.id]?.length ?? 0;
    if (n < g.min) errors[g.id] = g.min === 1 ? `Choose ${g.type === "single" ? "one" : "at least one"}` : `Choose at least ${g.min}`;
    else if (n > g.max) errors[g.id] = `Choose up to ${g.max}`;
  }
  return errors;
}

const PLACEMENT_LABEL: Record<Placement, string> = { whole: "", left: "left half", right: "right half" };

/** Human readable list of a line's choices, e.g. ["Large 17\"", "Pepperoni (left half)"]. */
export function describeLine(item: MenuItem, line: Pick<CartLine, "sizeId" | "selections">): string[] {
  const out: string[] = [];
  const size = item.sizes?.find((s) => s.id === line.sizeId);
  if (size) out.push(size.detail ? `${size.label} (${size.detail})` : size.label);
  for (const g of item.optionGroups) {
    const picks = line.selections[g.id] ?? [];
    for (const p of picks) {
      const c = g.choices.find((ch) => ch.id === p.choiceId);
      if (!c) continue;
      const where = p.placement ? PLACEMENT_LABEL[p.placement] : "";
      const prefix = g.id.startsWith("topping-") ? `${g.label.replace(" Topping", "")}: ` : g.id === "extra-dressing" ? "Extra " : "";
      out.push(`${prefix}${c.label}${where ? ` (${where})` : ""}`);
    }
  }
  return out;
}

/** Stable key so identical configurations merge into one cart line. */
export function lineKey(line: Pick<CartLine, "itemId" | "sizeId" | "selections" | "notes">): string {
  const sel = Object.keys(line.selections)
    .sort()
    .map((g) =>
      `${g}=${line.selections[g]
        .map((s) => `${s.choiceId}@${s.placement ?? ""}`)
        .sort()
        .join(",")}`,
    )
    .join(";");
  return `${line.itemId}|${line.sizeId ?? ""}|${sel}|${line.notes.trim()}`;
}

export type Promo = {
  id: "five-off" | "free-cannoli";
  label: string;
  /** Amount taken off the bill, in cents. */
  discount: number;
  /** Free cannoli added to the order. */
  freeCannoli: number;
};

export type OrderSummary = {
  itemCount: number;
  subtotal: number;
  promo: Promo | null;
  /** Explains why an offer isn't applied / how to unlock one. */
  promoNote: string | null;
  deliveryFee: number;
  tax: number;
  total: number;
  /** Lines that reference an unknown item or a deal not offered today. */
  unavailableLineIds: string[];
};

export function summarize(lines: CartLine[], mode: OrderMode, now: Date): OrderSummary {
  let subtotal = 0;
  let itemCount = 0;
  let hasDeal = false;
  let largeSpecialty = 0;
  const unavailableLineIds: string[] = [];

  for (const line of lines) {
    const item = getItem(line.itemId);
    if (!item) {
      unavailableLineIds.push(line.lineId);
      continue;
    }
    if (!isAvailableNow(item.availability, now)) unavailableLineIds.push(line.lineId);
    subtotal += unitPrice(item, line.sizeId, line.selections) * line.quantity;
    itemCount += line.quantity;
    if (item.deal) hasDeal = true;
    if (item.specialtyPizza && line.sizeId === "17") largeSpecialty += line.quantity;
  }

  // Offers can't be combined: specials exclude everything else, and otherwise
  // the customer gets whichever of the two standing offers is worth more.
  let promo: Promo | null = null;
  let promoNote: string | null = null;
  if (hasDeal) {
    if (subtotal >= FIVE_OFF_THRESHOLD || largeSpecialty > 0) {
      promoNote = "Weekday specials can't be combined with other offers.";
    }
  } else {
    const candidates: (Promo & { value: number })[] = [];
    if (subtotal >= FIVE_OFF_THRESHOLD) {
      candidates.push({ id: "five-off", label: "$5 off orders of $50+", discount: FIVE_OFF_AMOUNT, freeCannoli: 0, value: FIVE_OFF_AMOUNT });
    }
    if (largeSpecialty > 0) {
      candidates.push({
        id: "free-cannoli",
        label: `Free cannoli${largeSpecialty > 1 ? ` ×${largeSpecialty}` : ""} with large specialty pizza`,
        discount: 0,
        freeCannoli: largeSpecialty,
        value: largeSpecialty * cents(CANNOLI_PRICE),
      });
    }
    candidates.sort((a, b) => b.value - a.value);
    if (candidates[0]) {
      const { id, label, discount, freeCannoli } = candidates[0];
      promo = { id, label, discount, freeCannoli };
      if (candidates.length > 1) promoNote = "We applied your best offer — offers can't be combined.";
    } else if (subtotal > 0) {
      promoNote = `Add ${formatMoney(FIVE_OFF_THRESHOLD - subtotal)} more to get $5 off.`;
    }
  }

  const discount = promo?.discount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * MEALS_TAX_RATE);
  const deliveryFee = mode === "delivery" && lines.length > 0 ? DELIVERY_FEE : 0;
  return {
    itemCount,
    subtotal,
    promo,
    promoNote,
    deliveryFee,
    tax,
    total: taxable + tax + deliveryFee,
    unavailableLineIds,
  };
}
