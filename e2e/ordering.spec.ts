import { expect, test } from "@playwright/test";
import { addToOrder, at, cartCount, gotoMenu, isMobile, MONDAY_NOON, openItem, SATURDAY_NOON, SUNDAY_NOON, total, WEDNESDAY_NOON } from "./helpers";

test.beforeEach(async ({ page }) => {
  await at(page, MONDAY_NOON);
});

test("home page shows the brand, deals and popular picks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Best pizza");
  await expect(page.getByText("Open until 8 PM").filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular Picks" })).toBeVisible();
  // Same picks, in the same order, as the live vintagepizzanh.com homepage.
  const picks = page.locator("#popular li button");
  await expect(picks).toHaveCount(11);
  await expect(picks.first()).toHaveAccessibleName("Sausage & Ricotta Pizza, $14.49 / $21.99");
  await expect(picks.last()).toHaveAccessibleName("Beignets, $7.99");
  await expect(page.getByRole("heading", { name: "Weekly deals" })).toBeVisible();
  await expect(page.getByText("Today", { exact: true })).toBeVisible(); // Mon & Tue deal highlighted
});

test("popular pick on the home page can be added without leaving the page", async ({ page }) => {
  await page.goto("/");
  const dialog = await openItem(page, "Chicken Tender Dinner");
  await expect(dialog.getByRole("heading", { name: "Chicken Tender Dinner" })).toBeVisible();
  await addToOrder(page);
  await expect(page.getByRole("status")).toContainText("Added Chicken Tender Dinner");
  await expect(await cartCount(page)).toHaveAccessibleName("View order, 1 item");
});

test("build-your-own pizza prices toppings by size and half", async ({ page }) => {
  await gotoMenu(page);
  const d = await openItem(page, "Classic Cheese Pizza");
  // Defaults to large.
  await expect(d.getByRole("radio", { name: /Large 17"/ })).toHaveAttribute("aria-checked", "true");
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$15.99");
  await d.getByRole("checkbox", { name: /^Pepperoni/ }).click();
  await d.getByRole("checkbox", { name: /^Sausage/ }).click();
  await d.getByRole("radio", { name: "Sausage: Right half" }).click();
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$20.49"); // 15.99 + 2×2.25
  await d.getByRole("radio", { name: /Small 13"/ }).click();
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$13.49"); // 10.99 + 2×1.25
  await d.getByRole("checkbox", { name: "Steak" }).click();
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$17.49"); // + 4.00
  await d.getByRole("button", { name: "Increase quantity" }).click();
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$34.98");
  await addToOrder(page);

  await page.goto("/cart");
  const line = page.getByTestId("cart-line");
  await expect(line).toContainText('Small 13" · Pepperoni · Sausage (right half) · Steak');
  await expect(line).toContainText("$34.98");
  // 34.98 + 8.5% tax (2.97) = 37.95
  await expect(total(page)).toHaveText("$37.95");
});

test("salads require a dressing and charge for extra", async ({ page }) => {
  await gotoMenu(page);
  const d = await openItem(page, "Garden Salad");
  await d.getByRole("button", { name: /Add to order/ }).click();
  await expect(d.getByRole("alert")).toHaveText("Choose one");
  await expect(d).toBeVisible();
  await d.getByRole("radiogroup", { name: "Dressing" }).getByRole("radio", { name: "House Greek" }).click();
  await d.getByRole("group", { name: "Extra Dressing" }).getByRole("checkbox", { name: /Fresh Ranch/ }).click();
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$10.78");
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toContainText("House Greek · Extra Fresh Ranch");
});

test("subs offer a sub roll or Syrian wrap and free fixings", async ({ page }) => {
  await gotoMenu(page);
  const d = await openItem(page, "Italian");
  await expect(d.getByRole("radio", { name: "Sub Roll" })).toHaveAttribute("aria-checked", "true");
  await d.getByRole("radio", { name: "Syrian Wrap" }).click();
  await d.getByRole("checkbox", { name: "Hots" }).click();
  await d.getByRole("checkbox", { name: "Oil" }).click();
  await expect(d.getByRole("button", { name: /Add to order/ })).toContainText("$11.49");
  await d.getByRole("textbox", { name: "Special instructions" }).fill("extra hots please");
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toContainText("Syrian Wrap · Hots · Oil");
  await expect(page.getByTestId("cart-line")).toContainText("extra hots please");
});

test("weekday specials are only orderable on their days", async ({ page }) => {
  await gotoMenu(page);
  let d = await openItem(page, 'Large 17" One-Topping Pizza');
  await d.getByRole("button", { name: /Add to order/ }).click();
  await expect(d.getByRole("alert")).toHaveText("Choose one");
  await d.getByRole("radio", { name: "Bacon" }).click();
  await addToOrder(page);

  // The Wednesday deal is disabled on Monday.
  d = await openItem(page, 'Two Large 17" Cheese Pizzas');
  await expect(d.getByRole("button", { name: /Only available Wednesdays & Thursdays/ })).toBeDisabled();
});

test("a Monday special left in the cart blocks checkout on Wednesday", async ({ page }) => {
  await gotoMenu(page);
  await openItem(page, 'Large 17" Cheese Pizza');
  await addToOrder(page);
  await at(page, WEDNESDAY_NOON);
  await page.goto("/cart");
  await expect(page.getByText(/Only available Mondays & Tuesdays/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Checkout/ })).toBeDisabled();
  await page.getByRole("button", { name: /Remove Large 17" Cheese Pizza/ }).click();
  await expect(page.getByRole("heading", { name: "Your order is empty" })).toBeVisible();
});

test("$5 off orders of $50 or more", async ({ page }) => {
  await gotoMenu(page);
  await openItem(page, "Chicken Tender Party Tray");
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByText("Add $0.01 more to get $5 off.")).toBeVisible();
  await expect(total(page)).toHaveText("$54.24"); // 49.99 + 4.25 tax
  await page.getByRole("button", { name: /^Cannoli/ }).click();
  await addToOrder(page);
  await expect(page.getByText("$5 off orders of $50+")).toBeVisible();
  // (49.99 + 3.49 − 5) = 48.48, tax 4.12 → 52.60
  await expect(total(page)).toHaveText("$52.60");
});

test("large specialty pizza earns a free cannoli; specials can't be combined", async ({ page }) => {
  await gotoMenu(page);
  const d = await openItem(page, "Honey Boy");
  await d.getByRole("radio", { name: /Large 17"/ }).click();
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByTestId("free-cannoli")).toContainText("Cannoli × 1");

  await gotoMenu(page);
  await openItem(page, 'Large 17" Cheese Pizza');
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByTestId("free-cannoli")).toHaveCount(0);
  await expect(page.getByText("Weekday specials can't be combined with other offers.")).toBeVisible();
});

test("identical items merge; quantity, edit and remove work", async ({ page }) => {
  await gotoMenu(page);
  await openItem(page, "Cannoli");
  await addToOrder(page);
  await openItem(page, "Cannoli");
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-line")).toContainText("$6.98");

  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByTestId("cart-line")).toContainText("$10.47");
  await page.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(page.getByTestId("cart-line")).toContainText("$6.98");

  await gotoMenu(page);
  const d = await openItem(page, "Chicken Wings");
  await expect(d.getByRole("radio", { name: /Small/ })).toHaveAttribute("aria-checked", "true");
  await addToOrder(page);
  await page.goto("/cart");
  const wings = page.getByTestId("cart-line").filter({ hasText: "Chicken Wings" });
  await wings.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("dialog").getByRole("radio", { name: /Large/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Update order/ }).click();
  await expect(wings).toContainText("Large");
  await expect(wings).toContainText("$18.49");

  await page.getByRole("button", { name: "Remove Chicken Wings" }).click();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
});

test("the order survives a reload", async ({ page }) => {
  await gotoMenu(page);
  await openItem(page, "Beignets");
  await addToOrder(page);
  await page.reload();
  await expect(await cartCount(page)).toHaveAccessibleName("View order, 1 item");
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toContainText("Beignets");
});

test("delivery adds the $2.99 charge and needs an address before checkout", async ({ page }) => {
  await gotoMenu(page);
  await openItem(page, "French Fries");
  await addToOrder(page);
  await page.goto("/cart");
  const checkout = page.getByRole("button", { name: /Checkout/ });
  await expect(checkout).toBeEnabled();
  await expect(total(page)).toHaveText("$7.58"); // 6.99 + 0.59

  await page.getByRole("radio", { name: "Delivery" }).click();
  await expect(total(page)).toHaveText("$10.57");
  await expect(page.getByText("Add your delivery address.")).toBeVisible();
  await expect(checkout).toBeDisabled();

  await page.getByLabel("Street address").fill("123 Elm St");
  await page.getByLabel("ZIP code").fill("03a1b0c9");
  await expect(page.getByLabel("ZIP code")).toHaveValue("03109");
  await expect(checkout).toBeEnabled();
  await checkout.click();
  await expect(page).toHaveURL(/\/checkout$/);
});

test("checkout is disabled while the store is closed", async ({ page }) => {
  await at(page, SUNDAY_NOON);
  await gotoMenu(page);
  await expect(page.getByText(/We're closed right now/)).toBeVisible();
  await openItem(page, "Cannoli");
  await addToOrder(page);
  await page.goto("/cart");
  await expect(page.getByTestId("checkout-blockers")).toContainText("opens tomorrow at 11 AM");
  await expect(page.getByRole("button", { name: /Checkout/ })).toBeDisabled();
});

test("Saturday hours run until 9 PM", async ({ page }) => {
  await at(page, SATURDAY_NOON);
  await page.goto("/");
  await expect(page.getByText("Open until 9 PM").filter({ visible: true }).first()).toBeVisible();
});

test("menu search filters items", async ({ page }) => {
  await gotoMenu(page);
  if (isMobile(page)) await page.getByRole("button", { name: "Search the menu" }).click();
  await page.getByRole("searchbox", { name: "Search the menu" }).fill("wings");
  await expect(page.getByRole("button", { name: /^Buffalo Wings,/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Honey Boy,/ })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search the menu" }).fill("jalapeno");
  await expect(page.getByRole("button", { name: /^Jalapeño Poppers,/ })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search the menu" }).fill("sushi");
  await expect(page.getByText("No matches for “sushi”")).toBeVisible();
});

test("ordering starts with order details: pickup or delivery", async ({ page }) => {
  await page.goto("/order");
  await expect(page.getByRole("heading", { name: "Order details", level: 1 })).toBeVisible();
  await page.getByRole("radio", { name: /Delivery/ }).click();
  await page.getByRole("button", { name: /Continue to menu/ }).click();
  await expect(page.getByText("Add your delivery address to continue.")).toBeVisible();
  await page.getByLabel("Street address").fill("123 Elm St");
  await page.getByLabel("ZIP code").fill("03109");
  await page.getByRole("button", { name: /Continue to menu/ }).click();
  await expect(page.getByRole("heading", { name: "Full menu", level: 1 })).toBeVisible();
  await expect(page.getByText("123 Elm St").first()).toBeVisible();

  // The choice is remembered, and can be changed from the menu.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Full menu", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Change order details" }).click();
  await expect(page.getByRole("heading", { name: "Order details", level: 1 })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Delivery/ })).toHaveAttribute("aria-checked", "true");
});

test("deep link opens an item", async ({ page }) => {
  await page.goto("/order?item=honey-boy");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Honey Boy" })).toBeVisible();
  await expect(page).toHaveURL(/\/order$/);
});

test("item sheet closes with Escape and the close button", async ({ page }) => {
  await gotoMenu(page);
  await openItem(page, "Onion Rings");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await openItem(page, "Onion Rings");
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("mobile shows a sticky order bar", async ({ page }) => {
  test.skip(!isMobile(page), "mobile only");
  await gotoMenu(page);
  await openItem(page, "Cannoli");
  await addToOrder(page);
  const bar = page.getByRole("link", { name: /View order\s*\$3\.79/ });
  await expect(bar).toBeVisible();
  await bar.click();
  await expect(page).toHaveURL(/\/cart$/);
});

test("pages have no console errors or broken images", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("google.com") && errors.push(`${r.status()} ${r.url()}`));
  for (const path of ["/", "/order", "/cart", "/checkout"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForLoadState("networkidle");
    const broken = await page.$$eval("img", (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    errors.push(...broken.map((s) => `broken image ${s}`));
  }
  expect(errors).toEqual([]);
});

test("no page scrolls sideways", async ({ page }) => {
  await page.goto("/order?item=honey-boy");
  await addToOrder(page);
  for (const path of ["/", "/order", "/cart", "/checkout"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    const { client, scroll } = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(scroll, path).toBeLessThanOrEqual(client);
  }
});
