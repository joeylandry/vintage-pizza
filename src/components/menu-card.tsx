"use client";

import clsx from "clsx";
import Image from "next/image";
import { formatMoney, startingPrice } from "@/lib/pricing";
import type { MenuItem } from "@/lib/types";
import { PlusIcon, StarIcon } from "./icons";
import { useOrderUI } from "./providers";

export function MenuCard({ item, available = true, eager = false }: { item: MenuItem; available?: boolean; eager?: boolean }) {
  const { openItem } = useOrderUI();
  const from = item.sizes && item.sizes.length > 1;
  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className={clsx(
        "group flex w-full overflow-hidden rounded-3xl border border-line bg-white text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5",
        "flex-row sm:flex-col",
      )}
      aria-label={`${item.name}, ${from ? "from " : ""}${formatMoney(startingPrice(item))}${available ? "" : ", not available today"}`}
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-cream sm:aspect-[4/3] sm:w-full">
        <Image
          src={item.image.src}
          alt=""
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 40vw, 112px"
          className={clsx("object-cover transition duration-500 group-hover:scale-105", !available && "grayscale")}
          loading={eager ? "eager" : "lazy"}
        />
        {item.favorite && (
          <span className="absolute left-2 top-2 hidden items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold text-gold backdrop-blur sm:inline-flex">
            <StarIcon width={11} height={11} /> Favorite
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 font-display text-lg font-semibold uppercase leading-snug tracking-wide">{item.name}</h3>
          {item.favorite && <StarIcon width={14} height={14} className="mt-1.5 shrink-0 text-gold sm:hidden" aria-label="House favorite" />}
        </div>
        {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>}
        {item.availability && (
          <p className={clsx("mt-1 text-xs font-semibold", available ? "text-basil" : "text-tomato")}>
            {item.availability.label}
            {!available && " only"}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-semibold tabular-nums">
            {from && <span className="text-sm font-normal text-muted">from </span>}
            {formatMoney(startingPrice(item))}
          </span>
          <span
            className={clsx(
              "grid size-9 place-items-center rounded-full transition",
              available ? "bg-ink text-cream group-hover:bg-tomato" : "bg-cream text-muted",
            )}
            aria-hidden
          >
            <PlusIcon width={18} height={18} />
          </span>
        </div>
      </div>
    </button>
  );
}
