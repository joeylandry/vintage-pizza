/*
 * Generates AI placeholder photos for menu items that have no real photo.
 * Uses the free Pollinations image API. Output: raw JPEGs in OUT_DIR, which
 * scripts/process-images.py then crops (removing the watermark) and converts to WebP.
 *
 *   OUT_DIR=/path/to/raw npx tsx scripts/generate-ai-images.ts [itemId...]
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { menu } from "../src/lib/menu";
import type { MenuItem } from "../src/lib/types";

const OUT_DIR = process.env.OUT_DIR ?? "raw-ai";
const STYLE =
  "editorial food photography, sharp focus, high detail, appetizing, warm natural light, dark wooden table, no text, no people";

/** Hand-written prompts for dishes the generic prompts rendered poorly. */
const OVERRIDES: Record<string, string> = {
  "chicken-tender-dinner": "Photo of crispy golden breaded chicken tenders piled on a plate with seasoned french fries and a cup of creamy coleslaw",
  "asian-tender-dinner": "Photo of crispy fried chicken tenders glazed in sticky sweet asian sauce with sesame seeds, french fries and a cup of creamy coleslaw on a plate",
  "buffalo-tender-dinner": "Photo of crispy fried chicken tenders tossed in orange buffalo hot sauce, french fries and a cup of creamy coleslaw on a plate",
  "chicken-wing-dinner": "Photo of crispy golden fried chicken wings on a plate with french fries and a cup of creamy coleslaw",
  "buffalo-wing-dinner": "Photo of chicken wings coated in orange buffalo hot sauce on a plate with french fries and a cup of creamy coleslaw",
  "southwest-eggrolls": "Close-up photo of crispy golden southwest egg rolls cut diagonally showing black beans, corn, chicken and cheese filling, with a small cup of dipping sauce",
  "jalapeno-poppers": "Close-up photo of golden breaded fried jalapeno poppers, one broken open showing melted cream cheese and green jalapeno inside",
  "raspberry-beignets": "Close-up photo of square New Orleans beignets heavily dusted with powdered sugar, drizzled with bright red raspberry sauce, fresh raspberries",
};

function subject(item: MenuItem): string {
  if (OVERRIDES[item.id]) return OVERRIDES[item.id];
  const d = item.description ? `, ${item.description.toLowerCase()}` : "";
  const n = item.name.replace(/[“”"]/g, "").replace(/17/g, "large");
  switch (item.categoryId) {
    case "specials":
      return item.id.includes("two")
        ? `two whole large New York style pizzas side by side in open cardboard pizza boxes${item.id.includes("topping") ? ", one with pepperoni, one with mushrooms" : ", plain cheese"}`
        : `a whole large New York style ${item.id.includes("topping") ? "pepperoni" : "cheese"} pizza in an open cardboard pizza box`;
    case "pizza":
    case "specialty-pizza":
      return `Top-down photo of a whole round New York style ${n} pizza${d}, bubbling mozzarella, charred blistered crust, on a pizza tray`;
    case "subs":
    case "steak-subs":
      return `Close-up photo of a ${n} sub sandwich${d}, on a toasted Italian sub roll, cut in half, on butcher paper`;
    case "burgers":
      return `Close-up photo of a juicy ${n}${d}, melted cheese on a toasted sesame bun, crispy golden french fries beside it`;
    case "dinners":
      return `Photo of a takeout plate of ${n.replace(" Dinner", "").toLowerCase()} with crispy golden french fries and a small cup of creamy coleslaw`;
    case "salads":
      return `Overhead photo of a fresh ${n.replace(/ Salad$/, "").toLowerCase()} salad${d} in a clear takeout bowl, crisp romaine, tomatoes, cucumbers, red onion`;
    default:
      return `Close-up photo of ${n.toLowerCase()}${d}, freshly made, served in a basket`;
  }
}

async function fetchImage(prompt: string, seed: number): Promise<Buffer> {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=1024&height=768&seed=${seed}&nologo=true`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(180_000) });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.startsWith("image/")) return Buffer.from(await res.arrayBuffer());
      console.warn(`  attempt ${attempt}: HTTP ${res.status} ${type}`);
    } catch (e) {
      console.warn(`  attempt ${attempt}: ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  throw new Error("failed after retries");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const todo = menu.filter(
    (m) => m.image.kind === "ai" && (only.length ? only.includes(m.id) : !existsSync(join(OUT_DIR, `${m.id}.jpg`))),
  );
  console.log(`${todo.length} images to generate`);
  let i = 0;
  const failed: string[] = [];
  const worker = async () => {
    while (i < todo.length) {
      const item = todo[i++];
      const prompt = `${subject(item)}. ${STYLE}`;
      try {
        const buf = await fetchImage(prompt, 3);
        writeFileSync(join(OUT_DIR, `${item.id}.jpg`), buf);
        console.log(`ok   ${item.id}`);
      } catch {
        failed.push(item.id);
        console.log(`FAIL ${item.id}`);
      }
    }
  };
  // The free tier only allows one queued request per IP.
  await worker();
  if (failed.length) console.log("failed:", failed.join(" "));
}

main();
