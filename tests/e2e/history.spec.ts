import { expect, test, type Page } from "@playwright/test";

const HISTORY_ITEM = {
  id: "review-seed-1",
  code: "console.log('hello world')",
  language: "javascript",
  reviewType: "full",
  result: {
    summary: "Simple, working code with no issues.",
    score: 95,
    issues: [
      {
        id: "issue-1",
        severity: "info",
        category: "best-practice",
        title: "Consider using a logger",
        description: "console.log is fine for scripts, but a logger is better for apps.",
        line: 1,
        suggestion: "Use a structured logger in production code.",
        codeSnippet: "console.log('hello world')",
      },
    ],
    positives: ["Clear and simple"],
    refactoredSnippet: null,
  },
  createdAt: "2025-01-01T00:00:00.000Z",
};

/** Seeds `redux-persist` localStorage state before the app's first render. */
async function seedHistory(page: Page) {
  await page.addInitScript((item) => {
    const persisted = {
      history: JSON.stringify({ reviews: [item], selectedId: null }),
      ui: JSON.stringify({ theme: "dark", sidebarOpen: false, activeTab: "editor" }),
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    };
    localStorage.setItem("persist:ai-code-review", JSON.stringify(persisted));
  }, HISTORY_ITEM);
}

test.describe("History", () => {
  test("shows a saved review and reloads it into the editor on click", async ({ page }) => {
    await seedHistory(page);
    await page.goto("/history");

    await expect(page.getByText("JavaScript")).toBeVisible();
    await expect(page.getByText("95/100")).toBeVisible();
    await expect(page.getByText("Consider using a logger")).toBeVisible();

    await page.getByText("Consider using a logger").click();

    await expect(page).toHaveURL(/\/review$/);
    await expect(page.getByText("Simple, working code with no issues.")).toBeVisible();
  });

  test("clear history removes all saved reviews", async ({ page }) => {
    await seedHistory(page);
    await page.goto("/history");

    await expect(page.getByText("1 saved review")).toBeVisible();
    await page.getByRole("button", { name: /clear history/i }).click();

    await expect(page.getByText(/no reviews yet/i)).toBeVisible();
  });
});

test.describe("Theme toggle", () => {
  test("switches between dark and light mode", async ({ page }) => {
    await page.goto("/review");

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    await page.getByRole("button", { name: /switch to light mode/i }).click();
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: /switch to dark mode/i }).click();
    await expect(html).toHaveClass(/dark/);
  });
});
