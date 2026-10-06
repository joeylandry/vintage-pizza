"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartLineRow } from "@/components/cart-line";
import { ArrowRightIcon, BagIcon, CarIcon, ClockIcon, CloseIcon, SearchIcon, StoreIcon } from "@/components/icons";
import { MenuCard } from "@/components/menu-card";
import { OrderSteps } from "@/components/order-steps";
import { SummaryRows } from "@/components/order-summary";
import { useOrderUI } from "@/components/providers";
import { useStoreStatus } from "@/components/store-status";
import { useCheckout } from "@/components/use-checkout";
import { useNow } from "@/components/use-now";
import { useCart } from "@/lib/cart-store";
import { isAvailableNow } from "@/lib/hours";
import { categories, getItem, menu } from "@/lib/menu";
import { formatMoney } from "@/lib/pricing";
import { SITE, fullAddress } from "@/lib/site";
import { OrderDetailsStep } from "./order-details";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function OrderMenu() {
  const { openItem, hydrated } = useOrderUI();
  const params = useSearchParams();
  const router = useRouter();
  const detailsConfirmed = useCart((s) => s.detailsConfirmed);

  // Deep link: /order?item=honey-boy opens that item.
  const deepItem = params.get("item");
  useEffect(() => {
    if (deepItem && getItem(deepItem)) {
      openItem(deepItem);
      router.replace("/order", { scroll: false });
    }
  }, [deepItem, openItem, router]);

  // Like the old ordering site, step 1 is "Order details" (pickup or delivery); the menu comes after.
  if (hydrated && !detailsConfirmed) return <OrderDetailsStep />;
  return <MenuView />;
}

function MenuView() {
  const { hydrated } = useOrderUI();
  const now = useNow();
  const status = useStoreStatus();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
  };
  const [active, setActive] = useState(categories[0].id);
  const navRef = useRef<HTMLDivElement>(null);

  // A link like /order#specials lands here after the "Order details" step: jump to that category.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  const q = normalize(query.trim());
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          items: menu.filter(
            (m) =>
              m.categoryId === c.id &&
              (!q || normalize(`${m.name} ${m.description ?? ""} ${c.name}`).includes(q)),
          ),
        }))
        .filter((c) => c.items.length > 0),
    [q],
  );

  // Scrollspy: highlight the category currently under the sticky bars.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-160px 0px -60% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  // Keep the active chip visible in the horizontal category bar.
  useEffect(() => {
    const chip = navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    const bar = navRef.current;
    if (chip && bar) bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="bg-paper">
      <section className="border-b border-line bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 sm:pt-8">
          <OrderSteps current="Menu" />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">Full menu</h1>
            </div>
            {hydrated && <OrderDetailsBar />}
          </div>
          {status && !status.open && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-tomato/20 bg-tomato/5 px-4 py-3 text-sm" role="status">
              <ClockIcon className="mt-0.5 shrink-0 text-tomato" width={18} height={18} />
              <p>
                <span className="font-semibold">{status.detail}</span> You can still browse and build your order. Questions? Call{" "}
                <a href={SITE.phoneHref} className="font-semibold underline underline-offset-2">
                  {SITE.phone}
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sticky category bar + search */}
      <div className="sticky top-[72px] z-30 border-b border-line bg-paper/95 backdrop-blur sm:top-24">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className={clsx("relative shrink-0 sm:block sm:w-64", searchOpen ? "block flex-1" : "hidden")}>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width={16} height={16} />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
              placeholder="Search menu"
              aria-label="Search the menu"
              className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-8 text-sm placeholder:text-muted focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {(query || searchOpen) && (
              <button
                type="button"
                onClick={closeSearch}
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-cream"
                aria-label="Clear search"
              >
                <CloseIcon width={14} height={14} />
              </button>
            )}
          </div>
          {!searchOpen && (
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                requestAnimationFrame(() => searchRef.current?.focus());
              }}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white sm:hidden"
              aria-label="Search the menu"
            >
              <SearchIcon width={16} height={16} />
            </button>
          )}
          <nav
            ref={navRef}
            className={clsx("no-scrollbar flex-1 gap-1.5 overflow-x-auto sm:flex", searchOpen ? "hidden" : "flex")}
            aria-label="Menu categories"
          >
            {sections.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                data-cat={c.id}
                aria-current={active === c.id ? "true" : undefined}
                className={clsx(
                  "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition",
                  active === c.id ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream",
                )}
              >
                {c.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-32 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-16">
        <div>
          {sections.length === 0 && (
            <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
              <p className="font-display text-xl uppercase">No matches for “{query}”</p>
              <button type="button" onClick={closeSearch} className="mt-3 text-sm font-semibold text-tomato underline underline-offset-4">
                Clear search
              </button>
            </div>
          )}

          <div className="space-y-12">
            {sections.map((c, ci) => (
              <section key={c.id} id={c.id} data-anchor aria-labelledby={`${c.id}-title`}>
                <div className="mb-4">
                  <h2 id={`${c.id}-title`} className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
                    {c.name}
                  </h2>
                  {c.blurb && <p className="mt-1 text-sm text-muted">{c.blurb}</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {c.items.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      eager={ci === 0}
                      available={!now || isAvailableNow(item.availability, now)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="Your order">
          <div className="sticky top-[176px]">
            {hydrated && <SidebarCart />}
          </div>
        </aside>
      </div>

      {hydrated && <MobileCartBar />}
    </div>
  );
}

/** Shows the choice made in the "Order details" step, with a way back to change it. */
function OrderDetailsBar() {
  const mode = useCart((s) => s.mode);
  const address = useCart((s) => s.address);
  const change = useCart((s) => s.setDetailsConfirmed);
  const Icon = mode === "pickup" ? StoreIcon : CarIcon;
  const where = mode === "pickup" ? fullAddress : [address.street, address.unit].filter(Boolean).join(", ");
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm sm:w-auto sm:max-w-md">
      <Icon className="shrink-0 text-tomato" width={22} height={22} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{mode === "pickup" ? "Pickup" : "Delivery · $2.99"}</p>
        <p className="truncate text-muted">{where || "Address needed"}</p>
      </div>
      <button
        type="button"
        onClick={() => change(false)}
        className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-tomato hover:bg-tomato/5"
        aria-label="Change order details"
      >
        Change
      </button>
    </div>
  );
}

function SidebarCart() {
  const { lines, mode, summary, canCheckout } = useCheckout();
  return (
    <div className="flex max-h-[calc(100dvh-200px)] min-h-56 flex-col rounded-3xl border border-line bg-white">
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Your order</h2>
        {lines.length > 0 && <span className="text-sm text-muted">{summary.itemCount} items</span>}
      </div>
      {lines.length === 0 ? (
        <div className="grid flex-1 place-items-center px-6 py-8 text-center text-sm text-muted">
          <div>
            <BagIcon className="mx-auto mb-2 text-line" width={36} height={36} />
            Your order is empty. Tap an item to get started.
          </div>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-5">
            {lines.map((l) => (
              <CartLineRow key={l.lineId} line={l} compact unavailable={summary.unavailableLineIds.includes(l.lineId)} />
            ))}
          </ul>
          <div className="border-t border-line px-5 py-4">
            <SummaryRows summary={summary} mode={mode} />
            <Link
              href="/cart"
              className={clsx(
                "mt-4 flex h-12 items-center justify-center gap-2 rounded-full font-semibold transition",
                canCheckout ? "bg-tomato text-white hover:bg-tomato-dark" : "bg-ink text-cream hover:bg-ink-soft",
              )}
            >
              Review order <ArrowRightIcon width={18} height={18} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function MobileCartBar() {
  const { summary } = useCheckout();
  const visible = summary.itemCount > 0;
  // Reserve room under the footer so the fixed bar never covers it.
  useEffect(() => {
    document.body.classList.toggle("max-lg:pb-24", visible);
    return () => document.body.classList.remove("max-lg:pb-24");
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <Link
        href="/cart"
        className="mx-auto flex h-14 max-w-xl items-center justify-between rounded-full bg-tomato px-5 font-semibold text-white shadow-lift"
      >
        <span className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm tabular-nums">{summary.itemCount}</span>
          View order
        </span>
        <span className="tabular-nums">{formatMoney(summary.total)}</span>
      </Link>
    </div>
  );
}
