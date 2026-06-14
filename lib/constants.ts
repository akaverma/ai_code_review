import type { IssueCategory, Language, ReviewType, Severity } from "@/types";

/** Languages selectable in the editor, with their Monaco language IDs and labels. */
export const LANGUAGES: { value: Language; label: string; monacoId: string }[] = [
  { value: "javascript", label: "JavaScript", monacoId: "javascript" },
  { value: "typescript", label: "TypeScript", monacoId: "typescript" },
  { value: "jsx", label: "JSX (React)", monacoId: "javascript" },
  { value: "tsx", label: "TSX (React)", monacoId: "typescript" },
  { value: "python", label: "Python", monacoId: "python" },
  { value: "go", label: "Go", monacoId: "go" },
  { value: "java", label: "Java", monacoId: "java" },
  { value: "css", label: "CSS", monacoId: "css" },
];

/** Maps a file extension to a default language selection (used by file upload). */
export const EXTENSION_LANGUAGE_MAP: Record<string, Language> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  go: "go",
  java: "java",
  css: "css",
};

/** The review depth options shown to the user before running a review. */
export const REVIEW_TYPES: { value: ReviewType; label: string; description: string }[] = [
  {
    value: "full",
    label: "Full Review",
    description:
      "A complete pass covering correctness, security, performance, readability, and maintainability.",
  },
  {
    value: "security",
    label: "Security Audit",
    description: "Focus only on security vulnerabilities and unsafe patterns.",
  },
  {
    value: "performance",
    label: "Performance Check",
    description: "Focus only on performance bottlenecks and inefficiencies.",
  },
  {
    value: "quick",
    label: "Quick Scan",
    description: "A short summary plus the top 3 issues only.",
  },
];

/** Display metadata for each severity level. */
export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; badgeClass: string; borderClass: string; dotClass: string }
> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    borderClass: "border-l-destructive",
    dotClass: "bg-destructive",
  },
  warning: {
    label: "Warning",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    borderClass: "border-l-warning",
    dotClass: "bg-warning",
  },
  info: {
    label: "Info",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    borderClass: "border-l-primary",
    dotClass: "bg-primary",
  },
};

/** Display labels for each issue category. */
export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  security: "Security",
  performance: "Performance",
  maintainability: "Maintainability",
  readability: "Readability",
  bug: "Bug",
  "best-practice": "Best Practice",
};

/** Maximum number of reviews kept in history. */
export const MAX_HISTORY_ITEMS = 25;

/** Score thresholds used to color the score ring. */
export const SCORE_THRESHOLDS = {
  good: 75,
  fair: 50,
} as const;
