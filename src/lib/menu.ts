import type { Category, Choice, MenuItem, OptionGroup, Size } from "./types";

/*
 * Menu data transcribed from the Vintage Pizza printed menu (MENU-SEPT-2025.pdf)
 * published at vintagepizzanh.com. Where the website's "Popular Picks" list
 * disagreed with the PDF, the PDF (the newer source) wins.
 */

/** Items with a real Vintage Pizza photo. Everything else uses an AI placeholder. */
const PHOTO_ITEMS = new Set([
  "original-margherita",
  "sausage-ricotta",
  "greek-pizza",
  "italian-sub",
  "texas-cheeseburger",
  "chicken-tenders",
  "chicken-tender-dinner",
  "buffalo-tenders",
  "chicken-tender-party-tray",
  "asian-tender-salad",
  "grilled-chicken-greek-salad",
  "garden-salad",
  "sticks-and-stones",
  "cannoli",
  "beignets",
]);

const img = (id: string) => ({
  src: `/menu/${id}.webp`,
  kind: PHOTO_ITEMS.has(id) ? ("photo" as const) : ("ai" as const),
});

export const categories: Category[] = [
  { id: "specials", name: "Deals", blurb: "Weekly pizza-night deals. Can't be combined with any other offer." },
  { id: "appetizers", name: "Appetizers & Sides" },
  { id: "tenders-wings", name: "Tenders & Wings", blurb: "Award-winning, hand-breaded fresh chicken tenders and fresh wings." },
  { id: "pizza", name: "Build Your Own Pizza", blurb: 'Hand-tossed and topped with Grande mozzarella. Small 13" or large 17".' },
  { id: "specialty-pizza", name: "Specialty Pizzas", blurb: "Sausage Ricotta, Texas BBQ and Honey Boy are the fan favorites. Free cannoli with any large specialty pizza." },
  { id: "dinners", name: "Dinners", blurb: "Every dinner comes with french fries and coleslaw." },
  { id: "salads", name: "Fresh Salads", blurb: "Every salad comes with your choice of dressing and Syrian bread." },
  { id: "grilled-subs", name: "Grilled & Parm Subs" },
  { id: "subs", name: "Deli Subs", blurb: "Choose a sub roll or Syrian wrap, then pick your fixings." },
  { id: "burgers", name: "Cheeseburgers", blurb: "Every burger comes with french fries." },
  { id: "desserts", name: "Desserts", blurb: "Cannoli & beignets." },
];

/* ---------- Shared option groups ---------- */

export const PIZZA_SIZES: Size[] = [
  { id: "13", label: 'Small 13"', price: 0 },
  { id: "17", label: 'Large 17"', price: 0 },
];

const pizzaSizes = (small: number, large: number): Size[] => [
  { id: "13", label: 'Small 13"', price: small },
  { id: "17", label: 'Large 17"', price: large },
];

const TOPPING_NAMES = [
  "Pepperoni",
  "Sausage",
  "Ham",
  "Hamburg",
  "Meatball",
  "Bacon",
  "Salami",
  "Old World Pepperoni",
  "Onion",
  "Green Pepper",
  "Olives",
  "Mushroom",
  "Garlic",
  "Broccoli",
  "Tomatoes",
  "Spinach",
  "Pineapple",
  "Roasted Red Peppers",
  "Eggplant",
  "Ricotta",
  "Feta",
  "Extra Cheese",
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toppingChoices = (price: Choice["price"]): Choice[] =>
  TOPPING_NAMES.map((label) => ({ id: slug(label), label, price }));

const extraToppings: OptionGroup = {
  id: "toppings",
  label: "Toppings",
  hint: '+$1.25 each on a 13", +$2.25 on a 17". Put them on the whole pie or half.',
  type: "multi",
  min: 0,
  max: Infinity,
  placement: true,
  choices: toppingChoices({ "13": 1.25, "17": 2.25 }),
};

const pizzaProtein: OptionGroup = {
  id: "protein",
  label: "Add Chicken or Steak",
  type: "multi",
  min: 0,
  max: Infinity,
  placement: true,
  choices: [
    { id: "grilled-chicken", label: "Grilled Chicken", price: { "13": 3, "17": 4 } },
    { id: "fried-chicken", label: "Fried Chicken", price: { "13": 3, "17": 4 } },
    { id: "steak", label: "Steak", price: { "13": 4, "17": 6 } },
  ],
};

const garlicCup: OptionGroup = {
  id: "sides",
  label: "On the Side",
  type: "multi",
  min: 0,
  max: Infinity,
  choices: [{ id: "garlic-butter-cup", label: "Garlic Butter Dipping Cup", price: 0.89 }],
};

const pizzaOptions = [extraToppings, pizzaProtein, garlicCup];

const oneTopping = (id: string, label: string): OptionGroup => ({
  id,
  label,
  type: "single",
  min: 1,
  max: 1,
  choices: toppingChoices(undefined),
});

const subBread: OptionGroup = {
  id: "bread",
  label: "Sub or Wrap",
  type: "single",
  min: 1,
  max: 1,
  defaults: ["sub-roll"],
  choices: [
    { id: "sub-roll", label: "Sub Roll" },
    { id: "syrian-wrap", label: "Syrian Wrap" },
  ],
};

const subFixings: OptionGroup = {
  id: "fixings",
  label: "Fixings",
  hint: "Included — pick as many as you like.",
  type: "multi",
  min: 0,
  max: Infinity,
  choices: ["Cheese", "Lettuce", "Tomatoes", "Pickles", "Onions", "Hots", "Mayo", "Oil"].map(
    (label) => ({ id: slug(label), label }),
  ),
};

const DRESSINGS = [
  "House Greek",
  "Italian",
  "Fresh Ranch",
  "Bleu Cheese",
  "Honey Mustard",
  "Balsamic Vinaigrette",
  "Thousand Island",
];

const dressing: OptionGroup = {
  id: "dressing",
  label: "Dressing",
  type: "single",
  min: 1,
  max: 1,
  choices: DRESSINGS.map((label) => ({ id: slug(label), label })),
};

const extraDressing: OptionGroup = {
  id: "extra-dressing",
  label: "Extra Dressing",
  hint: "+$0.79 each",
  type: "multi",
  min: 0,
  max: Infinity,
  choices: DRESSINGS.map((label) => ({ id: slug(label), label, price: 0.79 })),
};

const saladOptions = [dressing, extraDressing];

/* ---------- Item builders ---------- */

type Extra = Partial<MenuItem>;

const flat = (categoryId: string, name: string, price: number, extra: Extra = {}): MenuItem => {
  const id = extra.id ?? slug(name);
  return { id, name, categoryId, price, optionGroups: [], image: img(id), ...extra };
};

const sized = (categoryId: string, name: string, sizes: Size[], extra: Extra = {}): MenuItem => {
  const id = extra.id ?? slug(name);
  return { id, name, categoryId, sizes, optionGroups: [], image: img(id), ...extra };
};

const specialty = (name: string, small: number, large: number, description: string, extra: Extra = {}) =>
  sized("specialty-pizza", name, pizzaSizes(small, large), {
    description,
    optionGroups: pizzaOptions,
    specialtyPizza: true,
    ...extra,
  });

const sub = (name: string, price: number, extra: Extra = {}) =>
  flat("subs", name, price, { optionGroups: [subBread, subFixings], ...extra });

const steakSub = (name: string, price: number, extra: Extra = {}) =>
  flat("grilled-subs", name, price, { optionGroups: [subFixings], ...extra });

const grilledSub = (name: string, price: number, extra: Extra = {}) =>
  flat("grilled-subs", name, price, { optionGroups: [subBread, subFixings], ...extra });

const burger = (name: string, price: number, extra: Extra = {}) =>
  flat("burgers", name, price, { note: "Served with french fries", ...extra });

const dinner = (name: string, price: number, extra: Extra = {}) =>
  flat("dinners", name, price, { note: "Served with french fries and coleslaw", ...extra });

const salad = (name: string, price: number, extra: Extra = {}) =>
  flat("salads", name, price, { optionGroups: saladOptions, note: "Served with Syrian bread", ...extra });

const twoSizes = (small: number, large: number, smallDetail?: string, largeDetail?: string): Size[] => [
  { id: "sm", label: "Small", detail: smallDetail, price: small },
  { id: "lg", label: "Large", detail: largeDetail, price: large },
];

const MON_TUE = { days: [1, 2], label: "Mondays & Tuesdays" };
const WED_THU = { days: [3, 4], label: "Wednesdays & Thursdays" };

/* ---------- The menu ---------- */

export const menu: MenuItem[] = [
  // Specials
  flat("specials", 'Large 17" Cheese Pizza', 9.99, {
    id: "deal-large-cheese",
    description: "Our classic cheese pie, large, for less.",
    availability: MON_TUE,
    deal: true,
    optionGroups: [],
  }),
  flat("specials", 'Large 17" One-Topping Pizza', 11.99, {
    id: "deal-large-one-topping",
    description: "Any single topping on a large pie. Online orders only.",
    availability: MON_TUE,
    deal: true,
    optionGroups: [oneTopping("topping", "Your Topping")],
  }),
  flat("specials", 'Two Large 17" Cheese Pizzas', 19.99, {
    id: "deal-two-large-cheese",
    description: "Two large cheese pies.",
    availability: WED_THU,
    deal: true,
  }),
  flat("specials", 'Two Large 17" One-Topping Pizzas', 23.99, {
    id: "deal-two-large-one-topping",
    description: "Two large pies, one topping each.",
    availability: WED_THU,
    deal: true,
    optionGroups: [oneTopping("topping-1", "Pizza #1 Topping"), oneTopping("topping-2", "Pizza #2 Topping")],
  }),

  // Build your own
  sized("pizza", "Classic Cheese Pizza", pizzaSizes(10.99, 15.99), {
    id: "classic-cheese",
    description: "Grande mozzarella and our house pizza sauce. Add any toppings you like.",
    optionGroups: pizzaOptions,
    favorite: true,
    popular: true,
  }),

  // Specialty pizza
  specialty("Vintage Special", 14.99, 21.99, "Pepperoni, sausage, hamburg, onion, pepper, mushroom", { favorite: true }),
  specialty("Sausage & Ricotta", 14.49, 21.99, "Garlic butter base, Grande mozzarella, smooth ricotta, Italian sausage, splashes of marinara", {
    id: "sausage-ricotta",
    favorite: true,
    popular: true,
  }),
  specialty("Pepperoni Lovers", 13.49, 20.99, "Covered in both Old World pepperoni and bold pepperoni", { favorite: true, popular: true }),
  specialty("Honey Boy", 15.99, 22.99, "Pizza sauce, Old World pepperoni, ricotta and Mike's Hot Honey drizzle", { favorite: true, popular: true }),
  specialty("Texas BBQ", 15.49, 21.99, "BBQ sauce, bacon, crispy chicken, pineapple, jalapeño", { favorite: true, popular: true }),
  specialty("Original Margherita", 12.99, 18.99, "Fresh mozzarella, tomato sauce, olive oil, Romano, basil pesto", { favorite: true }),
  specialty("Fig Jam Bacon & Ricotta", 16.49, 22.99, "Grande mozzarella, ricotta, smoked bacon, fig jam and balsamic glaze", { favorite: true }),
  specialty("Chipotle Chicken", 15.49, 22.99, "Alfredo sauce, crispy chicken, diced tomato, bacon, chipotle drizzle", { favorite: true }),
  specialty("Polo Pizza", 16.49, 22.99, "Chicken broccoli Alfredo with bacon and onions", { id: "polo-pizza", favorite: true }),
  specialty("Vegetarian", 14.5, 21.99, "Onion, green pepper, mushroom, tomato, black olives", { id: "vegetarian-pizza" }),
  specialty("Meat Lovers", 16.5, 22.99, "Pepperoni, sausage, hamburg, bacon"),
  specialty("Greek", 14.5, 21.99, "Spinach, feta, tomato, black olive, oregano", { id: "greek-pizza" }),
  specialty("BBQ Chicken", 13.75, 18.99, "", { id: "bbq-chicken-pizza" }),
  specialty("Buffalo Chicken", 13.75, 18.99, "", { id: "buffalo-chicken-pizza" }),
  specialty("Steak Bomb", 17.5, 23.99, "Steak, onions, peppers, mushrooms", { id: "steak-bomb-pizza" }),
  specialty("Chicken Broccoli Alfredo", 15.5, 22.99, ""),

  // Subs & Syrian wraps (deli subs; grilled & parm subs use grilledSub)
  sub("Italian", 11.49, { id: "italian-sub", favorite: true }),
  sub("Spicy Italian", 11.49, {
    id: "spicy-italian-sub",
    description: "Cooked salami, imported ham, spicy bold pepperoni, provolone",
    favorite: true,
    popular: true,
  }),
  sub("Turkey", 11.49, { id: "turkey-sub", favorite: true }),
  sub("Tuna", 11.49, { id: "tuna-sub", favorite: true }),
  sub("Chicken Salad", 11.49, { id: "chicken-salad-sub", favorite: true }),
  sub("Vintage Special", 12.49, { id: "vintage-special-sub", description: "Turkey, ham, bacon, American cheese" }),
  sub("Vegetarian", 9.99, { id: "vegetarian-sub" }),
  sub("American", 11.49, { id: "american-sub" }),
  sub("Imported Ham", 11.49, { id: "imported-ham-sub" }),
  sub("BLT", 11.49, { id: "blt-sub" }),
  sub("Genoa Salami", 11.49, { id: "genoa-salami-sub" }),
  grilledSub("Meatball", 11.49, { id: "meatball-sub" }),
  grilledSub("Chicken Parmesan", 11.49, { id: "chicken-parmesan-sub" }),
  grilledSub("Eggplant Parmesan", 11.49, { id: "eggplant-parmesan-sub" }),
  grilledSub("Grilled Chicken", 12.49, { id: "grilled-chicken-sub" }),
  grilledSub("Chicken Teriyaki", 12.99, { id: "chicken-teriyaki-sub" }),
  grilledSub("Grilled Chicken Bomb", 12.99, { id: "grilled-chicken-bomb-sub", description: "Onions, peppers, mushrooms" }),
  grilledSub("Buffalo Chicken", 12.49, { id: "buffalo-chicken-sub" }),
  grilledSub("Cheeseburger Sub", 12.49, { id: "cheeseburger-sub" }),

  // Steak subs (grilled)
  steakSub("Steak Bomb", 13.49, {
    id: "steak-bomb-sub",
    description: "Grilled onions, grilled peppers, grilled mushrooms, melted cheese",
    popular: true,
  }),
  steakSub("Steak & Cheese", 12.49, { id: "steak-and-cheese-sub" }),
  steakSub("Steak Special", 13.49, { id: "steak-special-sub", description: "Pepperoni and salami" }),
  steakSub("Steak Combo", 13.99, { id: "steak-combo-sub", description: "Onion, pepper, mushroom, pepperoni, salami" }),

  // Burgers
  burger("Cheeseburger", 10.49),
  burger("Bacon Cheeseburger", 11.75),
  burger("Texas Cheeseburger", 10.99, { description: "Lettuce, tomato, onion, mayo" }),
  burger("Vintage Cheeseburger", 11.49, { description: "Pickle, onion, bacon, BBQ sauce" }),
  burger("Mushroom Swiss Cheeseburger", 11.49, { description: "Mayo, lettuce, tomato" }),
  burger("Chipotle Cheeseburger", 11.49, { description: "Chipotle aioli, bacon, lettuce, tomato" }),
  burger("California Cheeseburger", 11.49, { description: "Lettuce, tomato, bacon, onion, special sauce" }),

  // Dinners
  dinner("Chicken Tender Dinner", 15.99, {
    description: "Fresh hand-breaded tenders, seasoned fries, homemade coleslaw, duck sauce",
    favorite: true,
    popular: true,
  }),
  dinner("Asian Tender Dinner", 16.79, { favorite: true }),
  dinner("Buffalo Tender Dinner", 16.79),
  dinner("Chicken Wing Dinner", 15.99),
  dinner("Buffalo Wing Dinner", 16.79),

  // Salads
  salad("Grilled Chicken Greek Salad", 13.99, { favorite: true, popular: true }),
  salad("Asian Tender Salad", 12.99, { favorite: true, popular: true }),
  salad("Greek Salad", 11.99, { description: "Feta cheese, Kalamata olives", favorite: true }),
  salad("Garden Salad", 9.99),
  salad("Tuna Salad", 12.49),
  salad("Antipasto Salad", 12.49, { description: "Pepperoni, salami, ham, provolone" }),
  salad("Julienne Salad", 12.49, { description: "Ham, turkey, provolone" }),
  salad("Chicken Salad Salad", 12.49, { id: "chicken-salad-salad" }),
  salad("Grilled Chicken Salad", 12.49),
  salad("Buffalo Chicken Salad", 12.99),
  // Caesar salads come dressed, so the dressing pick is optional (extra is still available).
  salad("Caesar Salad", 9.99, { optionGroups: [extraDressing] }),
  salad("Grilled Chicken Caesar Salad", 12.99, { optionGroups: [extraDressing] }),

  // Appetizers
  sized("tenders-wings", "Chicken Tenders", twoSizes(11.49, 16.99, "8 pieces", "16 pieces"), { favorite: true, popular: true }),
  sized("tenders-wings", "Asian Tenders", twoSizes(11.99, 17.75), { favorite: true }),
  sized("tenders-wings", "Buffalo Tenders", twoSizes(11.99, 17.49)),
  sized("tenders-wings", "BBQ Tenders", twoSizes(11.99, 17.49)),
  sized("tenders-wings", "Chicken Wings", twoSizes(11.99, 18.49), { favorite: true }),
  sized("tenders-wings", "Asian Wings", twoSizes(12.49, 18.99), { favorite: true }),
  sized("tenders-wings", "Buffalo Wings", twoSizes(12.49, 18.99)),
  sized("tenders-wings", "BBQ Wings", twoSizes(12.99, 18.99)),
  sized("appetizers", "Mozzarella Sticks", twoSizes(9.99, 15.99)),
  flat("appetizers", "Sticks & Stones", 11.99, { description: "5 mozzarella sticks and 5 jalapeño poppers" }),
  flat("appetizers", "Garlic Bread with Cheese", 5.99, { favorite: true }),
  flat("appetizers", "Texas Cheese Fries", 10.49, { description: "Cheese fries with bacon and jalapeño", favorite: true }),
  flat("appetizers", "Cheese Fries", 8.99),
  flat("appetizers", "French Fries", 6.99),
  flat("appetizers", "Spicy Fries", 7.49),
  flat("appetizers", "Onion Rings", 7.99),
  flat("appetizers", "Jalapeño Poppers", 10.99, { id: "jalapeno-poppers", description: "Cream cheese filled" }),
  flat("appetizers", "Southwest Eggrolls", 11.99),
  flat("appetizers", "Meatballs & Sauce", 9.49),
  flat("tenders-wings", "Chicken Tender Party Tray", 49.99, { description: "Over 60 pieces — built for a crowd" }),

  // Desserts
  flat("desserts", "Cannoli", 3.49, { description: "Freshly filled with our sweetened ricotta", favorite: true, popular: true }),
  flat("desserts", "Beignets", 7.99, {
    description: "Pillows of New Orleans-style fried dough dusted with cinnamon sugar and powdered sugar",
    favorite: true,
    popular: true,
  }),
  flat("desserts", "Raspberry Beignets", 7.99, { favorite: true }),
];

export const menuById: Record<string, MenuItem> = Object.fromEntries(menu.map((m) => [m.id, m]));

export const getItem = (id: string): MenuItem | undefined => menuById[id];

export const itemsInCategory = (categoryId: string) => menu.filter((m) => m.categoryId === categoryId);

export const popularItems = () => menu.filter((m) => m.popular);

export const CANNOLI_PRICE = 3.49;
