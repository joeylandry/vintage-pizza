"use client";

import Image from "next/image";
import { getItem, POPULAR_PICKS } from "@/lib/menu";
import { cents, formatMoney } from "@/lib/pricing";
import type { MenuItem } from "@/lib/types";
import { PlusIcon } from "./icons";
import { useOrderUI } from "./providers";

/** Every size's price, e.g. "$14.49 / $21.99" for a small and large pizza. */
const prices = (item: MenuItem) =>
  item.sizes?.length ? item.sizes.map((s) => formatMoney(cents(s.price))).join(" / ") : formatMoney(cents(item.price ?? 0));

/** Same picks, order, names and descriptions as the "Popular Picks" on vintagepizzanh.com — tap one to add it. */
export function PopularPicks() {
  const { openItem } = useOrderUI();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {POPULAR_PICKS.map(({ id, name }) => {
        const item = getItem(id);
        if (!item) return null;
        const price = prices(item);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => openItem(id)}
              aria-label={`${name}, ${price}`}
              className="group flex h-full w-full items-center gap-4 rounded-3xl border border-line bg-white p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lift sm:p-4"
            >
              <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-cream sm:size-28">
                <Image src={item.image.src} alt="" fill sizes="112px" className="object-cover transition duration-500 group-hover:scale-105" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col self-stretch">
                <span className="font-display text-lg font-semibold uppercase leading-snug tracking-wide">{name}</span>
                {item.description && <span className="mt-1 text-sm text-muted">{item.description}</span>}
                <span className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="font-semibold tabular-nums text-tomato">{price}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-cream transition group-hover:bg-tomato" aria-hidden>
                    <PlusIcon width={18} height={18} />
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
