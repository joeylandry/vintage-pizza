"use client";

import clsx from "clsx";
import { isAddressComplete, useCart } from "@/lib/cart-store";
import { SITE, fullAddress } from "@/lib/site";
import { CarIcon, PinIcon, StoreIcon } from "./icons";
import { useOrderUI } from "./providers";

export function OrderModePicker({ compact = false }: { compact?: boolean }) {
  const { hydrated } = useOrderUI();
  const mode = useCart((s) => s.mode);
  const setMode = useCart((s) => s.setMode);
  const shownMode = hydrated ? mode : "pickup";

  return (
    <div className={clsx("rounded-3xl border border-line bg-white", compact ? "p-4" : "p-5")}>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1" role="radiogroup" aria-label="Order type">
        {(
          [
            { id: "pickup", label: "Pickup", icon: StoreIcon },
            { id: "delivery", label: "Delivery", icon: CarIcon },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={shownMode === m.id}
            onClick={() => setMode(m.id)}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition",
              shownMode === m.id ? "bg-ink text-cream shadow-card" : "text-ink-soft hover:text-ink",
            )}
          >
            <m.icon width={18} height={18} /> {m.label}
          </button>
        ))}
      </div>

      {shownMode === "pickup" ? <PickupInfo className="mt-4" /> : <DeliveryAddressFields className="mt-4" />}
    </div>
  );
}

export function PickupInfo({ className }: { className?: string }) {
  return (
    <div className={clsx("flex gap-3 text-sm", className)}>
      <PinIcon className="mt-0.5 shrink-0 text-tomato" width={18} height={18} />
      <div>
        <p className="font-semibold">Pick up at Vintage Pizza</p>
        <p className="text-muted">{fullAddress}</p>
        <p className="mt-2 text-xs text-muted">
          Orders for a specific pickup time must be placed by phone at{" "}
          <a href={SITE.phoneHref} className="font-semibold text-ink underline underline-offset-2">
            {SITE.phone}
          </a>
          . Online orders are prepared right away.
        </p>
      </div>
    </div>
  );
}

const field =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] placeholder:text-muted/70 focus:border-ink focus:outline-none";

export function DeliveryAddressFields({ className }: { className?: string }) {
  const { hydrated } = useOrderUI();
  const address = useCart((s) => s.address);
  const setAddress = useCart((s) => s.setAddress);
  return (
    <fieldset className={clsx("space-y-2.5", className)}>
      <legend className="mb-2.5 text-sm font-semibold">
        Delivery address <span className="font-normal text-muted">· $2.99 delivery charge</span>
      </legend>
      <input
        className={field}
        placeholder="Street address"
        autoComplete="address-line1"
        aria-label="Street address"
        value={address.street}
        onChange={(e) => setAddress({ street: e.target.value })}
      />
      <div className="grid grid-cols-[1fr_1fr] gap-2.5 sm:grid-cols-[1fr_1.4fr_0.9fr]">
        <input
          className={clsx(field, "col-span-2 sm:col-span-1")}
          placeholder="Apt / unit (optional)"
          autoComplete="address-line2"
          aria-label="Apartment or unit"
          value={address.unit}
          onChange={(e) => setAddress({ unit: e.target.value })}
        />
        <input
          className={field}
          placeholder="City"
          autoComplete="address-level2"
          aria-label="City"
          value={address.city}
          onChange={(e) => setAddress({ city: e.target.value })}
        />
        <input
          className={field}
          placeholder="ZIP"
          inputMode="numeric"
          autoComplete="postal-code"
          aria-label="ZIP code"
          value={address.zip}
          onChange={(e) => setAddress({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
        />
      </div>
      {hydrated && !isAddressComplete(address) && (address.street || address.zip) && (
        <p className="text-xs text-tomato">Enter a street address, city and 5-digit ZIP.</p>
      )}
    </fieldset>
  );
}
