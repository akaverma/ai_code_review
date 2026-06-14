"use client";

import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  reviewChunkReceived,
  reviewCompleted,
  reviewFailed,
  reviewStarted,
} from "@/store/slices/reviewSlice";
import { historyItemAdded } from "@/store/slices/historySlice";
import { parseReviewResponse } from "@/lib/parsers";
import { generateId } from "@/lib/utils";

/**
 * Drives the full "Review Code" flow: sends the current code to
 * `/api/review`, streams the response into Redux chunk-by-chunk, then
 * parses the final JSON and (on success) saves it to history.
 */
export function useReview() {
  const dispatch = useAppDispatch();
  const { code, language, reviewType, status, streamedText, parsedResult, error } = useAppSelector(
    (state) => state.review
  );

  // Lets `cancelReview` abort an in-flight fetch.
  const abortControllerRef = useRef<AbortController | null>(null);

  const runReview = useCallback(async () => {
    if (!code.trim()) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch(reviewStarted());

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, reviewType }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        dispatch(reviewChunkReceived(chunk));
      }

      const result = parseReviewResponse(fullText);
      if (!result) {
        throw new Error("Claude's response could not be parsed as a valid review.");
      }

      dispatch(reviewCompleted(result));
      dispatch(
        historyItemAdded({
          id: generateId("review"),
          code,
          language,
          reviewType,
          result,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      dispatch(reviewFailed(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      abortControllerRef.current = null;
    }
  }, [code, language, reviewType, dispatch]);

  const cancelReview = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { status, streamedText, parsedResult, error, runReview, cancelReview };
}
