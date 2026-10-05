import { expect, type Page } from "@playwright/test";

// Store-time instants (America/New_York, EDT).
export const MONDAY_NOON = new Date("2026-09-28T16:00:00Z");
export const WEDNESDAY_NOON = new Date("2026-09-30T16:00:00Z");
export const SATURDAY_NOON = new Date("2026-09-26T16:00:00Z");
export const SUNDAY_NOON = new Date("2026-09-27T16:00:00Z");

export async function at(page: Page, when: Date) {
  await page.clock.setFixedTime(when);
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1000) < 1024;

/** Opens an item from the menu page by its visible name. */
export async function openItem(page: Page, name: string | RegExp) {
  const re = typeof name === "string" ? new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},`) : name;
  await page.getByRole("button", { name: re }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function addToOrder(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /Add to order|Update order/ }).click();
  await expect(dialog).toBeHidden();
}

export async function cartCount(page: Page) {
  return page.getByRole("link", { name: /View order, \d+ items?/ }).first();
}

export const total = (page: Page) => page.getByTestId("order-total").first();

/** Opens the menu, passing the "Order details" step (pickup) the first time. */
export async function gotoMenu(page: Page) {
  await page.goto("/order");
  // The server renders the menu; once the saved order loads, either the step replaces it or the details bar appears.
  const step = page.getByRole("heading", { name: "Order details", level: 1 });
  const ready = page.getByRole("button", { name: "Change order details" });
  await expect(step.or(ready)).toBeVisible();
  if (await step.isVisible()) await page.getByRole("button", { name: /Continue to menu/ }).click();
  await expect(ready).toBeVisible();
}
