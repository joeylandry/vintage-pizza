"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { lineKey } from "./pricing";
import type { CartLine, DeliveryAddress, OrderMode } from "./types";

export const MAX_QTY = 50;

type CartState = {
  lines: CartLine[];
  mode: OrderMode;
  address: DeliveryAddress;
  orderNotes: string;
  /** The customer has been through the "Order details" step (pickup or delivery) at least once. */
  detailsConfirmed: boolean;
  /** Adds a line, merging with an identical existing line. Returns the resulting lineId. */
  add: (line: Omit<CartLine, "lineId">) => string;
  /** Replaces an existing line's configuration (used by "Edit"). */
  replace: (lineId: string, line: Omit<CartLine, "lineId">) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  setMode: (mode: OrderMode) => void;
  setAddress: (address: Partial<DeliveryAddress>) => void;
  setOrderNotes: (notes: string) => void;
  setDetailsConfirmed: (confirmed: boolean) => void;
};

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n) || 1));

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      mode: "pickup",
      address: { street: "", unit: "", city: "Manchester", zip: "" },
      orderNotes: "",
      detailsConfirmed: false,
      add: (line) => {
        const key = lineKey(line);
        const existing = get().lines.find((l) => lineKey(l) === key);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.lineId === existing.lineId ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l,
            ),
          });
          return existing.lineId;
        }
        const lineId = newId();
        set({ lines: [...get().lines, { ...line, quantity: clampQty(line.quantity), lineId }] });
        return lineId;
      },
      replace: (lineId, line) => {
        const key = lineKey(line);
        const others = get().lines.filter((l) => l.lineId !== lineId);
        const twin = others.find((l) => lineKey(l) === key);
        if (twin) {
          // Editing made this line identical to another one: merge them.
          set({
            lines: others.map((l) => (l.lineId === twin.lineId ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l)),
          });
          return;
        }
        set({
          lines: get().lines.map((l) => (l.lineId === lineId ? { ...line, quantity: clampQty(line.quantity), lineId } : l)),
        });
      },
      setQuantity: (lineId, quantity) =>
        set({ lines: get().lines.map((l) => (l.lineId === lineId ? { ...l, quantity: clampQty(quantity) } : l)) }),
      remove: (lineId) => set({ lines: get().lines.filter((l) => l.lineId !== lineId) }),
      clear: () => set({ lines: [], orderNotes: "" }),
      setMode: (mode) => set({ mode }),
      setAddress: (address) => set({ address: { ...get().address, ...address } }),
      setOrderNotes: (orderNotes) => set({ orderNotes }),
      setDetailsConfirmed: (detailsConfirmed) => set({ detailsConfirmed }),
    }),
    {
      name: "vintage-pizza-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/** Rehydrates the persisted cart after mount so server and client HTML match. */
export function useCartHydrated(): boolean {
  useEffect(() => {
    if (!useCart.persist.hasHydrated()) void useCart.persist.rehydrate();
  }, []);
  return useSyncExternalStore(
    (onChange) => useCart.persist.onFinishHydration(onChange),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}

export const isAddressComplete = (a: DeliveryAddress) =>
  a.street.trim().length >= 3 && a.city.trim().length >= 2 && /^\d{5}$/.test(a.zip.trim());
