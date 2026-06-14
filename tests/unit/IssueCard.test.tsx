import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueCard } from "@/components/review/IssueCard";
import type { ReviewIssue } from "@/types";

const baseIssue: ReviewIssue = {
  id: "issue-1",
  severity: "critical",
  category: "security",
  title: "SQL Injection vulnerability",
  description: "User input is directly interpolated into the SQL query.",
  line: 14,
  suggestion: "Use parameterized queries.",
  codeSnippet: "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
};

describe("IssueCard", () => {
  it("renders the severity badge and category for the issue", () => {
    render(<IssueCard issue={baseIssue} />);
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText(baseIssue.title)).toBeInTheDocument();
  });

  it("applies the critical severity border color", () => {
    render(<IssueCard issue={baseIssue} />);
    const card = screen.getByText(baseIssue.title).closest("div.border-l-4");
    expect(card).toHaveClass("border-l-destructive");
  });

  it("applies the warning severity border color", () => {
    render(<IssueCard issue={{ ...baseIssue, severity: "warning" }} />);
    const card = screen.getByText(baseIssue.title).closest("div.border-l-4");
    expect(card).toHaveClass("border-l-warning");
  });

  it("applies the info severity border color", () => {
    render(<IssueCard issue={{ ...baseIssue, severity: "info" }} />);
    const card = screen.getByText(baseIssue.title).closest("div.border-l-4");
    expect(card).toHaveClass("border-l-primary");
  });

  it("hides the description until expanded, then shows it on click", async () => {
    render(<IssueCard issue={baseIssue} />);
    expect(screen.queryByText(baseIssue.description)).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { expanded: false });
    await userEvent.click(toggle);

    expect(await screen.findByText(baseIssue.description)).toBeInTheDocument();
    expect(screen.getByText(baseIssue.suggestion)).toBeInTheDocument();
  });
});
