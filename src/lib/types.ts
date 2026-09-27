export type SizeId = string;

/** A price that is either flat or depends on the item's selected size. */
export type Price = number | Record<SizeId, number>;

export type Choice = {
  id: string;
  label: string;
  /** Extra cost for picking this choice. Omitted means free. */
  price?: Price;
};

export type OptionGroup = {
  id: string;
  label: string;
  hint?: string;
  type: "single" | "multi";
  /** Minimum number of choices required (0 = optional). */
  min: number;
  /** Maximum number of choices allowed (Infinity when unlimited). */
  max: number;
  choices: Choice[];
  /** Pizza toppings can go on the whole pie or on one half. */
  placement?: boolean;
  /** Choice ids selected when the item is first opened. */
  defaults?: string[];
};

export type Size = { id: SizeId; label: string; detail?: string; price: number };

export type ItemImage = {
  src: string;
  /** "photo" = real Vintage Pizza photo; "ai" = AI-generated placeholder. */
  kind: "photo" | "ai";
};

export type Availability = {
  /** Days of the week (0 = Sunday) the item can be ordered, in store time. */
  days: number[];
  label: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  /** Flat price for single-size items. */
  price?: number;
  sizes?: Size[];
  optionGroups: OptionGroup[];
  image: ItemImage;
  favorite?: boolean;
  popular?: boolean;
  /** A "Specials" deal — cannot be combined with other offers. */
  deal?: boolean;
  availability?: Availability;
  note?: string;
  /** Counts toward "free cannoli with large specialty pizza". */
  specialtyPizza?: boolean;
};

export type Category = {
  id: string;
  name: string;
  blurb?: string;
};

export type Placement = "whole" | "left" | "right";

export type Selection = { choiceId: string; placement?: Placement };

export type CartLine = {
  lineId: string;
  itemId: string;
  sizeId?: SizeId;
  selections: Record<string, Selection[]>;
  quantity: number;
  notes: string;
};

export type OrderMode = "pickup" | "delivery";

export type DeliveryAddress = {
  street: string;
  unit: string;
  city: string;
  zip: string;
};
