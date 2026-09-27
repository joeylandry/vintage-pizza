import Image from "next/image";
import Link from "next/link";
import { HOURS_DISPLAY } from "@/lib/hours";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Image src="/images/logo-white.webp" alt="Vintage Pizza" width={497} height={376} className="h-20 w-auto" />
          <p className="mt-4 text-sm">Manchester&apos;s favorite takeout spot since {SITE.founded}.</p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-cream">Visit</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed">
            {SITE.street}
            <br />
            {SITE.city}, {SITE.state} {SITE.zip}
          </address>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-cream underline-offset-4 hover:underline">
            Get directions
          </a>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-cream">Hours</h2>
          <dl className="mt-3 space-y-1 text-sm">
            {HOURS_DISPLAY.map((h) => (
              <div key={h.days} className="flex justify-between gap-4">
                <dt>{h.days}</dt>
                <dd className="tabular-nums">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-cream">Order</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/order" className="hover:text-cream">Order online</Link></li>
            <li><a href={SITE.phoneHref} className="hover:text-cream">Call {SITE.phone}</a></li>
            <li><a href={SITE.pdfMenu} target="_blank" rel="noopener noreferrer" className="hover:text-cream">Printable menu (PDF)</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-cream/50 sm:px-6">
          © {new Date().getFullYear()} Vintage Pizza. Prices and items subject to change. NH meals tax added to all orders.
          Consumer advisory: consuming raw or undercooked meats, poultry or seafood may increase your risk of foodborne illness.
          Please tell us about any food allergies when ordering.
        </p>
      </div>
    </footer>
  );
}
