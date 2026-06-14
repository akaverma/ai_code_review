import { parseReviewResponse } from "@/lib/parsers";

const VALID_RESPONSE = {
  summary: "The code is generally fine but has one SQL injection risk.",
  score: 65,
  issues: [
    {
      id: "issue-1",
      severity: "critical",
      category: "security",
      title: "SQL Injection vulnerability",
      description: "User input is directly interpolated into the SQL query.",
      line: 14,
      suggestion: "Use parameterized queries.",
      codeSnippet: "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
    },
  ],
  positives: ["Good variable naming"],
  refactoredSnippet: "db.query('SELECT * FROM users WHERE id = ?', [userId])",
};

describe("parseReviewResponse", () => {
  it("parses a well-formed JSON response", () => {
    const result = parseReviewResponse(JSON.stringify(VALID_RESPONSE));
    expect(result).not.toBeNull();
    expect(result?.summary).toBe(VALID_RESPONSE.summary);
    expect(result?.score).toBe(65);
    expect(result?.issues).toHaveLength(1);
    expect(result?.issues[0].severity).toBe("critical");
    expect(result?.positives).toEqual(["Good variable naming"]);
    expect(result?.refactoredSnippet).toBe(VALID_RESPONSE.refactoredSnippet);
  });

  it("strips markdown code fences before parsing", () => {
    const fenced = `\`\`\`json\n${JSON.stringify(VALID_RESPONSE)}\n\`\`\``;
    const result = parseReviewResponse(fenced);
    expect(result?.score).toBe(65);
  });

  it("ignores leading/trailing commentary around the JSON object", () => {
    const wrapped = `Here is the review:\n${JSON.stringify(VALID_RESPONSE)}\nLet me know if you have questions.`;
    const result = parseReviewResponse(wrapped);
    expect(result?.summary).toBe(VALID_RESPONSE.summary);
  });

  it("returns null for incomplete/streaming JSON", () => {
    const partial = JSON.stringify(VALID_RESPONSE).slice(0, 40);
    expect(parseReviewResponse(partial)).toBeNull();
  });

  it("returns null when there is no JSON object at all", () => {
    expect(parseReviewResponse("Sorry, I cannot review this code.")).toBeNull();
  });

  it("clamps an out-of-range score into 0-100", () => {
    const result = parseReviewResponse(JSON.stringify({ ...VALID_RESPONSE, score: 150 }));
    expect(result?.score).toBe(100);
  });

  it("defaults score to 0 when missing or invalid", () => {
    const { score, ...rest } = VALID_RESPONSE;
    const result = parseReviewResponse(JSON.stringify(rest));
    expect(result?.score).toBe(0);
  });

  it("falls back to safe defaults for malformed issue fields", () => {
    const malformed = {
      ...VALID_RESPONSE,
      issues: [
        { title: "Missing severity", description: "No severity or category given" },
        { description: "Missing title is dropped" },
        "not even an object",
      ],
    };
    const result = parseReviewResponse(JSON.stringify(malformed));
    expect(result?.issues).toHaveLength(1);
    expect(result?.issues[0].severity).toBe("info");
    expect(result?.issues[0].category).toBe("best-practice");
    expect(result?.issues[0].line).toBeNull();
  });

  it("returns an empty issues array when issues is missing", () => {
    const { issues, ...rest } = VALID_RESPONSE;
    const result = parseReviewResponse(JSON.stringify(rest));
    expect(result?.issues).toEqual([]);
  });
});
