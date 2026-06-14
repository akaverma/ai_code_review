import { expect, test, type Page } from "@playwright/test";

const MOCK_REVIEW_RESPONSE = JSON.stringify({
  summary: "The function works but has a SQL injection vulnerability and an unused variable.",
  score: 58,
  issues: [
    {
      id: "issue-1",
      severity: "critical",
      category: "security",
      title: "SQL Injection vulnerability",
      description: "User input is directly interpolated into the SQL query string.",
      line: 2,
      suggestion: "Use a parameterized query instead of string interpolation.",
      codeSnippet: "db.query(`SELECT * FROM users WHERE id = ${id}`)",
    },
    {
      id: "issue-2",
      severity: "info",
      category: "readability",
      title: "Unused variable",
      description: "The variable `unused` is declared but never used.",
      line: 1,
      suggestion: "Remove the unused variable.",
      codeSnippet: "const unused = 42;",
    },
  ],
  positives: ["Function has a clear, descriptive name"],
  refactoredSnippet: "db.query('SELECT * FROM users WHERE id = ?', [id])",
});

/** Mocks the streaming `/api/review` endpoint so tests don't depend on a real API key. */
async function mockReviewEndpoint(page: Page) {
  await page.route("**/api/review", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: MOCK_REVIEW_RESPONSE,
    });
  });
}

/** Types code into the Monaco editor by targeting its underlying textarea. */
async function fillEditor(page: Page, code: string) {
  const editor = page.locator(".monaco-editor textarea").first();
  await editor.click();
  await editor.fill(code);
}

test.describe("Review flow", () => {
  test("user pastes code, runs a review, and sees structured issue cards", async ({ page }) => {
    await mockReviewEndpoint(page);
    await page.goto("/review");

    await fillEditor(page, "const unused = 42;\ndb.query(`SELECT * FROM users WHERE id = ${id}`);");

    await page.getByRole("button", { name: /review code/i }).click();

    // While the response streams in, the raw text + skeleton are visible.
    await expect(page.getByText(/Overall Assessment/i)).toBeVisible();

    // Once parsed, the score and issue cards should render.
    await expect(page.getByText("58")).toBeVisible();
    await expect(page.getByText("SQL Injection vulnerability")).toBeVisible();
    await expect(page.getByText("Unused variable")).toBeVisible();

    // Expanding an issue card reveals its suggestion.
    await page.getByText("SQL Injection vulnerability").click();
    await expect(page.getByText(/Use a parameterized query/i)).toBeVisible();
  });

  test("language selector updates the selected language", async ({ page }) => {
    await page.goto("/review");

    const languageSelect = page.getByLabel("Select language");
    await languageSelect.selectOption("python");
    await expect(languageSelect).toHaveValue("python");
  });
});
