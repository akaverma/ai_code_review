/**
 * Shared TypeScript types for the AI Code Review Dashboard.
 * These types describe the shape of data moving between the
 * Claude API, the Redux store, and the UI components.
 */

/** Programming languages selectable in the editor. */
export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "go"
  | "java"
  | "css"
  | "jsx"
  | "tsx";

/** How severe an issue is. Drives color coding throughout the UI. */
export type Severity = "critical" | "warning" | "info";

/** The kind of problem an issue represents. */
export type IssueCategory =
  | "security"
  | "performance"
  | "maintainability"
  | "readability"
  | "bug"
  | "best-practice";

/** The depth/focus of review the user asked for. */
export type ReviewType = "full" | "security" | "performance" | "quick";

/** A single piece of feedback returned by Claude for a reviewed file. */
export interface ReviewIssue {
  id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  description: string;
  line: number | null;
  suggestion: string;
  codeSnippet: string | null;
}

/** The fully parsed result of a code review. */
export interface ReviewResult {
  summary: string;
  score: number;
  issues: ReviewIssue[];
  positives: string[];
  refactoredSnippet: string | null;
}

/** A request sent to the `/api/review` streaming endpoint. */
export interface ReviewRequest {
  code: string;
  language: Language;
  reviewType: ReviewType;
}

/** Lifecycle of the current in-progress (or completed) review. */
export type ReviewStatus = "idle" | "streaming" | "complete" | "error";

/** Slice of state describing the review currently being worked on. */
export interface CurrentReviewState {
  code: string;
  language: Language;
  reviewType: ReviewType;
  status: ReviewStatus;
  streamedText: string;
  parsedResult: ReviewResult | null;
  error: string | null;
}

/** A completed review saved to history. */
export interface ReviewHistoryItem {
  id: string;
  code: string;
  language: Language;
  reviewType: ReviewType;
  result: ReviewResult;
  createdAt: string;
}

/** Helper type for components that need to render streaming progress. */
export interface StreamingState {
  status: ReviewStatus;
  streamedText: string;
  error: string | null;
}
