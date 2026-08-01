import { expect, test } from "@playwright/test";

test("generates a canonical two-word document URL", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\?document=[a-z]+-[a-z]+$/);
});

test("opens the editor and all five sidebar panels", async ({ page }) => {
  await page.goto("/?document=gentle-panda");
  await expect(page.getByRole("navigation", { name: "Document formatting" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Student progress report editor" })).toBeVisible();

  for (const tab of [
    "Chat",
    "Tracked changes",
    "Comments",
    "Suggestions",
    "Supporting documents",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(page.getByRole("tab", { name: tab, exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  }
  await expect(page.getByText("Garden watering routine", { exact: true })).toBeVisible();
});

test("matches the reference toolbar, editor spacing, toggle, and font", async ({ page }) => {
  await page.goto("/?document=gentle-panda");
  const toolbar = page.getByRole("navigation", { name: "Document formatting" });
  const paragraph = page.getByRole("button", { name: "Paragraph" });
  const reset = page.getByRole("button", { name: "Reset app" });
  const editor = page.getByRole("textbox", { name: "Student progress report editor" });
  const chatTab = page.getByRole("tab", { name: "Chat", exact: true });

  await expect(toolbar).toHaveCSS("flex-wrap", "wrap");
  expect(await toolbar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  expect(await paragraph.evaluate((element) => element.parentElement?.className)).toBe(
    await reset.evaluate((element) => element.parentElement?.className),
  );
  await expect(paragraph).toHaveCSS("font-size", "14px");
  await expect(paragraph).toHaveCSS("font-weight", "500");
  await expect(paragraph).toHaveCSS("border-radius", "8px");
  await expect(editor).toHaveCSS("padding", "24px");
  await expect(chatTab).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(chatTab).toHaveCSS("font-size", "12px");
  await expect(page.locator("body")).toHaveCSS("font-family", /Geist/);
});

test("offers document mentions in the minimal chat editor", async ({ page }) => {
  await page.goto("/?document=gentle-panda");
  const composer = page.getByRole("textbox", { name: "Ask the AI to edit the document" });
  await composer.fill("Use @marc");
  await expect(page.getByRole("option", { name: /Marc/ })).toBeVisible();
});

test("reset replaces the document slug", async ({ page }) => {
  await page.goto("/?document=gentle-panda");
  await expect(page.getByRole("button", { name: "Reset app" })).toBeVisible();
  await page.getByRole("button", { name: "Reset app" }).click();
  await expect(page).not.toHaveURL(/document=gentle-panda/);
  await expect(page).toHaveURL(/\?document=[a-z]+-[a-z]+$/);
});

test("synchronizes edits between two browser contexts", async ({ browser }) => {
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  const firstPage = await firstContext.newPage();
  const secondPage = await secondContext.newPage();
  await Promise.all([
    firstPage.goto("/?document=eager-zebra"),
    secondPage.goto("/?document=eager-zebra"),
  ]);

  const firstEditor = firstPage.getByRole("textbox", {
    name: "Student progress report editor",
  });
  const secondEditor = secondPage.getByRole("textbox", {
    name: "Student progress report editor",
  });
  await expect(firstEditor).toBeVisible();
  await expect(secondEditor).toBeVisible();
  await firstEditor.click();
  await firstPage.keyboard.press("ControlOrMeta+End");
  await firstPage.keyboard.type(" Collaborative update.");
  await expect(secondEditor).toContainText("Collaborative update.", {
    timeout: 15_000,
  });

  await firstContext.close();
  await secondContext.close();
});
