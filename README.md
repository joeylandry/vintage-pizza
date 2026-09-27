# Vintage Pizza — website & online ordering

A redesign of [vintagepizzanh.com](https://www.vintagepizzanh.com) and its online ordering flow, built with
Next.js 16 (App Router), React 19, Tailwind CSS 4 and Zustand.

It covers everything a customer does **up to the Checkout button**: browsing, customizing items,
pickup vs. delivery, the cart, deals, tax and totals. `/checkout` is a placeholder where payment and
POS submission get wired in.

## What's in it

| Page | What it does |
| --- | --- |
| `/` | Hero, weekly deals (today's deal highlighted), popular picks you can add straight from the page, the story, photos, hours, map |
| `/order` | Full menu with sticky category bar + scrollspy, search, pickup/delivery picker, live order sidebar (desktop) or sticky order bar (mobile) |
| `/cart` | Edit/merge/remove lines, quantity, kitchen notes, add-on suggestions, pickup/delivery + address, totals, Checkout button |
| `/checkout` | Placeholder for the payment step |

Ordering features carried over from the old site, now in one place:

- **Pickup or delivery** — $2.99 delivery charge; address required before checkout.
- **Pizza builder** — 13" / 17", 22 toppings priced by size ($1.25 / $2.25), each on the whole pie, left half or right half; add grilled/fried chicken or steak; garlic butter cup.
- **Subs & Syrian wraps** — sub roll or Syrian wrap, free fixings (cheese, lettuce, tomatoes, pickles, onions, hots, mayo, oil).
- **Salads** — required dressing choice, extra dressing at $0.79.
- **Tenders & wings** — small/large sizes.
- **Weekday specials** — Mon & Tue large cheese $9.99 / large 1-topping $11.99; Wed & Thu two large cheese $19.99 / two large 1-topping $23.99. Only orderable on their days (store time).
- **Offers** — $5 off $50+, free cannoli with each large specialty pizza. Offers can't be combined: specials exclude other offers, otherwise the customer automatically gets whichever offer is worth more.
- **NH meals tax** (8.5%) added to food after discounts.
- **Store hours** (Mon–Thu 11–8, Fri–Sat 11–9, Sun closed, America/New_York). Customers can build an order while closed; checkout unlocks when the store opens. Specific pickup times still go through the phone, as before.
- Special instructions per item, order notes, the cart persists across reloads (localStorage).

## Menu data & images

- Menu and prices: [`src/lib/menu.ts`](src/lib/menu.ts), transcribed from the September 2025 PDF menu. Where the website's
  "Popular Picks" prices disagreed with the PDF, the PDF (newer) was used.
- Photos: real Vintage Pizza photos from the current website and the PDF menu are used for the dishes they show
  (`PHOTO_ITEMS` in `menu.ts`). Every other dish uses an **AI-generated placeholder**, labelled as such in the item view,
  to be swapped for real photos later — drop a file at `public/menu/<item-id>.webp`, add the id to `PHOTO_ITEMS`.
- `scripts/generate-ai-images.ts` regenerates the placeholders (free Pollinations API); `scripts/process-images.py`
  crops/resizes everything into `public/`.

## Assumptions to confirm with the shop

- Half-pizza toppings are charged the same as whole-pizza toppings.
- One free cannoli per large specialty pizza.
- Meals tax is not applied to the delivery charge.
- Drinks ("Assorted Coca-Cola products") aren't listed because the menu has no prices for them.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run dev:open     # port 3001, forces "open" so checkout can be tried outside business hours
```

## Test

```bash
npm test             # unit tests: pricing, offers, tax, hours, menu data integrity
npm run test:e2e     # Playwright: full ordering flows on desktop + mobile against a production build
npm run lint && npm run typecheck
```

The e2e suite pins the browser clock (Monday noon, Wednesday, Sunday…) so hours and weekday deals are tested deterministically.
