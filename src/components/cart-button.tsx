"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { BagIcon } from "./icons";
import { useOrderUI } from "./providers";

export function CartButton() {
  const { hydrated } = useOrderUI();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/cart"
      className="relative inline-flex h-11 items-center gap-2 rounded-full bg-tomato px-4 font-semibold text-white transition hover:bg-tomato-dark"
      aria-label={`View order, ${shown} ${shown === 1 ? "item" : "items"}`}
    >
      <BagIcon />
      <span className="tabular-nums">{shown}</span>
    </Link>
  );
}
