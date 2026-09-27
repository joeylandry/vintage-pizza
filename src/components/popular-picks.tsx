"use client";

import { popularItems } from "@/lib/menu";
import { MenuCard } from "./menu-card";

export function PopularPicks() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {popularItems()
        .slice(0, 8)
        .map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
    </div>
  );
}
