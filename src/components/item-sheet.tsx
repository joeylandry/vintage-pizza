"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { isAvailableNow } from "@/lib/hours";
import { getItem } from "@/lib/menu";
import { defaultSelections, defaultSize, formatMoney, priceFor, unitPrice, validate } from "@/lib/pricing";
import type { MenuItem, OptionGroup, Placement, Selection } from "@/lib/types";
import { CheckIcon, CloseIcon, SparkIcon, StarIcon } from "./icons";
import { useOrderUI } from "./providers";
import { QtyStepper } from "./qty-stepper";
import { useNow } from "./use-now";

const PLACEMENTS: { id: Placement; label: string; short: string }[] = [
  { id: "left", label: "Left half", short: "Left ½" },
  { id: "whole", label: "Whole pizza", short: "Whole" },
  { id: "right", label: "Right half", short: "Right ½" },
];

export function ItemSheet({ itemId, lineId, onClose }: { itemId: string; lineId?: string; onClose: () => void }) {
  const item = getItem(itemId);
  const existing = useCart((s) => (lineId ? s.lines.find((l) => l.lineId === lineId) : undefined));
  const add = useCart((s) => s.add);
  const replace = useCart((s) => s.replace);
  const { notify } = useOrderUI();
  const now = useNow();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [sizeId, setSizeId] = useState(() => existing?.sizeId ?? (item ? defaultSize(item) : undefined));
  const [selections, setSelections] = useState<Record<string, Selection[]>>(() =>
    existing ? structuredClone(existing.selections) : item ? defaultSelections(item) : {},
  );
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const errors = useMemo(() => (item ? validate(item, sizeId, selections) : {}), [item, sizeId, selections]);
  const unit = item ? unitPrice(item, sizeId, selections) : 0;
  const available = !item?.availability || !now || isAvailableNow(item.availability, now);

  if (!item) return null;

  const toggle = (group: OptionGroup, choiceId: string) => {
    setSelections((prev) => {
      const cur = prev[group.id] ?? [];
      if (group.type === "single") return { ...prev, [group.id]: [{ choiceId }] };
      const on = cur.some((s) => s.choiceId === choiceId);
      if (on) return { ...prev, [group.id]: cur.filter((s) => s.choiceId !== choiceId) };
      if (cur.length >= group.max) return prev;
      return { ...prev, [group.id]: [...cur, { choiceId, ...(group.placement ? { placement: "whole" as const } : {}) }] };
    });
  };

  const place = (groupId: string, choiceId: string, placement: Placement) =>
    setSelections((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] ?? []).map((s) => (s.choiceId === choiceId ? { ...s, placement } : s)),
    }));

  const submit = () => {
    if (Object.keys(errors).length) {
      setShowErrors(true);
      const first = Object.keys(errors)[0];
      scrollRef.current?.querySelector(`[data-group="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const line = { itemId: item.id, sizeId, selections, quantity, notes: notes.trim() };
    if (lineId && existing) {
      replace(lineId, line);
      notify(`Updated ${item.name}`);
    } else {
      add(line);
      notify(`Added ${quantity > 1 ? `${quantity} × ` : ""}${item.name}`);
    }
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="item-sheet-title"
      className="fixed inset-x-0 bottom-0 top-auto m-0 flex max-h-[94dvh] w-full max-w-none flex-col overflow-hidden rounded-t-3xl bg-paper p-0 text-ink shadow-lift sm:inset-0 sm:m-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-3xl"
    >
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative aspect-[16/9] w-full bg-cream sm:aspect-[2/1]">
          <Image src={item.image.src} alt={item.name} fill sizes="(min-width: 640px) 672px, 100vw" className="object-cover" loading="eager" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          {item.image.kind === "ai" && (
            <span className="absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur">
              <SparkIcon width={12} height={12} /> AI-generated preview image
            </span>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-paper/95 text-ink shadow-card transition hover:bg-white"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-7 px-5 pb-6 pt-5 sm:px-7">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {item.favorite && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-[#8a6212]">
                  <StarIcon width={12} height={12} /> House favorite
                </span>
              )}
              {item.availability && (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    available ? "bg-basil/10 text-basil" : "bg-tomato/10 text-tomato",
                  )}
                >
                  {item.availability.label} only
                </span>
              )}
            </div>
            <h2 id="item-sheet-title" className="mt-2 font-display text-3xl font-semibold uppercase leading-tight tracking-wide">
              {item.name}
            </h2>
            {item.description && <p className="mt-1.5 text-muted">{item.description}</p>}
            {item.note && <p className="mt-1 text-sm font-medium text-ink-soft">{item.note}</p>}
          </header>

          {item.sizes && (
            <Group title="Size" required error={showErrors ? errors.size : undefined} groupId="size">
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Size">
                {item.sizes.map((s) => {
                  const on = s.id === sizeId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSizeId(s.id)}
                      className={clsx(
                        "rounded-2xl border-2 px-4 py-3 text-left transition",
                        on ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-ink/40",
                      )}
                    >
                      <span className="block font-semibold">{s.label}</span>
                      <span className={clsx("block text-sm", on ? "text-cream/75" : "text-muted")}>
                        {s.detail ? `${s.detail} · ` : ""}
                        {formatMoney(Math.round(s.price * 100))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          {item.optionGroups.map((g) => (
            <Group
              key={g.id}
              groupId={g.id}
              title={g.label}
              hint={g.hint}
              required={g.min > 0}
              count={g.type === "multi" ? selections[g.id]?.length : undefined}
              error={showErrors ? errors[g.id] : undefined}
            >
              {g.placement ? (
                <ToppingGrid
                  group={g}
                  sizeId={sizeId}
                  picks={selections[g.id] ?? []}
                  onToggle={(c) => toggle(g, c)}
                  onPlace={(c, p) => place(g.id, c, p)}
                />
              ) : (
                <ChoiceChips group={g} sizeId={sizeId} picks={selections[g.id] ?? []} onToggle={(c) => toggle(g, c)} />
              )}
            </Group>
          ))}

          <Group title="Special instructions" groupId="notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="e.g. well done, light sauce, cut in squares"
              className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[15px] placeholder:text-muted/70 focus:border-ink focus:outline-none"
              aria-label="Special instructions"
            />
          </Group>
        </div>
      </div>

      <footer className="flex items-center gap-3 border-t border-line bg-paper px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
        <QtyStepper value={quantity} onChange={setQuantity} label={item.name} />
        <button
          type="button"
          onClick={submit}
          disabled={!available}
          className="flex h-12 flex-1 items-center justify-between gap-3 rounded-full bg-tomato px-6 font-semibold text-white shadow-card transition hover:bg-tomato-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted"
        >
          {available ? (
            <>
              <span>{lineId ? "Update order" : "Add to order"}</span>
              <span className="tabular-nums">{formatMoney(unit * quantity)}</span>
            </>
          ) : (
            <span className="w-full text-center">Only available {item.availability?.label}</span>
          )}
        </button>
      </footer>
    </dialog>
  );
}

function Group({
  title,
  hint,
  required,
  error,
  count,
  groupId,
  children,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  error?: string;
  count?: number;
  groupId: string;
  children: React.ReactNode;
}) {
  return (
    <section data-group={groupId} aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{title}</h3>
          {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
        {error ? (
          <span className="shrink-0 rounded-full bg-tomato px-2.5 py-0.5 text-xs font-semibold text-white" role="alert">
            {error}
          </span>
        ) : required ? (
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-ink-soft">Required</span>
        ) : count ? (
          <span className="shrink-0 rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-cream">{count} selected</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function priceLabel(price: MenuItem["price"] | Record<string, number> | undefined, sizeId?: string) {
  const c = priceFor(price, sizeId);
  return c ? `+${formatMoney(c)}` : "";
}

function ChoiceChips({
  group,
  sizeId,
  picks,
  onToggle,
}: {
  group: OptionGroup;
  sizeId?: string;
  picks: Selection[];
  onToggle: (choiceId: string) => void;
}) {
  const single = group.type === "single";
  return (
    <div className="flex flex-wrap gap-2" role={single ? "radiogroup" : "group"} aria-label={group.label}>
      {group.choices.map((c) => {
        const on = picks.some((p) => p.choiceId === c.id);
        const extra = priceLabel(c.price, sizeId);
        return (
          <button
            key={c.id}
            type="button"
            role={single ? "radio" : "checkbox"}
            aria-checked={on}
            onClick={() => onToggle(c.id)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition",
              on ? "border-ink bg-ink text-cream" : "border-line bg-white hover:border-ink/40",
            )}
          >
            {on && <CheckIcon width={14} height={14} />}
            {c.label}
            {extra && <span className={on ? "text-cream/70" : "text-muted"}>{extra}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ToppingGrid({
  group,
  sizeId,
  picks,
  onToggle,
  onPlace,
}: {
  group: OptionGroup;
  sizeId?: string;
  picks: Selection[];
  onToggle: (choiceId: string) => void;
  onPlace: (choiceId: string, p: Placement) => void;
}) {
  return (
    <ul className="grid items-start gap-2 sm:grid-cols-2">
      {group.choices.map((c) => {
        const pick = picks.find((p) => p.choiceId === c.id);
        const on = !!pick;
        return (
          <li
            key={c.id}
            className={clsx("rounded-2xl border transition", on ? "border-ink bg-white shadow-card" : "border-line bg-white")}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(c.id)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
            >
              <span
                className={clsx(
                  "grid size-5 shrink-0 place-items-center rounded-md border-2 transition",
                  on ? "border-ink bg-ink text-cream" : "border-line",
                )}
              >
                {on && <CheckIcon width={12} height={12} strokeWidth={3} />}
              </span>
              <span className="flex-1 font-medium">{c.label}</span>
              <span className="text-sm text-muted tabular-nums">{priceLabel(c.price, sizeId)}</span>
            </button>
            {on && (
              <div className="flex gap-1 px-3 pb-3" role="radiogroup" aria-label={`Where to put ${c.label}`}>
                {PLACEMENTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={pick.placement === p.id}
                    aria-label={`${c.label}: ${p.label}`}
                    onClick={() => onPlace(c.id, p.id)}
                    className={clsx(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition",
                      pick.placement === p.id ? "bg-tomato text-white" : "bg-cream text-ink-soft hover:bg-line",
                    )}
                  >
                    <HalfDot side={p.id} />
                    {p.short}
                  </button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function HalfDot({ side }: { side: Placement }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {side === "whole" && <circle cx="6" cy="6" r="5" fill="currentColor" />}
      {side === "left" && <path d="M6 1a5 5 0 0 0 0 10Z" fill="currentColor" />}
      {side === "right" && <path d="M6 1a5 5 0 0 1 0 10Z" fill="currentColor" />}
    </svg>
  );
}
