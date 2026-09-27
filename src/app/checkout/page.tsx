import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

/*
 * The redesign covers everything up to the Checkout button. Payment, customer
 * details and sending the order to the POS get wired in here.
 */
export default function CheckoutPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tomato">Checkout</p>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">Payment step coming soon</h1>
      <p className="mt-3 text-muted">
        Your order is saved on this device. To place it now, call us at{" "}
        <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-2">
          {SITE.phone}
        </a>
        .
      </p>
      <Link href="/cart" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-cream hover:bg-ink-soft">
        Back to your order
      </Link>
    </div>
  );
}
