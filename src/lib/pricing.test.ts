import { describe, expect, it } from "vitest";
import { getStoreStatus, isAvailableNow, storeClock } from "./hours";
import { categories, getItem, menu } from "./menu";
import {
  defaultSelections,
  defaultSize,
  describeLine,
  formatMoney,
  lineKey,
  summarize,
  unitPrice,
  validate,
} from "./pricing";
import type { CartLine } from "./types";

// Fixed instants in store time (America/New_York, EDT = UTC-4 in September).
const SAT_NOON = new Date("2026-09-26T16:00:00Z");
const SAT_10PM = new Date("2026-09-27T02:00:00Z");
const SUN_NOON = new Date("2026-09-27T16:00:00Z");
const MON_10AM = new Date("2026-09-28T14:00:00Z");
const MON_NOON = new Date("2026-09-28T16:00:00Z");
const MON_8PM = new Date("2026-09-29T00:00:00Z");
const WED_NOON = new Date("2026-09-30T16:00:00Z");
const FRI_830PM = new Date("2026-10-03T00:30:00Z");

let n = 0;
const line = (itemId: string, extra: Partial<CartLine> = {}): CartLine => ({
  lineId: `l${n++}`,
  itemId,
  sizeId: getItem(itemId)?.sizes ? defaultSize(getItem(itemId)!) : undefined,
  selections: {},
  quantity: 1,
  notes: "",
  ...extra,
});

describe("menu data", () => {
  it("has unique item ids", () => {
    const ids = menu.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts every item in a known category and every category has items", () => {
    const catIds = new Set(categories.map((c) => c.id));
    for (const m of menu) expect(catIds.has(m.categoryId), m.id).toBe(true);
    for (const c of categories) expect(menu.some((m) => m.categoryId === c.id), c.id).toBe(true);
  });

  it("gives every item a price", () => {
    for (const m of menu) {
      const has = m.price !== undefined || (m.sizes?.length ?? 0) > 0;
      expect(has, m.id).toBe(true);
    }
  });

  it("has unique choice ids inside every option group", () => {
    for (const m of menu)
      for (const g of m.optionGroups) {
        const ids = g.choices.map((c) => c.id);
        expect(new Set(ids).size, `${m.id}/${g.id}`).toBe(ids.length);
      }
  });

  it("matches printed menu prices", () => {
    expect(unitPrice(getItem("classic-cheese")!, "13", {})).toBe(1099);
    expect(unitPrice(getItem("classic-cheese")!, "17", {})).toBe(1599);
    expect(unitPrice(getItem("honey-boy")!, "17", {})).toBe(2299);
    expect(unitPrice(getItem("vegetarian-pizza")!, "13", {})).toBe(1450);
    expect(unitPrice(getItem("chicken-tenders")!, "lg", {})).toBe(1699);
    expect(unitPrice(getItem("steak-combo-sub")!, undefined, {})).toBe(1399);
    expect(unitPrice(getItem("chicken-tender-party-tray")!, undefined, {})).toBe(4999);
  });
});

describe("unitPrice", () => {
  const cheese = getItem("classic-cheese")!;

  it("charges toppings by size", () => {
    const sel = { toppings: [{ choiceId: "pepperoni", placement: "whole" as const }, { choiceId: "mushroom", placement: "left" as const }] };
    expect(unitPrice(cheese, "13", sel)).toBe(1099 + 125 * 2);
    expect(unitPrice(cheese, "17", sel)).toBe(1599 + 225 * 2);
  });

  it("charges chicken, steak and the garlic cup", () => {
    const sel = {
      protein: [{ choiceId: "grilled-chicken", placement: "whole" as const }, { choiceId: "steak", placement: "whole" as const }],
      sides: [{ choiceId: "garlic-butter-cup" }],
    };
    expect(unitPrice(cheese, "13", sel)).toBe(1099 + 300 + 400 + 89);
    expect(unitPrice(cheese, "17", sel)).toBe(1599 + 400 + 600 + 89);
  });

  it("charges extra dressing at 79¢ and the included dressing free", () => {
    const greek = getItem("greek-salad")!;
    expect(
      unitPrice(greek, undefined, {
        dressing: [{ choiceId: "house-greek" }],
        "extra-dressing": [{ choiceId: "house-greek" }, { choiceId: "fresh-ranch" }],
      }),
    ).toBe(1199 + 79 * 2);
  });

  it("keeps sub fixings free", () => {
    const sub = getItem("italian-sub")!;
    expect(unitPrice(sub, undefined, { fixings: [{ choiceId: "lettuce" }, { choiceId: "hots" }] })).toBe(1149);
  });

  it("ignores unknown choice ids", () => {
    expect(unitPrice(cheese, "13", { toppings: [{ choiceId: "gold-leaf" }] })).toBe(1099);
  });
});

describe("validate", () => {
  it("requires a dressing on salads that include one", () => {
    const salad = getItem("garden-salad")!;
    expect(validate(salad, undefined, defaultSelections(salad))).toHaveProperty("dressing");
    expect(validate(salad, undefined, { dressing: [{ choiceId: "italian" }] })).toEqual({});
  });

  it("does not require a dressing on Caesar salads", () => {
    const caesar = getItem("caesar-salad")!;
    expect(validate(caesar, undefined, defaultSelections(caesar))).toEqual({});
  });

  it("requires a topping for each pizza in the one-topping deals", () => {
    const deal = getItem("deal-two-large-one-topping")!;
    const errs = validate(deal, undefined, { "topping-1": [{ choiceId: "bacon" }] });
    expect(Object.keys(errs)).toEqual(["topping-2"]);
  });

  it("requires a valid size", () => {
    const cheese = getItem("classic-cheese")!;
    expect(validate(cheese, "99", {})).toHaveProperty("size");
    expect(validate(cheese, "13", {})).toEqual({});
  });

  it("defaults subs to a sub roll", () => {
    const sub = getItem("italian-sub")!;
    expect(defaultSelections(sub).bread).toEqual([{ choiceId: "sub-roll" }]);
    expect(validate(sub, undefined, defaultSelections(sub))).toEqual({});
  });
});

describe("describeLine / lineKey", () => {
  it("describes size, halves and extras", () => {
    const cheese = getItem("classic-cheese")!;
    expect(
      describeLine(cheese, {
        sizeId: "17",
        selections: { toppings: [{ choiceId: "pepperoni", placement: "left" }, { choiceId: "onion", placement: "whole" }] },
      }),
    ).toEqual(['Large 17"', "Pepperoni (left half)", "Onion"]);
  });

  it("labels each pizza's topping in the two-pizza deal", () => {
    const deal = getItem("deal-two-large-one-topping")!;
    expect(
      describeLine(deal, { selections: { "topping-1": [{ choiceId: "bacon" }], "topping-2": [{ choiceId: "ham" }] } }),
    ).toEqual(["Pizza #1: Bacon", "Pizza #2: Ham"]);
  });

  it("is independent of selection order", () => {
    const a = line("classic-cheese", { selections: { toppings: [{ choiceId: "a" }, { choiceId: "b" }] } });
    const b = line("classic-cheese", { selections: { toppings: [{ choiceId: "b" }, { choiceId: "a" }] } });
    expect(lineKey(a)).toBe(lineKey(b));
    expect(lineKey(a)).not.toBe(lineKey({ ...a, notes: "well done" }));
  });
});

describe("summarize", () => {
  it("returns zeros for an empty cart", () => {
    const s = summarize([], "delivery", MON_NOON);
    expect(s).toMatchObject({ subtotal: 0, tax: 0, deliveryFee: 0, total: 0, promo: null, promoNote: null });
  });

  it("adds 8.5% NH meals tax and the delivery fee (untaxed)", () => {
    const s = summarize([line("french-fries", { quantity: 2 })], "delivery", MON_NOON);
    expect(s.subtotal).toBe(1398);
    expect(s.tax).toBe(119); // 13.98 * 0.085 = 1.1883
    expect(s.deliveryFee).toBe(299);
    expect(s.total).toBe(1398 + 119 + 299);
    expect(s.promoNote).toBe("Add $36.02 more to get $5 off.");
  });

  it("charges no delivery fee for pickup", () => {
    expect(summarize([line("cannoli")], "pickup", MON_NOON).deliveryFee).toBe(0);
  });

  it("takes $5 off at $50 (before tax)", () => {
    const s = summarize([line("chicken-tender-party-tray"), line("cannoli")], "pickup", MON_NOON);
    expect(s.subtotal).toBe(5348);
    expect(s.promo?.id).toBe("five-off");
    expect(s.tax).toBe(Math.round((5348 - 500) * 0.085));
    expect(s.total).toBe(5348 - 500 + s.tax);
  });

  it("does not take $5 off at $49.99", () => {
    const s = summarize([line("french-fries"), line("chicken-tender-party-tray")], "pickup", MON_NOON);
    expect(s.subtotal).toBeGreaterThan(5000);
    const s2 = summarize([line("chicken-tender-party-tray")], "pickup", MON_NOON);
    expect(s2.subtotal).toBe(4999);
    expect(s2.promo).toBeNull();
  });

  it("gives a free cannoli per large specialty pizza, but not for smalls", () => {
    const small = summarize([line("honey-boy", { sizeId: "13" })], "pickup", MON_NOON);
    expect(small.promo).toBeNull();
    const large = summarize([line("honey-boy", { sizeId: "17", quantity: 2 })], "pickup", MON_NOON);
    expect(large.promo).toMatchObject({ id: "free-cannoli", freeCannoli: 2, discount: 0 });
  });

  it("applies only the better offer when both qualify", () => {
    // 1 large specialty (cannoli worth $3.49) + $50 subtotal -> $5 off wins.
    const one = summarize([line("honey-boy", { sizeId: "17" }), line("chicken-tender-party-tray")], "pickup", MON_NOON);
    expect(one.promo?.id).toBe("five-off");
    expect(one.promoNote).toMatch(/best offer/);
    // 2 large specialty ($6.98 of cannoli) beats $5 off.
    const two = summarize([line("honey-boy", { sizeId: "17", quantity: 3 })], "pickup", MON_NOON);
    expect(two.subtotal).toBeGreaterThanOrEqual(5000);
    expect(two.promo?.id).toBe("free-cannoli");
    expect(two.promo?.discount).toBe(0);
  });

  it("does not combine weekday specials with other offers", () => {
    const s = summarize(
      [line("deal-large-cheese"), line("chicken-tender-party-tray"), line("honey-boy", { sizeId: "17" })],
      "pickup",
      MON_NOON,
    );
    expect(s.promo).toBeNull();
    expect(s.promoNote).toMatch(/can't be combined/);
  });

  it("flags specials that aren't offered today", () => {
    const monDeal = line("deal-large-cheese");
    const wedDeal = line("deal-two-large-cheese");
    expect(summarize([monDeal, wedDeal], "pickup", MON_NOON).unavailableLineIds).toEqual([wedDeal.lineId]);
    expect(summarize([monDeal, wedDeal], "pickup", WED_NOON).unavailableLineIds).toEqual([monDeal.lineId]);
  });

  it("flags lines for items that no longer exist", () => {
    const ghost = line("discontinued-thing");
    const s = summarize([ghost, line("cannoli")], "pickup", MON_NOON);
    expect(s.unavailableLineIds).toEqual([ghost.lineId]);
    expect(s.subtotal).toBe(349);
  });
});

describe("store hours", () => {
  it("reads the clock in store time", () => {
    expect(storeClock(MON_NOON)).toEqual({ day: 1, hour: 12 });
    expect(storeClock(SAT_10PM)).toEqual({ day: 6, hour: 22 });
  });

  it("knows when the store is open", () => {
    expect(getStoreStatus(MON_NOON).open).toBe(true);
    expect(getStoreStatus(SAT_NOON).label).toBe("Open until 9 PM");
    expect(getStoreStatus(FRI_830PM).open).toBe(true);
    expect(getStoreStatus(MON_8PM).open).toBe(false); // closes at 8 Mon–Thu
  });

  it("says when it opens next", () => {
    expect(getStoreStatus(MON_10AM).label).toBe("Closed · opens today at 11 AM");
    expect(getStoreStatus(MON_8PM).label).toBe("Closed · opens tomorrow at 11 AM");
    expect(getStoreStatus(SAT_10PM).label).toBe("Closed · opens Monday at 11 AM"); // Sunday closed
    expect(getStoreStatus(SUN_NOON).label).toBe("Closed · opens tomorrow at 11 AM");
  });

  it("limits specials to their days", () => {
    const monTue = getItem("deal-large-cheese")!.availability;
    expect(isAvailableNow(monTue, MON_NOON)).toBe(true);
    expect(isAvailableNow(monTue, WED_NOON)).toBe(false);
    expect(isAvailableNow(undefined, SUN_NOON)).toBe(true);
  });
});

describe("formatMoney", () => {
  it("formats cents", () => {
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(1099)).toBe("$10.99");
    expect(formatMoney(-500)).toBe("−$5.00");
    expect(formatMoney(123456)).toBe("$1,234.56");
  });
});

describe("menu images", () => {
  it("has an image file for every item", async () => {
    const { existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const missing = menu.filter((m) => !existsSync(join(process.cwd(), "public", m.image.src)));
    expect(missing.map((m) => m.id)).toEqual([]);
  });
});
