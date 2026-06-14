import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Shared Gemini client, created once per server process.
 * `GEMINI_API_KEY` must be set in the environment (see .env.local.example).
 */
export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

/** Model used for all code review requests. */
export const GEMINI_MODEL = "gemini-1.5-flash";

/** Max tokens Gemini is allowed to generate for a single review. */
export const MAX_REVIEW_TOKENS = 4096;
