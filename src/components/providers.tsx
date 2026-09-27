"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCartHydrated } from "@/lib/cart-store";
import { CheckIcon } from "./icons";
import { ItemSheet } from "./item-sheet";

type SheetState = { itemId: string; lineId?: string; nonce: number } | null;

type OrderUI = {
  openItem: (itemId: string, lineId?: string) => void;
  closeItem: () => void;
  notify: (message: string) => void;
  hydrated: boolean;
};

const Ctx = createContext<OrderUI | null>(null);

export function useOrderUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrderUI must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrated = useCartHydrated();
  const [sheet, setSheet] = useState<SheetState>(null);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openItem = useCallback((itemId: string, lineId?: string) => setSheet({ itemId, lineId, nonce: Date.now() }), []);
  const closeItem = useCallback(() => setSheet(null), []);
  const notify = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast({ message, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ openItem, closeItem, notify, hydrated }), [openItem, closeItem, notify, hydrated]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {sheet && <ItemSheet key={sheet.nonce} itemId={sheet.itemId} lineId={sheet.lineId} onClose={closeItem} />}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex animate-toast-in items-center gap-3 rounded-full bg-ink py-2.5 pl-3 pr-2 text-sm text-cream shadow-lift"
          >
            <span className="grid size-6 place-items-center rounded-full bg-basil">
              <CheckIcon width={14} height={14} />
            </span>
            <span>{toast.message}</span>
            <Link href="/cart" className="rounded-full bg-cream/10 px-3 py-1 font-semibold hover:bg-cream/20" onClick={() => setToast(null)}>
              View order
            </Link>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
