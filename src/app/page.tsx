import Image from "next/image";
import Link from "next/link";
import { Deals } from "@/components/deals";
import { ArrowRightIcon, ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { PopularPicks } from "@/components/popular-picks";
import { StoreStatusBadge } from "@/components/store-status";
import { HOURS_DISPLAY } from "@/lib/hours";
import { SITE } from "@/lib/site";

const GALLERY = [
  { src: "/images/broccoli-pie.webp", alt: "A broccoli pizza fresh out of the oven" },
  { src: "/images/cannoli-tray.webp", alt: "A tray of fresh cannoli dusted with powdered sugar" },
  { src: "/images/night-front.webp", alt: "The Vintage Pizza storefront lit up at night" },
  { src: "/images/sign.webp", alt: "The Vintage Pizza sign inside the shop" },
  { src: "/images/founders.webp", alt: "Two of the Vintage Pizza founders in the kitchen" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate bg-ink text-cream">
        <Image
          src="/images/hero-wide.webp"
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-ink/70" />
        <div className="mx-auto flex min-h-[560px] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[680px] sm:px-6">
          <StoreStatusBadge className="mb-6 md:hidden" />
          <Image
            src="/images/logo-white.webp"
            alt="Vintage Pizza, est. 2014"
            width={497}
            height={376}
            loading="eager"
            className="h-24 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:h-32"
          />
          <h1 className="mt-8 font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-7xl">
            <span className="block">Best pizza.</span>
            <span className="block">Best tenders.</span>
            <span className="block text-tomato">Best wings.</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link
              href="/order"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-tomato px-7 text-lg font-semibold text-white shadow-lift transition hover:bg-tomato-dark"
            >
              Order Online <ArrowRightIcon />
            </Link>
            <a href={SITE.phoneHref} className="inline-flex items-center gap-2 font-semibold text-cream/90 transition hover:text-cream">
              <PhoneIcon width={18} height={18} /> {SITE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="border-b border-line bg-cream" aria-labelledby="deals-title">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="deals-title" className="font-display text-xl font-bold uppercase tracking-wide">
              Weekly deals <span className="ml-1 font-sans text-xs font-normal normal-case tracking-normal text-muted">Can&apos;t be combined with other offers</span>
            </h2>
            <Link href="/order#specials" className="text-sm font-semibold text-tomato hover:underline">
              Order a deal →
            </Link>
          </div>
          <Deals />
        </div>
      </section>

      {/* Popular picks */}
      <section id="popular" data-anchor className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold uppercase tracking-wide">Popular Picks</h2>
          </div>
          <Link href="/order" className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream">
            Full menu <ArrowRightIcon width={18} height={18} />
          </Link>
        </div>
        <PopularPicks />
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-label="Photos from Vintage Pizza">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {GALLERY.map((g, i) => (
            <div
              key={g.src}
              className={`relative aspect-square overflow-hidden rounded-3xl bg-cream ${i === 0 ? "col-span-2 md:row-span-2" : ""}`}
            >
              <Image src={g.src} alt={g.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" data-anchor className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] shadow-lift">
            <Image src="/images/team.webp" alt="The Vintage Pizza crew in the kitchen" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tomato">Our story</p>
            <h2 className="mt-1 font-display text-4xl font-bold uppercase tracking-wide">Brothers, a best friend & a pizza oven</h2>
            <p className="mt-5 text-lg font-medium text-ink">
              The busiest delivery and takeout spot in Manchester, for good reason: consistent, high-quality pizza made only with Grande
              mozzarella, hand-breaded chicken tenders with our homemade duck sauce, and fresh salads with our famous house Greek dressing.
            </p>
            <div className="mt-4 space-y-4 text-ink-soft">
              <p>
                Vintage Pizza was started in {SITE.founded} by brothers Kris and Jamie and their best friend Jon. They took what they learned
                working at their uncle&apos;s pizza shop and combined it with new ideas from across the food industry.
              </p>
              <p>
                Today we&apos;re one of the busiest takeout and delivery spots in Manchester — thanks to customers who&apos;ve stuck with us
                even when the wait gets long. Every day the team works on new ways to make things faster and better for you.
              </p>
              <p className="font-semibold text-ink">We hope to see you soon!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" data-anchor className="bg-ink text-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-gold">Visit us</p>
            <h2 className="mt-1 font-display text-4xl font-bold uppercase tracking-wide">Candia Road, Manchester</h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <PinIcon className="mt-1 shrink-0 text-gold" />
                <div>
                  <p className="font-semibold">{SITE.street}</p>
                  <p className="text-cream/70">
                    {SITE.city}, {SITE.state} {SITE.zip}
                  </p>
                  <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-gold hover:underline">
                    Get directions →
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <ClockIcon className="mt-1 shrink-0 text-gold" />
                <dl className="w-full max-w-xs space-y-1">
                  {HOURS_DISPLAY.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt className="text-cream/70">{h.days}</dt>
                      <dd className="font-semibold tabular-nums">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </li>
              <li className="flex gap-4">
                <PhoneIcon className="mt-1 shrink-0 text-gold" />
                <div>
                  <a href={SITE.phoneHref} className="font-semibold hover:underline">
                    {SITE.phone}
                  </a>
                  <p className="text-sm text-cream/60">Call for delivery or to order for a specific time.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl sm:block">
              <Image src="/images/storefront.webp" alt="The Vintage Pizza storefront" fill sizes="30vw" className="object-cover" />
            </div>
            <iframe
              title="Map to Vintage Pizza"
              src={SITE.mapsEmbed}
              className="h-80 w-full rounded-3xl border-0 grayscale-[35%] sm:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
