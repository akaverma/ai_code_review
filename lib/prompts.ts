import type { Language, ReviewRequest, ReviewType } from "@/types";

/**
 * The JSON schema Claude must respond with. Kept as a string so it can be
 * embedded verbatim in the system prompt — this is the contract that
 * `lib/parsers.ts` relies on when parsing the streamed response.
 */
const RESPONSE_SCHEMA = `{
  "summary": "Brief overall assessment (max 3 sentences)",
  "score": 72,
  "issues": [
    {
      "id": "issue-1",
      "severity": "critical | warning | info",
      "category": "security | performance | maintainability | readability | bug | best-practice",
      "title": "Short title for the issue",
      "description": "What is wrong and why it matters",
      "line": 14,
      "suggestion": "A concrete, actionable fix",
      "codeSnippet": "The relevant line(s) of code, or null"
    }
  ],
  "positives": ["Things the code does well"],
  "refactoredSnippet": "An improved version of the most critical section, or null"
}`;

/** Extra instructions appended to the base system prompt per review type. */
const REVIEW_TYPE_INSTRUCTIONS: Record<ReviewType, string> = {
  full: "Perform a complete review covering correctness, security, performance, readability, and maintainability.",
  security:
    'Focus exclusively on security vulnerabilities (e.g. injection, XSS, unsafe deserialization, secrets, auth flaws). Only include non-security issues if they are severe bugs. Most issues should have category "security".',
  performance:
    'Focus exclusively on performance: unnecessary re-renders, O(n^2) algorithms, blocking I/O, memory leaks, inefficient data structures. Most issues should have category "performance".',
  quick:
    "Do a quick scan only. Keep the summary to 1-2 sentences and return AT MOST the 3 most important issues, ordered by severity (most severe first).",
};

/**
 * Builds the full system prompt sent to Claude for a code review request.
 * The prompt instructs Claude to act as a senior reviewer and to respond
 * with nothing but the JSON object described by `RESPONSE_SCHEMA`.
 */
export function buildSystemPrompt(reviewType: ReviewType): string {
  return `You are a senior software engineer performing a code review. You are thorough, direct, and practical.

Rules:
1. Identify issues by severity:
   - "critical": bugs, security vulnerabilities, or anything that will cause incorrect behavior or data exposure in production.
   - "warning": performance problems, code smells, or risky patterns that should be fixed soon.
   - "info": style, readability, or minor best-practice suggestions.
2. For every issue, give a specific line number when you can identify one from the code (use 1-based line numbers matching the input). Use null only if the issue spans the whole file.
3. Every suggestion must be a concrete, actionable fix — never vague advice like "consider improving this".
4. Keep "summary" to at most 3 sentences.
5. Score the code from 0-100 based on correctness, security, performance, readability, and maintainability. A score of 100 means production-ready with no notable issues.
6. ${REVIEW_TYPE_INSTRUCTIONS[reviewType]}
7. List 1-4 genuine positives about the code in "positives". If there is truly nothing positive, return an empty array.
8. "refactoredSnippet" should contain an improved version of the most critical section of code, or null if no single snippet would help.

Respond with ONLY a single JSON object matching this exact shape — no markdown fences, no commentary before or after:

${RESPONSE_SCHEMA}`;
}

/** Builds the user-facing message containing the code to review. */
export function buildUserPrompt({
  code,
  language,
}: Pick<ReviewRequest, "code" | "language">): string {
  return `Review the following ${languageLabel(language)} code. Remember to respond with only the JSON object described in your instructions.

\`\`\`${language}
${code}
\`\`\``;
}

function languageLabel(language: Language): string {
  switch (language) {
    case "jsx":
      return "JavaScript (JSX/React)";
    case "tsx":
      return "TypeScript (TSX/React)";
    default:
      return language;
  }
}
