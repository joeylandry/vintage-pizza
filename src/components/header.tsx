"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { CartButton } from "./cart-button";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { StoreStatusBadge } from "./store-status";

const NAV = [
  { href: "/order", label: "Order Online" },
  { href: "/order#specials", label: "Specials" },
  { href: "/#story", label: "Our Story" },
  { href: "/#visit", label: "Hours & Location" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Close the mobile drawer on navigation (state adjusted during render, not in an effect).
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-ink text-cream">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Vintage Pizza home">
          <Image src="/images/logo-white.webp" alt="Vintage Pizza, est. 2014" width={497} height={376} className="h-11 w-auto sm:h-12" loading="eager" />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "rounded-full px-3.5 py-2 text-sm font-medium transition hover:bg-white/10",
                pathname === n.href && "bg-white/10",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden md:block">
            <StoreStatusBadge />
          </span>
          <a href={SITE.phoneHref} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-white/10 xl:inline-flex">
            <PhoneIcon width={16} height={16} /> {SITE.phone}
          </a>
          <CartButton />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="animate-fade-in border-t border-white/10 bg-ink lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3" aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-display text-lg uppercase tracking-wide hover:bg-white/10">
                {n.label}
              </Link>
            ))}
            <a href={SITE.phoneHref} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 font-semibold hover:bg-white/10">
              <PhoneIcon width={18} height={18} /> Call {SITE.phone}
            </a>
            <StoreStatusBadge className="mx-3 mb-2 mt-1 self-start" />
          </nav>
        </div>
      )}
    </header>
  );
}
