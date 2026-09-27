"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartLineRow } from "@/components/cart-line";
import { ArrowRightIcon, BagIcon } from "@/components/icons";
import { OrderModePicker } from "@/components/order-mode";
import { SummaryRows } from "@/components/order-summary";
import { useOrderUI } from "@/components/providers";
import { useCheckout } from "@/components/use-checkout";
import { useCart } from "@/lib/cart-store";
import { getItem } from "@/lib/menu";
import { formatMoney, startingPrice } from "@/lib/pricing";

const ADD_ONS = ["garlic-bread-with-cheese", "cannoli", "beignets", "chicken-tenders", "texas-cheese-fries"];

export function CartView() {
  const { hydrated, openItem } = useOrderUI();
  const router = useRouter();
  const { lines, mode, summary, blockers, canCheckout } = useCheckout();
  const notes = useCart((s) => s.orderNotes);
  const setNotes = useCart((s) => s.setOrderNotes);
  const clear = useCart((s) => s.clear);

  if (!hydrated) {
    return <div className="mx-auto min-h-[60vh] max-w-6xl px-4 py-10" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-cream">
          <BagIcon width={36} height={36} className="text-muted" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-wide">Your order is empty</h1>
        <p className="mt-2 text-muted">Hungry? Our pizza, tenders and wings are a tap away.</p>
        <Link href="/order" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-tomato px-6 font-semibold text-white hover:bg-tomato-dark">
          Browse the menu <ArrowRightIcon width={18} height={18} />
        </Link>
      </div>
    );
  }

  const inCart = new Set(lines.map((l) => l.itemId));
  if (summary.promo?.freeCannoli) inCart.add("cannoli");
  const addOns = ADD_ONS.filter((id) => !inCart.has(id)).map((id) => getItem(id)!).filter(Boolean).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/order" className="text-sm font-semibold text-tomato hover:underline">
            ← Keep ordering
          </Link>
          <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-wide">Your order</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Remove everything from your order?")) clear();
          }}
          className="text-sm font-semibold text-muted hover:text-tomato"
        >
          Clear order
        </button>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-white px-5 sm:px-6" aria-label="Items">
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <CartLineRow key={l.lineId} line={l} unavailable={summary.unavailableLineIds.includes(l.lineId)} />
              ))}
              {summary.promo?.freeCannoli ? (
                <li className="flex items-center gap-4 py-4" data-testid="free-cannoli">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cream sm:size-24">
                    <Image src="/menu/cannoli.webp" alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Cannoli × {summary.promo.freeCannoli}</p>
                    <p className="text-sm text-basil">Free with your large specialty pizza</p>
                  </div>
                  <span className="font-semibold text-basil">Free</span>
                </li>
              ) : null}
            </ul>
          </section>

          {addOns.length > 0 && (
            <section aria-labelledby="addons-title">
              <h2 id="addons-title" className="font-display text-xl font-semibold uppercase tracking-wide">
                Round it out
              </h2>
              <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
                {addOns.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openItem(a.id)}
                    className="flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-white text-left transition hover:shadow-card"
                  >
                    <div className="relative aspect-[4/3] w-full bg-cream">
                      <Image src={a.image.src} alt="" fill sizes="160px" className="object-cover" />
                    </div>
                    <span className="px-3 pt-2 text-sm font-semibold leading-tight">{a.name}</span>
                    <span className="px-3 pb-3 text-sm text-muted">
                      {a.sizes ? "from " : ""}
                      {formatMoney(startingPrice(a))}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <label htmlFor="order-notes" className="font-display text-lg font-semibold uppercase tracking-wide">
              Notes for the kitchen
            </label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Allergies, extra napkins, buzzer code…"
              className="mt-3 w-full resize-none rounded-2xl border border-line px-4 py-3 text-[15px] placeholder:text-muted/70 focus:border-ink focus:outline-none"
            />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Checkout">
          <OrderModePicker />
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wide">Summary</h2>
            <SummaryRows summary={summary} mode={mode} />
            {blockers.length > 0 && (
              <ul className="mt-4 space-y-1 rounded-xl border border-tomato/20 bg-tomato/5 px-3 py-2 text-sm text-tomato" data-testid="checkout-blockers">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            <button
              type="button"
              disabled={!canCheckout}
              onClick={() => router.push("/checkout")}
              className={clsx(
                "mt-5 flex h-14 w-full items-center justify-between rounded-full px-6 text-lg font-semibold transition",
                canCheckout ? "bg-tomato text-white shadow-card hover:bg-tomato-dark" : "cursor-not-allowed bg-line text-muted",
              )}
            >
              <span>Checkout</span>
              <span className="tabular-nums">{formatMoney(summary.total)}</span>
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              Offers can&apos;t be combined. You&apos;ll confirm your details and pay on the next step.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
