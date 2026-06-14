import type { IssueCategory, ReviewIssue, ReviewResult, Severity } from "@/types";
import { generateId } from "@/lib/utils";

const VALID_SEVERITIES: Severity[] = ["critical", "warning", "info"];
const VALID_CATEGORIES: IssueCategory[] = [
  "security",
  "performance",
  "maintainability",
  "readability",
  "bug",
  "best-practice",
];

/**
 * Strips markdown code fences (```json ... ```) that Claude sometimes wraps
 * its JSON response in, despite being told not to.
 */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/**
 * Extracts the outermost JSON object from a string, tolerating any leading
 * or trailing text. Returns null if no `{ ... }` block is found.
 */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

/** Coerces a raw issue object into a valid `ReviewIssue`, or returns null if unusable. */
function normalizeIssue(raw: unknown, index: number): ReviewIssue | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const title = typeof obj.title === "string" ? obj.title : null;
  const description = typeof obj.description === "string" ? obj.description : null;
  if (!title || !description) return null;

  const severity = VALID_SEVERITIES.includes(obj.severity as Severity)
    ? (obj.severity as Severity)
    : "info";
  const category = VALID_CATEGORIES.includes(obj.category as IssueCategory)
    ? (obj.category as IssueCategory)
    : "best-practice";

  const line = typeof obj.line === "number" && Number.isFinite(obj.line) ? obj.line : null;

  return {
    id: typeof obj.id === "string" && obj.id.length > 0 ? obj.id : generateId(`issue-${index}`),
    severity,
    category,
    title,
    description,
    line,
    suggestion: typeof obj.suggestion === "string" ? obj.suggestion : "",
    codeSnippet: typeof obj.codeSnippet === "string" ? obj.codeSnippet : null,
  };
}

/**
 * Parses Claude's raw text response into a `ReviewResult`.
 *
 * This is intentionally lenient: while the response is still streaming the
 * JSON will be incomplete, so this returns `null` until a parseable object
 * with the expected top-level shape is found. Fields are individually
 * validated and given safe defaults so a single malformed field doesn't
 * throw away the whole result.
 */
export function parseReviewResponse(rawText: string): ReviewResult | null {
  const candidate = extractJsonObject(stripCodeFences(rawText));
  if (!candidate) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;

  const summary = typeof obj.summary === "string" ? obj.summary : "";
  const score =
    typeof obj.score === "number" && Number.isFinite(obj.score)
      ? Math.max(0, Math.min(100, Math.round(obj.score)))
      : 0;

  const issues = Array.isArray(obj.issues)
    ? obj.issues
        .map((issue, index) => normalizeIssue(issue, index))
        .filter((issue): issue is ReviewIssue => issue !== null)
    : [];

  const positives = Array.isArray(obj.positives)
    ? obj.positives.filter((item): item is string => typeof item === "string")
    : [];

  const refactoredSnippet =
    typeof obj.refactoredSnippet === "string" && obj.refactoredSnippet.length > 0
      ? obj.refactoredSnippet
      : null;

  return { summary, score, issues, positives, refactoredSnippet };
}
