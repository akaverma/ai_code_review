import { NextRequest } from "next/server";
import { gemini, GEMINI_MODEL, MAX_REVIEW_TOKENS } from "@/lib/gemini";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import type { Language, ReviewRequest, ReviewType } from "@/types";

export const runtime = "nodejs";

const VALID_LANGUAGES: Language[] = [
  "javascript",
  "typescript",
  "python",
  "go",
  "java",
  "css",
  "jsx",
  "tsx",
];
const VALID_REVIEW_TYPES: ReviewType[] = ["full", "security", "performance", "quick"];

/** Maximum size of code accepted for review, to keep token usage bounded. */
const MAX_CODE_LENGTH = 20_000;

function validateRequest(body: unknown): { data: ReviewRequest } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }
  const { code, language, reviewType } = body as Record<string, unknown>;

  if (typeof code !== "string" || code.trim().length === 0) {
    return { error: "`code` is required and must be a non-empty string." };
  }
  if (code.length > MAX_CODE_LENGTH) {
    return { error: `\`code\` must be ${MAX_CODE_LENGTH} characters or fewer.` };
  }
  if (typeof language !== "string" || !VALID_LANGUAGES.includes(language as Language)) {
    return { error: `\`language\` must be one of: ${VALID_LANGUAGES.join(", ")}.` };
  }
  if (typeof reviewType !== "string" || !VALID_REVIEW_TYPES.includes(reviewType as ReviewType)) {
    return { error: `\`reviewType\` must be one of: ${VALID_REVIEW_TYPES.join(", ")}.` };
  }

  return { data: { code, language: language as Language, reviewType: reviewType as ReviewType } };
}

/**
 * POST /api/review
 *
 * Streams a code review from Gemini as plain text. The response body is
 * the raw token stream — the frontend (`hooks/useReview.ts`) accumulates
 * it and parses the final JSON once the stream ends (see `lib/parsers.ts`).
 */
export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server is missing GEMINI_API_KEY. See .env.local.example." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = validateRequest(body);
  if ("error" in validation) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { code, language, reviewType } = validation.data;

  const model = gemini.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: buildSystemPrompt(reviewType),
    generationConfig: { maxOutputTokens: MAX_REVIEW_TOKENS },
  });

  const abortController = new AbortController();

  const geminiStream = await model.generateContentStream(
    { contents: [{ role: "user", parts: [{ text: buildUserPrompt({ code, language }) }] }] },
    { signal: abortController.signal }
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of geminiStream.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
